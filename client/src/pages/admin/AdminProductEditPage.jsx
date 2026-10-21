import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Upload, X, Plus, Trash2, ArrowLeft, Sparkles, Eye, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { formatINR } from '../../utils/formatters';

export const AdminProductEditPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '',
    availabilityType: 'both', // 'buy_only', 'rent_only', 'both'
    stockQuantity: 5,
    paymentMode: 'both', // 'advance_only', 'full_only', 'both'
    advancePercentage: 20,
    rentalPrice: '',
    rentalPeriodDays: 3,
    securityDeposit: 0,
    rentalTerms: 'Careful handling expected. Item must be returned clean in original box.',
    isFeatured: false,
    isNewArrival: false,
    isPopular: false
  });

  const [images, setImages] = useState([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [specifications, setSpecifications] = useState([
    { key: 'Material', value: '' },
    { key: 'Care', value: 'Keep away from moisture and perfume' }
  ]);

  useEffect(() => {
    // Load categories
    api.getCategories().then((res) => {
      if (res.success && res.categories) {
        setCategories(res.categories);
        if (!isEditMode && res.categories.length > 0) {
          setFormData((prev) => ({ ...prev, category: res.categories[0]._id }));
        }
      }
    });

    if (isEditMode) {
      setLoading(true);
      api.getProduct(id)
        .then((res) => {
          if (res.success && res.product) {
            const p = res.product;
            setFormData({
              name: p.name || '',
              description: p.description || '',
              category: p.category?._id || p.category || '',
              price: p.price || '',
              discountPrice: p.discountPrice || '',
              availabilityType: p.availabilityType || 'both',
              stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : 1,
              paymentMode: p.paymentMode || 'both',
              advancePercentage: p.advancePercentage !== undefined ? p.advancePercentage : 20,
              rentalPrice: p.rentalPrice || '',
              rentalPeriodDays: p.rentalPeriodDays || 3,
              securityDeposit: p.securityDeposit || 0,
              rentalTerms: p.rentalTerms || '',
              isFeatured: !!p.isFeatured,
              isNewArrival: !!p.isNewArrival,
              isPopular: !!p.isPopular
            });
            setImages(p.images || []);
            if (p.specifications && p.specifications.length > 0) {
              setSpecifications(p.specifications);
            }
          }
        })
        .catch((err) => notifyError('Failed to fetch product details'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await api.uploadProductImage(data);
      if (res.success && res.imageUrl) {
        setImages((prev) => [...prev, res.imageUrl]);
        notifySuccess('Image uploaded successfully.');
      }
    } catch (err) {
      notifyError(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const addImageUrlDirectly = () => {
    if (customImageUrl.trim()) {
      setImages((prev) => [...prev, customImageUrl.trim()]);
      setCustomImageUrl('');
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    setSpecifications((prev) => [...prev, { key: '', value: '' }]);
  };

  const updateSpecification = (index, field, value) => {
    setSpecifications((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const removeSpecification = (index) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.category) {
      notifyError('Product name and category are required.');
      return;
    }

    if (images.length === 0) {
      notifyError('Please add at least one product photograph.');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
      stockQuantity: Number(formData.stockQuantity) || 1,
      advancePercentage: Number(formData.advancePercentage) || 20,
      rentalPrice: Number(formData.rentalPrice) || 0,
      rentalPeriodDays: Number(formData.rentalPeriodDays) || 3,
      securityDeposit: Number(formData.securityDeposit) || 0,
      images,
      specifications: specifications.filter((s) => s.key && s.value)
    };

    try {
      let res;
      if (isEditMode) {
        res = await api.updateProduct(id, payload);
      } else {
        res = await api.createProduct(payload);
      }

      if (res.success) {
        notifySuccess(isEditMode ? 'Product updated successfully.' : 'Product created successfully.');
        navigate('/admin/products');
      }
    } catch (err) {
      notifyError(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/admin/products" className="btn btn-outline-dark btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
        <h1 style={{ fontSize: '1.8rem' }}>
          {isEditMode ? `Edit Product: ${formData.name}` : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Main Info Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Card: Basic Details */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                Basic Information
              </h3>

              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g. Kundan Temple Bridal Choker Set"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  style={{ minHeight: '120px' }}
                  placeholder="Detailed description of craftsmanship, materials, occasion styling..."
                />
              </div>
            </div>

            {/* Card: Availability & Core Payment Rules (CRITICAL CORE REQUIREMENT) */}
            <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--border-gold)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-dark)', fontWeight: 600, marginBottom: '0.5rem' }}>
                <Sparkles size={18} />
                <h3 style={{ fontSize: '1.15rem' }}>Availability & Granular Payment Configuration</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Configure whether this product can be bought, rented, or both, and set product-specific advance payment percentages.
              </p>

              <div className="form-group">
                <label className="form-label">Availability Mode *</label>
                <select
                  name="availabilityType"
                  value={formData.availabilityType}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="both">Both Buy and Rent Available</option>
                  <option value="buy_only">Buy Only (Purchase outright)</option>
                  <option value="rent_only">Rent Only (Celebration rentals)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Payment Mode Allowed</label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="both">Both Advance OR Full Payment</option>
                    <option value="advance_only">Advance Payment Only</option>
                    <option value="full_only">Full Payment Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Advance Percentage (%) *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="number"
                      name="advancePercentage"
                      min="5"
                      max="100"
                      required
                      value={formData.advancePercentage}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>%</span>
                  </div>
                  <span className="form-helper">
                    e.g. 10%, 20%, 30%, 50%
                  </span>
                </div>
              </div>

              {/* Purchase Pricing & Stock */}
              {formData.availabilityType !== 'rent_only' && (
                <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Purchase Pricing & Stock</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Sale Price (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        required
                        value={formData.price}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g. 4500"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Discount Price (₹)</label>
                      <input
                        type="number"
                        name="discountPrice"
                        value={formData.discountPrice}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g. 3999"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Stock Quantity *</label>
                      <input
                        type="number"
                        name="stockQuantity"
                        min="0"
                        required
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Rental Settings */}
              {formData.availabilityType !== 'buy_only' && (
                <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--accent-rent)' }}>
                    Rental Settings
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Rental Price (₹) *</label>
                      <input
                        type="number"
                        name="rentalPrice"
                        value={formData.rentalPrice}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g. 1200"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Rental Duration Period (Days)</label>
                      <input
                        type="number"
                        name="rentalPeriodDays"
                        min="1"
                        value={formData.rentalPeriodDays}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g. 3"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Rental Terms & Care Instructions</label>
                    <input
                      type="text"
                      name="rentalTerms"
                      value={formData.rentalTerms}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g. Return unwashed in original box by return date."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Specifications Builder */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Specifications & Attributes</h3>
                <button
                  type="button"
                  onClick={addSpecification}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Plus size={14} />
                  <span>Add Spec</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {specifications.map((spec, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="e.g. Material"
                      value={spec.key}
                      onChange={(e) => updateSpecification(i, 'key', e.target.value)}
                      className="form-input"
                      style={{ padding: '0.5rem' }}
                    />
                    <input
                      type="text"
                      placeholder="e.g. Brass alloy with 22k gold matte finish"
                      value={spec.value}
                      onChange={(e) => updateSpecification(i, 'value', e.target.value)}
                      className="form-input"
                      style={{ padding: '0.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(i)}
                      style={{ background: 'transparent', color: 'var(--status-danger)', cursor: 'pointer', padding: '0.4rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Images & Submission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Image Gallery Card */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                Product Photographs
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.75rem',
                    background: 'var(--bg-cream)',
                    border: '2px dashed var(--border-gold)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <Upload size={24} color="var(--gold-primary)" style={{ marginBottom: '0.5rem' }} />
                  <strong style={{ fontSize: '0.9rem' }}>
                    {uploadingImage ? 'Uploading Image...' : 'Click to Upload Image'}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    JPG, PNG, WEBP up to 5 MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    disabled={uploadingImage}
                    style={{ display: 'none' }}
                  />
                </label>

                {/* Direct Image URL input */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    placeholder="Or paste image URL (Unsplash / Cloudinary)"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  />
                  <button type="button" onClick={addImageUrlDirectly} className="btn btn-outline-dark btn-sm">
                    Add
                  </button>
                </div>
              </div>

              {/* Thumbnails of Added Images */}
              {images.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem' }}>
                  {images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: idx === 0 ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X size={12} />
                      </button>
                      {idx === 0 && (
                        <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--gold-primary)', color: '#fff', fontSize: '0.62rem', textAlign: 'center', fontWeight: 700 }}>
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No photos added yet. Add at least one image.
                </p>
              )}
            </div>

            {/* Display Badges Settings */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Display Badges</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />
                  <span>Feature on Homepage Spotlight</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={formData.isNewArrival}
                    onChange={handleInputChange}
                  />
                  <span>Mark as New Arrival</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    name="isPopular"
                    checked={formData.isPopular}
                    onChange={handleInputChange}
                  />
                  <span>Mark as Popular Collection</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
                disabled={loading}
              >
                {loading ? 'Saving Product...' : (isEditMode ? 'Update Product Changes' : 'Publish Product to Store')}
              </button>

              <Link to="/admin/products" className="btn btn-outline-dark btn-block">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
