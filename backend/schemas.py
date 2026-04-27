from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str


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

    model_config = {"from_attributes": True}
