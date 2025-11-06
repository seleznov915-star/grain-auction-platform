import { fetchGrains } from '../api/grains';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import OrderModal from '../components/OrderModal';
import InfoModal from '../components/InfoModal';
import axios from 'axios';
import ws from '../lib/socket';






const Catalog = () => {
  const { language, t } = useLanguage();
  const [selectedGrain, setSelectedGrain] = useState(null);
   const [infoGrain, setInfoGrain] = useState(null); 
  const [grains, setGrains] = useState([]);
  const [loading, setLoading] = useState(true);

const handleInfo = (grain) => {
    setInfoGrain(grain);
  };

  useEffect(() => {
    const loadGrains = async () => {
      try {
        const data = await fetchGrains();
        setGrains(data);
      } catch (error) {
        console.error('Failed to load grains:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGrains();
  }, []);

  const handleOrder = (grain) => {
    setSelectedGrain(grain);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t.catalog.title}</h1>
          <p className="text-xl text-gray-600">{t.catalog.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {grains.map((grain) => (
            <div
              key={grain.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={grain.image}
                  alt={language === 'ua' ? grain.name_ua : grain.name_en}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
                    {grain.category} {language === 'ua' ? 'категорія' : 'category'}
                  </Badge>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'ua' ? grain.name_ua : grain.name_en}
                </h3>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t.catalog.moisture}:</span>
                    <span className="font-semibold text-gray-900">{grain.moisture}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t.catalog.protein}:</span>
                    <span className="font-semibold text-gray-900">{grain.protein}</span>
                  </div>
                  {grain.gluten !== 'N/A' && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t.catalog.gluten}:</span>
                      <span className="font-semibold text-gray-900">{grain.gluten}</span>
                    </div>
                  )}
                  {grain.nature !== 'N/A' && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t.catalog.nature}:</span>
                      <span className="font-semibold text-gray-900">{grain.nature}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleInfo(grain)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {t.catalog.info} 
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedGrain && (
        <OrderModal
          grain={selectedGrain}
          onClose={() => setSelectedGrain(null)}
        />
        
      )}
      {infoGrain && (
  <InfoModal
    grain={infoGrain}
    onClose={() => setInfoGrain(null)}
  />
)}
    </div>
  );
};

export default Catalog;
