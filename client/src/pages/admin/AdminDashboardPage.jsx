import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  CalendarCheck,
  Palette,
  AlertTriangle,
  CreditCard,
  Clock,
  ArrowRight,
  Package
} from 'lucide-react';
import { api } from '../../services/api';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.getDashboardMetrics();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading business analytics...</div>;
  }

  const { metrics, recentOrders, recentCustomRequests, lowStockProducts } = data || {};

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Store Business Overview</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Real-time metrics calculated from confirmed orders, rental bookings, and payments
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {/* Verified Revenue */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Verified Revenue
            </span>
            <TrendingUp size={20} color="var(--status-success)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
            {formatINR(metrics?.totalRevenue || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confirmed PhonePe payments</span>
        </div>

        {/* Outstanding Balances */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--gold-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Outstanding Balance
            </span>
            <CreditCard size={20} color="var(--gold-dark)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', color: 'var(--gold-dark)' }}>
            {formatINR(metrics?.totalOutstandingBalance || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due on delivery / completion</span>
        </div>

        {/* Total Orders */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--text-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Orders Placed
            </span>
            <ShoppingBag size={20} color="var(--text-primary)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
            {metrics?.totalOrders || 0}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--status-pending)', fontWeight: 600 }}>
            {metrics?.pendingOrders || 0} pending confirmation
          </span>
        </div>

        {/* Active Rentals & Upcoming Returns */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-rent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Rentals
            </span>
            <CalendarCheck size={20} color="var(--accent-rent)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', color: 'var(--accent-rent)' }}>
            {metrics?.activeRentals || 0}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-rent)', fontWeight: 600 }}>
            {metrics?.upcomingReturns || 0} returns expected in 3 days
          </span>
        </div>

        {/* Custom Requests */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--gold-dark)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Custom Ideas
            </span>
            <Palette size={20} color="var(--gold-dark)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
            {metrics?.pendingCustomRequests || 0}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending review or quotation</span>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Pending Custom Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Recent Orders */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Recent Store Orders</h3>
            <Link to="/admin/orders" style={{ fontSize: '0.82rem', color: 'var(--gold-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((ord) => (
                    <tr key={ord._id}>
                      <td>
                        <Link to={`/admin/orders`} style={{ fontWeight: 600, color: 'var(--gold-dark)' }}>
                          #{ord.orderNumber}
                        </Link>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {formatDate(ord.createdAt)}
                        </span>
                      </td>
                      <td>{ord.customerDetails?.name || 'Customer'}</td>
                      <td>
                        <strong>{formatINR(ord.totalAmount)}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {ord.paymentTypeChosen}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${ord.orderStatus === 'confirmed' || ord.orderStatus === 'completed' ? 'badge-success' : 'badge-pending'}`}>
                          {ord.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No orders placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Custom Requests */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Custom Design Requests</h3>
            <Link to="/admin/custom-requests" style={{ fontSize: '0.82rem', color: 'var(--gold-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentCustomRequests && recentCustomRequests.length > 0 ? (
              recentCustomRequests.map((req) => (
                <div key={req._id} style={{ background: 'var(--bg-cream)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{req.title}</strong>
                    <span className={`badge ${req.status === 'quoted' ? 'badge-gold' : 'badge-pending'}`}>
                      {req.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    By {req.customerDetails?.name} • Req #{req.requestNumber}
                  </p>
                  <Link to="/admin/custom-requests" className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
                    Review Idea & Send Quotation →
                  </Link>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                No pending custom design requests.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--status-pending)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--status-pending)' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '1.15rem' }}>Low Stock Inventory Alerts</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {lowStockProducts.map((prod) => (
              <div key={prod._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#FFFFFF', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <img src={prod.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=100&q=80'} alt="" style={{ width: '45px', height: '45px', borderRadius: '4px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>{prod.name}</p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--status-danger)', fontWeight: 600 }}>
                    Only {prod.stockQuantity} unit(s) remaining
                  </span>
                </div>
                <Link to={`/admin/products/edit/${prod._id}`} className="btn btn-outline-dark btn-sm" style={{ fontSize: '0.75rem' }}>
                  Restock
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
