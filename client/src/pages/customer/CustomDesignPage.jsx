import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Upload, Image as ImageIcon, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';

export const CustomDesignPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    title: '',
    category: 'Custom Jewellery / Gifts',
    description: '',
    dimensions: '',
    preferredMaterials: '',
    budgetRange: '₹3,000 - ₹5,000',
    requiredDate: '',
    deliveryMethod: 'courier',
    additionalNotes: ''
  });

  const [referenceImages, setReferenceImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notifyError('Only image files (JPG, PNG, WEBP) are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notifyError('Image size cannot exceed 5 MB.');
      return;
    }

    setUploadingImage(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await api.uploadReferenceImage(data);
      if (res.success && res.imageUrl) {
        setReferenceImages((prev) => [...prev, res.imageUrl]);
        notifySuccess('Reference image uploaded successfully.');
      }
    } catch (err) {
      notifyError(err.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      notifyError('Please provide a title and detailed description of your idea.');
      return;
    }

    if (!formData.name || !formData.phone) {
      notifyError('Please provide your name and contact phone number.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        referenceImages,
        dimensions: formData.dimensions,
        preferredMaterials: formData.preferredMaterials,
        budgetRange: formData.budgetRange,
        requiredDate: formData.requiredDate,
        deliveryMethod: formData.deliveryMethod,
        additionalNotes: formData.additionalNotes,
        customerDetails: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email
        }
      };

      const res = await api.submitCustomRequest(payload);
      if (res.success && res.customRequest) {
        setSubmissionSuccess(res.customRequest);
        notifySuccess('Your custom design request has been submitted!');
      }
    } catch (err) {
      notifyError(err.message || 'Failed to submit custom request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', maxWidth: '640px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem', border: '2px solid var(--border-gold)' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--status-success-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <CheckCircle2 size={42} color="var(--status-success)" />
          </div>

          <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-dark)', fontWeight: 600 }}>
            Idea Submitted Successfully
          </span>
          <h1 style={{ fontSize: '2.2rem', margin: '0.5rem 0 1rem 0' }}>Request #{submissionSuccess.requestNumber}</h1>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Our boutique artisans have received your idea: <strong>"{submissionSuccess.title}"</strong>. We will review your materials, specifications, and reference photos to prepare a customized price quotation.
          </p>

          <div style={{ background: 'var(--bg-cream)', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'left', marginBottom: '2rem', fontSize: '0.85rem' }}>
            <p style={{ marginBottom: '0.35rem' }}><strong>What happens next?</strong></p>
            <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <li>Admin reviews your design and sets the exact price & advance percentage.</li>
              <li>You receive a formal quotation notification on your phone / account.</li>
              <li>You review and approve the quotation online.</li>
              <li>Upon your approval & advance payment, handcrafted production begins!</li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link to="/account/custom-requests" className="btn btn-primary">
                View in My Account
              </Link>
            ) : (
              <Link to="/shop" className="btn btn-primary">
                Explore Other Collections
              </Link>
            )}
            <button
              onClick={() => {
                setSubmissionSuccess(null);
                setFormData({ ...formData, title: '', description: '' });
                setReferenceImages([]);
              }}
              className="btn btn-outline"
            >
              Submit Another Idea
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 1rem 5rem 1rem' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--gold-lighter)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-gold)', marginBottom: '1rem' }}>
            <Sparkles size={14} color="var(--gold-dark)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Bespoke Artisan Studio
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Custom Design Orders
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Share your dream design with reference photos. We prepare a transparent quotation for your approval before starting production.
          </p>
        </div>

        {/* 5-Step Process Infographic Banner */}
        <div className="card card-gold" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--gold-dark)', marginBottom: '1rem', textAlign: 'center' }}>
            How Our Custom Design Process Works
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', textAlign: 'center', fontSize: '0.82rem' }}>
            <div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold-primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '0.35rem' }}>1</div>
              <p><strong>Submit Idea</strong><br /><span style={{ color: 'var(--text-muted)' }}>Photos & specs</span></p>
            </div>
            <div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold-primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '0.35rem' }}>2</div>
              <p><strong>Boutique Review</strong><br /><span style={{ color: 'var(--text-muted)' }}>Material sizing</span></p>
            </div>
            <div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold-primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '0.35rem' }}>3</div>
              <p><strong>Quotation Sent</strong><br /><span style={{ color: 'var(--text-muted)' }}>Price & advance %</span></p>
            </div>
            <div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold-primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '0.35rem' }}>4</div>
              <p><strong>You Approve & Pay</strong><br /><span style={{ color: 'var(--text-muted)' }}>Small advance</span></p>
            </div>
            <div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold-primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '0.35rem' }}>5</div>
              <p><strong>Craft & Deliver</strong><br /><span style={{ color: 'var(--text-muted)' }}>Balance on delivery</span></p>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            Tell Us About Your Custom Idea
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Your Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Full Name"
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address (Optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="For quotation copy"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Product Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="Custom Jewellery / Gifts">Custom Jewellery</option>
                <option value="Photoshoot Frocks">Photoshoot Frocks</option>
                <option value="Doll Sets">Doll Sets</option>
                <option value="Wedding & Marriage Decorations">Wedding & Marriage Decor</option>
                <option value="Handmade Gifts">Handmade Gifts / Resin</option>
                <option value="Other Bespoke Art">Other Bespoke Art</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Idea Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. Traditional Mango Mala with Ruby beads and Pearl drops"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description of Design & Requirements *</label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              style={{ minHeight: '120px' }}
              placeholder="Describe what you want crafted in detail: colors, motif themes, age group (for frocks), length, thickness, or personal customizations..."
            />
          </div>

          {/* Reference Photo Upload */}
          <div className="form-group">
            <label className="form-label">Upload Reference Photos (Pinterest / Screenshots / Sketches)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  background: 'var(--bg-cream)',
                  border: '1px dashed var(--gold-dark)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)'
                }}
              >
                <Upload size={16} color="var(--gold-dark)" />
                <span>{uploadingImage ? 'Uploading...' : 'Choose Reference Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  style={{ display: 'none' }}
                />
              </label>

              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                PNG, JPG, WEBP up to 5 MB
              </span>
            </div>

            {/* Uploaded thumbnails */}
            {referenceImages.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {referenceImages.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-gold)' }}>
                    <img src={url} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Dimensions / Sizing</label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g. 18 inches / 1 year baby"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Budget Range</label>
              <input
                type="text"
                name="budgetRange"
                value={formData.budgetRange}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g. ₹4,000 - ₹6,000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date Required By</label>
              <input
                type="date"
                name="requiredDate"
                min={new Date().toISOString().slice(0, 10)}
                value={formData.requiredDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Instructions / Delivery Preferences</label>
            <input
              type="text"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. Need by next Saturday for baby cradle ceremony"
            />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Sparkles size={18} />
              <span>{submitting ? 'Submitting Idea...' : 'Submit Custom Idea for Quotation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
