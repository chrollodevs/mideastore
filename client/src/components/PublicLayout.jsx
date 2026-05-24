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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky WhatsApp Button */}
      <a
        href="https://wa.me/213540363699"
        target="_blank"
        rel="noopener noreferrer"
        className="pulse-button"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: '1000',
          transition: 'all var(--transition-bounce)',
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
        title={t('footer.whatsappTitle') || "Chat on WhatsApp"}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Navigation */}
      <nav className="glass-nav">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-16) var(--space-24)', minHeight: '80px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/images/ui/logo.png" alt="Logo" style={{ height: '60px', objectFit: 'contain' }} />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-32)' }}>
            <div className="nav-links" style={{ display: 'flex', gap: 'var(--space-32)', alignItems: 'center' }}>
              <Link to="/" className={`nav-link-premium ${location.pathname === '/' ? 'active' : ''}`}>{t('navbar.home')}</Link>
              <Link to="/products" className={`nav-link-premium ${location.pathname === '/products' ? 'active' : ''}`}>{t('navbar.products')}</Link>
              <a href="/#marques" className="nav-link-premium">{t('navbar.brands')}</a>
              <Link to="/contact" className={`nav-link-premium ${location.pathname === '/contact' ? 'active' : ''}`}>{t('navbar.contact')}</Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)', borderLeft: '1px solid var(--border-subtle)', paddingLeft: 'var(--space-24)' }}>
              <LanguageSelector />
              <Link to="/admin" style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.color='var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--text-secondary)'}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
              <Link to="/cart" style={{ position: 'relative', padding: 'var(--space-8)', color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.color='var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--text-secondary)'}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {itemCount > 0 && (
                  <span className="cart-badge" style={{ position: 'absolute', top: '0', right: '0', background: 'var(--brand-s-challenge)', color: '#fff', fontSize: '0.65rem', fontWeight: '700', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    {itemCount}
                  </span>
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
      <footer className="footer-premium">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-64)' }}>
            {/* Brand Column */}
            <div>
              <Link to="/" style={{ display: 'inline-block', marginBottom: 'var(--space-24)' }}>
                <img src="/images/ui/logo.png" alt="El Hamiz Store" style={{ height: '50px', filter: 'brightness(0) invert(1)' }} />
              </Link>
              <p style={{ color: '#9CA3AF', fontSize: '0.9375rem', lineHeight: '1.6', marginBottom: 'var(--space-24)' }}>
                {t('footer.tagline')}
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
                <a href="#" className="footer-link"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
                <a href="#" className="footer-link"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
                <a href="#" className="footer-link"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.598 0 0 .598 0 1.325v21.351C0 23.402.598 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.598 1.323-1.325V1.325C24 .598 23.402 0 22.675 0z"/></svg></a>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h3 className="footer-column-title">{t('footer.navTitle')}</h3>
              <nav>
                <Link to="/" className="footer-link">{t('footer.navHome')}</Link>
                <Link to="/products" className="footer-link">{t('footer.navProducts')}</Link>
                <Link to="/contact" className="footer-link">{t('footer.contact')}</Link>
                <Link to="/about" className="footer-link">{t('footer.about')}</Link>
              </nav>
            </div>

            {/* Info Column */}
            <div>
              <h3 className="footer-column-title">{t('footer.infoTitle')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span style={{ color: '#9CA3AF', fontSize: '0.9375rem', lineHeight: '1.5' }}>{t('contact.location')}</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  <a href={`tel:${t('contact.phone')}`} className="footer-link" style={{ margin: 0 }}>{t('contact.phone')}</a>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <a href={`mailto:${t('contact.email')}`} className="footer-link" style={{ margin: 0 }}>{t('contact.email')}</a>
                </div>
              </div>
            </div>

            {/* Quick Actions Column */}
            <div>
              <h3 className="footer-column-title">{t('footer.quickContact') || 'Quick Contact'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                <a href="https://wa.me/213540363699" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', padding: 'var(--space-12) var(--space-16)', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', transition: 'background var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.background='rgba(37, 211, 102, 0.2)'} onMouseOut={e => e.currentTarget.style.background='rgba(37, 211, 102, 0.1)'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {t('footer.messageWhatsapp') || 'Message us on WhatsApp'}
                </a>
                <a href="tel:0540363699" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', padding: 'var(--space-12) var(--space-16)', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', transition: 'background var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.background='rgba(255, 255, 255, 0.1)'} onMouseOut={e => e.currentTarget.style.background='rgba(255, 255, 255, 0.05)'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  {t('footer.callStore') || 'Call Store Directly'}
                </a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'var(--space-64)', paddingTop: 'var(--space-24)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-16)', color: '#6B7280', fontSize: '0.875rem' }}>
            <p>© {new Date().getFullYear()} El Hamiz Store. {t('footer.rights') || 'All rights reserved.'}</p>
            <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
              <span style={{ cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color='#6B7280'}>{t('footer.privacy') || 'Privacy Policy'}</span>
              <span style={{ cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color='#6B7280'}>{t('footer.terms') || 'Terms of Service'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
