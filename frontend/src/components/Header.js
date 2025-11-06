import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Globe, User } from 'lucide-react';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-xl font-bold text-gray-900">GrainCompany</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-base font-medium transition-colors hover:text-amber-600 ${
                isActive('/') ? 'text-amber-600' : 'text-gray-700'
              }`}
            >
              {t.nav.home}
            </Link>
            <Link
              to="/catalog"
              className={`text-base font-medium transition-colors hover:text-amber-600 ${
                isActive('/catalog') ? 'text-amber-600' : 'text-gray-700'
              }`}
            >
              {t.nav.catalog}
            </Link>
            <Link
              to="/about"
              className={`text-base font-medium transition-colors hover:text-amber-600 ${
                isActive('/about') ? 'text-amber-600' : 'text-gray-700'
              }`}
            >
              {t.nav.about}
            </Link>
            <Link
              to="/contact"
              className={`text-base font-medium transition-colors hover:text-amber-600 ${
                isActive('/contact') ? 'text-amber-600' : 'text-gray-700'
              }`}
            >
              {t.nav.contact}
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLanguage(language === 'ua' ? 'en' : 'ua')}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Globe className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700 uppercase">{language}</span>
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Кабінет</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Вхід</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;