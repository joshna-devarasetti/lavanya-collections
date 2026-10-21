import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { formatINR } from '../../utils/formatters';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { notifySuccess, notifyError } = useNotification();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminProducts();
      if (res.success) {
        setProducts(res.products);
      }
    } catch (err) {
      notifyError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive "${name}"? It will be safely removed from customer visibility.`)) {
      return;
    }

    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        notifySuccess(`"${name}" archived successfully.`);
        loadProducts();
      }
    } catch (err) {
      notifyError(err.message || 'Failed to archive product.');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Products & Catalog</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage pricing, rental options, inventory stock, and product-specific advance percentages
          </p>
        </div>

        <Link to="/admin/products/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={18} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.2rem' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing {filteredProducts.length} of {products.length} products
        </span>
      </div>

      {/* Product Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Mode</th>
                <th>Price / Rental</th>
                <th>Advance %</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        style={{ width: '45px', height: '45px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{p.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Slug: {p.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{p.category?.name || 'Unassigned'}</td>
                  <td>
                    {p.availabilityType === 'both' && <span className="badge badge-gold">Buy & Rent</span>}
                    {p.availabilityType === 'rent_only' && <span className="badge badge-rent">Rent Only</span>}
                    {p.availabilityType === 'buy_only' && <span className="badge badge-buy">Buy Only</span>}
                  </td>
                  <td>
                    <div>
                      {p.availabilityType !== 'rent_only' && (
                        <strong>{formatINR(p.discountPrice || p.price)}</strong>
                      )}
                      {p.rentalPrice > 0 && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent-rent)' }}>
                          Rent: {formatINR(p.rentalPrice)}/{p.rentalPeriodDays}d
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-gold">{p.advancePercentage || 20}%</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: p.stockQuantity <= 2 ? 'var(--status-danger)' : 'var(--text-primary)' }}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {p.isActive ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <Link
                        to={`/product/${p.slug || p._id}`}
                        target="_blank"
                        className="btn btn-outline-dark btn-sm"
                        title="View on storefront"
                      >
                        <Eye size={15} />
                      </Link>
                      <Link
                        to={`/admin/products/edit/${p._id}`}
                        className="btn btn-outline btn-sm"
                        title="Edit product details"
                      >
                        <Edit size={15} />
                      </Link>
                      {p.isActive && (
                        <button
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          className="btn btn-sm"
                          style={{ background: 'transparent', color: 'var(--status-danger)', border: '1px solid #E8DFD5' }}
                          title="Archive product"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
