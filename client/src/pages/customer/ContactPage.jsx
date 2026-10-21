import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';

export const ContactPage = () => {
  const { notifySuccess } = useNotification();
  const { storeName, contactNumber, email, cleanWhatsAppPhone, formattedAddress } = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    notifySuccess('Message sent! Our boutique team will get in touch.');
  };

  return (
    <div style={{ padding: '3rem 1rem 5rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.6rem', marginBottom: '0.5rem' }}>Contact & Visit Our Boutique</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            We'd love to assist you in person or online for your celebratory styling
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Contact Details Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Boutique Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <MapPin size={22} color="var(--gold-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Boutique Address:</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {formattedAddress}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Phone size={20} color="var(--gold-primary)" />
                <div>
                  <strong>Phone / Orders:</strong>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    <a href={`tel:${contactNumber}`} style={{ color: 'inherit', textDecoration: 'none' }}>{contactNumber}</a>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Mail size={20} color="var(--gold-primary)" />
                <div>
                  <strong>Email:</strong>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    <a href={`mailto:${email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{email}</a>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Clock size={20} color="var(--gold-primary)" />
                <div>
                  <strong>Visiting Hours:</strong>
                  <p style={{ color: 'var(--text-secondary)' }}>Monday – Saturday: 10:30 AM – 8:00 PM</p>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <a
                  href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(`Hello ${storeName}! I would like to schedule a visit or ask a question.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-block"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <MessageCircle size={18} />
                  <span>Chat on WhatsApp Directly</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Send Us an Inquiry</h3>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={48} color="var(--status-success)" style={{ marginBottom: '1rem' }} />
                <h4>Thank You!</h4>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Your inquiry has been received. Our coordinator will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Message / Question</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-textarea"
                    placeholder="Tell us what items or rental dates you are interested in..."
                    style={{ minHeight: '100px' }}
                  />
                </div>

                <button type="submit" className="btn btn-secondary btn-block">
                  <Send size={16} />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
