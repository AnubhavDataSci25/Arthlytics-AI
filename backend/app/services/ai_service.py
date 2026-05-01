"""
SmartQuery - SQL Agent:
    CSV/XLSX -> SQLite (one-time, per file)
    SQLDatabaseToolkit -> 4 tools (query, schema, list_tables, checker)
    create_sql_agent + system_prompt -> Gemini/Groq LLM
    Raw result -> humanize pass -> plain Englist answer
"""

import hashlib
from typing import Any
import os

import pandas as pd
from sqlalchemy import create_engine
from langchain_community.utilities import SQLDatabase
from langchain.agents import create_sql_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langsmith import traceable

from app.config import settings
from app.models.file import UploadedFile
from app.services.data_service import load_dataframe

if settings.LANGSMITH_API_KEY:
    os.environ['LANGSMITH_TRACING_V2'] = "true"
    os.environ["LANGSMITH_API_KEY"] = settings.LANGSMITH_API_KEY
    os.environ["LANGSMITH_PROJECT"] = settings.LANGSMITH_PROJECT
    os.environ["LANGSMITH_ENDPOINT"] = settings.LANGSMITH_ENDPOINT

##### Config #####
SQLITE_DIR = "./sqlite_dbs"
os.makedirs(SQLITE_DIR, exist_ok=True)
_db_cache: dict[str, SQLDatabase] = {}

##### Helpers #####

def _file_hash(file_record: UploadedFile) -> str:
    key = f"{file_record.id}:{file_record.file_path}"
    return hashlib.md5(key.encode()).hexdigest()

def _sqlite_path(fhash: str) -> str:
    return os.path.join(SQLITE_DIR, f"{fhash}.db")

def _sanitize_col(col: str) -> str:
    return col.strip().replace(" ","_").replace("-","_").replace("(","").replace(")","")

##### CSV -> SQLite #####

def _build_sqlite(file_record: UploadedFile) -> str:
    fhash = _file_hash(file_record)
    db_path = _sqlite_path(fhash)

    if os.path.exists(db_path):
        return db_path
    
    df = load_dataframe(file_record)
    df.columns = [_sanitize_col(c) for c in df.columns]

    engine = create_engine(f"sqlite:///{db_path}")
    df.to_sql("data", engine, if_exists="replace", index=False)
    engine.dispose()

    return db_path

##### LLMs #####

def _get_llm():
    """Groq primary, Gemini fallback"""
    if settings.GROQ_API_KEY:
        return ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.1-8b-instant",
            temperature=0,
            max_tokens=1024,
        )
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0
    )

##### SQL DB #####

def _get_sql_db(file_record: UploadedFile) -> SQLDatabase:
    fhash = _file_hash(file_record)
    if fhash in _db_cache:
        return _db_cache[fhash]
    db_path = _build_sqlite(file_record)
    sql_db = SQLDatabase.from_uri(f"sqlite:///{db_path}")
    _db_cache[fhash] = sql_db
    return sql_db

##### System prompt #####

def _system_prompt(dialect: str, top_k: int = 5) -> str:
    return f"""
    You are a SQL agent. Database has ONE table: "data".

    IMPORTANT RULES:
    - Rules:
    - Table = "data". Always. Never guess other names.
    - Dialect = {dialect}. Use correct syntax.
    - Max {top_k} results unless user specifies more.
    - No DML (INSERT/UPDATE/DELETE/DROP).
    - If query fails once, rewrite and retry once only.
    - After getting result → answer immediately. No extra steps.

    STRICT Workflow - follow exactly, no deviations:
    1. Call sql_db_list_tables with empty input ""
    2. Call sql_db_schema with "data"
    3. Write SQL using ONLY columns from schema.
    4. Call sql_db_query_checker with your SQL.
    5. Call sql_db_query to execute.
    6. Return final answer immediately.
    """.strip()


##### Humanize #####

def _humanize(llm, query: str, sql_result: str) -> str:
    prompt = f"""
        User asked: "{query}"
        SQL query returned: {sql_result}
        Write clear, concise plain English answer. No markdown. No bullets. Direct answer only.
    """
    response = llm.invoke(prompt)
    return response.content.strip() if hasattr(response, "content") else str(response).strip()

##### Main entry #####
@traceable(name="SmartQuery")
async def query_file(file_record, query, top_k=5) -> dict[str, Any]:
    sql_db = _get_sql_db(file_record)
    llm = _get_llm()

    toolkit = SQLDatabaseToolkit(db=sql_db, llm=llm)

    agent = create_sql_agent(
        llm=llm,
        toolkit=toolkit,
        system_prompt=_system_prompt(sql_db.dialect, top_k),
        verbose=True,
        max_iterations=10,
        max_execution_time=30,
        handle_parsing_errors=True,
    )

    agent_result = agent.invoke({"input":query})
    raw_answer = agent_result.get("output", "Could not generate answer.")
    final_answer = _humanize(llm,query,raw_answer)

    df = load_dataframe(file_record)

    return {
        "answer": final_answer,
        "raw_sql_result": raw_answer,
        "source_file": file_record.original_name,
        "model_used": "groq/llama-3.3-70b-versatile" if settings.GROQ_API_KEY else "gemini/gemini-2.5-flash",
        "dataset_info": {"rows": len(df), "columns": list(df.columns)},
    }

def clear_index(file_record: UploadedFile) -> None:
    """Free memory when file deleted."""
    fhash = _file_hash(file_record)
    _db_cache.pop(fhash, None)
    db_path = _sqlite_path(fhash)
    if os.path.exists(db_path):
        os.remove(db_path)