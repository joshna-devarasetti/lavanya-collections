import React, { useState } from 'react';
import { QrCode, X, Smartphone, Wifi, Copy, Check } from 'lucide-react';

export const QrCodeModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const mobileUrl = 'http://10.230.144.205:5173/';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(44, 24, 16, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem'
    }}>
      <div style={{
        background: '#FAF7F2',
        border: '2px solid #C59B27',
        borderRadius: '16px',
        maxWidth: '440px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 20px 40px rgba(44, 24, 16, 0.25)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#2C1810',
            padding: '0.25rem'
          }}
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(197, 155, 39, 0.15)',
          color: '#C59B27',
          marginBottom: '0.75rem'
        }}>
          <Smartphone size={26} />
        </div>

        <h3 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          color: '#2C1810',
          marginBottom: '0.25rem'
        }}>
          Scan to Watch on Mobile
        </h3>
        <p style={{
          fontSize: '0.85rem',
          color: '#6E5D53',
          marginBottom: '1.25rem'
        }}>
          Open your smartphone's camera app to experience the Lavanya Collections boutique website live.
        </p>

        {/* QR Code Container */}
        <div style={{
          background: '#FFFFFF',
          padding: '1rem',
          borderRadius: '12px',
          display: 'inline-block',
          border: '1px solid #E6DCCD',
          boxShadow: '0 4px 12px rgba(44,24,16,0.06)',
          marginBottom: '1.25rem'
        }}>
          <img
            src="/qr-code.png"
            alt="Scan QR code to view Lavanya Collections on mobile"
            style={{ width: '220px', height: '220px', display: 'block' }}
          />
        </div>

        {/* Network requirement note */}
        <div style={{
          background: '#F5EFEB',
          border: '1px solid #E6DCCD',
          borderRadius: '8px',
          padding: '0.75rem',
          fontSize: '0.8rem',
          color: '#2C1810',
          textAlign: 'left',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            <Wifi size={15} color="#C59B27" />
            <span>Wi-Fi Connection Notice</span>
          </div>
          <div>Make sure your phone is connected to the same Wi-Fi network as this PC to open the local site.</div>
        </div>

        {/* URL and Copy */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          border: '1px solid #E6DCCD',
          borderRadius: '6px',
          padding: '0.5rem 0.75rem',
          fontSize: '0.8rem'
        }}>
          <code style={{ color: '#2C1810', wordBreak: 'break-all' }}>{mobileUrl}</code>
          <button
            onClick={handleCopy}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copied ? '#2E7D32' : '#C59B27',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: 600,
              fontSize: '0.75rem',
              marginLeft: '0.5rem'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
