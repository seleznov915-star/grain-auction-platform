import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}`;

const AuctionManager = () => {
  const { token } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [grains, setGrains] = useState([]);
  const [selectedGrain, setSelectedGrain] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    quantity: '',
    starting_price: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchAuctions();
    fetchGrains();
    // Auto-refresh auctions every 10 seconds
    const interval = setInterval(fetchAuctions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchGrains = async () => {
    try {
      const response = await axios.get(`${API}/grains`);
      setGrains(response.data);
    } catch (error) {
      console.error('Error fetching grains:', error);
    }
  };

  const fetchAuctions = async () => {
    try {
      const response = await axios.get(`${API}/auctions/list`);
      setAuctions(response.data);
    } catch (error) {
      toast.error('Помилка завантаження аукціонів');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedGrain) {
      toast.error('Оберіть зерно з каталогу');
      return;
    }
    
    try {
      await axios.post(
        `${API}/auctions/create`,
        {
          grain_id: selectedGrain.id,
          grain_type: selectedGrain.name_ua,
          category: selectedGrain.category,
          moisture: selectedGrain.moisture,
          protein: selectedGrain.protein,
          gluten: selectedGrain.gluten,
          nature: selectedGrain.nature,
          quantity: parseFloat(formData.quantity),
          starting_price: parseFloat(formData.starting_price),
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Аукціон створено!');
      setShowCreate(false);
      setSelectedGrain(null);
      fetchAuctions();
      setFormData({ quantity: '', starting_price: '', start_date: '', end_date: '' });
    } catch (error) {
      toast.error('Помилка створення аукціону');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-gray-500',
      active: 'bg-green-500',
      completed: 'bg-blue-500',
      winner_selected: 'bg-purple-500'
    };
    const labels = {
      pending: 'Очікує',
      active: 'Активний',
      completed: 'Завершено',
      winner_selected: 'Переможець обраний'
    };
    return <span className={`px-2 py-1 rounded text-white text-xs ${colors[status]}`}>{labels[status]}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Аукціони</h2>
        <Button onClick={() => setShowCreate(true)} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4 mr-2" />
          Створити аукціон
        </Button>
      </div>

      <div className="space-y-4">
        {auctions.map((auction) => (
          <Card key={auction.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{auction.grain_type} ({auction.category} категорія)</h3>
                    {getStatusBadge(auction.status)}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Кількість: {auction.quantity} тонн</p>
                    <p>Вологість: {auction.moisture} | Білок: {auction.protein}</p>
                    {auction.gluten !== 'N/A' && <p>Клейковина: {auction.gluten}</p>}
                    {auction.nature !== 'N/A' && <p>Натура: {auction.nature}</p>}
                    <p>Стартова ціна: {auction.starting_price} грн</p>
                    <p>Поточна найвища ставка: {auction.current_highest_bid || 'Немає ставок'} грн</p>
                    <p>Кількість ставок: {auction.total_bids}</p>
                    <p>Початок: {new Date(auction.start_date).toLocaleString('uk-UA')}</p>
                    <p>Кінець: {new Date(auction.end_date).toLocaleString('uk-UA')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Створити аукціон</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Оберіть зерно з каталогу</Label>
              <select 
                className="w-full border rounded px-3 py-2"
                value={selectedGrain?.id || ''}
                onChange={(e) => {
                  const grain = grains.find(g => g.id === e.target.value);
                  setSelectedGrain(grain);
                }}
                required
              >
                <option value="">-- Оберіть зерно --</option>
                {grains.map(grain => (
                  <option key={grain.id} value={grain.id}>
                    {grain.name_ua} - {grain.category} категорія
                  </option>
                ))}
              </select>
            </div>
            
            {selectedGrain && (
              <div className="bg-gray-50 p-4 rounded space-y-2 text-sm">
                <h3 className="font-semibold">Характеристики:</h3>
                <p>Вологість: {selectedGrain.moisture}</p>
                <p>Білок: {selectedGrain.protein}</p>
                {selectedGrain.gluten !== 'N/A' && <p>Клейковина: {selectedGrain.gluten}</p>}
                {selectedGrain.nature !== 'N/A' && <p>Натура: {selectedGrain.nature}</p>}
              </div>
            )}
            <div>
              <Label>Кількість (тонн)</Label>
              <Input type="number" step="0.1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required />
            </div>
            <div>
              <Label>Стартова ціна (грн)</Label>
              <Input type="number" value={formData.starting_price} onChange={(e) => setFormData({...formData, starting_price: e.target.value})} required />
            </div>
            <div>
              <Label>Дата початку</Label>
              <Input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} required />
            </div>
            <div>
              <Label>Дата закінчення</Label>
              <Input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} required />
            </div>
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">Створити</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuctionManager;
