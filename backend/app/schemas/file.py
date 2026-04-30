from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class FileOut(BaseModel):
    id: int
    original_name: str
    file_type: str
    file_size_kb: float
    row_count: Optional[int]
    col_count: Optional[int]
    columns: Optional[List[str]]
    created_at: datetime

    model_config = {"from_attributes":True}


class ColumnStat(BaseModel):
    name: str
    dtype: str
    null_count: int
    null_pct: float
    unique_count: int

    # Numeric only
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    col_min: Optional[float] = Field(None, alias="min")
    col_max: Optional[float] = Field(None, alias="max")

    # Categorical only
    top_values: Optional[Dict[str, int]] = None

    model_config = {"populate_by_name":True}

class OutlierInfo(BaseModel):
    count: int
    pct: float
    lower_bound: float
    upper_bound: float

class CleaningSummary(BaseModel):
    duplicates_removed: int
    missing_filled: int
    dtype_fixes: List[str]
    outliers_detected: Dict[str, OutlierInfo]
    outliers_removed: bool
    rows_before: int
    rows_after: int
    cols: int

class BeforeAfter(BaseModel):
    rows: Dict[str, int]
    missing_cells: Dict[str, int]
    duplicates: Dict[str, int]
    memory_kb: Dict[str, float]

class CleanStatsResponse(BaseModel):
    file_id: int
    original_name: str
    row_count: int
    col_count: int
    duplicate_rows: int
    missing_cells: int
    missing_pct: float
    columns: List[ColumnStat]
    sample_rows: List[Dict[str, Any]]
    cleaning_summary: Optional[CleaningSummary] = None
    before_after: Optional[BeforeAfter] = None
    insights: Optional[str] = None
    cleaned_file_path: Optional[str] = None
    cleaned_file_name: Optional[str] = None