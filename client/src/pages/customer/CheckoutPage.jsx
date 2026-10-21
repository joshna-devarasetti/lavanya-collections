import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, CreditCard, CheckCircle2, ArrowRight, Truck, Store, Smartphone, QrCode, ExternalLink, Copy, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { formatINR } from '../../utils/formatters';

export const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, clearCart, totalOrderValue, totalAdvanceDue, totalBalanceDue } = useCart();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    addressLine1: user?.addresses?.[0]?.addressLine1 || '',
    addressLine2: user?.addresses?.[0]?.addressLine2 || '',
    city: user?.addresses?.[0]?.city || 'Hyderabad',
    state: user?.addresses?.[0]?.state || 'Telangana',
    postalCode: user?.addresses?.[0]?.postalCode || '500033',
    landmark: user?.addresses?.[0]?.landmark || '',
    customerNotes: ''
  });

  const [deliveryMethod, setDeliveryMethod] = useState('courier'); // 'courier' or 'store_pickup'
  const [paymentChoice, setPaymentChoice] = useState('advance'); // 'advance' or 'full'
  const [policyAccepted, setPolicyAccepted] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [phonePeModal, setPhonePeModal] = useState(null);
  const [utrInput, setUtrInput] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
        addressLine1: prev.addressLine1 || user.addresses?.[0]?.addressLine1 || '',
        city: prev.city || user.addresses?.[0]?.city || 'Hyderabad',
        state: prev.state || user.addresses?.[0]?.state || 'Telangana',
        postalCode: prev.postalCode || user.addresses?.[0]?.postalCode || '500033'
      }));
    }
  }, [user]);

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>No Items to Checkout</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Your shopping cart is currently empty.
        </p>
        <Link to="/shop" className="btn btn-primary">Return to Shop</Link>
      </div>
    );
  }

  // Calculations
  const shippingFee = deliveryMethod === 'courier' ? (totalOrderValue >= 1999 ? 0 : 99) : 0;
  const grandTotal = totalOrderValue + shippingFee;
  const payableNow = paymentChoice === 'full' ? grandTotal : totalAdvanceDue + shippingFee;
  const remainingBalance = paymentChoice === 'full' ? 0 : grandTotal - payableNow;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrderAndPay = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || (deliveryMethod === 'courier' && !formData.addressLine1)) {
      notifyError('Please complete all required customer and address fields.');
      return;
    }

    if (!policyAccepted) {
      notifyError('Please accept the boutique order and rental policies to continue.');
      return;
    }

    setProcessing(true);

    try {
      // 1. Create order on server with validated totals
      const orderPayload = {
        customerDetails: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          addressLine1: formData.addressLine1 || 'Store Pickup',
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          landmark: formData.landmark
        },
        items: cartItems,
        deliveryMethod,
        paymentTypeChosen: paymentChoice,
        customerNotes: formData.customerNotes,
        policyAccepted
      };

      const orderRes = await api.createOrder(orderPayload);
      if (!orderRes.success) throw new Error(orderRes.message);

      const createdOrder = orderRes.order;

      // 2. Initiate PhonePe payment order
      const paymentOrderRes = await api.initiatePayment({ orderId: createdOrder._id });
      if (!paymentOrderRes.success) throw new Error(paymentOrderRes.message);

      // Open PhonePe Instant UPI Modal
      setPhonePeModal({
        order: createdOrder,
        paymentOrder: paymentOrderRes
      });
      setProcessing(false);
    } catch (err) {
      notifyError(err.message || 'Failed to initiate order checkout');
    } finally {
      setProcessing(false);
    }
  };

  // Confirm direct PhonePe payment using mandatory UTR
  const handleConfirmPhonePePayment = async () => {
    if (!phonePeModal) return;

    const trimmedUtr = (utrInput || '').trim();
    if (!trimmedUtr) {
      notifyError('Transaction ID is mandatory! Please enter the PhonePe Transaction ID / UTR to verify your payment.');
      return;
    }

    if (trimmedUtr.length < 4) {
      notifyError('Please enter a valid PhonePe Transaction ID / UTR.');
      return;
    }

    setProcessing(true);

    try {
      const verifyRes = await api.verifyDirectUPI({
        orderId: phonePeModal.order._id,
        utr: trimmedUtr,
        phonePeNumber: phonePeModal.paymentOrder.phonePe?.number || '6372556290',
        amount: phonePeModal.paymentOrder.amountInINR
      });

      if (verifyRes.success) {
        clearCart();
        setOrderSuccess(verifyRes.order || phonePeModal.order);
        setPhonePeModal(null);
        notifySuccess('PhonePe payment confirmed! Your boutique order has been placed.');
      }
    } catch (err) {
      notifyError(err.message || 'Payment confirmation failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyUpi = (upiId) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  // Success Screen
  if (orderSuccess) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', maxWidth: '640px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem', border: '2px solid var(--border-gold)' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--status-success-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <CheckCircle2 size={42} color="var(--status-success)" />
          </div>

          <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-dark)', fontWeight: 600 }}>
            Payment Verified & Confirmed
          </span>
          <h1 style={{ fontSize: '2.2rem', margin: '0.5rem 0 1rem 0' }}>Thank You for Your Order!</h1>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Your order <strong>#{orderSuccess.orderNumber}</strong> has been received by Lavanya Collections. Our boutique artisans are preparing your traditional items with utmost care.
          </p>

          <div style={{ background: 'var(--bg-cream)', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '2rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span>Order Number:</span>
              <strong>{orderSuccess.orderNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span>Payment Mode:</span>
              <strong style={{ textTransform: 'capitalize' }}>{orderSuccess.paymentTypeChosen} Payment</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span>Total Value:</span>
              <strong>{formatINR(orderSuccess.totalAmount)}</strong>
            </div>
            {orderSuccess.balanceAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-rent)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                <span>Remaining Balance Due on Delivery:</span>
                <strong>{formatINR(orderSuccess.balanceAmount)}</strong>
              </div>
            )}
            {orderSuccess.transactionId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                <span>PhonePe Transaction ID:</span>
                <strong style={{ fontFamily: 'monospace', color: '#5f259f' }}>{orderSuccess.transactionId}</strong>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/account/orders" className="btn btn-primary">
              View Order in Account
            </Link>
            <Link to="/shop" className="btn btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 1rem 5rem 1rem' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>Secure Checkout</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          Complete your customer details and choose your preferred payment option
        </p>

        <form onSubmit={handlePlaceOrderAndPay} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Left Column: Customer & Delivery Details */}
          <div>
            <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>1. Customer Information</span>
                {!isAuthenticated && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Guest Checkout Enabled)</span>
                )}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g. Priya Sharma"
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

              <div className="form-group">
                <label className="form-label">Email Address (Optional for receipt & tracking)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="priya@example.com"
                />
              </div>
            </div>

            {/* Delivery Method Selection */}
            <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>2. Delivery Method</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div
                  onClick={() => setDeliveryMethod('courier')}
                  style={{
                    border: deliveryMethod === 'courier' ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    cursor: 'pointer',
                    background: deliveryMethod === 'courier' ? 'var(--gold-lighter)' : '#FFFFFF'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Truck size={18} color="var(--gold-primary)" />
                    <strong style={{ fontSize: '0.95rem' }}>Courier Delivery</strong>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Fast courier shipping across India with manual tracking updates.
                  </p>
                </div>

                <div
                  onClick={() => setDeliveryMethod('store_pickup')}
                  style={{
                    border: deliveryMethod === 'store_pickup' ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    cursor: 'pointer',
                    background: deliveryMethod === 'store_pickup' ? 'var(--gold-lighter)' : '#FFFFFF'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Store size={18} color="var(--gold-primary)" />
                    <strong style={{ fontSize: '0.95rem' }}>Boutique Pickup</strong>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Collect from Jubilee Hills, Hyderabad. No delivery charge.
                  </p>
                </div>
              </div>

              {deliveryMethod === 'courier' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Shipping Address Line 1 *</label>
                    <input
                      type="text"
                      name="addressLine1"
                      required
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Flat, House no., Building, Street"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Apartment, suite, unit, landmark"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode *</label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Order Notes / Sizing Instructions (Optional)</label>
                <textarea
                  name="customerNotes"
                  value={formData.customerNotes}
                  onChange={handleInputChange}
                  className="form-textarea"
                  style={{ minHeight: '70px' }}
                  placeholder="Special instructions for our artisans or delivery courier..."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Payment Options & Summary */}
          <div>
            <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>3. Select Payment Option</h3>

              {/* Advance vs Full Option Radio Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div
                  onClick={() => setPaymentChoice('advance')}
                  style={{
                    border: paymentChoice === 'advance' ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    cursor: 'pointer',
                    background: paymentChoice === 'advance' ? 'var(--gold-lighter)' : '#FFFFFF'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sparkles size={16} />
                      <span>Pay Advance Only (Recommended)</span>
                    </strong>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {formatINR(totalAdvanceDue + shippingFee)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Confirm your order now with a small advance. Pay the remaining <strong>{formatINR(grandTotal - (totalAdvanceDue + shippingFee))}</strong> upon delivery.
                  </p>
                </div>

                <div
                  onClick={() => setPaymentChoice('full')}
                  style={{
                    border: paymentChoice === 'full' ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    cursor: 'pointer',
                    background: paymentChoice === 'full' ? 'var(--gold-lighter)' : '#FFFFFF'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CreditCard size={16} />
                      <span>Pay Full Amount Now</span>
                    </strong>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {formatINR(grandTotal)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Zero balance on delivery. Complete your transaction seamlessly.
                  </p>
                </div>
              </div>

              {/* Order Cost Breakdown */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span>Items Total ({cartItems.length} items):</span>
                  <span>{formatINR(totalOrderValue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span>Delivery ({deliveryMethod === 'courier' ? 'Courier' : 'Pickup'}):</span>
                  <span>{shippingFee === 0 ? <strong style={{ color: 'var(--status-success)' }}>FREE</strong> : formatINR(shippingFee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontWeight: 600 }}>
                  <span>Total Order Value:</span>
                  <span>{formatINR(grandTotal)}</span>
                </div>
              </div>

              {/* Highlight Amount Due Today */}
              <div style={{ background: 'var(--text-primary)', color: '#FAF6EE', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--gold-light)' }}>Payable Online Today:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: '#FFFFFF' }}>
                    {formatINR(payableNow)}
                  </span>
                </div>
                {remainingBalance > 0 && (
                  <p style={{ fontSize: '0.78rem', color: '#D4C4B7', marginTop: '0.25rem' }}>
                    Remaining balance: <strong>{formatINR(remainingBalance)}</strong> due later.
                  </p>
                )}
              </div>

              {/* Exclusive PhonePe UPI Payment Method */}
              <div
                style={{
                  border: '2px solid #5f259f',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  background: '#FAF5FF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#5f259f', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Smartphone size={20} />
                    <span>PhonePe UPI Payment</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#5f259f', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '100px' }}>
                    <CheckCircle2 size={12} />
                    <span>Official PhonePe</span>
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#524365', margin: 0, lineHeight: 1.4 }}>
                  Fast & secure UPI payment linked to PhonePe number <strong>+91 6372556290</strong> (<code>6372556290@ybl</code>). Pay via PhonePe App or scan dynamic QR.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="policyCheck"
                  checked={policyAccepted}
                  onChange={(e) => setPolicyAccepted(e.target.checked)}
                  style={{ marginTop: '3px' }}
                />
                <label htmlFor="policyCheck" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  I accept Lavanya Collections <Link to="/policies#returns" target="_blank" style={{ color: 'var(--gold-dark)', textDecoration: 'underline' }}>return terms</Link> and <Link to="/policies#rentals" target="_blank" style={{ color: 'var(--gold-dark)', textDecoration: 'underline' }}>rental agreements</Link>.
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={processing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: '#5f259f',
                  borderColor: '#4a1b7e',
                  boxShadow: '0 4px 14px rgba(95, 37, 159, 0.25)'
                }}
              >
                <Smartphone size={20} />
                <span>
                  {processing
                    ? 'Processing Order...'
                    : `Pay ${formatINR(payableNow)} with PhonePe`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* PhonePe Direct Payment Modal */}
      {phonePeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '490px', padding: '2rem 1.75rem', textAlign: 'center' }}>
            {/* PhonePe Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#5f259f', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={26} color="#FFFFFF" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#5f259f', fontWeight: 700 }}>
                  PhonePe Instant UPI
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Lavanya Collections Boutique
                </span>
              </div>
            </div>

            <div style={{ background: '#FAF5FF', border: '1px solid #E9D8FD', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem', borderBottom: '1px dashed #D6BCFA', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.88rem', color: '#5f259f', fontWeight: 600 }}>Payable Amount:</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#2D1B4E' }}>
                  {formatINR(phonePeModal.paymentOrder.amountInINR)}
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                  <strong>#{phonePeModal.order.orderNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>PhonePe Number:</span>
                  <strong style={{ color: '#5f259f' }}>+91 {phonePeModal.paymentOrder.phonePe?.number || '6372556290'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>UPI ID:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <code style={{ background: '#FFFFFF', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                      {phonePeModal.paymentOrder.phonePe?.upiId || '6372556290@ybl'}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyUpi(phonePeModal.paymentOrder.phonePe?.upiId || '6372556290@ybl')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#5f259f' }}
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check size={14} color="#137333" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            {phonePeModal.paymentOrder.phonePe?.qrCodeDataUrl ? (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
                <img
                  src={phonePeModal.paymentOrder.phonePe.qrCodeDataUrl}
                  alt="PhonePe UPI QR Code"
                  style={{ width: '180px', height: '180px', display: 'block', margin: '0 auto' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem' }}>
                  Scan with PhonePe or any UPI app
                </span>
              </div>
            ) : null}

            {/* Mobile 1-Click Pay Deep Link */}
            <div style={{ marginBottom: '1.25rem' }}>
              <a
                href={phonePeModal.paymentOrder.phonePe?.phonepeIntentUrl || phonePeModal.paymentOrder.phonePe?.upiIntentUrl}
                className="btn btn-primary btn-block"
                style={{ background: '#5f259f', borderColor: '#4a1b7e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
              >
                <Smartphone size={18} />
                <span>Open in PhonePe App to Pay</span>
                <ExternalLink size={16} />
              </a>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                (Tap if you are on mobile with PhonePe installed)
              </span>
            </div>

            {/* Mandatory UTR / Transaction ID Input Form */}
            <div style={{ textAlign: 'left', marginBottom: '1.25rem', background: '#FFFDF5', border: '1px solid #F6E05E', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                PhonePe Transaction ID / UTR <span style={{ color: '#C53030' }}>* (Mandatory)</span>
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. T26102112345678 or 428901234567"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                style={{ fontSize: '0.9rem', border: '1.5px solid #D69E2E', background: '#FFFFFF' }}
              />
              <span style={{ fontSize: '0.74rem', color: '#744210', display: 'block', marginTop: '0.4rem', lineHeight: 1.4 }}>
                ⚠️ <strong>Required for Verification</strong>: Open your PhonePe app &gt; History &gt; Click this payment &gt; Copy the <strong>12-digit UTR / Transaction ID</strong> and paste it above to verify your transfer.
              </span>
            </div>

            {/* Confirmation Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={handleConfirmPhonePePayment}
                className="btn btn-primary btn-block"
                disabled={processing}
                style={{ background: '#137333', borderColor: '#0d5424', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <CheckCircle2 size={18} />
                <span>{processing ? 'Verifying...' : 'I Have Paid — Confirm Order'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPhonePeModal(null)}
                className="btn btn-outline-dark btn-block"
                disabled={processing}
              >
                Cancel / Edit Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
