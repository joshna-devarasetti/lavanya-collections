import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { ProductCard } from '../../components/ProductCard';

export const RentalCatalogPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      setLoading(true);
      try {
        const res = await api.getProducts('availabilityType=rent');
        if (res.success) {
          setRentals(res.products);
        }
      } catch (err) {
        console.error('Error fetching rentals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, []);

  return (
    <div style={{ padding: '2.5rem 1rem 5rem 1rem' }}>
      <div className="container">
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #FBEFEB 0%, #F5ECDB 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2rem',
          border: '1px solid #E8C1B7',
          marginBottom: '3rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FFFFFF', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-gold)', marginBottom: '1rem' }}>
            <Calendar size={14} color="var(--accent-rent)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-rent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Celebration Rentals
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Rental Collections & Photoshoot Wardrobe
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
            Look regal for your baby photoshoots, weddings, receptions, and traditional ceremonies without the cost of outright purchase. Flexible 3-day rental periods with easy booking.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--status-success)" />
              <span>Sanitized & Cleaned</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--status-success)" />
              <span>Low 20-30% Advance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--status-success)" />
              <span>Pan-India Courier & Hyderabad Pickup</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <p>Loading rental wardrobe & decor items...</p>
          </div>
        ) : rentals.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h3>No rental items available right now</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Check back soon or explore our purchase collections.</p>
          </div>
        ) : (
          <div className="grid-products">
            {rentals.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
