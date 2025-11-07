from fastapi import APIRouter, HTTPException, Depends
from backend.auction_models import (
    AuctionCreate,
    Auction,
    AuctionResponse,
    BidCreate,
    Bid,
    BidResponse,
    WinnerSelect
)
from backend.auth import get_current_admin, get_approved_buyer, get_current_user
from database import auctions_collection, bids_collection, users_collection
from email_service import send_auction_winner_email
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auctions", tags=["auctions"])


@router.post("/create", response_model=AuctionResponse)
async def create_auction(
    auction_data: AuctionCreate,
    current_user: dict = Depends(get_current_admin)
):
    """Create new auction (Admin only)"""
    auction = Auction(
        **auction_data.dict(),
        created_by=current_user["sub"]
    )
    
    await auctions_collection.insert_one(auction.dict())
    logger.info(f"Auction created: {auction.id} by {current_user['email']}")
    
    return AuctionResponse(**auction.dict(), current_highest_bid=None, total_bids=0)


@router.get("/list", response_model=list[AuctionResponse])
async def list_auctions():
    """Get all auctions with their current status"""
    auctions = await auctions_collection.find().to_list(100)
    
    result = []
    for auction in auctions:
        # Get highest bid
        highest_bid = await bids_collection.find_one(
            {"auction_id": auction["id"]},
            sort=[("bid_amount", -1)]
        )
        
        # Count total bids
        total_bids = await bids_collection.count_documents({"auction_id": auction["id"]})
        
        # Update auction status based on dates
        now = datetime.utcnow()
        if auction["status"] == "pending" and now >= auction["start_date"]:
            auction["status"] = "active"
            await auctions_collection.update_one(
                {"id": auction["id"]},
                {"$set": {"status": "active"}}
            )
        elif auction["status"] == "active" and now >= auction["end_date"]:
            auction["status"] = "completed"
            await auctions_collection.update_one(
                {"id": auction["id"]},
                {"$set": {"status": "completed"}}
            )
        
        result.append(AuctionResponse(
            **auction,
            current_highest_bid=highest_bid["bid_amount"] if highest_bid else None,
            total_bids=total_bids
        ))
    
    return result


@router.get("/{auction_id}", response_model=AuctionResponse)
async def get_auction(auction_id: str):
    """Get auction details"""
    auction = await auctions_collection.find_one({"id": auction_id})
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    # Get highest bid
    highest_bid = await bids_collection.find_one(
        {"auction_id": auction_id},
        sort=[("bid_amount", -1)]
    )
    
    # Count total bids
    total_bids = await bids_collection.count_documents({"auction_id": auction_id})
    
    return AuctionResponse(
        **auction,
        current_highest_bid=highest_bid["bid_amount"] if highest_bid else None,
        total_bids=total_bids
    )


@router.post("/bid", response_model=BidResponse)
async def place_bid(
    bid_data: BidCreate,
    current_user: dict = Depends(get_approved_buyer)
):
    """Place bid on auction (Approved buyers only)"""
    # Check auction exists and is active
    auction = await auctions_collection.find_one({"id": bid_data.auction_id})
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    if auction["status"] != "active":
        raise HTTPException(status_code=400, detail="Auction is not active")
    
    # Check if auction has ended
    if datetime.utcnow() >= auction["end_date"]:
        raise HTTPException(status_code=400, detail="Auction has ended")
    
    # Get highest bid
    highest_bid = await bids_collection.find_one(
        {"auction_id": bid_data.auction_id},
        sort=[("bid_amount", -1)]
    )
    
    # Check if bid is higher than current highest with minimum 1% increase
    current_price = highest_bid["bid_amount"] if highest_bid else auction["starting_price"]
    min_bid = current_price * 1.01  # 1% increase
    
    if bid_data.bid_amount < min_bid:
        raise HTTPException(
            status_code=400,
            detail=f"Ставка має бути мінімум на 1% вище поточної ціни. Мінімальна ставка: {min_bid:.2f} грн"
        )
    
    # Get user info
    user = await users_collection.find_one({"id": current_user["sub"]})
    
    # Create bid
    bid = Bid(
        **bid_data.dict(),
        user_id=current_user["sub"],
        user_name=user["full_name"],
        user_company=user["company_name"]
    )
    
    await bids_collection.insert_one(bid.dict())
    logger.info(f"Bid placed: {bid.id} on auction {bid_data.auction_id} by {user['email']}")
    
    return BidResponse(**bid.dict())


@router.get("/{auction_id}/bids", response_model=list[BidResponse])
async def get_auction_bids(
    auction_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """Get all bids for an auction (Admin only - bids are confidential)"""
    bids = await bids_collection.find(
        {"auction_id": auction_id}
    ).sort("bid_amount", -1).to_list(100)
    
    return [BidResponse(**bid) for bid in bids]


@router.post("/select-winner")
async def select_winner(
    winner_data: WinnerSelect,
    current_user: dict = Depends(get_current_admin)
):
    """Select auction winner (Admin only)"""
    # Check auction exists and is completed
    auction = await auctions_collection.find_one({"id": winner_data.auction_id})
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    if auction["status"] != "completed":
        raise HTTPException(status_code=400, detail="Auction is not completed yet")
    
    # Check bid exists
    bid = await bids_collection.find_one({"id": winner_data.winner_bid_id})
    if not bid or bid["auction_id"] != winner_data.auction_id:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    # Update auction with winner
    await auctions_collection.update_one(
        {"id": winner_data.auction_id},
        {"$set": {
            "winner_id": bid["user_id"],
            "status": "winner_selected"
        }}
    )
    
    # Send email to winner
    user = await users_collection.find_one({"id": bid["user_id"]})
    auction_details = {
        "grain_type": auction["grain_type"],
        "quality": auction["quality"],
        "quantity": auction["quantity"],
        "winning_bid": bid["bid_amount"]
    }
    send_auction_winner_email(user["email"], user["full_name"], auction_details)
    
    logger.info(f"Winner selected for auction {winner_data.auction_id}: {user['email']}")
    
    return {"success": True, "message": "Winner selected and notified"}
