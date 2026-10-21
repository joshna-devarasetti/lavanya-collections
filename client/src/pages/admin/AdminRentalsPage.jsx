import React, { useState, useEffect } from 'react';
import { CalendarCheck, AlertTriangle, CheckCircle, Clock, Eye, X } from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { formatINR, formatDate } from '../../utils/formatters';

export const AdminRentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRental, setSelectedRental] = useState(null);
  const [returnModal, setReturnModal] = useState(null);
  const [returnNotes, setReturnNotes] = useState('Item received in good condition. No damages.');
  const [lateFee, setLateFee] = useState(0);
  const [saving, setSaving] = useState(false);

  const { notifySuccess, notifyError } = useNotification();

  const loadRentals = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminRentals(statusFilter ? `status=${statusFilter}` : '');
      if (res.success) {
        setRentals(res.rentals);
      }
    } catch (err) {
      notifyError('Failed to load rentals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals();
  }, [statusFilter]);

  const handleStatusChange = async (rentalId, newStatus) => {
    try {
      const res = await api.updateRentalStatus(rentalId, { status: newStatus });
      if (res.success) {
        notifySuccess(`Rental status updated to ${newStatus}.`);
        loadRentals();
      }
    } catch (err) {
      notifyError(err.message || 'Failed to update rental status.');
    }
  };

  const handleRecordReturn = async (e) => {
    e.preventDefault();
    if (!returnModal) return;

    setSaving(true);
    try {
      const res = await api.recordRentalReturn(returnModal._id, {
        actualReturnDate: new Date(),
        returnInspectionNotes: returnNotes,
        lateFee: Number(lateFee) || 0
      });

      if (res.success) {
        notifySuccess('Rental return and inspection recorded successfully.');
        setReturnModal(null);
        loadRentals();
      }
    } catch (err) {
      notifyError(err.message || 'Failed to record return.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Rental Bookings & Returns</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage celebration wardrobe rentals, date conflict validation, and post-event return inspections
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <option value="">All Rental Bookings</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="confirmed">Confirmed (Upcoming)</option>
            <option value="dispatched">Dispatched / Pickup</option>
            <option value="rented_out">Rented Out (Event Ongoing)</option>
            <option value="return_pending">Return Pending</option>
            <option value="returned">Returned & Inspected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {rentals.length} booking(s) found
        </span>
      </div>

      {/* Rentals Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Product</th>
                <th>Renter Details</th>
                <th>Event Dates</th>
                <th>Fee & Advance</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => {
                const isOverdue = new Date(r.endDate) < new Date() && !['returned', 'inspected_complete', 'cancelled'].includes(r.status);
                return (
                  <tr key={r._id} style={{ background: isOverdue ? 'rgba(255, 235, 238, 0.4)' : undefined }}>
                    <td>
                      <strong style={{ color: 'var(--accent-rent)', fontSize: '0.92rem' }}>
                        #{r.bookingNumber}
                      </strong>
                      {isOverdue && (
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--status-danger)', fontWeight: 700 }}>
                          OVERDUE
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={r.product?.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.product?.name}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{r.customerDetails?.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {r.customerDetails?.phone}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <span>{formatDate(r.startDate)}</span>
                        <span style={{ color: 'var(--text-muted)' }}> to </span>
                        <strong>{formatDate(r.endDate)}</strong>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ({r.totalDays} days)
                      </span>
                    </td>
                    <td>
                      <strong>{formatINR(r.rentalPrice)}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold-dark)' }}>
                        Adv: {formatINR(r.advancePaid)} | Due: {formatINR(r.balanceDue)}
                      </span>
                    </td>
                    <td>
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r._id, e.target.value)}
                        className="form-select"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                      >
                        <option value="pending_payment">Pending Payment</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="rented_out">Rented Out</option>
                        <option value="return_pending">Return Pending</option>
                        <option value="returned">Returned</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {r.status !== 'returned' && r.status !== 'cancelled' && (
                        <button
                          onClick={() => setReturnModal(r)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.78rem' }}
                        >
                          Record Return
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Return & Inspection Modal */}
      {returnModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Record Return & Inspection</h3>
              <button onClick={() => setReturnModal(null)} style={{ background: 'transparent' }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Booking: <strong>#{returnModal.bookingNumber}</strong> for <em>"{returnModal.product?.name}"</em>
            </p>

            <form onSubmit={handleRecordReturn}>
              <div className="form-group">
                <label className="form-label">Inspection & Condition Notes</label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  required
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Late Fee / Damage Penalty (₹) (Optional)</label>
                <input
                  type="number"
                  min="0"
                  value={lateFee}
                  onChange={(e) => setLateFee(e.target.value)}
                  className="form-input"
                  placeholder="0"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                  {saving ? 'Recording...' : 'Confirm Return & Restore Stock'}
                </button>
                <button type="button" onClick={() => setReturnModal(null)} className="btn btn-outline-dark">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
