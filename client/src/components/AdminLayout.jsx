import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

const NavIcon = ({ d }) => (
  <span className="nav-icon">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  </span>
);

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close sidebar on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const userInitials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <div className="admin-mobile-header">
        <div className="admin-mobile-header-brand">EH Admin</div>
        <button className="admin-mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Overlay */}
      <div 
        className={`admin-sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-icon">EH</div>
          <div className="admin-sidebar-brand-text">
            <span className="admin-sidebar-brand-name">{t('admin.dashboard.commandBase')}</span>
            <span className="admin-sidebar-brand-sub">Admin Panel</span>
          </div>
        </div>

        {/* Navigation: Management */}
        <div className="admin-nav-section">
          <div className="admin-nav-section-label">Management</div>
          <nav className="admin-nav">
            <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
              <NavIcon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />
              {t('admin.nav.dashboard')}
            </Link>
            <Link to="/admin/products" className={location.pathname.includes('/products') ? 'active' : ''}>
              <NavIcon d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              {t('admin.nav.products')}
            </Link>
          </nav>
        </div>

        {/* Navigation: Communication */}
        <div className="admin-nav-section">
          <div className="admin-nav-section-label">Communication</div>
          <nav className="admin-nav">
            <Link to="/admin/requests" className={location.pathname.includes('/requests') ? 'active' : ''}>
              <NavIcon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />
              {t('admin.nav.requests')}
            </Link>
            <Link to="/admin/messages" className={location.pathname.includes('/messages') ? 'active' : ''}>
              <NavIcon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              {t('admin.nav.messages')}
            </Link>
          </nav>
        </div>

        {/* Language */}
        <div style={{ padding: '0 var(--space-12)', marginBottom: 'var(--space-16)' }}>
          <LanguageSelector />
        </div>

        {/* Profile + Logout */}
        <div className="admin-sidebar-profile">
          <div className="admin-sidebar-avatar">{userInitials}</div>
          <div className="admin-sidebar-user-info">
            <div className="admin-sidebar-user-name">{user?.name || 'Admin'}</div>
            <div className="admin-sidebar-user-role">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
        <button onClick={logout} className="admin-logout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {t('admin.nav.logout')}
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
