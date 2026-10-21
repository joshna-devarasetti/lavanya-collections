import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, Truck, CheckCircle, Clock, X } from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { formatINR, formatDateTime, formatDate } from '../../utils/formatters';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Tracking form inside modal
  const [trackingForm, setTrackingForm] = useState({
    courierName: '',
    trackingNumber: '',
    trackingUrl: '',
    estimatedDeliveryDate: ''
  });

  const { notifySuccess, notifyError } = useNotification();

  const loadOrders = async () => {
    setLoading(true);
    try {
      let params = '';
      if (statusFilter) params += `status=${statusFilter}&`;
      if (search) params += `search=${encodeURIComponent(search)}&`;

      const res = await api.getAdminOrders(params);
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      notifyError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleOpenDetailModal = async (orderId) => {
    try {
      const res = await api.getAdminOrderDetail(orderId);
      if (res.success) {
        setSelectedOrder(res.order);
        setTrackingForm({
          courierName: res.order.trackingInfo?.courierName || '',
          trackingNumber: res.order.trackingInfo?.trackingNumber || '',
          trackingUrl: res.order.trackingInfo?.trackingUrl || '',
          estimatedDeliveryDate: res.order.trackingInfo?.estimatedDeliveryDate
            ? new Date(res.order.trackingInfo.estimatedDeliveryDate).toISOString().slice(0, 10)
            : ''
        });
      }
    } catch (err) {
      notifyError('Failed to load order details.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await api.updateOrderStatus(selectedOrder._id, { status: newStatus });
      if (res.success) {
        notifySuccess(`Order status updated to ${newStatus}.`);
        setSelectedOrder(res.order);
        loadOrders();
      }
    } catch (err) {
      notifyError(err.message || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await api.updateTracking(selectedOrder._id, trackingForm);
      if (res.success) {
        notifySuccess('Courier tracking details updated and customer notified.');
        setSelectedOrder(res.order);
        loadOrders();
      }
    } catch (err) {
      notifyError(err.message || 'Failed to update tracking details.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Order Management</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Track customer purchases, rental orders, advance payments, and dispatch tracking
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by order #, customer name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.2rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">Search</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <option value="">All Statuses</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Total Value</th>
                <th>Payment Breakdown</th>
                <th>Order Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord._id}>
                  <td>
                    <strong style={{ color: 'var(--gold-dark)', fontSize: '0.92rem' }}>
                      #{ord.orderNumber}
                    </strong>
                    {ord.isGuest && (
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Guest Order
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {formatDate(ord.createdAt)}
                    </span>
                  </td>
                  <td>
                    <strong>{ord.customerDetails?.name || 'Customer'}</strong>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {ord.customerDetails?.phone}
                    </span>
                  </td>
                  <td>
                    <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', fontWeight: 500 }}>
                      {ord.orderType}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.95rem' }}>{formatINR(ord.totalAmount)}</strong>
                  </td>
                  <td>
                    <div>
                      <span className={`badge ${ord.paymentStatus === 'fully_paid' ? 'badge-success' : 'badge-pending'}`}>
                        {ord.paymentStatus.replace(/_/g, ' ')}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Paid: {formatINR(ord.amountPaid)} | Due: {formatINR(ord.balanceAmount)}
                      </span>
                      {ord.transactionId && (
                        <span style={{ display: 'block', fontSize: '0.73rem', fontFamily: 'monospace', color: '#5f259f', marginTop: '0.25rem', fontWeight: 600 }}>
                          UTR: {ord.transactionId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${ord.orderStatus === 'confirmed' || ord.orderStatus === 'completed' ? 'badge-success' : ord.orderStatus === 'cancelled' ? 'badge-danger' : 'badge-gold'}`}>
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenDetailModal(ord._id)}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Eye size={14} />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Tracking Management Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>Manage Order #{selectedOrder.orderNumber}</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Placed on {formatDateTime(selectedOrder.createdAt)}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent' }}><X size={20} /></button>
            </div>

            {/* Status Transition Control */}
            <div className="card card-gold" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold-dark)' }}>
                    CURRENT LIFECYCLE STATUS
                  </span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'capitalize' }}>
                    {selectedOrder.orderStatus.replace(/_/g, ' ')}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Change Status:</span>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updating}
                    className="form-select"
                    style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.88rem' }}
                  >
                    <option value="pending_payment">Pending Payment</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PhonePe Payment & UTR Verification Box */}
            <div style={{ background: '#FAF5FF', border: '1.5px solid #D6BCFA', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#5f259f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PhonePe Payment Verification
                </span>
                <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Transaction ID / UTR:</span>
                  <strong style={{ fontSize: '1rem', fontFamily: 'monospace', color: '#2D1B4E', background: '#FFFFFF', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1.5px solid #9F7AEA' }}>
                    {selectedOrder.transactionId || 'Not provided'}
                  </strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Amount Paid:</span>
                <h3 style={{ fontSize: '1.3rem', color: '#137333', margin: 0 }}>{formatINR(selectedOrder.amountPaid)}</h3>
                {selectedOrder.balanceAmount > 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-rent)', display: 'block' }}>
                    Balance Due on Delivery: {formatINR(selectedOrder.balanceAmount)}
                  </span>
                )}
              </div>
            </div>

            {/* Customer Details & Shipping Address */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              <div style={{ background: 'var(--bg-cream)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>Customer:</strong>
                <p>{selectedOrder.customerDetails?.name}</p>
                <p>Phone: {selectedOrder.customerDetails?.phone}</p>
                <p>Email: {selectedOrder.customerDetails?.email || 'None'}</p>
              </div>

              <div style={{ background: 'var(--bg-cream)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  {selectedOrder.deliveryMethod === 'courier' ? 'Courier Address:' : 'Store Pickup:'}
                </strong>
                <p>{selectedOrder.customerDetails?.addressLine1}</p>
                {selectedOrder.customerDetails?.addressLine2 && <p>{selectedOrder.customerDetails.addressLine2}</p>}
                <p>{selectedOrder.customerDetails?.city}, {selectedOrder.customerDetails?.state} - {selectedOrder.customerDetails?.postalCode}</p>
              </div>
            </div>

            {/* Items Breakdown */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Ordered Items</h4>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--border-subtle)' : 'none', background: idx % 2 === 0 ? '#FFFFFF' : 'var(--bg-cream)' }}>
                    <div>
                      <strong style={{ fontSize: '0.92rem' }}>{item.productName}</strong>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Qty: {item.quantity} • {item.itemType} (Advance %: {item.advancePercentage}%)
                      </span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{formatINR(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Courier / Dispatch Section */}
            <form onSubmit={handleSaveTracking} className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                <Truck size={18} color="var(--gold-primary)" />
                <h4 style={{ fontSize: '1rem' }}>Manual Courier & Dispatch Tracking</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Courier Service</label>
                  <input
                    type="text"
                    value={trackingForm.courierName}
                    onChange={(e) => setTrackingForm({ ...trackingForm, courierName: e.target.value })}
                    className="form-input"
                    placeholder="e.g. DTDC, Delhivery, Professional"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tracking / AWB Number</label>
                  <input
                    type="text"
                    value={trackingForm.trackingNumber}
                    onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                    className="form-input"
                    placeholder="e.g. DTDC-HYD-98214"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tracking URL</label>
                  <input
                    type="url"
                    value={trackingForm.trackingUrl}
                    onChange={(e) => setTrackingForm({ ...trackingForm, trackingUrl: e.target.value })}
                    className="form-input"
                    placeholder="https://www.dtdc.in/tracking.asp"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Estimated Delivery Date</label>
                  <input
                    type="date"
                    value={trackingForm.estimatedDeliveryDate}
                    onChange={(e) => setTrackingForm({ ...trackingForm, estimatedDeliveryDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-secondary btn-sm" disabled={updating}>
                {updating ? 'Saving...' : 'Update Courier Tracking & Notify Customer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
