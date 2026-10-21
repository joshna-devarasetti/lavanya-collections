import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { formatINR } from '../../utils/formatters';

export const ProductDetailPage = () => {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { notifySuccess, notifyError } = useNotification();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'rent'
  const [quantity, setQuantity] = useState(1);

  // Rental state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const in4Days = new Date();
  in4Days.setDate(in4Days.getDate() + 4);

  const [rentalStartDate, setRentalStartDate] = useState(tomorrow.toISOString().slice(0, 10));
  const [rentalEndDate, setRentalEndDate] = useState(in4Days.toISOString().slice(0, 10));
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [rentalCalc, setRentalCalc] = useState(null);
  const [rentalError, setRentalError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.getProduct(slugOrId);
        if (res.success && res.product) {
          setProduct(res.product);
          setSelectedImage(res.product.images?.[0] || '');
          if (res.product.availabilityType === 'rent_only') {
            setActiveTab('rent');
          } else {
            setActiveTab('buy');
          }
        }
      } catch (err) {
        notifyError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slugOrId]);

  // Check rental availability whenever dates change
  useEffect(() => {
    if (!product || (product.availabilityType !== 'rent_only' && product.availabilityType !== 'both')) {
      return;
    }

    const checkAvailability = async () => {
      if (!rentalStartDate || !rentalEndDate) return;
      if (new Date(rentalStartDate) >= new Date(rentalEndDate)) {
        setRentalError('End date must be after start date.');
        setRentalCalc(null);
        return;
      }

      setAvailabilityChecking(true);
      setRentalError('');

      try {
        const res = await api.checkRentalAvailability(product._id, rentalStartDate, rentalEndDate);
        if (res.success) {
          if (!res.isAvailable) {
            setRentalError('This item is fully booked for the selected dates. Please choose different dates.');
            setRentalCalc(null);
          } else {
            setRentalCalc(res);
          }
        }
      } catch (err) {
        setRentalError(err.message);
        setRentalCalc(null);
      } finally {
        setAvailabilityChecking(false);
      }
    };

    checkAvailability();
  }, [product, rentalStartDate, rentalEndDate]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading handcrafted masterpiece details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          The product you are looking for does not exist or has been archived.
        </p>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const effectivePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const advancePct = product.advancePercentage || 20;

  // Advance calculation for buy
  const buyAdvanceAmount = Math.round((effectivePrice * advancePct) / 100);
  const buyBalanceAmount = effectivePrice - buyAdvanceAmount;

  const handleAddToCart = (directCheckout = false) => {
    if (activeTab === 'buy') {
      if (product.availabilityType === 'rent_only') {
        notifyError('This product is available for rental only.');
        return;
      }
      addItem(product, 'purchase', quantity);
      notifySuccess(`Added ${quantity} unit(s) of "${product.name}" to cart.`);
      if (directCheckout) navigate('/checkout');
    } else {
      if (product.availabilityType === 'buy_only') {
        notifyError('This product is available for purchase only.');
        return;
      }
      if (!rentalCalc || !rentalCalc.isAvailable) {
        notifyError('Please select valid and available rental dates.');
        return;
      }

      addItem(product, 'rental', quantity, {
        startDate: rentalStartDate,
        endDate: rentalEndDate,
        days: rentalCalc.rentalDays,
        rentalPrice: rentalCalc.estimatedRentalPrice
      });
      notifySuccess(`Rental for "${product.name}" added to cart for ${rentalCalc.rentalDays} days.`);
      if (directCheckout) navigate('/checkout');
    }
  };

  const whatsappNumber = import.meta.env.VITE_STORE_WHATSAPP || '+919876543210';
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const inquiryText = encodeURIComponent(`Hello Lavanya Collections! I am interested in "${product.name}" (Ref: ${product.slug}). Could you share more details or availability?`);

  return (
    <div style={{ padding: '2rem 1rem 5rem 1rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop">Shop</Link>
          <ChevronRight size={14} />
          <Link to={`/shop?category=${product.category?.slug}`}>{product.category?.name || 'Collection'}</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'start' }}>
          {/* Left Column: Image Gallery */}
          <div>
            <div style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: 'var(--bg-cream)',
              aspectRatio: '4 / 5',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <img
                src={selectedImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: selectedImage === img ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                      padding: 0,
                      background: 'var(--bg-cream)',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-dark)', fontWeight: 600 }}>
              {product.category?.name}
            </span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'var(--text-primary)', margin: '0.4rem 0 1rem 0', lineHeight: 1.25 }}>
              {product.name}
            </h1>

            {/* Availability Mode Tabs (if product supports both) */}
            {product.availabilityType === 'both' && (
              <div style={{ display: 'flex', borderBottom: '2px solid var(--border-subtle)', marginBottom: '1.5rem', gap: '1.5rem' }}>
                <button
                  onClick={() => setActiveTab('buy')}
                  style={{
                    background: 'transparent',
                    padding: '0.75rem 0.5rem',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: activeTab === 'buy' ? 'var(--gold-dark)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'buy' ? '3px solid var(--gold-primary)' : '3px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  Buy Outright
                </button>
                <button
                  onClick={() => setActiveTab('rent')}
                  style={{
                    background: 'transparent',
                    padding: '0.75rem 0.5rem',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: activeTab === 'rent' ? 'var(--accent-rent)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'rent' ? '3px solid var(--accent-rent)' : '3px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Calendar size={18} />
                  <span>Rent for Event</span>
                </button>
              </div>
            )}

            {/* Pricing Section */}
            {activeTab === 'buy' ? (
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                    {formatINR(effectivePrice)}
                  </span>
                  {hasDiscount && (
                    <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {formatINR(product.price)}
                    </span>
                  )}
                </div>

                {/* Advance breakdown card */}
                <div className="card card-gold" style={{ padding: '1rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--gold-dark)', fontWeight: 600, fontSize: '0.9rem' }}>
                    <Sparkles size={16} />
                    <span>Configurable Payment Option</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    You can pay a <strong>{advancePct}% advance ({formatINR(buyAdvanceAmount)})</strong> now to confirm your order, and pay the remaining balance of <strong>{formatINR(buyBalanceAmount)}</strong> upon delivery!
                  </p>
                </div>
              </div>
            ) : (
              /* Rental Options Section */
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--accent-rent)' }}>
                    {formatINR(product.rentalPrice)}
                  </span>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    per {product.rentalPeriodDays || 3} days rental
                  </span>
                </div>

                {/* Date Selection Box */}
                <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={16} color="var(--accent-rent)" />
                    <span>Select Rental Event Dates</span>
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Start Date</label>
                      <input
                        type="date"
                        value={rentalStartDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setRentalStartDate(e.target.value)}
                        className="form-input"
                        style={{ padding: '0.5rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Return Date</label>
                      <input
                        type="date"
                        value={rentalEndDate}
                        min={rentalStartDate}
                        onChange={(e) => setRentalEndDate(e.target.value)}
                        className="form-input"
                        style={{ padding: '0.5rem' }}
                      />
                    </div>
                  </div>

                  {availabilityChecking ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Checking date availability...</p>
                  ) : rentalError ? (
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', color: 'var(--status-danger)', fontSize: '0.85rem' }}>
                      <AlertCircle size={16} />
                      <span>{rentalError}</span>
                    </div>
                  ) : rentalCalc ? (
                    <div style={{ background: 'var(--bg-cream)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span>Total Rental Duration:</span>
                        <strong>{rentalCalc.rentalDays} days</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span>Calculated Rental Fee:</span>
                        <strong>{formatINR(rentalCalc.estimatedRentalPrice)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: 'var(--gold-dark)' }}>
                        <span>Advance Due Today ({rentalCalc.advancePercentage}%):</span>
                        <strong>{formatINR(rentalCalc.advanceAmount)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.35rem', color: 'var(--text-muted)' }}>
                        <span>Balance Due on Delivery:</span>
                        <span>{formatINR(rentalCalc.balanceAmount)}</span>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Rental Terms Pill */}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <strong>Rental Policy:</strong> {product.rentalTerms}
                </div>
              </div>
            )}

            {/* Quantity Stepper (for buy) */}
            {activeTab === 'buy' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', background: '#FFFFFF' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '0.4rem 0.8rem', background: 'transparent', fontSize: '1rem', fontWeight: 600 }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0.4rem 0.8rem', fontSize: '0.95rem', fontWeight: 600 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ padding: '0.4rem 0.8rem', background: 'transparent', fontSize: '1rem', fontWeight: 600 }}
                  >
                    +
                  </button>
                </div>
                <span style={{ fontSize: '0.8rem', color: product.stockQuantity > 0 ? 'var(--status-success)' : 'var(--status-danger)' }}>
                  {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} units available)` : 'Out of Stock'}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleAddToCart(false)}
                  className="btn btn-secondary btn-lg"
                  style={{ flex: 1, minWidth: '180px' }}
                  disabled={activeTab === 'rent' && (!rentalCalc || !rentalCalc.isAvailable)}
                >
                  <ShoppingBag size={18} />
                  <span>{activeTab === 'buy' ? 'Add to Cart' : 'Add Rental to Cart'}</span>
                </button>
                <button
                  onClick={() => handleAddToCart(true)}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1, minWidth: '180px' }}
                  disabled={activeTab === 'rent' && (!rentalCalc || !rentalCalc.isAvailable)}
                >
                  <Sparkles size={18} />
                  <span>{activeTab === 'buy' ? 'Buy Now' : 'Book Rental Now'}</span>
                </button>
              </div>

              {/* Direct WhatsApp Stylist Assistance */}
              <a
                href={`https://wa.me/${cleanPhone}?text=${inquiryText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-block"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <MessageCircle size={18} color="#25D366" />
                <span>Inquire on WhatsApp (Instant Response & Video)</span>
              </a>
            </div>

            {/* Description & Specifications */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Description & Craftsmanship</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                {product.description}
              </p>

              {product.specifications && product.specifications.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Specifications</h4>
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    {product.specifications.map((spec, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '140px 1fr',
                          padding: '0.65rem 1rem',
                          background: i % 2 === 0 ? 'var(--bg-cream)' : '#FFFFFF',
                          fontSize: '0.85rem'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{spec.key}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
