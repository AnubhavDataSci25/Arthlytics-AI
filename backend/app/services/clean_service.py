"""
CleanStats v2 - Automated Cleaning pipeline:
    1. Remove duplicates
    2. Fix missing values (numeric -> median, categorical -> mode)
    3. Detect outliers via IQR (report + optional removal)
    4. Fix dtype inconsistencies
    5. Saved cleaned file to disk
    6. Generate NL insights via Groq
    7. Return before/after comparison
"""

import os
import uuid
import math
from pathlib import Path
from typing import Any

import pandas as pd
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import settings
from app.models.file import UploadedFile

CLEANED_DIR = "./cleaned_files"
os.makedirs(CLEANED_DIR, exist_ok=True)

##### LLM #####

def _get_llm():
    if settings.GROQ_API_KEY:
        return ChatGroq(api_key=settings.GROQ_API_KEY, model_name="llama-3.1-8b-instant", temperature=0.3, max_tokens=1024)
    
    return ChatGoogleGenerativeAI(google_api_key=settings.GEMINI_API_KEY, model="gemini-2.5-flash", temperature=0.3)

##### Safe val #####

def _safe(val):
    if val is None:
        return None
    try:
        if math.isnan(float(val)) or math.isinf(float(val)):
            return None
    except (TypeError, ValueError):
        pass
    return val

##### Outlier detection (IQR) #####

def detect_outliers(df: pd.DataFrame) -> dict[str, dict]:
    report = {}
    for col in df.select_dtypes(include="number").columns:
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3-q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        outlier_mask = (df[col] < lower) | (df[col] > upper)
        count = int(outlier_mask.sum())
        if count > 0:
            report[col] = {
                "count": count,
                "pct": round(count / len(df) * 100, 2),
                "lower_bound": round(lower, 4),
                "upper_bound": round(upper, 4),
            }
    return report

##### Auto cleaning pipeline #####

def auto_clean(
        df: pd.DataFrame,
        remove_outliers: bool = False,
) -> tuple[pd.DataFrame, dict[str, Any]]:
    """
    Returns: (cleaned_df, cleaning_summary)
    """
    summary: dict[str, Any] = {}
    original_shape = df.shape

    # 1. Duplicates
    dupes = int(df.duplicated().sum())
    df = df.drop_duplicates()
    summary["duplicates_removed"]=dupes

    # 2. Missing values
    missing_before = int(df.isnull().sum().sum())
    for col in df.columns:
        if df[col].isnull().sum() == 0:
            continue

        if pd.api.types.is_numeric_dtype(df[col]):
            df[col] = df[col].fillna(df[col].median())
        else:
            mode = df[col].mode()
            df[col] = df[col].fillna(mode[0] if not mode.empty else "Unknown")
    
    missing_after = int(df.isnull().sum().sum())
    summary["missing_filled"] = missing_before - missing_after

    # 3. Dtype fixes - try numeric coercion on object cols
    dtype_fixes = []
    for col in df.select_dtypes(include="object").columns:
        converted = pd.to_numeric(df[col], errors="coerce")
        non_null_converted = converted.notna().sum()
        if non_null_converted > len(df) * 0.8:
            df[col] = converted
            dtype_fixes.append(col)
    summary["dtype_fixes"] = dtype_fixes

    # Outlier removal (optional)
    outliers = detect_outliers(df)
    summary["outliers_detected"]=outliers
    if remove_outliers and outliers:
        for col, info in outliers.items():
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3-q1
            df = df[(df(col) >= q1 - 1.5 * iqr) & (df[col] <= q3 + 1.5 * iqr)]
        summary["outliers_removed"] = True
    else:
        summary["outliers_removed"] = False

    summary["rows_before"]=original_shape[0]
    summary["rows_after"]=len(df)
    summary["cols"]=original_shape[1]

    return df.reset_index(drop=True), summary

##### Save cleaned file #####

def save_cleaned(df: pd.DataFrame, original_name: str, fmt: str="csv") -> tuple[str, str]:
    """Returns: (file_apth, stored_name)"""
    name = Path(original_name).stem
    stored_name = f"{name}_cleaned_{uuid.uuid4().hex[:8]}.{fmt}"
    file_path = os.path.join(CLEANED_DIR, stored_name)

    if fmt == "csv":
        df.to_csv(file_path, index=False)
    else:
        df.to_excel(file_path, index=False, engine="openpyxl")
    
    return file_path, stored_name

##### NL Insights #####

def generate_insights(df: pd.DataFrame, summary: dict, original_name: str) -> str:
    llm = _get_llm()

    # Build stats snippet - keep small to stay under token limit
    num_cols = df.select_dtypes(include="number").columns.tolist()
    stats_lines = []
    for col in num_cols[:6]:
        stats_lines.append(
            f"{col}: mean={df[col].mean():.2f}, min={df[col].min()}, max={df[col].max()}, std={df[col].std():.2f}"
        )

        cat_cols = df.select_dtypes(exclude="number").columns.tolist()
        cat_lines = []
        for col in cat_cols[:4]:
            top = df[col].value_counts().head(3).to_dict()
            cat_lines.append(f"{col} top values: {top}")
        
        prompt = f"""
            You are a data analyst. Given dataset stats, provide 4-5 concise insights in plain English.
            Dataset: {original_name} | {summary['row_after']} rows | {summary['cols']} columns

            Cleaning summary:
            - Duplicates removed: {summary['duplicates_removed']}
            - Missing values filled: {summary['missing_filled']}
            - Outliers detected in: {list(summary['outliers_detected'].keys())}

            Numeric stats:
            {chr(10).join(stats_lines)}

            Categorical distributions:
            {chr(10).join(cat_lines)}

            Give 4-5 insights. Plain text. No markdown. No bullet symbols. Number each insight.
    
        """
        response = llm.invoke(prompt)
        return response.content.strip() if hasattr(response, "content") else str(response).strip()
    
##### Before / After comparison

def before_after_comparison(df_before: pd.DataFrame, df_after: pd.DataFrame) -> dict:
    return {
        "rows": {
            "before": len(df_before), 
            "after": len(df_after), 
            "diff": len(df_before) - len(df_after)
        },
        "missing_cells": {
            "before": int(df_before.isnull().sum().sum()),
            "after": int(df_after.isnull().sum().sum()),
        },
        "duplicates": {
            "before": int(df_before.duplicated().sum()),
            "after": int(df_after.duplicated().sum()),
        },
        "memory_kb": {
            "before": round(df_before.memory_usage(deep=True).sum() / 1024, 2),
            "after": round(df_after.memory_usage(deep=True).sum() / 1024, 2),
        },
    }