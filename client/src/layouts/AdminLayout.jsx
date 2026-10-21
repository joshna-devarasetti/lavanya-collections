import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CalendarCheck,
  Palette,
  CreditCard,
  Truck,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Route protection
  if (!user || !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F2' }}>
        <div className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Admin Access Required</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Please sign in with administrator credentials to view this dashboard.
          </p>
          <Link to="/admin/login" className="btn btn-primary btn-block">
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Rentals', path: '/admin/rentals', icon: CalendarCheck },
    { label: 'Custom Requests', path: '/admin/custom-requests', icon: Palette },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Delivery & Dispatch', path: '/admin/delivery', icon: Truck },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Business Settings', path: '/admin/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      {/* Sidebar (Desktop and Mobile Slide-over) */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img src="/logo.svg" alt="Lavanya Collections" style={{ width: '32px', height: '32px' }} />
            <div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, color: '#FAF6EE', display: 'block' }}>
                Lavanya
              </span>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gold-primary)' }}>
                Admin Console
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ display: 'none', background: 'transparent', color: '#FFFFFF' }}
            className="mobile-close"
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  color: isActive ? '#FFFFFF' : '#C4B4A8',
                  background: isActive ? 'var(--gold-primary)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FAF6EE' }}>{user.name}</p>
            <p style={{ fontSize: '0.72rem', color: '#A08E82' }}>Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#FF6B6B',
              fontSize: '0.85rem',
              background: 'transparent',
              padding: '0.25rem 0'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{ background: 'transparent', color: 'var(--text-primary)' }}
              className="mobile-toggle"
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Lavanya Collections Management System
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link
              to="/"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
                color: 'var(--gold-dark)',
                fontWeight: 600
              }}
            >
              <span>View Storefront</span>
              <ExternalLink size={13} />
            </Link>
            <Link to="/admin/notifications" style={{ color: 'var(--text-primary)', position: 'relative' }}>
              <Bell size={20} />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="admin-body">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-close { display: block !important; }
        }
      `}</style>
    </div>
  );
};
