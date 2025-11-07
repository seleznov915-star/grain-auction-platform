import logging
from fastapi import APIRouter, HTTPException, Depends

from backend.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_admin
)

from backend.database import users_collection
from backend.email_service import (
    send_accreditation_approved_email,
    send_accreditation_rejected_email
)

from backend.auth_models import (
    UserRegister,
    UserLogin,
    User,
    UserResponse,
    Token,
    AccreditationUpdate
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    """Register new user"""
    # Check if user exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        **user_data.dict(exclude={"password"}),
        hashed_password=get_password_hash(user_data.password)
    )
    
    await users_collection.insert_one(user.dict())
    logger.info(f"User registered: {user.email}")
    
    return UserResponse(**user.dict())


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    """Login user"""
    user_doc = await users_collection.find_one({"email": login_data.email})
    
    if not user_doc or not verify_password(login_data.password, user_doc["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    user = User(**user_doc)
    
    # Create token
    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "accreditation_status": user.accreditation_status
    }
    access_token = create_access_token(token_data)
    
    logger.info(f"User logged in: {user.email}")
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user.dict())
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    user_doc = await users_collection.find_one({"id": current_user["sub"]})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(**user_doc)


@router.get("/pending-accreditations", response_model=list[UserResponse])
async def get_pending_accreditations(current_user: dict = Depends(get_current_admin)):
    """Get all pending accreditation requests (Admin only)"""
    users = await users_collection.find({"accreditation_status": "pending"}).to_list(100)
    return [UserResponse(**user) for user in users]


@router.post("/update-accreditation")
async def update_accreditation(
    data: AccreditationUpdate,
    current_user: dict = Depends(get_current_admin)
):
    """Update user accreditation status (Admin only)"""
    if data.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    user_doc = await users_collection.find_one({"id": data.user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    await users_collection.update_one(
        {"id": data.user_id},
        {"$set": {"accreditation_status": data.status}}
    )
    
    # Send email notification
    if data.status == "approved":
        send_accreditation_approved_email(user_doc["email"], user_doc["full_name"])
    else:
        send_accreditation_rejected_email(user_doc["email"], user_doc["full_name"])
    
    logger.info(f"Accreditation {data.status} for user: {user_doc['email']}")
    
    return {"success": True, "message": f"Accreditation {data.status}"}
