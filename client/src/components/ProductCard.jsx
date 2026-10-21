import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, ShoppingCart } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const ProductCard = ({ product }) => {
  if (!product) return null;

  const effectivePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug || product._id}`} className="product-card-img-wrap">
        <img src={imageSrc} alt={product.name} className="product-card-img" loading="lazy" />
        
        {/* Badges */}
        <div className="product-card-badges">
          {product.availabilityType === 'both' && (
            <span className="badge badge-gold">Buy & Rent</span>
          )}
          {product.availabilityType === 'rent_only' && (
            <span className="badge badge-rent">Rent Only</span>
          )}
          {product.availabilityType === 'buy_only' && (
            <span className="badge badge-buy">Buy Only</span>
          )}
          {hasDiscount && (
            <span className="badge badge-danger">{discountPercent}% OFF</span>
          )}
        </div>
      </Link>

      <div className="product-card-content">
        <span className="product-card-category">{product.category?.name || 'Traditional Collection'}</span>
        <Link to={`/product/${product.slug || product._id}`}>
          <h3 className="product-card-title">{product.name}</h3>
        </Link>

        <div className="product-card-pricing">
          {/* Purchase price (if not rent_only) */}
          {product.availabilityType !== 'rent_only' && (
            <div className="product-price-row">
              <span className="product-price-current">{formatINR(effectivePrice)}</span>
              {hasDiscount && (
                <span className="product-price-original">{formatINR(product.price)}</span>
              )}
            </div>
          )}

          {/* Rental price (if rent_only or both) */}
          {(product.availabilityType === 'rent_only' || product.availabilityType === 'both') && product.rentalPrice > 0 && (
            <div className="product-price-rental" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={13} />
              <span>Rent: {formatINR(product.rentalPrice)} / {product.rentalPeriodDays || 3} days</span>
            </div>
          )}

          {/* Advance payment indicator */}
          <div className="product-advance-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Sparkles size={11} color="var(--gold-primary)" />
            <span>{product.advancePercentage || 20}% advance payment enabled</span>
          </div>
        </div>

        <div style={{ marginTop: '0.85rem' }}>
          <Link
            to={`/product/${product.slug || product._id}`}
            className="btn btn-outline btn-sm btn-block"
            style={{ fontSize: '0.82rem' }}
          >
            View Details & Options
          </Link>
        </div>
      </div>
    </div>
  );
};
