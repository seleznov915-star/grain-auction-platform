from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from .auth_models import UserRegister, UserLogin, User, UserResponse, Token, AccreditationUpdate
import uuid

# User Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: str
    edrpou: str
    phone: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    hashed_password: str
    full_name: str
    company_name: str
    edrpou: str
    phone: str
    role: str = "buyer"  # buyer or admin
    accreditation_status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    company_name: str
    edrpou: str
    phone: str
    role: str
    accreditation_status: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class AccreditationUpdate(BaseModel):
    user_id: str
    status: str  # approved or rejected
