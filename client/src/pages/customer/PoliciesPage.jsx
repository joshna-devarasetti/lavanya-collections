import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export const PoliciesPage = () => {
  const { policies } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const elem = document.querySelector(location.hash);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location, policies]);

  return (
    <div style={{ padding: '3rem 1rem 5rem 1rem' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <h1 style={{ fontSize: '2.6rem', marginBottom: '0.75rem', textAlign: 'center' }}>Boutique Policies</h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '3rem' }}>
          Clear and transparent guidelines for shopping, rentals, and customized designs
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Returns */}
          <section id="returns" className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              1. Return & Refund Policy
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {policies?.returnPolicy || 'Due to the custom and delicate nature of traditional jewellery and handmade items, returns are accepted within 3 days of delivery only in cases of verified transit damage. Please contact support with unboxing video proof.'}
            </p>
          </section>

          {/* Rentals */}
          <section id="rentals" className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-rent)' }}>
              2. Rental Terms & Security Policy
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {policies?.rentalPolicy || 'Rental items must be handled with utmost care. Do not wash, dry clean, or alter the garments/jewellery. Please return items in the provided protective boxes by the agreed return date. Late returns may incur daily charges.'}
            </p>
          </section>

          {/* Custom Orders */}
          <section id="custom" className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--gold-dark)' }}>
              3. Custom Design & Advance Payment Terms
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {policies?.customDesignPolicy || 'Custom orders require advance confirmation. Once raw materials are cut or jewelry components are assembled, advance payments are non-refundable. Delivery timelines are estimates and subject to craftsmanship complexity.'}
            </p>
          </section>

          {/* Privacy */}
          <section id="privacy" className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>
              4. Privacy Policy
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {policies?.privacyPolicy || 'Lavanya Collections respects your privacy. We collect customer names, phone numbers, and delivery addresses strictly for order fulfillment and notification purposes.'}
            </p>
          </section>

          {/* Terms */}
          <section id="terms" className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>
              5. Terms of Service
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {policies?.termsOfService || 'By placing an order or rental booking with Lavanya Collections, you agree to our terms, rental agreements, and payment schedules.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
