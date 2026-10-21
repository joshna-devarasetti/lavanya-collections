import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Search, ExternalLink, Send } from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { formatINR, formatDate } from '../../utils/formatters';

export const AdminDeliveryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const [courierName, setCourierName] = useState('DTDC Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { notifySuccess, notifyError } = useNotification();

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Load orders that are confirmed, processing, packed, or shipped
      const res = await api.getAdminOrders();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      notifyError('Failed to load orders for delivery.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSelectOrder = (order) => {
    setActiveOrder(order);
    setCourierName(order.trackingInfo?.courierName || 'DTDC Express');
    setTrackingNumber(order.trackingInfo?.trackingNumber || '');
    setTrackingUrl(order.trackingInfo?.trackingUrl || '');
    setEstimatedDate(order.trackingInfo?.estimatedDeliveryDate ? new Date(order.trackingInfo.estimatedDeliveryDate).toISOString().slice(0, 10) : '');
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!activeOrder || !trackingNumber) {
      notifyError('Please enter a tracking or consignment number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.updateTracking(activeOrder._id, {
        courierName,
        trackingNumber,
        trackingUrl,
        estimatedDeliveryDate: estimatedDate
      });

      if (res.success) {
        notifySuccess(`Order #${activeOrder.orderNumber} marked as shipped. Customer notified via WhatsApp/In-app.`);
        setActiveOrder(null);
        loadOrders();
      }
    } catch (err) {
      notifyError(err.message || 'Failed to update courier tracking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Delivery & Manual Courier Dispatch</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Assign manual courier details, track consignment numbers, and update shipment progress
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Orders Awaiting Dispatch */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Select Order to Dispatch / Update
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '550px', overflowY: 'auto' }}>
            {orders.map((ord) => (
              <div
                key={ord._id}
                onClick={() => handleSelectOrder(ord)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: activeOrder?._id === ord._id ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                  background: activeOrder?._id === ord._id ? 'var(--gold-lighter)' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>#{ord.orderNumber}</strong>
                  <span className={`badge ${ord.orderStatus === 'shipped' ? 'badge-gold' : 'badge-pending'}`}>
                    {ord.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  {ord.customerDetails?.name} • {ord.customerDetails?.city || 'Hyderabad'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>{ord.items?.length} item(s)</span>
                  <span>{formatINR(ord.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Manual Dispatch Details Form */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Truck size={20} color="var(--gold-primary)" />
            <span>Dispatch Entry Form</span>
          </h3>

          {activeOrder ? (
            <form onSubmit={handleDispatchSubmit}>
              <div style={{ background: 'var(--bg-cream)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                <p><strong>Selected Order:</strong> #{activeOrder.orderNumber}</p>
                <p><strong>Customer Name:</strong> {activeOrder.customerDetails?.name}</p>
                <p><strong>Delivery Address:</strong> {activeOrder.customerDetails?.addressLine1}, {activeOrder.customerDetails?.city}</p>
              </div>

              <div className="form-group">
                <label className="form-label">Courier Company Name *</label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="form-input"
                  placeholder="e.g. DTDC, Delhivery, Professional Couriers, Porter"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tracking / Consignment Number *</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="form-input"
                  placeholder="e.g. DTDC-HYD-847291"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Public Tracking Link (Optional)</label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="form-input"
                  placeholder="https://www.dtdc.in/tracking.asp"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={estimatedDate}
                  onChange={(e) => setEstimatedDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Send size={18} />
                  <span>{submitting ? 'Updating...' : 'Dispatch Package & Send Notification'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Truck size={36} color="var(--border-gold)" style={{ marginBottom: '0.75rem' }} />
              <p>Select an order from the list on the left to enter manual courier and tracking details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
