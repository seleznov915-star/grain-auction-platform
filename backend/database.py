from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ.get("DB_NAME", "grain_app")

print("Connecting to DB:", db_name)
print("MONGO_URL:", os.environ.get("MONGO_URL"))
print("DB_NAME:", os.environ.get("DB_NAME"))

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Collections
grains_collection = db.grains
orders_collection = db.orders
contacts_collection = db.contacts
users_collection = db.users
auctions_collection = db.auctions
bids_collection = db.bids

# --- TEMP: quick async test ---
async def test_connection():
    try:
        # Список колекцій
        collections = await db.list_collection_names()
        print("MongoDB connected! Collections:", collections)
    except Exception as e:
        print("MongoDB connection failed:", e)

# Запускаємо тест, якщо файл виконується напряму
if __name__ == "__main__":
    asyncio.run(test_connection())
