import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import AccreditationManager from './AccreditationManager';
import AuctionManager from './AuctionManager';
import BidManager from './BidManager';
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.dashboard.adminPanel}</h1>
            <p className="text-gray-600 mt-1">{t.dashboard.welcome}, {user.full_name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>{t.dashboard.logout}</span>
          </Button>
        </div>

        <Tabs defaultValue="accreditation" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="accreditation">{t.dashboard.accreditation}</TabsTrigger>
            <TabsTrigger value="auctions">{t.dashboard.auctions}</TabsTrigger>
            <TabsTrigger value="bids">{t.dashboard.bids}</TabsTrigger>
          </TabsList>

          <TabsContent value="accreditation">
            <AccreditationManager />
          </TabsContent>

          <TabsContent value="auctions">
            <AuctionManager />
          </TabsContent>

          <TabsContent value="bids">
            <BidManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
