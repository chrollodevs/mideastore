import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import LanguageSelector from './LanguageSelector';

export default function PublicLayout() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { itemCount } = useCart();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky WhatsApp Button */}
      <a
        href="https://wa.me/213540363699"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
          zIndex: '1000',
          transition: 'transform 0.2s ease',
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Navigation */}
      <nav className="retail-nav">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-16) var(--space-24)', minHeight: '80px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/images/ui/logo.png" alt="Logo" style={{ height: '60px', objectFit: 'contain' }} />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-24)' }}>
            <div className="nav-links" style={{ display: 'flex', gap: 'var(--space-32)', alignItems: 'center' }}>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''} style={{ fontWeight: '500', color: 'var(--text-secondary)', textDecoration: 'none' }}>{t('navbar.home')}</Link>
              <Link to="/products" className={location.pathname === '/products' ? 'active' : ''} style={{ fontWeight: '500', color: 'var(--text-secondary)', textDecoration: 'none' }}>{t('navbar.products')}</Link>
              <a href="/#marques" style={{ fontWeight: '500', color: 'var(--text-secondary)', textDecoration: 'none' }}>Brands</a>
              <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''} style={{ fontWeight: '500', color: 'var(--text-secondary)', textDecoration: 'none' }}>{t('navbar.contact')}</Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
              <LanguageSelector />
              <Link to="/admin" className="profile-nav-btn" style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', color: 'inherit' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
              <Link to="/cart" className="cart-nav-btn" style={{ position: 'relative', padding: 'var(--space-8)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {itemCount > 0 && (
                  <span className="cart-badge">{itemCount}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--text-primary)', color: '#fff', padding: 'var(--space-64) 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-48)' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-16)' }}>{t('footer.navTitle')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                <Link to="/" style={{ color: '#9CA3AF' }}>{t('footer.navHome')}</Link>
                <Link to="/products" style={{ color: '#9CA3AF' }}>{t('footer.navProducts')}</Link>
                <Link to="/contact" style={{ color: '#9CA3AF' }}>{t('footer.contact')}</Link>
                <Link to="/about" style={{ color: '#9CA3AF' }}>{t('footer.about')}</Link>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-16)' }}>{t('footer.infoTitle')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', color: '#9CA3AF' }}>
                <p>{t('contact.location')}</p>
                <p>{t('contact.phone')}</p>
                <p>{t('contact.email')}</p>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-16)' }}>Quick Contact</h3>
              <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
                <a href="tel:0540363699" className="btn btn-ghost" style={{ padding: 'var(--space-8) var(--space-16)', fontSize: '0.875rem' }}>📞 Call</a>
                <a href="https://wa.me/213540363699" target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: 'var(--space-8) var(--space-16)', fontSize: '0.875rem', background: '#25D366', color: '#fff' }}>💬 WhatsApp</a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #374151', marginTop: 'var(--space-48)', paddingTop: 'var(--space-24)', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
            <p>{t('footer.tagline')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
