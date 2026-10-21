import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await adminLogin(email, password);
      if (res.success) {
        notifySuccess('Admin authentication verified. Welcome to Lavanya Collections Dashboard.');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      notifyError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1C0F0A 0%, #2D180F 100%)',
      padding: '1.5rem'
    }}>
      <div className="card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '2.5rem',
        background: '#FAF6EE',
        border: '2px solid var(--gold-primary)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.svg" alt="Lavanya Collections" style={{ width: '56px', height: '56px', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '1.9rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Store Management
          </h1>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gold-dark)', fontWeight: 700 }}>
            Administrator Access Only
          </span>
        </div>

        <form onSubmit={handleAdminSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={14} color="var(--gold-dark)" />
              <span>Admin Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="admin@lavanyacollections.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={14} color="var(--gold-dark)" />
              <span>Admin Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••••••"
            />
          </div>

          <div style={{ marginTop: '1.75rem', marginBottom: '1.5rem' }}>
            <button
              type="submit"
              className="btn btn-secondary btn-block btn-lg"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#23130C' }}
            >
              <ShieldCheck size={18} color="var(--gold-primary)" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--gold-dark)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>← Return to Public Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
