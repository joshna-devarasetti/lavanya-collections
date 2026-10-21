import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, MessageCircle, ShieldCheck, Heart } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const Footer = () => {
  const { storeName, contactNumber, email, cleanWhatsAppPhone, formattedAddress } = useSettings();

  return (
    <footer style={{ background: '#23130C', color: '#FAF6EE', paddingTop: '4rem', paddingBottom: '2rem', borderTop: '2px solid var(--gold-dark)', marginTop: '4rem' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <img src="/logo.svg" alt={storeName} style={{ width: '38px', height: '38px' }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: '#FAF6EE' }}>
              {storeName}
            </span>
          </div>
          <p style={{ color: '#D4C4B7', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            A boutique destination celebrating timeless Indian traditions. Offering exquisite jewellery, designer photoshoot frocks, traditional dolls, and personalized wedding decor for purchase and rentals.
          </p>
          <a
            href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(`Hello ${storeName}, I would like to inquire about your collections.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <MessageCircle size={16} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Quick Collections */}
        <div>
          <h4 style={{ color: 'var(--gold-light)', fontSize: '1.1rem', marginBottom: '1.25rem', fontFamily: 'var(--font-serif)' }}>
            Collections
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: '#D4C4B7' }}>
            <li><Link to="/shop?category=jewellery">Traditional Jewellery</Link></li>
            <li><Link to="/shop?category=photoshoot-frocks">Photoshoot Frocks</Link></li>
            <li><Link to="/shop?category=doll-sets">Handcrafted Doll Sets</Link></li>
            <li><Link to="/shop?category=decorative-items">Decorative & Puja Items</Link></li>
            <li><Link to="/shop?category=wedding-decorations">Wedding & Haldi Decor</Link></li>
            <li><Link to="/rentals" style={{ color: 'var(--gold-light)', fontWeight: 600 }}>Rentals Catalog</Link></li>
            <li><Link to="/custom-orders" style={{ color: 'var(--gold-light)', fontWeight: 600 }}>Custom Design Orders</Link></li>
          </ul>
        </div>

        {/* Policies & Support */}
        <div>
          <h4 style={{ color: 'var(--gold-light)', fontSize: '1.1rem', marginBottom: '1.25rem', fontFamily: 'var(--font-serif)' }}>
            Customer Care & Policies
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: '#D4C4B7' }}>
            <li><Link to="/policies#returns">Return & Refund Policy</Link></li>
            <li><Link to="/policies#rentals">Rental Terms & Security Policy</Link></li>
            <li><Link to="/policies#custom">Custom Orders & Advance Policy</Link></li>
            <li><Link to="/policies#privacy">Privacy Policy</Link></li>
            <li><Link to="/policies#terms">Terms of Service</Link></li>
            <li><Link to="/contact">Contact & Store Location</Link></li>
          </ul>
        </div>

        {/* Store Location */}
        <div>
          <h4 style={{ color: 'var(--gold-light)', fontSize: '1.1rem', marginBottom: '1.25rem', fontFamily: 'var(--font-serif)' }}>
            Visit Our Boutique
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: '#D4C4B7' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <MapPin size={18} color="var(--gold-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{formattedAddress}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Phone size={16} color="var(--gold-primary)" />
              <a href={`tel:${contactNumber}`} style={{ color: '#D4C4B7', textDecoration: 'none' }}>{contactNumber}</a>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Mail size={16} color="var(--gold-primary)" />
              <a href={`mailto:${email}`} style={{ color: '#D4C4B7', textDecoration: 'none' }}>{email}</a>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', color: 'var(--gold-light)', fontSize: '0.82rem' }}>
              <ShieldCheck size={16} />
              <span>100% Genuine Craftsmanship & Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ borderTop: '1px solid rgba(232, 223, 213, 0.15)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem', color: '#A08E82' }}>
        <p>© {new Date().getFullYear()} Lavanya Collections. All rights reserved.</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          Crafted with <Heart size={13} color="#C59B27" fill="#C59B27" /> in Hyderabad, India
        </p>
      </div>
    </footer>
  );
};
