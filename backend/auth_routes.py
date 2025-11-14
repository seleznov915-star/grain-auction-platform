import logging
import os
from fastapi import APIRouter, HTTPException, Depends, Header, status, Body
from backend.auth import pwd_context, create_access_token, get_current_user, get_current_admin
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


# ==========================================================
# PASSWORD HELPERS
# ==========================================================
def get_password_hash(password: str) -> str:
    trimmed = password[:72]
    return pwd_context.hash(trimmed)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    trimmed = plain_password[:72]
    return pwd_context.verify(trimmed, hashed_password)


# ==========================================================
# TEMPORARY ADMIN RESET ENDPOINT
# ==========================================================
@router.post("/admin/reset-password")
async def admin_reset_password(
    payload: dict = Body(...),
    x_admin_reset_secret: str | None = Header(None)
):
    """Reset admin password (TEMPORARY endpoint)"""

    env_secret = os.environ.get("ADMIN_RESET_SECRET")

    if not env_secret or x_admin_reset_secret != env_secret:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    new_password = payload.get("new_password")
    if not new_password:
        raise HTTPException(status_code=400, detail="Missing new_password")

    hashed = get_password_hash(new_password)

    result = await users_collection.update_one(
        {"email": "admin@graincompany.ua"},
        {"$set": {"hashed_password": hashed}}
    )

    if result.modified_count > 0:
        return {"status": "ok", "message": "Admin password updated"}
    else:
        return {"status": "error", "message": "Admin not found or unchanged"}


# ==========================================================
# LOGIN
# ==========================================================
@router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    user_doc = await users_collection.find_one({"email": login_data.email})
    
    if not user_doc or not verify_password(login_data.password, user_doc["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    user = User(**user_doc)
    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "accreditation_status": user.accreditation_status
    }
    access_token = create_access_token(token_data)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user.dict())
    )


# ==========================================================
# CURRENT USER INFO
# ==========================================================
@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    user_doc = await users_collection.find_one({"id": current_user["sub"]})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user_doc)


# ==========================================================
# ACCREDITATION LOGIC
# ==========================================================
@router.get("/pending-accreditations", response_model=list[UserResponse])
async def get_pending_accreditations(current_user: dict = Depends(get_current_admin)):
    users = await users_collection.find({"accreditation_status": "pending"}).to_list(100)
    return [UserResponse(**user) for user in users]


@router.post("/update-accreditation")
async def update_accreditation(
    data: AccreditationUpdate,
    current_user: dict = Depends(get_current_admin)
):
    if data.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    user_doc = await users_collection.find_one({"id": data.user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    await users_collection.update_one(
        {"id": data.user_id},
        {"$set": {"accreditation_status": data.status}}
    )
    
    if data.status == "approved":
        send_accreditation_approved_email(user_doc["email"], user_doc["full_name"])
    else:
        send_accreditation_rejected_email(user_doc["email"], user_doc["full_name"])
    
    return {"success": True, "message": f"Accreditation {data.status}"}
