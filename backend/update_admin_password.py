import os
from pymongo import MongoClient
from backend.auth import hash_password

# Новий пароль для адміністратора
NEW_ADMIN_PASSWORD = "admin123"  # заміни на бажаний пароль, максимум 72 символи

# Підключення до MongoDB
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

if not MONGO_URL or not DB_NAME:
    raise ValueError("Environment variables MONGO_URL and DB_NAME must be set")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Хешуємо новий пароль
hashed_password = hash_password(NEW_ADMIN_PASSWORD)

# Оновлюємо адміністратора
result = db.users.update_one(
    {"email": "admin@graincompany.ua"},
    {"$set": {"hashed_password": hashed_password}}
)

if result.modified_count > 0:
    print(f"✅ Admin password updated successfully to '{NEW_ADMIN_PASSWORD}'")
else:
    print("⚠️ No admin user found or password unchanged")
