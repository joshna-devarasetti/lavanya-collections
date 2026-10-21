import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { formatINR, formatDateTime } from '../../utils/formatters';

export const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [confirmedRevenue, setConfirmedRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { notifyError } = useNotification();

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      try {
        const res = await api.getAdminPayments(statusFilter ? `status=${statusFilter}` : '');
        if (res.success) {
          setPayments(res.payments);
          setConfirmedRevenue(res.confirmedRevenue || 0);
        }
      } catch (err) {
        notifyError('Failed to load payment transactions.');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [statusFilter]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Payment Transactions & Gateway Ledger</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Official PhonePe UPI transactions, UTR verifications, and advance ledger
        </p>
      </div>

      {/* Revenue Highlight Card */}
      <div className="card card-gold" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Total Confirmed & Verified Revenue
          </span>
          <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {formatINR(confirmedRevenue)}
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Excludes failed, pending, or unverified transactions
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <option value="">All Transactions</option>
            <option value="verified">Verified Only</option>
            <option value="created">Created (Pending)</option>
            <option value="failed">Failed Verification</option>
          </select>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Reference #</th>
                <th>Gateway & Payment IDs</th>
                <th>Type</th>
                <th>Amount (INR)</th>
                <th>Amount (Paise)</th>
                <th>Verification Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>
                    <span style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {formatDateTime(p.createdAt)}
                    </span>
                  </td>
                  <td>
                    {p.order ? (
                      <strong style={{ color: 'var(--gold-dark)' }}>
                        #{p.order.orderNumber}
                      </strong>
                    ) : p.customRequest ? (
                      <strong style={{ color: 'var(--accent-rent)' }}>
                        #{p.customRequest.requestNumber}
                      </strong>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Direct Payment</span>
                    )}
                  </td>
                  <td>
                    <span style={{ display: 'block', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      {p.transactionRef || p.razorpayOrderId || p._id}
                    </span>
                    {(p.razorpayPaymentId || p.transactionRef) && (
                      <span style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        UTR / Ref: {p.razorpayPaymentId || p.transactionRef}
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', fontWeight: 600 }}>
                      {p.paymentType} Payment
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.95rem' }}>{formatINR(p.amount)}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {p.amountInPaise} p
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.status === 'verified' ? 'badge-success' : p.status === 'failed' ? 'badge-danger' : 'badge-pending'}`}>
                      {p.status}
                    </span>
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
