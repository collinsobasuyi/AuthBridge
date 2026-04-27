from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)


class UserUpdate(BaseModel):
    """PUT — all fields required"""
    full_name: str
    email: EmailStr


class UserPartialUpdate(BaseModel):
    """PATCH — all fields optional"""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}
