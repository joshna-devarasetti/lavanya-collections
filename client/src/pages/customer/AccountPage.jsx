import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShoppingBag, Palette, User as UserIcon, Calendar, CheckCircle2, XCircle, CreditCard, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';

export const AccountPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'orders'; // 'orders', 'custom', 'profile'

  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal for Quotation payment in mock mode
  const [quotationPayModal, setQuotationPayModal] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [ordRes, custRes] = await Promise.all([
          api.getMyOrders(),
          api.getMyCustomRequests()
        ]);
        if (ordRes.success) setOrders(ordRes.orders);
        if (custRes.success) setCustomRequests(custRes.requests);
      } catch (err) {
        console.error('Error loading account data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Please Sign In</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Sign in to view your orders, rental bookings, and custom design quotations.
        </p>
        <Link to="/login" className="btn btn-primary">Sign In to Your Account</Link>
      </div>
    );
  }

  const handleRespondQuotation = async (requestId, response, declineReason = '') => {
    try {
      const res = await api.respondToQuotation(requestId, { response, declineReason });
      if (res.success) {
        notifySuccess(`Quotation ${response} successfully.`);
        // Refresh requests
        const custRes = await api.getMyCustomRequests();
        if (custRes.success) setCustomRequests(custRes.requests);
      }
    } catch (err) {
      notifyError(err.message || 'Failed to update quotation response.');
    }
  };

  const handlePayQuotationAdvance = async (request) => {
    try {
      const paymentOrderRes = await api.initiatePayment({ customRequestId: request._id });
      if (!paymentOrderRes.success) throw new Error(paymentOrderRes.message);

      if (paymentOrderRes.isMock || !window.Razorpay) {
        setQuotationPayModal({
          request,
          paymentOrder: paymentOrderRes
        });
        return;
      }

      const options = {
        key: paymentOrderRes.keyId,
        amount: paymentOrderRes.amount,
        currency: 'INR',
        name: 'Lavanya Collections',
        description: `Advance for Custom Request #${request.requestNumber}`,
        order_id: paymentOrderRes.razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyRes.success) {
              notifySuccess('Advance payment verified! Your custom piece is now in production.');
              const custRes = await api.getMyCustomRequests();
              if (custRes.success) setCustomRequests(custRes.requests);
            }
          } catch (e) {
            notifyError(e.message);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: { color: '#C59B27' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      notifyError(err.message || 'Payment initiation failed.');
    }
  };

  const completeMockQuotationPayment = async () => {
    if (!quotationPayModal) return;
    setPaying(true);
    try {
      const verifyRes = await api.verifyPayment({
        razorpay_order_id: quotationPayModal.paymentOrder.razorpayOrderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature',
        paymentMethod: 'UPI / Razorpay Test'
      });

      if (verifyRes.success) {
        notifySuccess('Advance payment verified! Custom design is now in production.');
        setQuotationPayModal(null);
        const custRes = await api.getMyCustomRequests();
        if (custRes.success) setCustomRequests(custRes.requests);
      }
    } catch (err) {
      notifyError(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 1rem 5rem 1rem' }}>
      <div className="container">
        {/* Header Profile Summary */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Welcome, {user.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email} • {user.phone}</p>
          </div>
          <button onClick={logout} className="btn btn-outline-dark btn-sm">Sign Out</button>
        </div>

        {/* Account Nav Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem', gap: '2rem' }}>
          <button
            onClick={() => setSearchParams({ tab: 'orders' })}
            style={{
              background: 'transparent',
              padding: '0.75rem 0.25rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: activeTab === 'orders' ? 'var(--gold-dark)' : 'var(--text-muted)',
              borderBottom: activeTab === 'orders' ? '3px solid var(--gold-primary)' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <ShoppingBag size={18} />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'custom' })}
            style={{
              background: 'transparent',
              padding: '0.75rem 0.25rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: activeTab === 'custom' ? 'var(--gold-dark)' : 'var(--text-muted)',
              borderBottom: activeTab === 'custom' ? '3px solid var(--gold-primary)' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Palette size={18} />
            <span>Custom Requests & Quotations ({customRequests.length})</span>
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No orders placed yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Explore our collections or book a rental to see your orders here.
                </p>
                <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map((order) => (
                  <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
                            #{order.orderNumber}
                          </span>
                          <span className={`badge ${order.orderStatus === 'delivered' || order.orderStatus === 'completed' ? 'badge-success' : 'badge-pending'}`}>
                            {order.orderStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Placed on {formatDateTime(order.createdAt)}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-serif)', display: 'block' }}>
                          {formatINR(order.totalAmount)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: order.paymentStatus === 'fully_paid' ? 'var(--status-success)' : 'var(--gold-dark)', fontWeight: 600 }}>
                          {order.paymentStatus === 'fully_paid' ? 'Fully Paid' : `Advance Paid: ${formatINR(order.amountPaid)} (Balance: ${formatINR(order.balanceAmount)})`}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img
                            src={item.productImage || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=100&q=80'}
                            alt=""
                            style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.productName}</p>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Qty: {item.quantity} • {item.itemType === 'rental' ? `Rental (${item.rentalDays} days)` : 'Purchase'}
                            </span>
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{formatINR(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Manual Courier & Tracking Details */}
                    {order.trackingInfo?.trackingNumber && (
                      <div style={{ background: 'var(--bg-cream)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.88rem' }}>
                        <div>
                          <strong style={{ color: 'var(--gold-dark)' }}>Courier Dispatch: </strong>
                          <span>{order.trackingInfo.courierName || 'Courier'} (Tracking: #{order.trackingInfo.trackingNumber})</span>
                        </div>
                        {order.trackingInfo.trackingUrl && (
                          <a
                            href={order.trackingInfo.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--gold-dark)', fontWeight: 600 }}
                          >
                            <span>Track Package</span>
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Custom Requests & Quotations */}
        {activeTab === 'custom' && (
          <div>
            {customRequests.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No custom requests submitted yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Have a dream jewellery piece or frock? Submit your idea and reference photos.
                </p>
                <Link to="/custom-orders" className="btn btn-primary">Submit Custom Idea</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {customRequests.map((req) => (
                  <div key={req._id} className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
                            #{req.requestNumber}
                          </span>
                          <span className={`badge ${req.status === 'in_production' ? 'badge-success' : req.status === 'quoted' ? 'badge-gold' : 'badge-pending'}`}>
                            {req.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{req.title}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Submitted on {formatDate(req.createdAt)} • Category: {req.category}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {req.description}
                    </p>

                    {/* Reference Images Thumbnails */}
                    {req.referenceImages && req.referenceImages.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        {req.referenceImages.map((img, i) => (
                          <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                            <img src={img} alt="" style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }} />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Active Quotation Box */}
                    {req.quotation && req.quotation.price > 0 && (
                      <div className="card card-gold" style={{ padding: '1.25rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--gold-dark)', fontWeight: 600 }}>
                              Formal Boutique Quotation
                            </span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.25rem' }}>
                              <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                                {formatINR(req.quotation.price)}
                              </span>
                              <span style={{ fontSize: '0.85rem', color: 'var(--gold-dark)', fontWeight: 600 }}>
                                (Advance Required: {req.quotation.advancePercentage}% = {formatINR(req.quotation.advanceAmount)})
                              </span>
                            </div>
                          </div>

                          {/* Approval / Payment Action */}
                          {req.status === 'quoted' && (
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                              <button
                                onClick={() => handleRespondQuotation(req._id, 'accepted')}
                                className="btn btn-primary btn-sm"
                              >
                                Accept Quotation
                              </button>
                              <button
                                onClick={() => handleRespondQuotation(req._id, 'declined')}
                                className="btn btn-outline-dark btn-sm"
                              >
                                Decline
                              </button>
                            </div>
                          )}

                          {req.status === 'quotation_accepted' && (
                            <button
                              onClick={() => handlePayQuotationAdvance(req)}
                              className="btn btn-primary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <CreditCard size={16} />
                              <span>Pay Advance {formatINR(req.quotation.advanceAmount)} Online</span>
                            </button>
                          )}
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          <p><strong>Estimated Delivery Date:</strong> {req.quotation.estimatedDeliveryDate ? formatDate(req.quotation.estimatedDeliveryDate) : 'Within 2-3 weeks'}</p>
                          <p><strong>Quotation Terms:</strong> {req.quotation.terms}</p>
                          {req.quotation.validUntil && (
                            <p style={{ color: 'var(--text-muted)' }}>Valid until: {formatDate(req.quotation.validUntil)}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mock Modal for Custom Request Advance Payment in test mode */}
      {quotationPayModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Custom Quotation Advance Payment</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Test Mode Simulator: Confirm advance payment to transition your design into production.
            </p>

            <div style={{ background: 'var(--bg-cream)', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'left', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Custom Request:</span>
                <strong>#{quotationPayModal.request.requestNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Advance Payable Today:</span>
                <strong>{formatINR(quotationPayModal.paymentOrder.amountInINR)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={completeMockQuotationPayment} className="btn btn-primary btn-block" disabled={paying}>
                {paying ? 'Verifying...' : 'Simulate Verified Payment'}
              </button>
              <button onClick={() => setQuotationPayModal(null)} className="btn btn-outline-dark btn-block">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
