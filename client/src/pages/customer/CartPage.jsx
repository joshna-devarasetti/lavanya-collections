import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR, formatDate } from '../../utils/formatters';

export const CartPage = () => {
  const { cartItems, removeItem, updateQuantity, clearCart, totalOrderValue, totalAdvanceDue, totalBalanceDue } = useCart();
  const navigate = useNavigate();

  const isFreeShipping = totalOrderValue >= 1999 || totalOrderValue === 0;
  const shippingFee = isFreeShipping ? 0 : 99;
  const grandTotal = totalOrderValue + shippingFee;
  const payableTodayWithShipping = totalAdvanceDue + shippingFee;

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-cream)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <ShoppingBag size={36} color="var(--gold-dark)" />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Your Shopping Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem auto' }}>
          Explore our handcrafted traditional jewellery, photoshoot frocks, and rental sets to begin your celebration.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/shop" className="btn btn-primary">Browse All Collections</Link>
          <Link to="/rentals" className="btn btn-outline">Explore Rentals</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 1rem 5rem 1rem' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>Shopping & Rental Cart</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          Review your selected pieces and flexible payment options
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Items List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{cartItems.length} distinct item(s)</span>
              <button
                onClick={clearCart}
                style={{ background: 'transparent', color: 'var(--status-danger)', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Clear Entire Cart
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map((item) => {
                const identifier = item.rentalKey || item.productId;
                return (
                  <div
                    key={identifier}
                    className="card"
                    style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: '1.25rem', padding: '1.25rem', alignItems: 'center' }}
                  >
                    {/* Item Image */}
                    <div style={{ width: '100px', height: '110px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-cream)' }}>
                      <img src={item.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Item Details */}
                    <div>
                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        {item.itemType === 'rental' ? (
                          <span className="badge badge-rent">Rental Item</span>
                        ) : (
                          <span className="badge badge-buy">Purchase Item</span>
                        )}
                        <span className="badge badge-gold">{item.advancePercentage}% Advance</span>
                      </div>

                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                        {item.name}
                      </h3>

                      {/* Rental Dates if applicable */}
                      {item.itemType === 'rental' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--accent-rent)', marginBottom: '0.5rem' }}>
                          <Calendar size={14} />
                          <span>Dates: {formatDate(item.rentalStartDate)} to {formatDate(item.rentalEndDate)} ({item.rentalDays} days)</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', background: '#FFFFFF' }}>
                          <button
                            onClick={() => updateQuantity(identifier, item.quantity - 1)}
                            style={{ padding: '0.2rem 0.6rem', background: 'transparent', fontWeight: 600 }}
                          >
                            -
                          </button>
                          <span style={{ padding: '0.2rem 0.6rem', fontSize: '0.9rem', fontWeight: 600 }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(identifier, item.quantity + 1)}
                            style={{ padding: '0.2rem 0.6rem', background: 'transparent', fontWeight: 600 }}
                          >
                            +
                          </button>
                        </div>

                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {formatINR(item.unitPrice)} each
                        </span>
                      </div>
                    </div>

                    {/* Line Total & Remove */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                        {formatINR(item.subtotal)}
                      </span>
                      <button
                        onClick={() => removeItem(identifier)}
                        style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                        title="Remove item"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              Payment Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Value of Items:</span>
                <span style={{ fontWeight: 600 }}>{formatINR(totalOrderValue)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shipping Fee:</span>
                <span>{isFreeShipping ? <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>FREE (Orders ₹1,999+)</span> : formatINR(shippingFee)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '1.05rem', fontWeight: 700 }}>
                <span>Grand Total:</span>
                <span style={{ fontFamily: 'var(--font-serif)' }}>{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Advance payment highlight box */}
            <div className="card card-gold" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-dark)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                <Sparkles size={16} />
                <span>Advance Payment Option</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem' }}>Payable Advance Today:</span>
                <strong style={{ color: 'var(--gold-dark)', fontSize: '1.05rem' }}>{formatINR(payableTodayWithShipping)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>Remaining Balance on Delivery:</span>
                <span>{formatINR(totalBalanceDue)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-block btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <ShieldCheck size={15} color="var(--status-success)" />
              <span>100% Secure Checkout powered by PhonePe UPI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
