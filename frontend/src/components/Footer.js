import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-xl font-bold text-white">GrainCompany</span>
            </div>
            <p className="text-sm">{t.footer.description}</p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t.nav.catalog}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/catalog" className="hover:text-amber-500 transition-colors">
                  {t.catalog.wheat}
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-amber-500 transition-colors">
                  {t.catalog.corn}
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-amber-500 transition-colors">
                  {t.catalog.barley}
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-amber-500 transition-colors">
                  {t.catalog.sunflower}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t.contact.info}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>{t.contact.addressText}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>{t.contact.phoneText}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-500" />
                <span>{t.contact.emailText}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© 2025 GrainCompany. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;