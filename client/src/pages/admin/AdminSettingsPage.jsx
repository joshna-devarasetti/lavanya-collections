import React, { useState, useEffect } from 'react';
import { Save, Sparkles, Store, FileText, Phone, KeyRound, Shield, Lock, UserCheck, CreditCard, Smartphone, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notifySuccess, notifyError } = useNotification();
  const { refreshSettings } = useSettings();
  const { user, updateCredentials } = useAuth();

  // Admin Credentials State
  const [adminCreds, setAdminCreds] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingCreds, setSavingCreds] = useState(false);

  useEffect(() => {
    api.getSettings().then((res) => {
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user) {
      setAdminCreds((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value }
    }));
  };

  const handlePaymentSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      paymentSettings: {
        ...(prev.paymentSettings || {}),
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handlePolicyChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      policies: { ...prev.policies, [name]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        notifySuccess('Boutique business settings and contact details updated. Synced to customer website!');
        setSettings(res.settings);
        refreshSettings(); // Instantly update customer website!
      }
    } catch (err) {
      notifyError(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleCredsChange = (e) => {
    const { name, value } = e.target;
    setAdminCreds((prev) => ({ ...prev, [name]: value }));
  };

  const handleCredsSubmit = async (e) => {
    e.preventDefault();

    if (adminCreds.newPassword) {
      if (!adminCreds.currentPassword) {
        notifyError('Please enter your current password to verify your identity before setting a new password.');
        return;
      }
      if (adminCreds.newPassword.length < 6) {
        notifyError('New password must be at least 6 characters.');
        return;
      }
      if (adminCreds.newPassword !== adminCreds.confirmPassword) {
        notifyError('New passwords do not match. Please re-enter.');
        return;
      }
    }

    setSavingCreds(true);
    try {
      const res = await updateCredentials({
        name: adminCreds.name,
        email: adminCreds.email,
        currentPassword: adminCreds.currentPassword || undefined,
        newPassword: adminCreds.newPassword || undefined
      });

      if (res.success) {
        notifySuccess('Admin personal credentials updated! You can now log in using your new email & password.');
        setAdminCreds((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (err) {
      notifyError(err.message || 'Failed to update admin credentials.');
    } finally {
      setSavingCreds(false);
    }
  };

  if (loading || !settings) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading settings...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Store Profile & Security Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Update boutique contact details, customer support numbers, policies, and your private admin login credentials.
        </p>
      </div>

      {/* SECTION 1: ADMIN LOGIN CREDENTIALS & SECURITY */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem', border: '2px solid var(--gold-primary)', background: '#FFFEFA' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--text-primary)' }}>
            <KeyRound size={20} color="var(--gold-dark)" />
            <span>Admin Private Login Credentials</span>
          </h3>
          <span style={{ fontSize: '0.75rem', background: 'var(--bg-cream)', padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', color: 'var(--gold-dark)', fontWeight: 600 }}>
            Restricted Admin Area
          </span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Change your administrative email and password to your own personal credentials. Once saved, only you can log into the Admin Dashboard using these credentials.
        </p>

        <form onSubmit={handleCredsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Admin Name</label>
              <input
                type="text"
                name="name"
                required
                value={adminCreds.name}
                onChange={handleCredsChange}
                className="form-input"
                placeholder="Store Owner Name"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Admin Login Email</label>
              <input
                type="email"
                name="email"
                required
                value={adminCreds.email}
                onChange={handleCredsChange}
                className="form-input"
                placeholder="your-personal-email@domain.com"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={adminCreds.currentPassword}
                onChange={handleCredsChange}
                className="form-input"
                placeholder="••••••••"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password (optional)</label>
              <input
                type="password"
                name="newPassword"
                value={adminCreds.newPassword}
                onChange={handleCredsChange}
                className="form-input"
                placeholder="New secret password"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={adminCreds.confirmPassword}
                onChange={handleCredsChange}
                className="form-input"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={savingCreds}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Shield size={16} color="var(--gold-primary)" />
              <span>{savingCreds ? 'Updating Credentials...' : 'Save Private Admin Credentials'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: BUSINESS PROFILE & CUSTOMER-FACING CONTACT DETAILS */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Branding & Contact */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Store size={18} color="var(--gold-primary)" />
            <span>Store Profile & Customer Support Lines</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Store Brand Name</label>
              <input
                type="text"
                name="storeName"
                value={settings.storeName || ''}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline || ''}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Public Phone Number (Calling)</label>
              <input
                type="text"
                name="contactNumber"
                value={settings.contactNumber || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Support WhatsApp Number</label>
              <input
                type="text"
                name="whatsappNumber"
                value={settings.whatsappNumber || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="+919876543210"
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Used in WhatsApp buttons, chat links & order notifications
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">Customer Support Email</label>
              <input
                type="email"
                name="email"
                value={settings.email || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="contact@lavanyacollections.com"
              />
            </div>
          </div>
        </div>

        {/* Physical Boutique Address */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Boutique Physical Address</h3>

          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input
              type="text"
              name="street"
              value={settings.address?.street || ''}
              onChange={handleAddressChange}
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                value={settings.address?.city || ''}
                onChange={handleAddressChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                value={settings.address?.state || ''}
                onChange={handleAddressChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                name="postalCode"
                value={settings.address?.postalCode || ''}
                onChange={handleAddressChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Payment & Shipping Defaults */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Payment & Shipping Defaults</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Default Advance Percentage (%)</label>
              <input
                type="number"
                name="defaultAdvancePercentage"
                min="5"
                max="100"
                value={settings.defaultAdvancePercentage || 20}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Flat Shipping Rate (₹)</label>
              <input
                type="number"
                name="flatShippingRate"
                value={settings.flatShippingRate || 0}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                name="freeShippingThreshold"
                value={settings.freeShippingThreshold || 0}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* SECTION: PHONEPE UPI PAYMENT INTEGRATION */}
        <div className="card" style={{ padding: '1.75rem', border: '1.5px solid #5f259f', background: '#FFFEFA' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, color: '#5f259f' }}>
              <Smartphone size={20} color="#5f259f" />
              <span>PhonePe UPI Payment Integration</span>
            </h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#FAF5FF', color: '#5f259f', border: '1px solid #E9D8FD', fontSize: '0.78rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: '100px' }}>
              <CheckCircle2 size={14} color="#5f259f" />
              <span>PhonePe Active: +91 6372556290</span>
            </span>
          </div>

          <div style={{ background: '#FAF5FF', border: '1px solid #E9D8FD', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.86rem', lineHeight: 1.5 }}>
            <strong style={{ color: '#5f259f', display: 'block', marginBottom: '0.25rem' }}>
              Direct PhonePe Settlements for 6372556290
            </strong>
            <p style={{ margin: 0, color: '#4A3B63' }}>
              All customer payments on the storefront are processed directly via PhonePe UPI. Mobile customers pay with 1-click using the PhonePe app, and desktop customers scan dynamically generated UPI QR codes linked to your VPA (<strong>{settings.paymentSettings?.upiId || '6372556290@ybl'}</strong>). Money settles directly into your account with 0% gateway commission.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">PhonePe Registered Number</label>
              <input
                type="text"
                name="phonePeNumber"
                value={settings.paymentSettings?.phonePeNumber || '6372556290'}
                onChange={handlePaymentSettingsChange}
                className="form-input"
                placeholder="6372556290"
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Primary phone number for PhonePe settlement
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">PhonePe UPI ID / VPA</label>
              <input
                type="text"
                name="upiId"
                value={settings.paymentSettings?.upiId || '6372556290@ybl'}
                onChange={handlePaymentSettingsChange}
                className="form-input"
                placeholder="6372556290@ybl"
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                e.g. 6372556290@ybl
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">UPI Payee Display Name</label>
              <input
                type="text"
                name="upiAccountName"
                value={settings.paymentSettings?.upiAccountName || 'Lavanya Collections'}
                onChange={handlePaymentSettingsChange}
                className="form-input"
                placeholder="Lavanya Collections"
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Beneficiary name shown on customer's PhonePe screen
              </span>
            </div>
          </div>
        </div>

        {/* Customer Policies */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={18} color="var(--gold-primary)" />
            <span>Boutique Store Policies</span>
          </h3>

          <div className="form-group">
            <label className="form-label">Return, Exchange & Refund Policy</label>
            <textarea
              name="returnPolicy"
              value={settings.policies?.returnPolicy || ''}
              onChange={handlePolicyChange}
              className="form-textarea"
              style={{ minHeight: '90px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rental Terms & Security Deposit Policy</label>
            <textarea
              name="rentalPolicy"
              value={settings.policies?.rentalPolicy || ''}
              onChange={handlePolicyChange}
              className="form-textarea"
              style={{ minHeight: '90px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Custom Design & Advance Policy</label>
            <textarea
              name="customDesignPolicy"
              value={settings.policies?.customDesignPolicy || ''}
              onChange={handlePolicyChange}
              className="form-textarea"
              style={{ minHeight: '90px' }}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={18} />
            <span>{saving ? 'Saving Changes...' : 'Save All Business Settings (Sync with Customer Site)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
