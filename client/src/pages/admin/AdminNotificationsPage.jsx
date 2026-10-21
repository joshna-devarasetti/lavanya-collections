import React, { useState, useEffect } from 'react';
import { Bell, Check, MessageSquare, CheckCheck, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { formatDateTime } from '../../utils/formatters';

export const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { notifySuccess, notifyError } = useNotification();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      notifyError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      notifySuccess('All notifications marked as read.');
      loadNotifications();
    } catch (e) {}
  };

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Boutique Notification Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            In-app alert feeds and WhatsApp delivery status logs
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadNotifications} className="btn btn-outline-dark btn-sm">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn btn-primary btn-sm">
              <CheckCheck size={16} />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <Bell size={36} color="var(--border-gold)" style={{ marginBottom: '0.75rem' }} />
            <p>No notifications yet. New orders, payments, and rental returns will alert here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: n.isRead ? '#FFFFFF' : 'var(--gold-lighter)',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{n.title}</strong>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                      {n.type.replace(/_/g, ' ')}
                    </span>
                    {n.whatsappStatus && n.whatsappStatus !== 'not_sent' && (
                      <span className={`badge ${n.whatsappStatus === 'sent' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.68rem' }}>
                        WhatsApp: {n.whatsappStatus}
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '0.35rem' }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
