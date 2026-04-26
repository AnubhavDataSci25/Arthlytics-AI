import json
import re
from typing import Any

import google.generativeai as genai
import pandas as pd

from app.config import settings
from app.models.file import UploadedFile
from app.services.data_service import load_dataframe

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

##### Prompt Builder #####

def _build_prompt(df: pd.DataFrame, user_query: str) -> str:
    # Send column names + dtypes + 3 sample rows - not full data
    col_info = {col: str(df[col].dtype) for col in df.columns}
    sample = df.head(3).where(pd.notnull(df), None).to_dict(orient="records")

    return f"""
        You are a data visualization expert. Given a dataset summary and user request, return ONLY a JSON
        chart configuration. No explanation, no markdown, no code blocks.

        Dataset columns and types:
        {json.dumps(col_info, indent=2)}

        Sample rows:
        {json.dumps(sample, indent=2)}

        User request: "{user_query}"

        Return a single JSON object with this exact structure:
        {{
            "chart_type": "bar" | "line" | "scatter" | "pie" | "histogram" | "area",
            "title": "Chart Title",
            "x_column": "column name from dataset",
            "y_column": "column name form dataset (null for histogram/pie)",
            "color_column": "column for color grouping or null",
            "aggregation": "sum" | "mean" | "count" | "none",
            "sort_by": "x" | "y" | "none",
            "limit": 20,
            "reasoning": "one line why this chart fits the request"
        }}

        Rules:
        - x_column and y_column MUST exist in the dataset columns listed above
        - For pie charts: x_column = category, y_column = value
        - For histogram: x_column = numeric column, y_column = null
        - limit controls max data points sent to frontend (5-50)
        - Return ONLY the JSON object, nothing else
    
    """.strip()

##### JSON extractor #####

def _extract_json(text: str) -> dict:
    """Strip markdown fences if model wraps response anyway."""
    text = text.strip()
    
    # ------ Remove ```json ... ``` or ``` ... ``` -------- #
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text)

##### Data Builder #####

def _build_chart_data(df: pd.DataFrame, config: dict) -> list[dict[str, Any]]:
    """Apply aggregation + limit -> return rows for Recharts."""
    x = config.get("x_column")
    y = config.get("y_column")
    agg = config.get("aggregation", "none")
    limit = min(int(config.get("limit", 20)), 50)
    sort_by = config.get("sort_by", "none")
    chart_type = config.get("chart_type", "bar")

    # Validate columns exist
    if x and x not in df.columns:
        raise ValueError(f"Column '{x}' not found in dataset")
    if y and y not in df.columns:
        raise ValueError(f"Column '{y}' not found in dataset")
    
    if chart_type == "histogram" or not y:
        data = df[[x]].dropna().head(limit)
        return data.to_dict(orient="records")

    # Aggregation
    if agg == "none":
        result = df[[x,y]].dropna().head(limit)
    else:
        agg_map = {"sum":"sum", "mean":"mean", "count":"count"}
        result = (
            df.groupby(x)[y]
            .agg(agg_map[agg])
            .reset_index()
        )
    
    # Sort
    if sort_by == "y":
        result = result.sort_values(y, ascending=False)
    elif sort_by == "x":
        result = result.sort_values(x)

    result = result.head(limit)

    # Safe serialization
    result = result.where(pd.notnull(result), None)
    return result.to_dict(orient="records")

##### Main entry #####

async def generate_chart(file_record: UploadedFile, user_query: str) -> dict:
    df = load_dataframe(file_record)

    prompt = _build_prompt(df, user_query)

    response = model.generate_content(prompt)
    raw = response.text

    try:
        config = _extract_json(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}\nRaw: {raw[:300]}")
    
    # Build actual data points
    chart_data = _build_chart_data(df, config)

    return {
        "config": config,
        "data": chart_data,
    }
