import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { LogOut, Clock, CheckCircle, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}`;

const BuyerDashboard = () => {
  const { user, logout, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [bidData, setBidData] = useState({});

  useEffect(() => {
    fetchAuctions();
    // Auto-refresh auctions every 10 seconds
    const interval = setInterval(fetchAuctions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await axios.get(`${API}/auctions/list`);
      setAuctions(response.data);
    } catch (error) {
      toast.error('Помилка завантаження аукціонів');
    }
  };

  const placeBid = async (auctionId) => {
    const data = bidData[auctionId];
    if (!data?.amount || !data?.paymentType || !data?.deliveryLocation) {
      toast.error('Заповніть всі поля');
      return;
    }

    try {
      await axios.post(
        `${API}/auctions/bid`,
        { 
          auction_id: auctionId, 
          bid_amount: parseFloat(data.amount),
          payment_type: data.paymentType,
          delivery_location: data.deliveryLocation
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Ставку зроблено!');
      fetchAuctions();
      setBidData({ ...bidData, [auctionId]: {} });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Помилка створення ставки');
    }
  };
  
  const updateBidField = (auctionId, field, value) => {
    setBidData({
      ...bidData,
      [auctionId]: {
        ...(bidData[auctionId] || {}),
        [field]: value
      }
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-gray-500', text: 'Очікує' },
      active: { color: 'bg-green-500', text: 'Активний' },
      completed: { color: 'bg-blue-500', text: 'Завершено' },
      winner_selected: { color: 'bg-purple-500', text: 'Переможець обраний' }
    };
    const { color, text } = config[status] || config.pending;
    return <span className={`px-2 py-1 rounded text-white text-xs ${color}`}>{text}</span>;
  };

  const getAccreditationStatus = () => {
    if (user.accreditation_status === 'approved') {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span>Акредитовано</span>
        </div>
      );
    } else if (user.accreditation_status === 'rejected') {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <XCircle className="w-5 h-5" />
          <span>Відхилено</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2 text-yellow-600">
          <Clock className="w-5 h-5" />
          <span>Очікує акредитації</span>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Мій Кабінет</h1>
            <p className="text-gray-600 mt-1">Вітаємо, {user.full_name}</p>
            <div className="mt-2">{getAccreditationStatus()}</div>
          </div>
          <Button onClick={() => { logout(); navigate('/'); }} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Вийти
          </Button>
        </div>

        {user.accreditation_status !== 'approved' && (
          <Card className="mb-8 border-yellow-500 bg-yellow-50">
            <CardContent className="p-6">
              <p className="text-yellow-800">
                {user.accreditation_status === 'pending' 
                  ? 'Ваша заявка на акредитацію розглядається адміністратором. Після схвалення ви зможете брати участь у торгах.'
                  : 'Ваша заявка на акредитацію була відхилена. Зверніться до адміністратора для уточнення деталей.'}
              </p>
            </CardContent>
          </Card>
        )}

        <h2 className="text-2xl font-bold mb-6">Активні аукціони</h2>
        <div className="space-y-4">
          {auctions.filter(a => a.status === 'active').map((auction) => (
            <Card key={auction.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold">{auction.grain_type} ({auction.category} категорія)</h3>
                      {getStatusBadge(auction.status)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Кількість: {auction.quantity} тонн</p>
                      <p>Вологість: {auction.moisture} | Білок: {auction.protein}</p>
                      {auction.gluten !== 'N/A' && <p>Клейковина: {auction.gluten}</p>}
                      {auction.nature !== 'N/A' && <p>Натура: {auction.nature}</p>}
                      <p>Стартова ціна: {auction.starting_price} грн</p>
                      <p>Поточна найвища ставка: <span className="text-amber-600 font-bold">{auction.current_highest_bid || auction.starting_price} грн</span></p>
                      <p>Кількість ставок: {auction.total_bids}</p>
                      <p>Завершення: {new Date(auction.end_date).toLocaleString('uk-UA')}</p>
                    </div>
                  </div>
                </div>

                {user.accreditation_status === 'approved' && (
                  <div className="space-y-3 mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Ваша ставка (грн) *
                        </label>
                        <Input
                          type="number"
                          placeholder={(auction.current_highest_bid || auction.starting_price) * 1.01}
                          value={bidData[auction.id]?.amount || ''}
                          onChange={(e) => updateBidField(auction.id, 'amount', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Мінімум: {((auction.current_highest_bid || auction.starting_price) * 1.01).toFixed(2)} грн (+1%)
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          {t.auction.paymentType} *
                        </label>
                        <select 
                          className="w-full border rounded px-3 py-2"
                          value={bidData[auction.id]?.paymentType || ''}
                          onChange={(e) => updateBidField(auction.id, 'paymentType', e.target.value)}
                        >
                          <option value="">Оберіть</option>
                          <option value="cashless">{t.auction.paymentCashless}</option>
                          <option value="cash">{t.auction.paymentCash}</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          {t.auction.deliveryLocation} *
                        </label>
                        <Input
                          placeholder="Місто, область"
                          value={bidData[auction.id]?.deliveryLocation || ''}
                          onChange={(e) => updateBidField(auction.id, 'deliveryLocation', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => placeBid(auction.id)}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      Зробити ставку
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {auctions.filter(a => a.status === 'active').length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Наразі немає активних аукціонів
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
