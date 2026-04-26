from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.file import UploadedFile
from app.services import chart_service

router = APIRouter(prefix="/visualize")

class VizRequest(BaseModel):
    file_id: int
    query: str

@router.post("")
async def generate_visualization(
    body: VizRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Ownership check
    db_file = db.query(UploadedFile).filter(
        UploadedFile.id == body.file_id,
        UploadedFile.user_id == current_user.id,
    ).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File not Found")
    
    if not body.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    try:
        result = await chart_service.generate_chart(db_file, body.query)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chart generation failed: {str(e)}")
    
    return result