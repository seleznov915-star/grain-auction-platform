# backend/database.py
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Завантаження .env файлу (якщо він є)
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Зчитування змінних середовища
mongo_url = os.environ.get("MONGO_URL")
db_name = os.environ.get("DB_NAME", "grain_app")  # дефолт "grain_app", якщо змінної нема

# Підключення до MongoDB
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Колекції
grains_collection = db.grains
orders_collection = db.orders
contacts_collection = db.contacts
users_collection = db.users
auctions_collection = db.auctions
bids_collection = db.bids
