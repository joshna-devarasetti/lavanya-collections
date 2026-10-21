import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: 'Lavanya Collections',
    tagline: 'Traditional Jewellery, Photoshoot Frocks & Customized Gifts',
    contactNumber: '+91 98765 43210',
    whatsappNumber: '+919876543210',
    email: 'contact@lavanyacollections.com',
    address: {
      street: 'Plot 42, Traditional Enclave, Jubilee Hills Road No. 36',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500033',
      country: 'India'
    },
    defaultAdvancePercentage: 20,
    flatShippingRate: 99,
    freeShippingThreshold: 1999,
    policies: {}
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.warn('Failed to fetch business settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const cleanWhatsAppPhone = (settings?.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '');
  const cleanContactPhone = (settings?.contactNumber || '+919876543210').replace(/[^0-9]/g, '');

  const addr = settings?.address || {};
  const formattedAddress = [addr.street, addr.city, addr.state, addr.postalCode]
    .filter(Boolean)
    .join(', ') || 'Hyderabad, Telangana, India';

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        storeName: settings?.storeName || 'Lavanya Collections',
        tagline: settings?.tagline || '',
        contactNumber: settings?.contactNumber || '+91 98765 43210',
        whatsappNumber: settings?.whatsappNumber || '+919876543210',
        cleanWhatsAppPhone,
        cleanContactPhone,
        email: settings?.email || 'contact@lavanyacollections.com',
        address: settings?.address || {},
        formattedAddress,
        policies: settings?.policies || {}
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
