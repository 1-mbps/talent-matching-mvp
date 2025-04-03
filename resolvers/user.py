from fastapi import APIRouter
from fastapi import UploadFile, File
from typing import Annotated
from fastapi import Depends
import os
import PyPDF2
import io

from utils.auth import get_current_user
from models import User

router = APIRouter()

@router.post("/upload")
async def upload(current_user: Annotated[User, Depends(get_current_user)], file: UploadFile = File(...)):
    # Check if file is a PDF
    if not file.filename.endswith('.pdf'):
        return {"error": "Only PDF files are supported"}
    
    try:
        # Read file content
        contents = await file.read()
        
        # Create a file-like object from the bytes
        pdf_file = io.BytesIO(contents)
        
        # Create PDF reader object
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from all pages
        text_content = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text_content += page.extract_text()          
        
        # will add text content to the database later

    except Exception as e:
        return {"error": str(e)}

@router.get("/profile")
async def profile(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user

