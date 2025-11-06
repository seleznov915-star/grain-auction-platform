import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  ua: {
    nav: {
      home: 'Головна',
      catalog: 'Каталог',
      about: 'Про нас',
      contact: 'Контакти'
    },
    hero: {
      title: 'Якісне зерно від виробника',
      subtitle: 'Пропонуємо пшеницю, кукурудзу, ячмінь та соняшник високої якості з детальною інформацією про параметри',
      cta: 'Переглянути каталог'
    },
    catalog: {
      title: 'Наш каталог зерна',
      subtitle: 'Високоякісне зерно з детальними характеристиками',
      moisture: 'Вологість',
      protein: 'Білок',
      gluten: 'Клейковина',
      nature: 'Натура',
      info: 'Опис',
      order: 'Замовити',
      premium: 'Преміум',
      standard: 'Стандарт',
      wheat: 'Пшениця',
      corn: 'Кукурудза',
      barley: 'Ячмінь',
      sunflower: 'Соняшник'
    },
    about: {
      title: 'Про нашу компанію',
      subtitle: 'Надійний постачальник якісного зерна',
      experience: 'Досвід роботи',
      yearsText: 'років на ринку',
      quality: 'Контроль якості',
      qualityText: 'Сертифіковане зерно',
      delivery: 'Доставка',
      deliveryText: 'По всій Україні',
      description: 'Ми спеціалізуємося на виробництві та постачанні високоякісного зерна. Наша компанія працює безпосередньо з фермерськими господарствами, забезпечуючи суворий контроль якості на всіх етапах виробництва. Ми пропонуємо пшеницю, кукурудзу, ячмінь та соняшник з детальною інформацією про всі параметри якості.'
    },
    contact: {
      title: 'Зв\'яжіться з нами',
      subtitle: 'Готові відповісти на всі ваші запитання',
      name: 'Ім\'я',
      email: 'Email',
      phone: 'Телефон',
      message: 'Повідомлення',
      send: 'Надіслати',
      info: 'Контактна інформація',
      address: 'Адреса',
      addressText: 'м. Київ, вул. Зернова, 123',
      phoneText: '+380 44 123 4567',
      emailText: 'info@graincompany.ua'
    },
    footer: {
      rights: 'Всі права захищені',
      description: 'Якісне зерно від виробника'
    },
    orderModal: {
      title: 'Замовлення зерна',
      grainType: 'Тип зерна',
      quantity: 'Кількість (тонн)',
      name: 'Ваше ім\'я',
      phone: 'Телефон',
      email: 'Email',
      comment: 'Коментар',
      send: 'Надіслати замовлення',
      cancel: 'Скасувати',
      success: 'Замовлення успішно надіслано!',
      error: 'Помилка відправки замовлення'
    },
    auction: {
      category1: '1 категорія',
      category2: '2 категорія',
      category3: '3 категорія',
      paymentCashless: 'Безготівка',
      paymentCash: 'Готівка',
      deliveryLocation: 'Місце доставки',
      paymentType: 'Тип оплати'
    },
    dashboard: {
      welcome: 'Вітаємо',
      logout: 'Вийти',
      adminPanel: 'Адмін Панель',
      myAccount: 'Мій Кабінет',
      accreditation: 'Акредитація',
      auctions: 'Аукціони',
      bids: 'Ставки'
    }
  },
  en: {
    nav: {
      home: 'Home',
      catalog: 'Catalog',
      about: 'About',
      contact: 'Contact'
    },
    hero: {
      title: 'Quality Grain from Producer',
      subtitle: 'We offer high-quality wheat, corn, barley and sunflower with detailed parameter information',
      cta: 'View Catalog'
    },
    catalog: {
      title: 'Our Grain Catalog',
      subtitle: 'High-quality grain with detailed characteristics',
      moisture: 'Moisture',
      protein: 'Protein',
      gluten: 'Gluten',
      nature: 'Test Weight',
      info: 'Info',
      order: 'Order',
      premium: 'Premium',
      standard: 'Standard',
      wheat: 'Wheat',
      corn: 'Corn',
      barley: 'Barley',
      sunflower: 'Sunflower'
    },
    about: {
      title: 'About Our Company',
      subtitle: 'Reliable supplier of quality grain',
      experience: 'Experience',
      yearsText: 'years in market',
      quality: 'Quality Control',
      qualityText: 'Certified grain',
      delivery: 'Delivery',
      deliveryText: 'Throughout Ukraine',
      description: 'We specialize in production and supply of high-quality grain. Our company works directly with farms, ensuring strict quality control at all production stages. We offer wheat, corn, barley and sunflower with detailed information about all quality parameters.'
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'Ready to answer all your questions',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      send: 'Send',
      info: 'Contact Information',
      address: 'Address',
      addressText: 'Kyiv, Zernova St., 123',
      phoneText: '+380 44 123 4567',
      emailText: 'info@graincompany.ua'
    },
    footer: {
      rights: 'All rights reserved',
      description: 'Quality grain from producer'
    },
    orderModal: {
      title: 'Order Grain',
      grainType: 'Grain Type',
      quantity: 'Quantity (tons)',
      name: 'Your Name',
      phone: 'Phone',
      email: 'Email',
      comment: 'Comment',
      send: 'Send Order',
      cancel: 'Cancel',
      success: 'Order sent successfully!',
      error: 'Error sending order'
    },
    auction: {
      category1: 'Category 1',
      category2: 'Category 2',
      category3: 'Category 3',
      paymentCashless: 'Cashless',
      paymentCash: 'Cash',
      deliveryLocation: 'Delivery Location',
      paymentType: 'Payment Type'
    },
    dashboard: {
      welcome: 'Welcome',
      logout: 'Logout',
      adminPanel: 'Admin Panel',
      myAccount: 'My Account',
      accreditation: 'Accreditation',
      auctions: 'Auctions',
      bids: 'Bids'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ua');

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};