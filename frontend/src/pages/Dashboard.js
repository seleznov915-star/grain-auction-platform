import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import BuyerDashboard from '../components/BuyerDashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="text-xl text-gray-600">Завантаження...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.role === 'admin' ? <AdminDashboard /> : <BuyerDashboard />;
};

export default Dashboard;
