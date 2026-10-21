import React, { useState, useEffect } from 'react';
import { Palette, Eye, Sparkles, Send, CheckCircle2, Clock, X, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { formatINR, formatDate } from '../../utils/formatters';

export const AdminCustomRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [quotationModal, setQuotationModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [issuing, setIssuing] = useState(false);

  // Quotation Form
  const [quoteForm, setQuoteForm] = useState({
    price: '',
    advancePercentage: 30,
    estimatedDeliveryDate: '',
    validUntil: '',
    terms: 'Handcrafted custom item. Advance payment required to procure raw materials and begin work.'
  });

  const { notifySuccess, notifyError } = useNotification();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminCustomRequests(statusFilter ? `status=${statusFilter}` : '');
      if (res.success) {
        setRequests(res.requests);
      }
    } catch (err) {
      notifyError('Failed to load custom requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleOpenQuotationModal = (req) => {
    const in2Weeks = new Date();
    in2Weeks.setDate(in2Weeks.getDate() + 14);
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);

    setQuoteForm({
      price: req.quotation?.price || '',
      advancePercentage: req.quotation?.advancePercentage || 30,
      estimatedDeliveryDate: req.quotation?.estimatedDeliveryDate
        ? new Date(req.quotation.estimatedDeliveryDate).toISOString().slice(0, 10)
        : in2Weeks.toISOString().slice(0, 10),
      validUntil: req.quotation?.validUntil
        ? new Date(req.quotation.validUntil).toISOString().slice(0, 10)
        : in7Days.toISOString().slice(0, 10),
      terms: req.quotation?.terms || 'Handcrafted customized item. Advance payment required to begin production.'
    });
    setQuotationModal(req);
  };

  const handleIssueQuotationSubmit = async (e) => {
    e.preventDefault();
    if (!quotationModal || !quoteForm.price) return;

    setIssuing(true);
    try {
      const res = await api.issueQuotation(quotationModal._id, quoteForm);
      if (res.success) {
        notifySuccess(`Quotation of ₹${quoteForm.price} issued to ${quotationModal.customerDetails.name}.`);
        setQuotationModal(null);
        loadRequests();
      }
    } catch (err) {
      notifyError(err.message || 'Failed to issue quotation.');
    } finally {
      setIssuing(false);
    }
  };

  const handleStatusChange = async (reqId, newStatus) => {
    try {
      const res = await api.updateCustomRequestStatus(reqId, { status: newStatus });
      if (res.success) {
        notifySuccess(`Status updated to ${newStatus}.`);
        loadRequests();
      }
    } catch (err) {
      notifyError(err.message || 'Failed to update status.');
    }
  };

  const calculatedAdvance = quoteForm.price
    ? Math.round((Number(quoteForm.price) * Number(quoteForm.advancePercentage || 30)) / 100)
    : 0;
  const calculatedBalance = quoteForm.price ? Number(quoteForm.price) - calculatedAdvance : 0;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Custom Design Orders & Quotations</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Review submitted ideas, inspect customer reference photos, and issue formal price quotations
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <option value="">All Custom Requests</option>
            <option value="submitted">New Submissions</option>
            <option value="quoted">Quoted (Awaiting Approval)</option>
            <option value="quotation_accepted">Quotation Accepted</option>
            <option value="in_production">In Production</option>
            <option value="completed">Completed & Delivered</option>
            <option value="rejected">Rejected / Declined</option>
          </select>
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {requests.length} request(s) found
        </span>
      </div>

      {/* Requests Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Request #</th>
                <th>Idea Title</th>
                <th>Customer</th>
                <th>Category / Budget</th>
                <th>Quotation Status</th>
                <th>Lifecycle Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>
                    <strong style={{ color: 'var(--gold-dark)', fontSize: '0.92rem' }}>
                      #{r.requestNumber}
                    </strong>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {formatDate(r.createdAt)}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.92rem' }}>{r.title}</strong>
                    {r.referenceImages && r.referenceImages.length > 0 && (
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold-dark)' }}>
                        📷 {r.referenceImages.length} reference photo(s)
                      </span>
                    )}
                  </td>
                  <td>
                    <strong>{r.customerDetails?.name}</strong>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {r.customerDetails?.phone}
                    </span>
                  </td>
                  <td>
                    <span>{r.category}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Budget: {r.budgetRange || 'Open'}
                    </span>
                  </td>
                  <td>
                    {r.quotation?.price ? (
                      <div>
                        <strong>{formatINR(r.quotation.price)}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold-dark)' }}>
                          Adv {r.quotation.advancePercentage}%: {formatINR(r.quotation.advanceAmount)}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Not Quoted</span>
                    )}
                  </td>
                  <td>
                    <select
                      value={r.status}
                      onChange={(e) => handleStatusChange(r._id, e.target.value)}
                      className="form-select"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="quoted">Quoted</option>
                      <option value="quotation_accepted">Quotation Accepted</option>
                      <option value="in_production">In Production</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setDetailModal(r)}
                        className="btn btn-outline-dark btn-sm"
                        title="View Full Submission"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenQuotationModal(r)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.78rem' }}
                      >
                        {r.quotation?.price ? 'Edit Quote' : 'Issue Quotation'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Full Submission Modal */}
      {detailModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Custom Idea: #{detailModal.requestNumber}</h3>
              <button onClick={() => setDetailModal(null)} style={{ background: 'transparent' }}><X size={20} /></button>
            </div>

            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{detailModal.title}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {detailModal.description}
            </p>

            <div style={{ background: 'var(--bg-cream)', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <div><strong>Category:</strong> {detailModal.category}</div>
              <div><strong>Target Budget:</strong> {detailModal.budgetRange || 'Open'}</div>
              <div><strong>Dimensions:</strong> {detailModal.dimensions || 'Standard'}</div>
              <div><strong>Needed By:</strong> {detailModal.requiredDate ? formatDate(detailModal.requiredDate) : 'Flexible'}</div>
              <div><strong>Customer Name:</strong> {detailModal.customerDetails?.name}</div>
              <div><strong>Customer Phone:</strong> {detailModal.customerDetails?.phone}</div>
            </div>

            {/* Reference Photos */}
            {detailModal.referenceImages && detailModal.referenceImages.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: '0.5rem' }}>Uploaded Reference Photos:</strong>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {detailModal.referenceImages.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                      <img src={img} alt="" style={{ width: '90px', height: '90px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-gold)' }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setDetailModal(null);
                  handleOpenQuotationModal(detailModal);
                }}
                className="btn btn-primary btn-sm"
              >
                Issue Formal Quotation
              </button>
              <button onClick={() => setDetailModal(null)} className="btn btn-outline-dark btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Formal Quotation Modal */}
      {quotationModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>Issue Formal Quotation</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  For #{quotationModal.requestNumber} ("{quotationModal.title}")
                </span>
              </div>
              <button onClick={() => setQuotationModal(null)} style={{ background: 'transparent' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleIssueQuotationSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Total Quotation Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quoteForm.price}
                    onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                    className="form-input"
                    placeholder="e.g. 6500"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Advance Percentage (%) *</label>
                  <select
                    value={quoteForm.advancePercentage}
                    onChange={(e) => setQuoteForm({ ...quoteForm, advancePercentage: Number(e.target.value) })}
                    className="form-select"
                  >
                    <option value={10}>10% Advance</option>
                    <option value={20}>20% Advance</option>
                    <option value={30}>30% Advance (Standard)</option>
                    <option value={50}>50% Advance</option>
                    <option value={75}>75% Advance</option>
                    <option value={100}>100% Full Payment</option>
                  </select>
                </div>
              </div>

              {/* Automatic Calculation Preview */}
              {quoteForm.price > 0 && (
                <div style={{ background: 'var(--bg-cream)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Customer Advance to Pay Online:</span>
                    <strong style={{ color: 'var(--gold-dark)' }}>{formatINR(calculatedAdvance)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Remaining Balance on Completion:</span>
                    <span>{formatINR(calculatedBalance)}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Estimated Delivery Date</label>
                  <input
                    type="date"
                    value={quoteForm.estimatedDeliveryDate}
                    onChange={(e) => setQuoteForm({ ...quoteForm, estimatedDeliveryDate: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Quotation Expiry Date</label>
                  <input
                    type="date"
                    value={quoteForm.validUntil}
                    onChange={(e) => setQuoteForm({ ...quoteForm, validUntil: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Quotation Terms & Crafting Schedule</label>
                <textarea
                  value={quoteForm.terms}
                  onChange={(e) => setQuoteForm({ ...quoteForm, terms: e.target.value })}
                  className="form-textarea"
                  style={{ minHeight: '75px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary btn-block" disabled={issuing}>
                  {issuing ? 'Sending...' : 'Send Quotation to Customer'}
                </button>
                <button type="button" onClick={() => setQuotationModal(null)} className="btn btn-outline-dark">
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
