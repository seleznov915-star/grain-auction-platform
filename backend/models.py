from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
import uuid

# Grain Models
class GrainBase(BaseModel):
    name_ua: str
    name_en: str
    category: str  # 1, 2, or 3
    moisture: str
    protein: str
    gluten: str
    nature: str
    image: str

class Grain(GrainBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    active: bool = True
    description: str = ""

class GrainResponse(GrainBase):
    id: str
    description: str

# Order Models
class OrderCreate(BaseModel):
    grain_type: str
    grain_id: str
    quantity: float
    customer_name: str
    customer_phone: str
    customer_email: EmailStr
    comment: Optional[str] = ""

class Order(OrderCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OrderResponse(BaseModel):
    success: bool
    order_id: str
    message: str

# Contact Models
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str

class Contact(ContactCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ContactResponse(BaseModel):
    success: bool
    message: str
