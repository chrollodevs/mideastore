import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { usePolling } from '../hooks/usePolling';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  const { showToast } = useToast();

  const loadRequests = async () => {
    const params = new URLSearchParams();
    if (filterStatus !== 'all') params.append('status', filterStatus);
    if (filterType !== 'all') params.append('type', filterType);
    if (searchQuery) params.append('search', searchQuery);
    return await fetchApi(`/requests?${params.toString()}`);
  };

  const { data: polledRequests } = usePolling(loadRequests, 15000);

  useEffect(() => {
    if (polledRequests) setRequests(polledRequests);
  }, [polledRequests]);

  // Initial load or filter change load
  useEffect(() => {
    loadRequests().then(setRequests).catch(console.error);
  }, [filterStatus, filterType, searchQuery]);

  const handleStatusChange = async (id, status) => {
    // Optimistic Update
    const previousRequests = [...requests];
    setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    
    try {
      await fetchApi(`/requests/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      showToast(t('admin.requests.statusUpdated') || 'Status updated', 'success');
    } catch (err) {
      // Revert on failure
      setRequests(previousRequests);
      showToast(t('admin.requests.statusUpdateFailed') || 'Failed to update status', 'error');
    }
  };

  const parseProducts = (productsStr) => {
    if (!productsStr) return null;
    try { const parsed = JSON.parse(productsStr); return Array.isArray(parsed) && parsed.length > 0 ? parsed : null; }
    catch { return null; }
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

  const getTypeLabel = (type) => type.replace('_', ' ').toUpperCase();
  const getStatusVariant = (status) => {
    switch(status) { case 'pending': return 'pending'; case 'contacted': return 'reviewed'; case 'confirmed': return 'completed'; case 'cancelled': return 'cancelled'; default: return 'cancelled'; }
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
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{t('admin.dashboard.pipeline')}</h1>
          <p className="admin-page-subtitle">{stats.total} {t('admin.requests.total')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid" style={{ marginBottom: 'var(--space-24)' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-label">{t('admin.requests.statTotal')}</div>
          <div className="admin-stat-value">{stats.total}</div>
        </div>
        <div className="admin-stat-card admin-stat-card--pending">
          <div className="admin-stat-label" style={{ color: 'var(--status-pending)' }}>{t('admin.requests.statPending')}</div>
          <div className="admin-stat-value">{stats.pending}</div>
        </div>
        <div className="admin-stat-card admin-stat-card--reviewed">
          <div className="admin-stat-label" style={{ color: 'var(--status-reviewed)' }}>{t('admin.requests.statContacted')}</div>
          <div className="admin-stat-value">{stats.contacted}</div>
        </div>
        <div className="admin-stat-card admin-stat-card--completed">
          <div className="admin-stat-label" style={{ color: 'var(--status-completed)' }}>{t('admin.requests.statConfirmed')}</div>
          <div className="admin-stat-value">{stats.confirmed}</div>
        </div>
        <div className="admin-stat-card admin-stat-card--cancelled">
          <div className="admin-stat-label" style={{ color: '#6B7280' }}>{t('admin.requests.statCancelled')}</div>
          <div className="admin-stat-value">{stats.cancelled}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" className="input-field" placeholder={t("admin.requests.search")} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="admin-filter-select">
          <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">{t('admin.requests.allStatus')}</option>
            <option value="pending">{t('admin.requests.statPending')}</option>
            <option value="contacted">{t('admin.requests.statContacted')}</option>
            <option value="confirmed">{t('admin.requests.statConfirmed')}</option>
            <option value="cancelled">{t('admin.requests.statCancelled')}</option>
          </select>
        </div>
        <div className="admin-filter-select">
          <select className="input-field" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">{t('admin.requests.allTypes')}</option>
            <option value="cart_request">Cart Requests</option>
            <option value="purchase_intent">Purchase Intent</option>
            <option value="inquiry">Inquiry</option>
            <option value="contact">Contact</option>
          </select>
        </div>
        <button onClick={loadRequests} className="admin-btn-sm">Refresh</button>
      </div>

      {/* Requests */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {filteredRequests.map(req => {
          const cartProducts = parseProducts(req.products);
          const variant = getStatusVariant(req.status);

          return (
            <div key={req.id} className="admin-card" style={{ padding: 'var(--space-24)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-24)' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  {/* Status + Type + Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-12)', flexWrap: 'wrap' }}>
                    <span className={`admin-badge admin-badge--${variant}`}>
                      <span className={`admin-badge-dot admin-badge-dot--${variant}`}></span>
                      {getStatusLabel(req.status)}
                    </span>
                    <span className="admin-badge">{getTypeLabel(req.type)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--admin-font-display)' }}>
                      {new Date(req.created_at).toLocaleString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-8)' }}>{req.name}</h3>
                  <div style={{ display: 'flex', gap: 'var(--space-16)', flexWrap: 'wrap', marginBottom: 'var(--space-12)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {req.email && <span>Email: <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{req.email}</strong></span>}
                    {req.phone && <span>Phone: <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{req.phone}</strong></span>}
                  </div>

                  {req.product_name && (
                    <div style={{ padding: 'var(--space-8) var(--space-12)', background: '#F8FAFC', border: '1px solid var(--admin-border-light)', borderRadius: 'var(--admin-radius-xs)', marginBottom: 'var(--space-12)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product:</span>
                      <strong style={{ fontSize: '0.875rem' }}>{req.product_name}</strong>
                    </div>
                  )}

                  {cartProducts && (
                    <div style={{ background: '#F8FAFC', border: '1px solid var(--admin-border-light)', borderRadius: 'var(--admin-radius-xs)', padding: 'var(--space-16)', marginBottom: 'var(--space-12)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-8)' }}>{t('admin.requests.cartProducts')} ({cartProducts.length})</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {cartProducts.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-8) var(--space-12)', background: '#fff', borderRadius: '6px', border: '1px solid var(--admin-border-light)' }}>
                            <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.name}</span>
                            <div style={{ display: 'flex', gap: 'var(--space-12)', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>x{item.quantity}</span>
                              {item.price && <span style={{ fontFamily: 'var(--admin-font-display)', fontWeight: 600, color: 'var(--brand-media)', fontSize: '0.875rem' }}>{(item.price * item.quantity).toLocaleString()} DZD</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-8)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--admin-border-light)' }}>
                        <span style={{ fontFamily: 'var(--admin-font-display)', fontWeight: 700, fontSize: '0.9375rem' }}>
                          Total: {cartProducts.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0).toLocaleString()} DZD
                        </span>
                      </div>
                    </div>
                  )}

                  {req.message && (
                    <div style={{ background: '#F8FAFC', padding: 'var(--space-12) var(--space-16)', borderLeft: '3px solid var(--admin-border)', borderRadius: '0 var(--admin-radius-xs) var(--admin-radius-xs) 0' }}>
                      <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>"{req.message}"</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', minWidth: '180px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('admin.requests.updateStatus')}</label>
                  <select value={req.status} onChange={(e) => handleStatusChange(req.id, e.target.value)} className="input-field" style={{ fontSize: '0.875rem' }}>
                    <option value="pending">{t('admin.requests.statPending')}</option>
                    <option value="contacted">{t('admin.requests.statContacted')}</option>
                    <option value="confirmed">{t('admin.requests.statConfirmed')}</option>
                    <option value="cancelled">{t('admin.requests.statCancelled')}</option>
                  </select>
                  <Link to={`/admin/requests/${req.id}`} className="admin-btn-sm" style={{ textAlign: 'center', textDecoration: 'none' }}>
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {filteredRequests.length === 0 && (
          <div className="admin-card">
            <div className="admin-empty-state">
              <p className="admin-empty-text">{t('admin.requests.empty')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
