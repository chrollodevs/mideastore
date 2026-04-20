import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);
      if (searchQuery) params.append('search', searchQuery);

      const data = await fetchApi(`/requests?${params.toString()}`);
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filterStatus, filterType, searchQuery]);

  const handleStatusChange = async (id, status) => {
    try {
      await fetchApi(`/requests/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      loadRequests();
    } catch (err) {
      alert(t('admin.requests.statusUpdateFailed'));
    }
  };

  const parseProducts = (productsStr) => {
    if (!productsStr) return null;
    try {
      const parsed = JSON.parse(productsStr);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    } catch { return null; }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return t('admin.requests.status.pending');
      case 'contacted': return t('admin.requests.status.reviewed');
      case 'confirmed': return t('admin.status.confirmed');
      case 'cancelled': return t('admin.status.cancelled');
      default: return status;
    }
  };

  const getTypeLabel = (type) => {
    return type.replace('_', ' ').toUpperCase();
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = searchQuery === '' ||
        req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.email && req.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (req.phone && req.phone.includes(searchQuery));
      return matchesSearch;
    });
  }, [requests, searchQuery]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    contacted: requests.filter(r => r.status === 'contacted').length,
    confirmed: requests.filter(r => r.status === 'confirmed').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  }), [requests]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-48)' }}>
        <div>
          <h1 className="t-page-title" style={{ marginBottom: 'var(--space-8)' }}>{t('admin.dashboard.pipeline')}</h1>
          <p className="t-body">{stats.total} {t('admin.requests.total')}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-16)', marginBottom: 'var(--space-32)' }}>
        <div style={{ padding: 'var(--space-16)', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <span className="t-label">{t('admin.requests.statTotal')}</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.total}</p>
        </div>
        <div style={{ padding: 'var(--space-16)', background: 'var(--bg-surface)', borderRadius: '8px', borderLeft: '3px solid var(--status-pending)' }}>
          <span className="t-label" style={{ color: 'var(--status-pending)' }}>{t('admin.requests.statPending')}</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--status-pending)' }}>{stats.pending}</p>
        </div>
        <div style={{ padding: 'var(--space-16)', background: 'var(--bg-surface)', borderRadius: '8px', borderLeft: '3px solid var(--status-reviewed)' }}>
          <span className="t-label" style={{ color: 'var(--status-reviewed)' }}>{t('admin.requests.statContacted')}</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--status-reviewed)' }}>{stats.contacted}</p>
        </div>
        <div style={{ padding: 'var(--space-16)', background: 'var(--bg-surface)', borderRadius: '8px', borderLeft: '3px solid var(--status-completed)' }}>
          <span className="t-label" style={{ color: 'var(--status-completed)' }}>{t('admin.requests.statConfirmed')}</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--status-completed)' }}>{stats.confirmed}</p>
        </div>
        <div style={{ padding: 'var(--space-16)', background: 'var(--bg-surface)', borderRadius: '8px', borderLeft: '3px solid #6B7280' }}>
          <span className="t-label" style={{ color: '#6B7280' }}>{t('admin.requests.statCancelled')}</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#6B7280' }}>{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="surface-card" style={{ padding: 'var(--space-16) var(--space-24)', marginBottom: 'var(--space-24)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-16)', alignItems: 'center' }}>
        <div style={{ flex: '1 1 300px' }}>
          <input
            type="text"
            className="input-field"
            placeholder={t("admin.requests.search")}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="input-field" style={{ flex: '0 0 180px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">{t('admin.requests.allStatus')}</option>
          <option value="pending">{t('admin.requests.statPending')}</option>
          <option value="contacted">{t('admin.requests.statContacted')}</option>
          <option value="confirmed">{t('admin.requests.statConfirmed')}</option>
          <option value="cancelled">{t('admin.requests.statCancelled')}</option>
        </select>
        <select className="input-field" style={{ flex: '0 0 180px' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">{t('admin.requests.allTypes')}</option>
          <option value="cart_request">Cart Requests</option>
          <option value="purchase_intent">Purchase Intent</option>
          <option value="inquiry">Inquiry</option>
          <option value="contact">Contact</option>
        </select>
        <button onClick={loadRequests} className="btn btn-ghost" style={{ padding: 'var(--space-8) var(--space-16)' }}>
          Refresh
        </button>
      </div>

      {/* Requests List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
        {filteredRequests.map(req => {
          const cartProducts = parseProducts(req.products);

          return (
            <div key={req.id} className="surface-card" style={{ borderLeft: `6px solid var(--status-${req.status})`, padding: 'var(--space-24)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-24)' }}>

                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginBottom: 'var(--space-16)', flexWrap: 'wrap' }}>
                    <span className="t-label" style={{ padding: 'var(--space-4) var(--space-12)', background: `var(--status-${req.status})`, color: 'var(--bg-surface)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {getStatusLabel(req.status)}
                    </span>
                    <span className="t-label" style={{ padding: 'var(--space-4) var(--space-12)', background: 'var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '99px', fontSize: '0.75rem' }}>
                      {getTypeLabel(req.type)}
                    </span>
                    <span className="t-body" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {new Date(req.created_at).toLocaleString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-8)' }}>{req.name}</h3>
                  <div className="t-body" style={{ display: 'flex', gap: 'var(--space-24)', flexWrap: 'wrap', marginBottom: 'var(--space-16)' }}>
                    {req.email && <span>Email: <strong style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{req.email}</strong></span>}
                    {req.phone && <span>Phone: <strong style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{req.phone}</strong></span>}
                  </div>

                  {req.product_name && (
                    <div style={{ padding: 'var(--space-12) var(--space-16)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', marginBottom: 'var(--space-16)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                      <span className="t-label">Product:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{req.product_name}</strong>
                    </div>
                  )}

                  {cartProducts && (
                    <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: 'var(--space-16)', marginBottom: 'var(--space-16)' }}>
                      <div className="t-label" style={{ marginBottom: 'var(--space-12)', fontSize: '0.8rem' }}>{t('admin.requests.cartProducts')} ({cartProducts.length})</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                        {cartProducts.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-8) var(--space-12)', background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{item.name}</span>
                            <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
                              <span className="t-label">x{item.quantity}</span>
                              {item.price && (
                                <span style={{ fontWeight: 600, color: 'var(--brand-media)', fontSize: '0.875rem' }}>
                                  {(item.price * item.quantity).toLocaleString()} DZD
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                          Total: {cartProducts.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0).toLocaleString()} DZD
                        </span>
                      </div>
                    </div>
                  )}

                  {req.message && (
                    <div style={{ background: 'var(--bg-base)', padding: 'var(--space-16)', borderLeft: '3px solid var(--border-strong)', borderRadius: '0 4px 4px 0' }}>
                      <p className="t-body" style={{ margin: 0, fontStyle: 'italic' }}>"{req.message}"</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', minWidth: '200px' }}>
                  <label className="t-label">{t('admin.requests.updateStatus')}</label>
                  <select
                    value={req.status}
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    className="input-field"
                    style={{ padding: 'var(--space-12)', fontSize: '0.95rem' }}
                  >
                    <option value="pending">{t('admin.requests.statPending')}</option>
                    <option value="contacted">{t('admin.requests.statContacted')}</option>
                    <option value="confirmed">{t('admin.requests.statConfirmed')}</option>
                    <option value="cancelled">{t('admin.requests.statCancelled')}</option>
                  </select>
                  <Link to={`/admin/requests/${req.id}`} className="btn btn-ghost" style={{ fontSize: '0.875rem', textAlign: 'center' }}>
                    View Details
                  </Link>
                </div>

              </div>
            </div>
          );
        })}
        {filteredRequests.length === 0 && (
          <div className="surface-card" style={{ textAlign: 'center', padding: 'var(--space-64)' }}>
            <p className="t-body" style={{ color: 'var(--text-tertiary)', fontSize: '1.125rem' }}>{t('admin.requests.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
