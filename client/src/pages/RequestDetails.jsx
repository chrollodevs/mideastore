import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchApi(`/requests/${id}`)
      .then(setRequest)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await fetchApi(`/requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      setRequest(prev => ({ ...prev, status }));
    } catch (err) {
      alert('Status update failed.');
    }
  };

  const parseProducts = (productsStr) => {
    if (!productsStr) return null;
    try {
      const parsed = JSON.parse(productsStr);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    } catch { return null; }
  };

  if (loading) return <div className="container section-spacing t-body">Loading...</div>;
  if (!request) return <div className="container section-spacing t-body">Request not found.</div>;

  const cartProducts = parseProducts(request.products);

  return (
    <div className="container section-spacing">
      <div style={{ marginBottom: 'var(--space-32)' }}>
        <Link to="/admin/requests" className="t-label" style={{ color: 'var(--brand-media)', textDecoration: 'underline' }}>
          ← Back to Requests
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-32)' }}>
        {/* Left Column - Customer & Request Info */}
        <div>
          <div className="surface-card" style={{ marginBottom: 'var(--space-24)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Customer Information</h2>
              <span className="t-label" style={{ padding: 'var(--space-4) var(--space-12)', background: `var(--status-${request.status})`, color: '#fff', borderRadius: '99px', fontSize: '0.75rem' }}>
                {request.status.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
              <div>
                <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>Name</span>
                <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>{request.name}</p>
              </div>
              {request.email && (
                <div>
                  <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>Email</span>
                  <p style={{ fontSize: '1rem' }}>
                    <a href={`mailto:${request.email}`} style={{ color: 'var(--brand-media)' }}>{request.email}</a>
                  </p>
                </div>
              )}
              {request.phone && (
                <div>
                  <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>Phone</span>
                  <p style={{ fontSize: '1rem' }}>
                    <a href={`tel:${request.phone}`} style={{ color: 'var(--brand-media)' }}>{request.phone}</a>
                  </p>
                </div>
              )}
              <div>
                <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>Request Type</span>
                <p style={{ fontSize: '1rem', textTransform: 'uppercase' }}>{request.type.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>Submitted</span>
                <p style={{ fontSize: '1rem' }}>{new Date(request.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {request.message && (
            <div className="surface-card">
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 'var(--space-12)' }}>Customer Message</h3>
              <p className="t-body" style={{ fontStyle: 'italic', background: 'var(--bg-base)', padding: 'var(--space-16)', borderRadius: '8px' }}>
                "{request.message}"
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Products & Actions */}
        <div>
          <div className="surface-card" style={{ marginBottom: 'var(--space-24)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-24)' }}>Products</h3>

            {request.product_name && (
              <div style={{ padding: 'var(--space-16)', background: 'var(--bg-base)', borderRadius: '8px', marginBottom: 'var(--space-16)' }}>
                <p style={{ fontWeight: '500' }}>{request.product_name}</p>
              </div>
            )}

            {cartProducts && cartProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                {cartProducts.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-12)', background: 'var(--bg-base)', borderRadius: '8px' }}>
                    <div>
                      <p style={{ fontWeight: '500', fontSize: '0.95rem' }}>{item.name}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Qty: {item.quantity}</p>
                    </div>
                    {item.price && (
                      <span style={{ fontWeight: '600', color: 'var(--brand-media)' }}>
                        {(item.price * item.quantity).toLocaleString()} DZD
                      </span>
                    )}
                  </div>
                ))}
                <div style={{ borderTop: '2px solid var(--border-strong)', paddingTop: 'var(--space-12)', marginTop: 'var(--space-8)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600' }}>Total</span>
                    <span style={{ fontWeight: '700', fontSize: '1.125rem', color: 'var(--brand-media)' }}>
                      {cartProducts.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0).toLocaleString()} DZD
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="t-body" style={{ color: 'var(--text-tertiary)' }}>No products associated</p>
            )}
          </div>

          <div className="surface-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-24)' }}>Update Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              <button
                onClick={() => handleStatusChange('pending')}
                className={`btn ${request.status === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start' }}
              >
                {request.status === 'pending' ? '✓ ' : ''}Pending
              </button>
              <button
                onClick={() => handleStatusChange('contacted')}
                className={`btn ${request.status === 'contacted' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start' }}
              >
                {request.status === 'contacted' ? '✓ ' : ''}Contacted
              </button>
              <button
                onClick={() => handleStatusChange('confirmed')}
                className={`btn ${request.status === 'confirmed' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start' }}
              >
                {request.status === 'confirmed' ? '✓ ' : ''}Confirmed
              </button>
              <button
                onClick={() => handleStatusChange('cancelled')}
                className={`btn ${request.status === 'cancelled' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', color: '#EF4444' }}
              >
                {request.status === 'cancelled' ? '✓ ' : ''}Cancelled
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
