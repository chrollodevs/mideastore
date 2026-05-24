import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDialog } from '../context/DialogContext';
import { usePolling } from '../hooks/usePolling';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const dialog = useDialog();
  
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
      showToast('Admin created successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Error creating admin', 'error');
    }
  };

  const handleDeleteAdmin = async (id) => {
    const confirmed = await dialog.confirm({
      title: 'Delete Admin',
      message: 'Are you sure you want to revoke this admin access? They will no longer be able to log in.',
      confirmText: 'Delete',
      isDestructive: true
    });
    
    if (!confirmed) return;

    try {
      await fetchApi(`/admin/users/${id}`, { method: 'DELETE' });
      setAdmins(admins.filter(a => a.id !== id));
      showToast('Admin access revoked', 'success');
    } catch (error) {
      showToast(error.message || 'Error deleting admin', 'error');
    }
  };

  const fetchDashboardData = async () => {
    const payload = await fetchApi('/admin/dashboard');
    return payload?.stats || payload;
  };

  const { data: polledStats, error: pollError, loading: pollLoading, refetch } = usePolling(fetchDashboardData, 30000);

  useEffect(() => {
    if (polledStats) setStats(polledStats);
    if (pollError) setError(pollError.message || 'Failed to load dashboard data.');
    setLoading(pollLoading && !stats); // Only show global loading if we don't have stale stats
  }, [polledStats, pollError, pollLoading]);

  /* Loading skeleton */
  if (loading) return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-skeleton admin-skeleton-title" style={{ width: '200px' }}></div>
          <div className="admin-skeleton admin-skeleton-text" style={{ width: '280px' }}></div>
        </div>
      </div>
      <div className="admin-stat-grid" style={{ marginBottom: 'var(--space-32)' }}>
        {[1,2,3,4].map(i => <div key={i} className="admin-skeleton admin-skeleton-card"></div>)}
      </div>
      <div className="admin-stat-grid">
        {[1,2,3,4].map(i => <div key={i} className="admin-skeleton admin-skeleton-card"></div>)}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="admin-card" style={{ maxWidth: '720px', margin: 'var(--space-48) auto' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-12)', color: 'var(--brand-s-challenge)', fontFamily: 'var(--admin-font-display)' }}>Dashboard unavailable</h2>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-24)' }}>{error}</p>
        <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
          <button className="btn btn-primary" type="button" onClick={() => window.location.reload()} style={{ borderRadius: 'var(--admin-radius-xs)' }}>
            Retry Connection
          </button>
          {error.toLowerCase().includes('token') || error.toLowerCase().includes('session') ? (
            <button className="btn btn-ghost" type="button" onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/admin/login';
            }}>
              Return to Login
            </button>
          ) : null}
        </div>
      </div>
    );
  }
  if (!stats) return <div className="admin-empty-state"><p className="admin-empty-text">No dashboard data available.</p></div>;

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{t('admin.dashboard.title')}</h1>
          <p className="admin-page-subtitle">{t('admin.dashboard.subtitle')}</p>
        </div>
        <span className="badge" style={{ alignSelf: 'center' }}>
          {t('admin.dashboard.lastUpdated')} {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Request Timeline */}
      <div style={{ marginBottom: 'var(--space-32)' }}>
        <h2 className="admin-card-title" style={{ marginBottom: 'var(--space-16)' }}>{t('admin.dashboard.requestTimeline')}</h2>
        <div className="admin-stat-grid">
          <div className="admin-stat-card admin-stat-card--accent">
            <div className="admin-stat-label">{t('admin.dashboard.time.today')}</div>
            <div className="admin-stat-value">{stats.todayRequests}</div>
            <div className="admin-stat-sub">{t('admin.dashboard.time.todaySubtitle')}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">{t('admin.dashboard.time.thisWeek')}</div>
            <div className="admin-stat-value">{stats.weekRequests}</div>
            <div className="admin-stat-sub">{t('admin.dashboard.time.weekSubtitle')}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">{t('admin.dashboard.time.thisMonth')}</div>
            <div className="admin-stat-value">{stats.monthRequests}</div>
            <div className="admin-stat-sub">{t('admin.dashboard.time.monthSubtitle')}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">{t('admin.dashboard.time.allTime')}</div>
            <div className="admin-stat-value">{stats.requests}</div>
            <div className="admin-stat-sub">{t('admin.dashboard.time.allTimeSubtitle')}</div>
          </div>
        </div>
      </div>

      {/* Pipeline Status */}
      <div style={{ marginBottom: 'var(--space-32)' }}>
        <h2 className="admin-card-title" style={{ marginBottom: 'var(--space-16)' }}>{t('admin.dashboard.pipelineStatus')}</h2>
        <div className="admin-stat-grid">
          <div className="admin-stat-card admin-stat-card--pending">
            <div className="admin-stat-label" style={{ color: 'var(--status-pending)' }}>{t('admin.requests.status.pending')}</div>
            <div className="admin-stat-value">{stats.pendingRequests}</div>
            <div className="admin-stat-sub">{t('admin.dashboard.status.pendingSub')}</div>
          </div>
          <div className="admin-stat-card admin-stat-card--reviewed">
            <div className="admin-stat-label" style={{ color: 'var(--status-reviewed)' }}>{t('admin.dashboard.status.contacted')}</div>
            <div className="admin-stat-value">{stats.contactedRequests}</div>
            <div className="admin-stat-sub">{t('admin.dashboard.status.contactedSub')}</div>
          </div>
          <div className="admin-stat-card admin-stat-card--completed">
            <div className="admin-stat-label" style={{ color: 'var(--status-completed)' }}>{t('admin.dashboard.status.confirmed')}</div>
            <div className="admin-stat-value">{stats.confirmedRequests}</div>
            <div className="admin-stat-sub">{t('admin.dashboard.status.confirmedSub')}</div>
          </div>
          <div className="admin-stat-card admin-stat-card--cancelled">
            <div className="admin-stat-label" style={{ color: '#6B7280' }}>{t('admin.dashboard.status.cancelled')}</div>
            <div className="admin-stat-value">{stats.cancelledRequests}</div>
            <div className="admin-stat-sub">{t('admin.dashboard.status.cancelledSub')}</div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="admin-stat-grid" style={{ marginBottom: 'var(--space-32)' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-label">{t('admin.dashboard.stats.products')}</div>
          <div className="admin-stat-value" style={{ fontSize: '2.5rem' }}>{stats.products}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">{t('admin.dashboard.stats.brands')}</div>
          <div className="admin-stat-value" style={{ fontSize: '2.5rem' }}>{stats.brands}</div>
        </div>
        <div className="admin-stat-card admin-stat-card--accent">
          <div className="admin-stat-label">{t('admin.dashboard.messages')}</div>
          <div className="admin-stat-value" style={{ fontSize: '2.5rem' }}>{stats.totalMessages}</div>
          {stats.unreadMessages > 0 && (
            <span className="admin-badge admin-badge--info" style={{ marginTop: 'var(--space-8)' }}>
              {stats.unreadMessages} {t('admin.dashboard.messagesUnread')}
            </span>
          )}
        </div>
      </div>

      {/* Two Column: Brand Requests + Low Stock */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-24)', marginBottom: 'var(--space-32)' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">{t('admin.dashboard.requestsByBrand')}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {stats.brandRequests.map(brand => (
              <div key={brand.slug} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-8) var(--space-12)', borderRadius: 'var(--admin-radius-xs)', background: '#F8FAFC' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>{brand.name}</span>
                <span style={{ fontFamily: 'var(--admin-font-display)', fontSize: '1.125rem', fontWeight: 700 }}>{brand.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              {t('admin.dashboard.lowStockAlerts')}
            </h3>
            {stats.lowStockProducts.length > 0 && (
              <span className="admin-badge admin-badge--danger">
                {stats.lowStockProducts.length} {t('admin.dashboard.items')}
              </span>
            )}
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>{t('admin.dashboard.allStocked')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              {stats.lowStockProducts.map(product => (
                <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-8) var(--space-12)', background: '#FFFBEB', borderRadius: 'var(--admin-radius-xs)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{product.name}</span>
                  <span className="admin-badge admin-badge--pending">{product.stock} {t('admin.dashboard.left')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-32)' }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">{t('admin.dashboard.topProducts')}</h3>
        </div>
        {stats.topProducts.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>{t('admin.dashboard.noProductRequests')}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-16)' }}>
            {stats.topProducts.map((product, idx) => (
              <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', padding: 'var(--space-12)', borderRadius: 'var(--admin-radius-xs)', background: '#F8FAFC' }}>
                <span style={{ fontFamily: 'var(--admin-font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-tertiary)', width: '32px', textAlign: 'center' }}>#{idx + 1}</span>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{product.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{product.request_count} {t('admin.dashboard.requests')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-32)' }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">{t('admin.dashboard.recentActivity')}</h3>
        </div>
        {stats.recentActivity.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>{t('admin.dashboard.noRecentActivity')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {stats.recentActivity.map(log => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-8) var(--space-12)', borderRadius: 'var(--admin-radius-xs)', transition: 'background var(--admin-transition)' }}
                   onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                   onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{log.action}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--admin-font-display)' }}>
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-12)', marginBottom: 'var(--space-48)' }}>
        <Link to="/admin/requests" className="btn btn-primary" style={{ borderRadius: 'var(--admin-radius-xs)' }}>{t('admin.dashboard.viewAllRequests')}</Link>
        <Link to="/admin/products" className="btn btn-ghost" style={{ borderRadius: 'var(--admin-radius-xs)' }}>{t('admin.dashboard.manageProducts')}</Link>
      </div>

      {/* Super Admin Section */}
      {user?.role === 'super_admin' && (
        <div className="admin-card" style={{ borderTop: '3px solid var(--admin-sidebar-accent)' }}>
          <div className="admin-card-header">
            <h2 style={{ fontFamily: 'var(--admin-font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('admin.dashboard.superAdmin.title')}</h2>
            <span className="admin-badge admin-badge--danger">{t('admin.dashboard.superAdmin.restricted')}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: 'var(--space-32)' }}>
            {/* Create Admin Form */}
            <div className="admin-form-section">
              <h3 className="admin-form-section-title">{t('admin.dashboard.superAdmin.createAdmin')}</h3>
              <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                <div>
                  <label className="t-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.8125rem' }}>{t('admin.dashboard.superAdmin.name')}</label>
                  <input className="input-field" required value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} placeholder="Admin Name" />
                </div>
                <div>
                  <label className="t-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.8125rem' }}>{t('admin.dashboard.superAdmin.email')}</label>
                  <input type="email" className="input-field" required value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} placeholder="admin@example.com" />
                </div>
                <div>
                  <label className="t-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.8125rem' }}>{t('admin.dashboard.superAdmin.password')}</label>
                  <input type="password" className="input-field" required value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} placeholder="Secure password" />
                </div>
                <div>
                  <label className="t-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.8125rem' }}>{t('admin.dashboard.superAdmin.role')}</label>
                  <select className="input-field" value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}>
                    <option value="admin">{t('admin.dashboard.superAdmin.adminOpt')}</option>
                    <option value="super_admin">{t('admin.dashboard.superAdmin.superAdminOpt')}</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-4)', borderRadius: 'var(--admin-radius-xs)', fontSize: '0.875rem' }}>{t('admin.dashboard.superAdmin.createBtn')}</button>
              </form>
            </div>

            {/* Admins Table */}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('admin.dashboard.superAdmin.name')}</th>
                    <th>{t('admin.dashboard.superAdmin.email')}</th>
                    <th>{t('admin.dashboard.superAdmin.role')}</th>
                    <th>{t('admin.dashboard.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin.id}>
                      <td style={{ fontWeight: 500 }}>{admin.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{admin.email}</td>
                      <td>
                        <span className={`admin-badge ${admin.role === 'super_admin' ? 'admin-badge--danger' : 'admin-badge--info'}`}>
                          {admin.role === 'super_admin' ? t('admin.dashboard.superAdmin.superAdminOpt') : t('admin.dashboard.superAdmin.adminOpt')}
                        </span>
                      </td>
                      <td>
                        {String(admin.id) !== String(user.id) && (
                          <button onClick={() => handleDeleteAdmin(admin.id)} className="admin-btn-sm admin-btn-sm--danger">
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
