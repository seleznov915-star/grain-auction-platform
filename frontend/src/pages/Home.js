import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Award, Truck, CheckCircle } from 'lucide-react';

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 opacity-60"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t.hero.subtitle}
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center space-x-2 bg-amber-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-amber-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>{t.hero.cta}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.about.quality}</h3>
              <p className="text-gray-600">{t.about.qualityText}</p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.about.experience}</h3>
              <p className="text-gray-600">15+ {t.about.yearsText}</p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.about.delivery}</h3>
              <p className="text-gray-600">{t.about.deliveryText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">{t.catalog.title}</h2>
          <p className="text-xl text-amber-50 mb-8 max-w-2xl mx-auto">
            {t.catalog.subtitle}
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center space-x-2 bg-white text-amber-600 px-8 py-4 rounded-lg font-semibold hover:bg-amber-50 transition-all hover:scale-105 shadow-lg"
          >
            <span>{t.hero.cta}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;