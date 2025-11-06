import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}`;

const AccreditationManager = () => {
  const { token } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingAccreditations();
  }, []);

  const fetchPendingAccreditations = async () => {
    try {
      const response = await axios.get(`${API}/auth/pending-accreditations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingUsers(response.data);
    } catch (error) {
      console.error('Error fetching accreditations:', error);
      toast.error('Помилка завантаження заявок');
    } finally {
      setLoading(false);
    }
  };

  const handleAccreditation = async (userId, status) => {
    try {
      await axios.post(
        `${API}/auth/update-accreditation`,
        { user_id: userId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Акредитацію ${status === 'approved' ? 'схвалено' : 'відхилено'}`);
      fetchPendingAccreditations();
    } catch (error) {
      toast.error('Помилка обробки акредитації');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Завантаження...</div>;
  }

  if (pendingUsers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          Немає заявок на акредитацію
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pendingUsers.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Компанія:</span> {user.company_name}</p>
                  <p><span className="font-medium">ЄДРПОУ:</span> {user.edrpou}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Телефон:</span> {user.phone}</p>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  onClick={() => handleAccreditation(user.id, 'approved')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Схвалити
                </Button>
                <Button
                  onClick={() => handleAccreditation(user.id, 'rejected')}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Відхилити
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AccreditationManager;
