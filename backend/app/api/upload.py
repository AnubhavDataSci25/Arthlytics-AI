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