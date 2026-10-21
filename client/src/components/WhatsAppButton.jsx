import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton = () => {
  const whatsappNumber = import.meta.env.VITE_STORE_WHATSAPP || '+919876543210';
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const defaultMessage = encodeURIComponent('Hello Lavanya Collections! I would like to inquire about your products and rentals.');

  return (
    <a
      href={`https://wa.me/${cleanPhone}?text=${defaultMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={{
        position: 'fixed',
        bottom: '1.75rem',
        left: '1.75rem',
        zIndex: 890,
        backgroundColor: '#25D366',
        color: '#FFFFFF',
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.08)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 211, 102, 0.4)';
      }}
    >
      <MessageCircle size={28} />
    </a>
  );
};
