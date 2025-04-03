from pydantic import BaseModel
from typing import Literal
from fastapi import APIRouter, HTTPException
import os
from utils.auth import get_password_hash, supabase
from utils.env import env

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    user_type: Literal["business", "user"]
    city: str
    country: str

@router.post("/register")
async def register(request: RegisterRequest):
    # Hash the password for security
    hashed_password = get_password_hash(request.password)
    
    # Prepare user data for Supabase
    user_data = {
        "name": request.name,
        "email": request.email,
        "hashed_password": hashed_password,
        "user_type": request.user_type,
        "city": request.city,
        "country": request.country,
        "created_at": "now()"
    }
    
    # Insert user into Supabase
    try:
        supabase.table("users").insert(user_data).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")
    
