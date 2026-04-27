"""
SmartQuery - RAG pipeline (LangChain full chain):
    HuggingFace Inference API -> embeddings (no local download)
    FAISS                     -> vector store + retrieval
    LangChain                 -> full chain (prompt + retrieval + LLM)
    Groq / LlaMa3-8b          -> LLM answer
    Gemini                    -> fallback if Groq fails
"""

import hashlib
from typing import Any

import pandas as pd
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import PromptTemplate
from langchain.schema import Document

from app.config import settings
from app.models.file import UploadedFile
from app.services.data_service import load_dataframe

##### LLMs #####

def _get_llm():
    """Groq primary, Gemini fallback"""
    if settings.GROQ_API_KEY:
        return ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.2,
            max_tokens=1024,
        )
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.2
    )

##### Embeddings #####

def _get_embeddings():
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
    )

##### In-memory FAISS cache: {file_hash: FAISS vectorstore} #####

_store_cache: dict[str, FAISS] = {}

def _file_hash(file_record: UploadedFile) -> str:
    key = f"{file_record.id}:{file_record.file_path}"
    return hashlib.md5(key.encode()).hexdigest()

##### Chunking -> LangChain Documents #####

def _df_to_documents(df: pd.DataFrame, chunk_size: int = 10) -> list[Document]:
    """
    Convert dataframe rows -> LangChain Documents.
    Each doc = up to chunk_size rows as readable text + metadata
    """
    docs = []
    cols = list(df.columns)

    for start in range(0, len(df), chunk_size):
        batch = df.iloc[start: start + chunk_size]
        lines = [f"Columns: {', '.join(cols)}"]
        for _, row in batch.iterrows():
            parts = [f"{col}={row[col]}" for col in cols]
            lines.append(" | ".join(parts))
        
        docs.append(Document(
            page_content="\n".join(lines),
            metadata={
                "rows": f"{start}-{start + len(batch) - 1}",
                "chunk_index": start // chunk_size,
            }
        ))
    return docs

##### Build / load FAISS vectorstore #####

def _get_vectorestore(file_record: UploadedFile) -> FAISS:
    fhash = _file_hash(file_record)

    if fhash in _store_cache:
        return _store_cache[fhash]
    
    df = load_dataframe(file_record)
    docs = _df_to_documents(df, chunk_size=10)
    embeddings = _get_embeddings()

    store = FAISS.from_documents(docs, embeddings)
    _store_cache[fhash] = store
    return store

##### RAG Prompt #####

RAG_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are a precise data analyst assistant. Answer the question using ONLY the data context below.

    Context:
    {context}

    Question: {question}

    Rules:
    - Use ONLY data from context. Never invent numbers.
    - Be concise and specific. Include actual values when available.
    - If context is insufficient, say: "Based on available data, I cannot answer this precisely."
    - Plain text only. No markdown headers or bullet symbols.

    Answer:
    """
)

##### Main entry #####

async def query_file(file_record, query, top_k=5):
    vectorestore = _get_vectorestore(file_record)
    retriever = vectorestore.as_retriever(search_kwargs={"k": top_k})
    llm = _get_llm()

    def format_docs(docs):
        return "\n\n---\n\n".join(d.page_content for d in docs)
    
    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | RAG_PROMPT
        | llm
        | StrOutputParser()
    )

    retrieved_docs = retriever.invoke(query)
    answer = chain.invoke(query)

    df = load_dataframe(file_record)
    return {
        "answer": answer.strip(),
        "chunk_used": len(retrieved_docs),
        "total_chunks": vectorestore.index.ntotal,
        "source_file": file_record.original_name,
        "model_used": "groq/llama-3.3-70b-versatile" if settings.GROQ_API_KEY else "gemini/gemini-2.5-flash",
        "dataset_info": {"rows": len(df), "columns": list(df.columns)},
    }

def clear_index(file_record: UploadedFile) -> None:
    """Free memory when file deleted."""
    fhash = _file_hash(file_record)
    _store_cache.pop(fhash, None)