from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=8)


class UserUpdate(BaseModel):
    """PUT — all fields required"""
    full_name: str = Field(min_length=1)
    email: EmailStr


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPartialUpdate(BaseModel):
    """PATCH — all fields optional"""
    full_name: Optional[str] = Field(default=None, min_length=1)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8)


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}
