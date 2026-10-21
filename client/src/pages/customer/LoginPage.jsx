import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        notifySuccess('Logged in successfully!');
        navigate('/account/orders');
      }
    } catch (err) {
      notifyError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 1rem 6rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.svg" alt="Lavanya Collections" style={{ width: '48px', height: '48px', marginBottom: '0.75rem' }} />
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>Customer Login</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Access your orders, rentals, and custom quotations
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="name@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>
              Create Account
            </Link>
          </p>
          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '1.5rem', paddingTop: '1rem' }}>
            <Link to="/admin/login" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Are you the store owner? Go to Admin Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
