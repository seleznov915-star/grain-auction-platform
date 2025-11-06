from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

# Auction Models
class AuctionCreate(BaseModel):
    grain_id: str  # Reference to grain from catalog
    grain_type: str
    category: str  # 1, 2, or 3
    moisture: str
    protein: str
    gluten: str
    nature: str
    quantity: float
    starting_price: float
    start_date: datetime
    end_date: datetime

class Auction(AuctionCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "pending"  # pending, active, completed, winner_selected
    winner_id: Optional[str] = None
    created_by: str  # admin user id
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuctionResponse(Auction):
    current_highest_bid: Optional[float] = None
    total_bids: int = 0

# Bid Models
class BidCreate(BaseModel):
    auction_id: str
    bid_amount: float
    payment_type: str  # cashless or cash
    delivery_location: str

class Bid(BidCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_company: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BidResponse(BaseModel):
    id: str
    auction_id: str
    bid_amount: float
    user_name: str
    user_company: str
    created_at: datetime

class WinnerSelect(BaseModel):
    auction_id: str
    winner_bid_id: str
