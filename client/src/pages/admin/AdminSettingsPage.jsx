import React, { useState, useEffect } from 'react';
import { Save, Sparkles, Store, FileText, Phone } from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  useEffect(() => {
    api.getSettings().then((res) => {
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
      setLoading(false);
    });
  }, []);

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
        notifySuccess('Boutique business settings and policies updated successfully.');
        setSettings(res.settings);
      }
    } catch (err) {
      notifyError(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading settings...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Business Profile & Store Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Configure public store contact details, WhatsApp support lines, delivery fees, and policies
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Branding & Contact */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Store size={18} color="var(--gold-primary)" />
            <span>Store Profile & Public Contact</span>
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
              <label className="form-label">Public Phone Number</label>
              <input
                type="text"
                name="contactNumber"
                value={settings.contactNumber || ''}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Public WhatsApp Number</label>
              <input
                type="text"
                name="whatsappNumber"
                value={settings.whatsappNumber || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder="+919876543210"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Public Support Email</label>
              <input
                type="email"
                name="email"
                value={settings.email || ''}
                onChange={handleInputChange}
                className="form-input"
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
              <span className="form-helper">Applied to newly created products</span>
            </div>

            <div className="form-group">
              <label className="form-label">Flat Shipping Rate (₹)</label>
              <input
                type="number"
                name="flatShippingRate"
                value={settings.flatShippingRate || 99}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Free Shipping Minimum (₹)</label>
              <input
                type="number"
                name="freeShippingThreshold"
                value={settings.freeShippingThreshold || 1999}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Policies Editor */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={18} color="var(--gold-primary)" />
            <span>Customer-Facing Policies</span>
          </h3>

          <div className="form-group">
            <label className="form-label">Return & Refund Policy</label>
            <textarea
              name="returnPolicy"
              value={settings.policies?.returnPolicy || ''}
              onChange={handlePolicyChange}
              className="form-textarea"
              style={{ minHeight: '90px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rental Terms & Security Policy</label>
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
            <span>{saving ? 'Saving Changes...' : 'Save All Business Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
