import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User as UserIcon, Menu, X, Sparkles, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 900, background: '#FFFFFF', borderBottom: '1px solid var(--border-subtle)', boxShadow: '0 2px 10px rgba(44,24,16,0.03)' }}>
      {/* Luxury Announcement Bar */}
      <div style={{ background: 'var(--text-primary)', color: 'var(--gold-light)', padding: '0.45rem 1rem', fontSize: '0.78rem', textAlign: 'center', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <Sparkles size={13} color="var(--gold-primary)" />
        <span>Boutique Indian Jewellery, Photoshoot Frocks & Custom Crafts • Purchase & Rentals Available</span>
      </div>

      {/* Main Nav Bar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', gap: '1.5rem' }}>
        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none', background: 'transparent', color: 'var(--text-primary)' }}
          className="mobile-toggle"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img src="/logo.svg" alt="Lavanya Collections" style={{ width: '42px', height: '42px' }} />
          <div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em', display: 'block', lineHeight: 1.1 }}>
              Lavanya
            </span>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--gold-dark)', display: 'block', fontWeight: 600 }}>
              Collections
            </span>
          </div>
        </Link>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearchSubmit} className="desktop-search" style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search jewellery, photoshoot frocks, doll sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.5rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-ivory)',
              fontSize: '0.88rem',
              outline: 'none',
              color: 'var(--text-primary)'
            }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
        </form>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Custom Orders Link */}
          <Link
            to="/custom-orders"
            className="btn btn-outline btn-sm desktop-only"
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
          >
            <Sparkles size={14} />
            <span>Custom Orders</span>
          </Link>

          {/* User Account Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', color: 'var(--text-primary)', padding: '0.4rem' }}
            >
              <UserIcon size={21} />
              <span style={{ fontSize: '0.88rem', fontWeight: 500 }} className="desktop-only">
                {isAuthenticated ? user?.name?.split(' ')[0] : 'Account'}
              </span>
            </button>

            {accountMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  minWidth: '200px',
                  padding: '0.5rem 0',
                  zIndex: 999
                }}
              >
                {isAuthenticated ? (
                  <>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{user.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                    </div>
                    <Link
                      to="/account/orders"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{ display: 'block', padding: '0.6rem 1rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/account/custom-requests"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{ display: 'block', padding: '0.6rem 1rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}
                    >
                      Custom Requests & Quotations
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setAccountMenuOpen(false)}
                        style={{ display: 'block', padding: '0.6rem 1rem', fontSize: '0.88rem', color: 'var(--gold-dark)', fontWeight: 600, borderTop: '1px solid var(--border-subtle)' }}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setAccountMenuOpen(false);
                      }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', fontSize: '0.88rem', color: 'var(--status-danger)', background: 'transparent' }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{ display: 'block', padding: '0.6rem 1rem', fontSize: '0.88rem', fontWeight: 600 }}
                    >
                      Customer Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{ display: 'block', padding: '0.6rem 1rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <Link
            to="/cart"
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              color: 'var(--text-primary)',
              padding: '0.4rem'
            }}
            aria-label="Shopping Cart"
          >
            <ShoppingBag size={22} />
            {itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-4px',
                  background: 'var(--gold-primary)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Category Navigation Bar (Desktop) */}
      <nav style={{ background: 'var(--bg-cream)', borderTop: '1px solid var(--border-subtle)', padding: '0.5rem 1.25rem' }} className="desktop-categories">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.88rem', fontWeight: 500 }}>
          <Link to="/shop" style={{ color: 'var(--text-primary)' }}>All Collections</Link>
          <Link to="/shop?category=jewellery" style={{ color: 'var(--text-primary)' }}>Jewellery</Link>
          <Link to="/shop?category=photoshoot-frocks" style={{ color: 'var(--text-primary)' }}>Photoshoot Frocks</Link>
          <Link to="/shop?category=doll-sets" style={{ color: 'var(--text-primary)' }}>Doll Sets</Link>
          <Link to="/shop?category=decorative-items" style={{ color: 'var(--text-primary)' }}>Decorative Items</Link>
          <Link to="/shop?category=wedding-decorations" style={{ color: 'var(--text-primary)' }}>Wedding Decor</Link>
          <Link to="/rentals" style={{ color: 'var(--accent-rent)', fontWeight: 600 }}>Rentals Catalog</Link>
          <Link to="/custom-orders" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Custom Design Orders</Link>
          <Link to="/contact" style={{ color: 'var(--text-secondary)' }}>Contact & Visit</Link>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(44, 24, 16, 0.6)',
            zIndex: 9999
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '80%',
              maxWidth: '320px',
              height: '100%',
              background: '#FFFFFF',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700 }}>Lavanya Collections</span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent' }}><X size={20} /></button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
              />
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>All Collections</Link>
              <Link to="/shop?category=jewellery" onClick={() => setMobileMenuOpen(false)}>Traditional Jewellery</Link>
              <Link to="/shop?category=photoshoot-frocks" onClick={() => setMobileMenuOpen(false)}>Photoshoot Frocks</Link>
              <Link to="/shop?category=doll-sets" onClick={() => setMobileMenuOpen(false)}>Doll Sets</Link>
              <Link to="/shop?category=decorative-items" onClick={() => setMobileMenuOpen(false)}>Decorative Items</Link>
              <Link to="/shop?category=wedding-decorations" onClick={() => setMobileMenuOpen(false)}>Wedding Decor</Link>
              <Link to="/rentals" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--accent-rent)', fontWeight: 600 }}>Rentals Catalog</Link>
              <Link to="/custom-orders" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Custom Design Orders</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact & Support</Link>
            </div>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              {isAuthenticated ? (
                <div>
                  <p style={{ fontWeight: 600 }}>{user.name}</p>
                  <Link to="/account/orders" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', margin: '0.5rem 0' }}>My Orders</Link>
                  <button onClick={logout} style={{ color: 'var(--status-danger)', background: 'transparent' }}>Sign Out</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link to="/login" className="btn btn-primary btn-block" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="btn btn-outline btn-block" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-search, .desktop-only, .desktop-categories { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};
