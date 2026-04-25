import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.file import UploadedFile
from app.schemas.file import FileOut
from app.services import data_service

router = APIRouter(prefix="/upload")

@router.post("", response_model=FileOut, status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), 
):
    
    # Save to disk
    try:
        original_name, stored_name, file_path, size_kb = await data_service.save_upload(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Determine file type from stored name extension
    file_type = stored_name.rsplit(".",1)[-1]

    # Create DB record (shape filled after parse below)
    db_file = UploadedFile(
        user_id=current_user.id,
        original_name=original_name,
        stored_name=stored_name,
        file_path=file_path,
        file_type=file_type,
        file_size_kb=size_kb,
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Parse shape immediately and update record
    try:
        df = data_service.load_dataframe(db_file)
        db_file.row_count = df.shape[0]
        db_file.col_count = df.shape[1]
        db_file.columns = list(df.columns)
        db.commit()
        db.refresh(db_file)
    except Exception:
        pass        # Shape optional - don't fail upload if parse fails

    return db_file


@router.get("", response_model=list[FileOut])
def list_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(UploadedFile).filter(UploadedFile.user_id == current_user.id).all()


@router.delete("/{file_id}", status_code=204)
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.user_id == current_user.id,
    ).first()

    if not file_id:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete from disk
    if os.path.exists(db_file.file_path):
        os.remove(db_file.file_path)

    db.delete(db_file)
    db.commit()