import { useState, useEffect } from 'react';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const { t } = useLanguage();

  useEffect(() => {
    loadMessages();
  }, [filterStatus]);

  const loadMessages = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      const data = await fetchApi(`/messages?${params.toString()}`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await fetchApi(`/messages/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      loadMessages();
    } catch (err) {
      alert(t('admin.messages.statusUpdateFailed'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.products.confirmDelete'))) return;
    try {
      await fetchApi(`/messages/${id}`, { method: 'DELETE' });
      loadMessages();
    } catch (err) {
      alert(t('admin.products.deleteError'));
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
      <div style={{ marginBottom: 'var(--space-48)' }}>
        <h1 className="t-page-title" style={{ marginBottom: 'var(--space-8)' }}>{t('admin.messages.title')}</h1>
        <p className="t-body">{t('admin.messages.subtitle')}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-16)', marginBottom: 'var(--space-32)' }}>
        <div style={{ padding: 'var(--space-16)', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <span className="t-label">{t('admin.messages.statTotal')}</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.total}</p>
        </div>
        <div style={{ padding: 'var(--space-16)', background: '#EFF6FF', borderRadius: '8px', borderLeft: '3px solid var(--brand-media)' }}>
          <span className="t-label" style={{ color: 'var(--brand-media)' }}>{t('admin.messages.statUnread')}</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--brand-media)' }}>{stats.unread}</p>
        </div>
        <div style={{ padding: 'var(--space-16)', background: 'var(--bg-surface)', borderRadius: '8px', borderLeft: '3px solid var(--status-completed)' }}>
          <span className="t-label" style={{ color: 'var(--status-completed)' }}>{t('admin.messages.statRead')}</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--status-completed)' }}>{stats.read}</p>
        </div>
        <div style={{ padding: 'var(--space-16)', background: 'var(--bg-surface)', borderRadius: '8px', borderLeft: '3px solid #6B7280' }}>
          <span className="t-label" style={{ color: '#6B7280' }}>{t('admin.messages.statArchived')}</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#6B7280' }}>{stats.archived}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="surface-card" style={{ padding: 'var(--space-16) var(--space-24)', marginBottom: 'var(--space-24)', display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
        <span className="t-label">{t('admin.messages.status')}:</span>
        <select className="input-field" style={{ flex: '0 0 180px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">{t('admin.messages.allStatus')}</option>
          <option value="unread">{t('admin.messages.statUnread')}</option>
          <option value="read">{t('admin.messages.statRead')}</option>
          <option value="archived">{t('admin.messages.statArchived')}</option>
        </select>
        <button onClick={loadMessages} className="btn btn-ghost" style={{ padding: 'var(--space-8) var(--space-16)' }}>
          Refresh
        </button>
      </div>

      {/* Messages List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            className="surface-card"
            style={{
              borderLeft: `6px solid ${msg.status === 'unread' ? 'var(--brand-media)' : 'var(--border-subtle)'}`,
              opacity: msg.status === 'archived' ? 0.6 : 1
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-24)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginBottom: 'var(--space-12)' }}>
                  <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{msg.name}</span>
                  {msg.status === 'unread' && (
                    <span style={{ fontSize: '0.75rem', background: 'var(--brand-media)', color: '#fff', padding: '2px 8px', borderRadius: '99px' }}>NEW</span>
                  )}
                  <span className="t-body" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ marginBottom: 'var(--space-12)' }}>
                  <a href={`mailto:${msg.email}`} className="t-label" style={{ color: 'var(--brand-media)' }}>{msg.email}</a>
                </div>
                <p className="t-body" style={{ background: 'var(--bg-base)', padding: 'var(--space-16)', borderRadius: '8px', margin: 0 }}>
                  {msg.message}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', minWidth: '180px' }}>
                <select
                  value={msg.status}
                  onChange={(e) => handleStatusChange(msg.id, e.target.value)}
                  className="input-field"
                  style={{ padding: 'var(--space-8)', fontSize: '0.875rem' }}
                >
                  <option value="unread">{t('admin.messages.markUnread')}</option>
                  <option value="read">{t('admin.messages.markRead')}</option>
                  <option value="archived">{t('admin.messages.archive')}</option>
                </select>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.75rem', color: '#EF4444' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="surface-card" style={{ textAlign: 'center', padding: 'var(--space-64)' }}>
            <p className="t-body" style={{ color: 'var(--text-tertiary)' }}>{t('admin.messages.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
