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