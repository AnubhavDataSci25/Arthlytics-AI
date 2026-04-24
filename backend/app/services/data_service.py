import os
import uuid
import math
from pathlib import Path
from typing import Tuple

import pandas as pd
from fastapi import UploadFile

from app.config import settings
from app.models.file import UploadedFile
from app.schemas.file import CleanStatsResponse, ColumnStat

##### Helpers #####

ALLOWED_TYPES = {
    "text/csv":"csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"xlsx",
    "application/vnd.ms-excel":"xlsx",
}

def _ensure_upload_dir() -> Path:
    path = Path(settings.UPLOAD_DIR)
    path.mkdir(parents=True, exist_ok=True)
    return path

def _safe_val(val):
    "Convert Nan/Inf to None for JSON serialization."
    if val is None:
        return None
    try:
        if math.isnan(val) or math.isinf(val):
            return None
    except TypeError:
        pass
    return val

##### Save file to disk #####

async def save_upload(file: UploadedFile) -> Tuple[str, str, str, float]:
    """
    SAVES UPLOADED FILE TO DIST WITH A UUID NAME.
    RETURNS: (original_name, stored_name, file_path, size_kb)
    """
    content_type = file.content_type or ""
    file_type = ALLOWED_TYPES.get(content_type)

    # Fallback: detect by extension
    if not file_type:
        ext = Path(file.filename or "").suffix.lower()
        if ext == ".csv":
            file_type = "csv"
        elif ext in (".xlsx", ".xls"):
            file_type = "xlsx"
    
    if not file_type:
        raise ValueError(f"Unsupported file type: {content_type}. Upload CSV or XLSX only.")
    
    upload_dir = _ensure_upload_dir()
    stored_name = f"{uuid.uuid4().hex}.{file_type}"
    file_path = upload_dir / stored_name

    contents = await file.read()

    # Size check
    size_kb = len(contents) / 1024
    max_kb = settings.MAX_UPLOAD_SIZE_MB * 1024
    if size_kb > max_kb:
        raise ValueError(f"File too large: {size_kb:.1f}KB. Max: {settings.MAX_UPLOAD_SIZE_MB}MB")
    
    with open(file_path, 'wb') as f:
        f.write(contents)
    
    return file.filename or stored_name, stored_name, str(file_path), round(size_kb,2)

##### Load Dataframe #####

def load_dataframe(file_record: UploadedFile) -> pd.DataFrame:
    path = file_record.file_path
    if file_record.file_type == "csv":
        return pd.read_csv(path)
    elif file_record.file_type == "xlsx":
        return pd.read_excel(path, engine="openpyxl")
    raise ValueError(f"Unknown file type: {file_record.file_type}")

##### CleanStats #####
def compute_clean_stats(df: pd.DataFrame, file_record: UploadedFile) -> CleanStatsResponse:
    row_count, col_count = df.shape
    duplicate_rows = int(df.duplicated().sum())
    missing_cells = int(df.isnull().sum().sum())
    total_cells = row_count * col_count
    missing_pct = round((missing_cells / total_cells) * 100, 2) if total_cells > 0 else 0.0

    col_stats = []
    for col in df.columns:
        series = df[col]
        null_count = int(series.isnull().sum())
        null_pct = round((null_count / row_count) * 100, 2) if row_count > 0 else 0.0
        unique_count = int(series.nunique())
        dtype_str = str(series.dtype)

        stat = ColumnStat(
            name=col,
            dtype=dtype_str,
            null_count=null_count,
            null_pct=null_pct,
            unique_count=unique_count,
        )

        # Numeric stats
        if pd.api.types.is_numeric_dtype(series):
            desc = series.describe()
            stat.mean = _safe_val(round(float(desc["mean"]), 4))
            stat.median = _safe_val(round(float(series.median()), 4))
            stat.std = _safe_val(round(float(desc["std"]), 4))
            stat.max = _safe_val(round(float(desc["max"]), 4))
            stat.min = _safe_val(round(float(desc["min"]), 4))
        else:
            # Top 5 most frequent values
            top = series.value_counts().head(5).to_dict()
            stat.top_values = {str(k): int(v) for k,v in top.items()}
        
        col_stats.append(stat)
    
    # Sample rows - first 5, Nan -> None
    sample = df.head(5).where(pd.notnull(df), None)
    sample_rows = sample.to_dict(orient="records")

    return CleanStatsResponse(
        file_id=file_record.id,
        original_name=file_record.original_name,
        row_count=row_count,
        col_count=col_count,
        duplicate_rows=duplicate_rows,
        missing_cells=missing_cells,
        missing_pct=missing_pct,
        columns=col_stats,
        sample_rows=sample_rows
    )