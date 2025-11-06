import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderModal = ({ grain, onClose }) => {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    grain_type: language === 'ua' ? grain.name_ua : grain.name_en,
    grain_id: grain.id,
    quality: grain.quality,
    quantity: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    comment: ''
    
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const payload = {
      grain_id: formData.grain_id,
      grain_type: formData.grain_type,
      quantity: parseFloat(formData.quantity),
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_email: formData.customer_email,
      comment: formData.comment,
    };

    await axios.post(`${API}/orders`, payload);
    toast.success(t.orderModal.success);
    onClose();
  } catch (error) {
    console.error('Error submitting order:', error);
    toast.error(t.orderModal.error);
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t.orderModal.title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="grain_type">{t.orderModal.grainType}</Label>
            <Input
              id="grain_type"
              name="grain_type"
              value={formData.grain_type}
              disabled
              className="mt-1 bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="quantity">{t.orderModal.quantity}</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              step="0.1"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="customer_name">{t.orderModal.name}</Label>
            <Input
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="customer_phone">{t.orderModal.phone}</Label>
            <Input
              id="customer_phone"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="customer_email">{t.orderModal.email}</Label>
            <Input
              id="customer_email"
              name="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="comment">{t.orderModal.comment}</Label>
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t.orderModal.cancel}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? '...' : t.orderModal.send}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;