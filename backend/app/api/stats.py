from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.file import UploadedFile
from app.schemas.file import CleanStatsResponse
from app.services import data_service
from app.services import clean_service

router = APIRouter(prefix="/stats")

@router.get("/{file_id}", response_model=CleanStatsResponse)
def get_stats(
    file_id: int,
    clean: bool = Query(False, description="Run auto-cleaning pipeline"),
    remove_outliers: bool = Query(False, description="Remove outliers during cleaning"),
    insights: bool = Query(False, description="Generate NL insights via LLM"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.user_id == current_user.id,
    ).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File Not Found")
    
    try:
        df_original = data_service.load_dataframe(db_file)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")
    
    # Basic stats on original df
    base = data_service.compute_clean_stats(df_original, db_file)

    if not clean:
        return base
    
    # Full cleaning pipeline
    try:
        df_clean, summary = clean_service.auto_clean(df_original.copy(), remove_outliers=remove_outliers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleaning failed: {e}")
    
    # Save cleaned file
    cleaned_path, cleaned_name = clean_service.save_cleaned(df_clean, db_file.original_name)

    # Before/After comparison
    comparison = clean_service.before_after_comparison(df_original, df_clean)

    # NL insights
    nl_insights = None
    if insights:
        try:
            nl_insights = clean_service.generate_insights(df_clean, summary, db_file.original_name)
        except Exception:
            nl_insights = "Insights unavailable - check LLM API key."

    # Re-run stats on cleaned df
    cleaned_stats = data_service.compute_clean_stats(df_clean, db_file)

    cleaned_dict = cleaned_stats.model_dump()
    cleaned_dict.update({
        "cleaning_summary": summary,
        "before_after": comparison,
        "insights": nl_insights,
        "cleaned_file_name": cleaned_name,
        "cleaned_file_path": cleaned_path,
    })

    return CleanStatsResponse(**cleaned_dict)

@router.get("/{file_id}/download-cleaned")
def download_cleaned(
    file_id: int,
    filename: str = Query(..., description="Cleaned filename from stats response"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.user_id == current_user.id,
    ).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not Found")
    
    file_path = os.path.join(clean_service.CLEANED_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Cleaned file not found. Run clean first.")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="text/csv" if filename.endswith(".csv") else
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheets",
    )

