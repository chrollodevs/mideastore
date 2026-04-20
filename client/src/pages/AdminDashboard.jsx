import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin' });

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchApi('/admin/users').then(setAdmins).catch((err) => {
        console.error(err);
      });
    }
  }, [user]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/admin/users', { method: 'POST', body: JSON.stringify(newAdmin) });
      setAdmins([...admins, { id: res.id, name: res.name, email: res.email, role: res.role, created_at: new Date().toISOString() }]);
      setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
      alert('Admin created successfully');
    } catch (error) {
      alert(error.message || 'Error creating admin');
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    try {
      await fetchApi(`/admin/users/${id}`, { method: 'DELETE' });
      setAdmins(admins.filter(a => a.id !== id));
    } catch (error) {
      alert(error.message || 'Error deleting admin');
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setError('Dashboard request timed out. Please refresh and try again.');
        setLoading(false);
      }
    }, 12000);

    fetchApi('/admin/dashboard')
      .then((payload) => {
        if (cancelled) return;
        setStats(payload?.stats || payload);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load dashboard data.');
      })
      .finally(() => {
        if (cancelled) return;
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  if (loading) return <div className="t-body">{t('admin.dashboard.loading')}</div>;
  if (error) {
    return (
      <div className="surface-card" style={{ maxWidth: '720px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-12)' }}>Dashboard unavailable</h2>
        <p className="t-body" style={{ marginBottom: 'var(--space-16)' }}>{error}</p>
        <button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }
  if (!stats) return <div className="t-body">No dashboard data available.</div>;

  const statusCard = (title, count, status, subtitle) => (
    <div className="surface-card" style={{ borderBottom: `4px solid var(--status-${status})` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 className="t-label" style={{ color: `var(--status-${status})`, marginBottom: 'var(--space-8)' }}>{title}</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: 1, color: `var(--status-${status})` }}>{count}</p>
          {subtitle && <p className="t-body" style={{ fontSize: '0.875rem', marginTop: 'var(--space-8)', color: 'var(--text-tertiary)' }}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const timeCard = (title, count, subtitle) => (
    <div className="surface-card">
      <h3 className="t-label" style={{ marginBottom: 'var(--space-8)' }}>{title}</h3>
      <p style={{ fontSize: '2rem', fontWeight: '700', lineHeight: 1 }}>{count}</p>
      {subtitle && <p className="t-body" style={{ fontSize: '0.875rem', marginTop: 'var(--space-8)', color: 'var(--text-tertiary)' }}>{subtitle}</p>}
    </div>
  );

  return (
    <div style={{ maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-48)' }}>
        <div>
          <h1 className="t-page-title" style={{ marginBottom: 'var(--space-8)' }}>{t('admin.dashboard.title')}</h1>
          <p className="t-body">{t('admin.dashboard.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
          <span className="badge">{t('admin.dashboard.lastUpdated')} {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Time-based Overview */}
      <div style={{ marginBottom: 'var(--space-48)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-24)' }}>{t('admin.dashboard.requestTimeline')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-24)' }}>
          {timeCard(t('admin.dashboard.time.today'), stats.todayRequests, t('admin.dashboard.time.todaySubtitle'))}
          {timeCard(t('admin.dashboard.time.thisWeek'), stats.weekRequests, t('admin.dashboard.time.weekSubtitle'))}
          {timeCard(t('admin.dashboard.time.thisMonth'), stats.monthRequests, t('admin.dashboard.time.monthSubtitle'))}
          {timeCard(t('admin.dashboard.time.allTime'), stats.requests, t('admin.dashboard.time.allTimeSubtitle'))}
        </div>
      </div>

      {/* Status Breakdown */}
      <div style={{ marginBottom: 'var(--space-48)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-24)' }}>{t('admin.dashboard.pipelineStatus')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-24)' }}>
          {statusCard(t('admin.requests.status.pending'), stats.pendingRequests, 'pending', t('admin.dashboard.status.pendingSub'))}
          {statusCard(t('admin.dashboard.status.contacted'), stats.contactedRequests, 'reviewed', t('admin.dashboard.status.contactedSub'))}
          {statusCard(t('admin.dashboard.status.confirmed'), stats.confirmedRequests, 'completed', t('admin.dashboard.status.confirmedSub'))}
          {statusCard(t('admin.dashboard.status.cancelled'), stats.cancelledRequests, 'pending', t('admin.dashboard.status.cancelledSub'))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-24)', marginBottom: 'var(--space-48)' }}>
        <div className="surface-card">
          <h3 className="t-label" style={{ marginBottom: 'var(--space-8)' }}>{t('admin.dashboard.stats.products')}</h3>
          <p style={{ fontSize: '3rem', fontWeight: '700', lineHeight: 1 }}>{stats.products}</p>
        </div>
        <div className="surface-card">
          <h3 className="t-label" style={{ marginBottom: 'var(--space-8)' }}>{t('admin.dashboard.stats.brands')}</h3>
          <p style={{ fontSize: '3rem', fontWeight: '700', lineHeight: 1 }}>{stats.brands}</p>
        </div>
        <div className="surface-card" style={{ borderColor: 'var(--brand-media)', borderWidth: '0 0 4px 0' }}>
          <h3 className="t-label" style={{ marginBottom: 'var(--space-8)' }}>{t('admin.dashboard.messages')}</h3>
          <p style={{ fontSize: '3rem', fontWeight: '700', lineHeight: 1 }}>{stats.totalMessages}</p>
          {stats.unreadMessages > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--brand-media)', fontWeight: '600' }}>
              {stats.unreadMessages} {t('admin.dashboard.messagesUnread')}
            </span>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-32)' }}>
        {/* Requests per Brand */}
        <div className="surface-card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-24)' }}>{t('admin.dashboard.requestsByBrand')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            {stats.brandRequests.map(brand => (
              <div key={brand.slug} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="t-label" style={{ textTransform: 'capitalize' }}>{brand.name}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>{brand.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* {t('admin.dashboard.lowStockAlerts')} */}
        <div className="surface-card" style={{ borderColor: 'var(--brand-s-challenge)', borderWidth: '0 0 4px 0' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-24)' }}>
            {t('admin.dashboard.lowStockAlerts')}
            {stats.lowStockProducts.length > 0 && (
              <span style={{ marginLeft: 'var(--space-8)', fontSize: '0.75rem', background: 'var(--brand-s-challenge)', color: '#fff', padding: '2px 8px', borderRadius: '99px' }}>
                {stats.lowStockProducts.length} {t('admin.dashboard.items')}
              </span>
            )}
          </h3>
          {stats.lowStockProducts.length === 0 ? (
            <p className="t-body" style={{ color: 'var(--text-tertiary)' }}>{t('admin.dashboard.allStocked')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
              {stats.lowStockProducts.map(product => (
                <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-8)', background: '#FEF3C7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{product.name}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#D97706' }}>{product.stock} {t('admin.dashboard.left')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="surface-card" style={{ marginTop: 'var(--space-32)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-24)' }}>{t('admin.dashboard.topProducts')}</h3>
        {stats.topProducts.length === 0 ? (
          <p className="t-body" style={{ color: 'var(--text-tertiary)' }}>{t('admin.dashboard.noProductRequests')}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-16)' }}>
            {stats.topProducts.map((product, idx) => (
              <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-tertiary)' }}>#{idx + 1}</span>
                <div>
                  <p style={{ fontWeight: '500', fontSize: '0.95rem' }}>{product.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{product.request_count} {t('admin.dashboard.requests')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* {t('admin.dashboard.recentActivity')} */}
      <div className="surface-card" style={{ marginTop: 'var(--space-32)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-24)' }}>{t('admin.dashboard.recentActivity')}</h3>
        {stats.recentActivity.length === 0 ? (
          <p className="t-body" style={{ color: 'var(--text-tertiary)' }}>{t('admin.dashboard.noRecentActivity')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {stats.recentActivity.map(log => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-8) var(--space-12)', background: 'var(--bg-base)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.875rem' }}>{log.action}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 'var(--space-48)', display: 'flex', gap: 'var(--space-16)' }}>
        <Link to="/admin/requests" className="btn btn-primary">{t('admin.dashboard.viewAllRequests')}</Link>
        <Link to="/admin/products" className="btn btn-ghost">{t('admin.dashboard.manageProducts')}</Link>
      </div>

      {/* {t('admin.dashboard.superAdmin.title')} */}
      {user?.role === 'super_admin' && (
        <div className="surface-card" style={{ marginTop: 'var(--space-48)', borderTop: '4px solid #DC2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#DC2626' }}>{t('admin.dashboard.superAdmin.title')}</h2>
            <span className="badge" style={{ background: '#FEE2E2', color: '#991B1B' }}>{t('admin.dashboard.superAdmin.restricted')}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 'var(--space-32)' }}>
            {/* Create Admin Form */}
            <div style={{ background: 'var(--bg-base)', padding: 'var(--space-24)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-16)' }}>{t('admin.dashboard.superAdmin.createAdmin')}</h3>
              <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                <div>
                  <label className="t-label">{t('admin.dashboard.superAdmin.name')}</label>
                  <input className="input-field" required value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} placeholder="Admin Name" />
                </div>
                <div>
                  <label className="t-label">{t('admin.dashboard.superAdmin.email')}</label>
                  <input type="email" className="input-field" required value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} placeholder="admin@example.com" />
                </div>
                <div>
                  <label className="t-label">{t('admin.dashboard.superAdmin.password')}</label>
                  <input type="password" className="input-field" required value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} placeholder="Secure password" />
                </div>
                <div>
                  <label className="t-label">{t('admin.dashboard.superAdmin.role')}</label>
                  <select className="input-field" value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}>
                    <option value="admin">{t('admin.dashboard.superAdmin.adminOpt')}</option>
                    <option value="super_admin">{t('admin.dashboard.superAdmin.superAdminOpt')}</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-8)' }}>{t('admin.dashboard.superAdmin.createBtn')}</button>
              </form>
            </div>

            {/* Admins List */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-base)', textAlign: 'left' }}>
                    <th style={{ padding: 'var(--space-12)', borderBottom: '2px solid var(--border-subtle)' }}>{t('admin.dashboard.superAdmin.name')}</th>
                    <th style={{ padding: 'var(--space-12)', borderBottom: '2px solid var(--border-subtle)' }}>{t('admin.dashboard.superAdmin.email')}</th>
                    <th style={{ padding: 'var(--space-12)', borderBottom: '2px solid var(--border-subtle)' }}>{t('admin.dashboard.superAdmin.role')}</th>
                    <th style={{ padding: 'var(--space-12)', borderBottom: '2px solid var(--border-subtle)' }}>{t('admin.dashboard.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: 'var(--space-12)', fontWeight: '500' }}>{admin.name}</td>
                      <td style={{ padding: 'var(--space-12)', color: 'var(--text-secondary)' }}>{admin.email}</td>
                      <td style={{ padding: 'var(--space-12)' }}>
                        <span className="badge" style={{ background: admin.role === 'super_admin' ? '#FEE2E2' : '#DBEAFE', color: admin.role === 'super_admin' ? '#991B1B' : '#1E40AF' }}>
                          {admin.role === 'super_admin' ? t('admin.dashboard.superAdmin.superAdminOpt') : t('admin.dashboard.superAdmin.adminOpt')}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-12)' }}>
                        {String(admin.id) !== String(user.id) && (
                          <button onClick={() => handleDeleteAdmin(admin.id)} style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
