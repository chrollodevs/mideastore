import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="admin-layout">
      {/* Structural Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ marginBottom: 'var(--space-32)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>Command Base</h2>
          <span className="badge">{user?.role}</span>
        </div>
        
        <nav className="admin-nav">
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Overview</Link>
          <Link to="/admin/products" className={location.pathname.includes('/products') ? 'active' : ''}>Catalog Database</Link>
          <Link to="/admin/requests" className={location.pathname.includes('/requests') ? 'active' : ''}>Request Pipeline</Link>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-24)', borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={logout} className="btn btn-ghost" style={{ width: '100%' }}>
            Terminate Session
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 'var(--space-32)', background: 'var(--bg-base)' }}>
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
