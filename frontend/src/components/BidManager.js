import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Trophy, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}`;

const BidManager = () => {
  const { token } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAllAuctions();
  }, []);

  // Auto-refresh every 5 seconds when auction selected and autoRefresh is on
  useEffect(() => {
    if (selectedAuction && autoRefresh) {
      const interval = setInterval(() => {
        fetchBids(selectedAuction, true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedAuction, autoRefresh]);

  const fetchAllAuctions = async () => {
    try {
      const response = await axios.get(`${API}/auctions/list`);
      // Show both active and completed auctions
      const relevantAuctions = response.data.filter(a => 
        a.status === 'active' || a.status === 'completed' || a.status === 'winner_selected'
      );
      setAuctions(relevantAuctions);
    } catch (error) {
      toast.error('Помилка завантаження');
    }
  };

  const fetchBids = async (auctionId, silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const response = await axios.get(`${API}/auctions/${auctionId}/bids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBids(response.data);
      setSelectedAuction(auctionId);
    } catch (error) {
      if (!silent) toast.error('Помилка завантаження ставок');
    } finally {
      setIsRefreshing(false);
    }
  };

  const selectWinner = async (bidId) => {
    try {
      await axios.post(
        `${API}/auctions/select-winner`,
        { auction_id: selectedAuction, winner_bid_id: bidId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Переможця обрано та повідомлено!');
      fetchAllAuctions();
      setSelectedAuction(null);
      setBids([]);
    } catch (error) {
      toast.error('Помилка вибору переможця');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-500',
      completed: 'bg-blue-500',
      winner_selected: 'bg-purple-500'
    };
    const labels = {
      active: 'Активний',
      completed: 'Завершено',
      winner_selected: 'Переможець обраний'
    };
    return <span className={`px-2 py-1 rounded text-white text-xs ${colors[status]}`}>{labels[status]}</span>;
  };

  const selectedAuctionData = auctions.find(a => a.id === selectedAuction);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Аукціони з торгами</h2>
        <div className="space-y-3">
          {auctions.map((auction) => (
            <Card 
              key={auction.id} 
              className={`cursor-pointer hover:shadow-md transition-all ${selectedAuction === auction.id ? 'ring-2 ring-amber-500' : ''}`}
              onClick={() => fetchBids(auction.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{auction.grain_type} ({auction.quality})</h3>
                    <p className="text-sm text-gray-600">Ставок: {auction.total_bids}</p>
                    <p className="text-xs text-gray-500">Найвища: {auction.current_highest_bid || auction.starting_price} грн</p>
                  </div>
                  {getStatusBadge(auction.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedAuction && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Ставки в реальному часі</h2>
              {selectedAuctionData && (
                <p className="text-sm text-gray-600">
                  {selectedAuctionData.grain_type} ({selectedAuctionData.quality}) - {selectedAuctionData.quantity} тонн
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span>Авто-оновлення (5 сек)</span>
              </label>
              <Button
                onClick={() => fetchBids(selectedAuction)}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Оновити
              </Button>
            </div>
          </div>

          {bids.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Ставок поки немає
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bids.map((bid, index) => (
                <Card key={bid.id} className={index === 0 ? 'border-2 border-yellow-500' : ''}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        {index === 0 && <Trophy className="w-6 h-6 text-yellow-500 flex-shrink-0" />}
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-lg">{bid.user_name}</p>
                            <span className="text-sm text-gray-500">({bid.user_company})</span>
                          </div>
                          <p className="text-2xl text-amber-600 font-bold">{bid.bid_amount} грн</p>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>Оплата: <span className="font-medium">{bid.payment_type === 'cashless' ? 'Безготівка' : 'Готівка'}</span></p>
                            <p>Доставка: <span className="font-medium">{bid.delivery_location}</span></p>
                            <p className="text-xs text-gray-500">{new Date(bid.created_at).toLocaleString('uk-UA')}</p>
                          </div>
                        </div>
                      </div>
                      {selectedAuctionData?.status !== 'winner_selected' && (
                        <Button 
                          onClick={() => selectWinner(bid.id)} 
                          className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                        >
                          Обрати переможцем
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BidManager;
