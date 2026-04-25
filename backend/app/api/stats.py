from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.file import UploadedFile
from app.schemas.file import CleanStatsResponse
from app.services import data_service

router = APIRouter(prefix="/stats")

@router.get("/{file_id}", response_model=CleanStatsResponse)
def get_stats(
    file_id: int,
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
        df = data_service.load_dataframe(db_file)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")
    
    return data_service.compute_clean_stats(df, db_file)
