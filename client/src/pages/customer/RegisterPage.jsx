import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      notifyError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      notifyError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      if (res.success) {
        notifySuccess('Account registered successfully! Welcome to Lavanya Collections.');
        navigate('/account/orders');
      }
    } catch (err) {
      notifyError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 1rem 6rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.svg" alt="Lavanya Collections" style={{ width: '48px', height: '48px', marginBottom: '0.75rem' }} />
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Track your orders, save addresses & manage custom quotations
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. Priya Sharma"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number *</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="name@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="At least 6 characters"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Re-enter your password"
            />
          </div>

          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <p>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
