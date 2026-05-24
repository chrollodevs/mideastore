import { useState, useEffect } from 'react';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useDialog } from '../context/DialogContext';
import { usePolling } from '../hooks/usePolling';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const { t } = useLanguage();
  const { showToast } = useToast();
  const dialog = useDialog();

  const loadMessages = async () => {
    const params = new URLSearchParams();
    if (filterStatus !== 'all') params.append('status', filterStatus);
    return await fetchApi(`/messages?${params.toString()}`);
  };

  const { data: polledMessages } = usePolling(loadMessages, 15000);

  useEffect(() => {
    if (polledMessages) setMessages(polledMessages);
  }, [polledMessages]);

  useEffect(() => {
    loadMessages().then(setMessages).catch(console.error);
  }, [filterStatus]);

  const handleStatusChange = async (id, status) => {
    const previousMessages = [...messages];
    setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
    
    try {
      await fetchApi(`/messages/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      showToast(t('admin.messages.statusUpdated') || 'Message status updated', 'success');
    } catch (err) {
      setMessages(previousMessages);
      showToast(t('admin.messages.statusUpdateFailed') || 'Status update failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await dialog.confirm({
      title: 'Delete Message',
      message: 'Are you sure you want to permanently delete this message?',
      confirmText: 'Delete',
      isDestructive: true
    });
    
    if (!confirmed) return;
    
    const previousMessages = [...messages];
    setMessages(messages.filter(m => m.id !== id));
    
    try {
      await fetchApi(`/messages/${id}`, { method: 'DELETE' });
      showToast('Message deleted successfully', 'success');
    } catch (err) {
      setMessages(previousMessages);
      showToast(t('admin.products.deleteError') || 'Failed to delete message', 'error');
    }
  };

  const stats = {
    total: messages.length,
    unread: messages.filter(m => m.status === 'unread').length,
    read: messages.filter(m => m.status === 'read').length,
    archived: messages.filter(m => m.status === 'archived').length,
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{t('admin.messages.title')}</h1>
          <p className="admin-page-subtitle">{t('admin.messages.subtitle')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid" style={{ marginBottom: 'var(--space-24)' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-label">{t('admin.messages.statTotal')}</div>
          <div className="admin-stat-value">{stats.total}</div>
        </div>
        <div className="admin-stat-card admin-stat-card--accent">
          <div className="admin-stat-label" style={{ color: 'var(--brand-media)' }}>{t('admin.messages.statUnread')}</div>
          <div className="admin-stat-value">{stats.unread}</div>
        </div>
        <div className="admin-stat-card admin-stat-card--completed">
          <div className="admin-stat-label" style={{ color: 'var(--status-completed)' }}>{t('admin.messages.statRead')}</div>
          <div className="admin-stat-value">{stats.read}</div>
        </div>
        <div className="admin-stat-card admin-stat-card--cancelled">
          <div className="admin-stat-label" style={{ color: '#6B7280' }}>{t('admin.messages.statArchived')}</div>
          <div className="admin-stat-value">{stats.archived}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="admin-filter-bar">
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('admin.messages.status')}:</span>
        <div className="admin-filter-select">
          <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">{t('admin.messages.allStatus')}</option>
            <option value="unread">{t('admin.messages.statUnread')}</option>
            <option value="read">{t('admin.messages.statRead')}</option>
            <option value="archived">{t('admin.messages.statArchived')}</option>
          </select>
        </div>
        <button onClick={loadMessages} className="admin-btn-sm">Refresh</button>
      </div>

      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        {messages.map(msg => (
          <div key={msg.id} className="admin-card" style={{
            padding: 'var(--space-24)',
            opacity: msg.status === 'archived' ? 0.6 : 1,
            borderLeft: msg.status === 'unread' ? '3px solid var(--brand-media)' : '3px solid transparent'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-24)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>{msg.name}</span>
                  {msg.status === 'unread' && (
                    <span className="admin-badge admin-badge--info" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>NEW</span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--admin-font-display)' }}>
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-12)', marginBottom: 'var(--space-12)', flexWrap: 'wrap' }}>
                  <a href={`mailto:${msg.email}`} style={{ fontSize: '0.875rem', color: 'var(--brand-media)', fontWeight: 500 }}>{msg.email}</a>
                  {msg.phone && <a href={`tel:${msg.phone}`} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{msg.phone}</a>}
                </div>
                <div style={{ background: '#F8FAFC', padding: 'var(--space-12) var(--space-16)', borderRadius: 'var(--admin-radius-xs)', fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {msg.message}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px' }}>
                <select value={msg.status} onChange={(e) => handleStatusChange(msg.id, e.target.value)} className="input-field" style={{ fontSize: '0.8125rem' }}>
                  <option value="unread">{t('admin.messages.markUnread')}</option>
                  <option value="read">{t('admin.messages.markRead')}</option>
                  <option value="archived">{t('admin.messages.archive')}</option>
                </select>
                <button onClick={() => handleDelete(msg.id)} className="admin-btn-sm admin-btn-sm--danger" style={{ fontSize: '0.75rem' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="admin-card">
            <div className="admin-empty-state">
              <p className="admin-empty-text">{t('admin.messages.empty')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
