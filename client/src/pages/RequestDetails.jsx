import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { showToast } = useToast();

  useEffect(() => {
    fetchApi(`/requests/${id}`)
      .then(setRequest)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await fetchApi(`/requests/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      setRequest(prev => ({ ...prev, status }));
      showToast('Status updated successfully', 'success');
    } catch (err) { 
      showToast('Status update failed.', 'error'); 
    }
  };

  const parseProducts = (productsStr) => {
    if (!productsStr) return null;
    try { const parsed = JSON.parse(productsStr); return Array.isArray(parsed) && parsed.length > 0 ? parsed : null; }
    catch { return null; }
  };

  const getStatusVariant = (status) => {
    switch(status) { case 'pending': return 'pending'; case 'contacted': return 'reviewed'; case 'confirmed': return 'completed'; case 'cancelled': return 'cancelled'; default: return 'cancelled'; }
  };

  if (loading) return (
    <div>
      <div className="admin-skeleton admin-skeleton-text" style={{ width: '120px', marginBottom: 'var(--space-32)' }}></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-24)' }}>
        <div className="admin-skeleton admin-skeleton-card" style={{ height: '300px' }}></div>
        <div className="admin-skeleton admin-skeleton-card" style={{ height: '300px' }}></div>
      </div>
    </div>
  );

  if (!request) return (
    <div className="admin-card" style={{ maxWidth: '500px', margin: 'var(--space-48) auto' }}>
      <div className="admin-empty-state"><p className="admin-empty-text">Request not found.</p></div>
    </div>
  );

  const cartProducts = parseProducts(request.products);
  const variant = getStatusVariant(request.status);

  const statusButtons = [
    { value: 'pending', label: 'Pending' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div>
      {/* Back */}
      <div style={{ marginBottom: 'var(--space-24)' }}>
        <Link to="/admin/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-sidebar-accent)', textDecoration: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Requests
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-24)' }}>
        {/* Left: Customer Info */}
        <div>
          <div className="admin-card" style={{ marginBottom: 'var(--space-16)' }}>
            <div className="admin-card-header">
              <h2 className="admin-card-title">Customer Information</h2>
              <span className={`admin-badge admin-badge--${variant}`}>
                <span className={`admin-badge-dot admin-badge-dot--${variant}`}></span>
                {request.status.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Name</span>
                <p style={{ fontSize: '1.0625rem', fontWeight: 500 }}>{request.name}</p>
              </div>
              {request.email && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Email</span>
                  <a href={`mailto:${request.email}`} style={{ color: 'var(--brand-media)', fontWeight: 500 }}>{request.email}</a>
                </div>
              )}
              {request.phone && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Phone</span>
                  <a href={`tel:${request.phone}`} style={{ color: 'var(--brand-media)', fontWeight: 500 }}>{request.phone}</a>
                </div>
              )}
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Request Type</span>
                <p style={{ fontSize: '0.9375rem', textTransform: 'uppercase', fontWeight: 500 }}>{request.type.replace('_', ' ')}</p>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Submitted</span>
                <p style={{ fontSize: '0.9375rem', fontFamily: 'var(--admin-font-display)' }}>{new Date(request.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {request.message && (
            <div className="admin-card">
              <h3 className="admin-card-title" style={{ marginBottom: 'var(--space-12)' }}>Customer Message</h3>
              <div style={{ background: '#F8FAFC', padding: 'var(--space-16)', borderRadius: 'var(--admin-radius-xs)', fontSize: '0.9375rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                "{request.message}"
              </div>
            </div>
          )}
        </div>

        {/* Right: Products + Status */}
        <div>
          <div className="admin-card" style={{ marginBottom: 'var(--space-16)' }}>
            <h3 className="admin-card-title" style={{ marginBottom: 'var(--space-16)' }}>Products</h3>

            {request.product_name && (
              <div style={{ padding: 'var(--space-12)', background: '#F8FAFC', borderRadius: 'var(--admin-radius-xs)', marginBottom: 'var(--space-12)' }}>
                <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{request.product_name}</p>
              </div>
            )}

            {cartProducts && cartProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cartProducts.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-12)', background: '#F8FAFC', borderRadius: 'var(--admin-radius-xs)' }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{item.name}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Qty: {item.quantity}</p>
                    </div>
                    {item.price && (
                      <span style={{ fontFamily: 'var(--admin-font-display)', fontWeight: 600, color: 'var(--brand-media)' }}>
                        {(item.price * item.quantity).toLocaleString()} DZD
                      </span>
                    )}
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: 'var(--space-8)', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Total</span>
                  <span style={{ fontFamily: 'var(--admin-font-display)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--brand-media)' }}>
                    {cartProducts.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0).toLocaleString()} DZD
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>No products associated</p>
            )}
          </div>

          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: 'var(--space-16)' }}>Update Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {statusButtons.map(btn => {
                const isActive = request.status === btn.value;
                const btnVariant = getStatusVariant(btn.value);
                return (
                  <button
                    key={btn.value}
                    onClick={() => handleStatusChange(btn.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-8)',
                      padding: 'var(--space-12) var(--space-16)',
                      borderRadius: 'var(--admin-radius-xs)',
                      border: isActive ? '2px solid var(--admin-sidebar-accent)' : '1px solid var(--admin-border)',
                      background: isActive ? 'rgba(99,102,241,0.06)' : '#fff',
                      cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'all var(--admin-transition)',
                      textAlign: 'left'
                    }}
                  >
                    <span className={`admin-badge-dot admin-badge-dot--${btnVariant}`}></span>
                    {isActive && <span style={{ fontSize: '0.875rem' }}>✓</span>}
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
