from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from typing import List
from fastapi import FastAPI

from backend.models import (
    Grain, GrainResponse, 
    Order, OrderCreate, OrderResponse,
    Contact, ContactCreate, ContactResponse
)
from backend.database import grains_collection, orders_collection, contacts_collection, users_collection, auctions_collection, bids_collection
from backend.seed_data import INITIAL_GRAINS
from backend.auth_routes import router as auth_router
from backend.auction_routes import router as auction_router
from backend.auth import get_password_hash


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ.get("DB_NAME", "grain_app")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
@app.get("/")
async def root():
    return {"status": "ok", "db": "connected"}


# Seed database on startup
@app.on_event("startup")
async def seed_database():
    # Seed grains only if empty
    count = await grains_collection.count_documents({})
    if count == 0:
        logger.info("Seeding grains database...")
        await grains_collection.insert_many(INITIAL_GRAINS)
        logger.info(f"Seeded {len(INITIAL_GRAINS)} grains")
    
    # Create default admin user if not exists
    admin_exists = await users_collection.find_one({"email": "admin@graincompany.ua"})
    if not admin_exists:
        logger.info("Creating default admin user...")
        from backend.auth_models import User 
        admin = User(
            email="admin@graincompany.ua",
            hashed_password=get_password_hash("admin123"),
            full_name="Administrator",
            company_name="GrainCompany",
            edrpou="00000000",
            phone="+380441234567",
            role="admin",
            accreditation_status="approved"
        )
        await users_collection.insert_one(admin.dict())
        logger.info("Admin user created: admin@graincompany.ua / admin123")


# Routes
@api_router.get("/")
async def root():
    return {"message": "Grain Company API"}


@api_router.get("/grains", response_model=List[GrainResponse])
async def get_grains():
    """Get all active grains"""
    try:
        grains = await grains_collection.find({"active": True}).to_list(100)
        return [GrainResponse(**grain) for grain in grains]
    except Exception as e:
        logger.error(f"Error fetching grains: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch grains")


@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate):
    """Create a new grain order"""
    try:
        order = Order(**order_data.dict())
        await orders_collection.insert_one(order.dict())
        logger.info(f"Order created: {order.id} for {order.grain_type}")
        return OrderResponse(
            success=True,
            order_id=order.id,
            message="Order submitted successfully"
        )
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create order")


@api_router.post("/contacts", response_model=ContactResponse)
async def create_contact(contact_data: ContactCreate):
    """Submit a contact form"""
    try:
        contact = Contact(**contact_data.dict())
        await contacts_collection.insert_one(contact.dict())
        logger.info(f"Contact form submitted: {contact.id} from {contact.name}")
        return ContactResponse(
            success=True,
            message="Message sent successfully"
        )
    except Exception as e:
        logger.error(f"Error creating contact: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit contact form")


# Include the routers in the main app
app.include_router(api_router)
app.include_router(auth_router, prefix="/api")
app.include_router(auction_router, prefix="/api")

