import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi, getImageUrl } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

const brandIdentityMap = {
  media: {
    logo: '/images/ui/midealogo.png',
    taglineKey: 'brandMidea',
    themeClass: 'brand-theme-media'
  },
  arcodym: {
    logo: '/images/ui/arcodymlogo.svg',
    taglineKey: 'brandArcodym',
    themeClass: 'brand-theme-arcodym'
  },
  's-challenge': {
    logo: '/images/ui/schalogo.png',
    taglineKey: 'brandSChallenge',
    themeClass: 'brand-theme-s-challenge'
  }
};

const getBrandLogo = (slug) => {
  if (!slug) return null;
  const s = slug.toLowerCase();
  if (s.includes('media') || s.includes('midea')) return '/images/ui/midealogo.png';
  if (s.includes('schalleng') || s.includes('s-challenge')) return '/images/ui/schalogo.png';
  if (s.includes('arcodym') || s.includes('arcodim')) return '/images/ui/arcodymlogo.svg';
  return null;
};

const REVIEWS_DATA = [
  { key: 'review1', name: 'Amina B.', rating: 5, date: '1 week ago' },
  { key: 'review2', name: 'Yacine K.', rating: 5, date: '2 weeks ago' },
  { key: 'review3', name: 'Lilia M.', rating: 5, date: '1 month ago' },
  { key: 'review4', name: 'Karim D.', rating: 4, date: '2 months ago' },
  { key: 'review5', name: 'Nadia R.', rating: 5, date: '3 months ago' },
  { key: 'review6', name: 'Sofiane T.', rating: 5, date: '3 months ago' }
];

export default function Home() {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [contactSent, setContactSent] = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [contactError, setContactError] = useState('');
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetchApi('/brands').then(setBrands).catch(console.error);
    fetchApi('/products').then(setProducts).catch(console.error);
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    const formData = new FormData(e.target);
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const phone = formData.get('phone')?.trim();
    const message = formData.get('message')?.trim();

    if (!name || !message) {
      setContactError(t('contactPage.validationError') || 'Name and message are required.');
      return;
    }

    setContactSending(true);
    try {
      await fetchApi('/messages', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, message })
      });
      setContactSent(true);
      e.target.reset();
    } catch (err) {
      setContactError(t('contactPage.formError') || 'Failed to send message. Please try again.');
    } finally {
      setContactSending(false);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div>
      
      {/* PREMIUM EDITORIAL HERO SECTION */}
      <section className="hero-editorial">
        <video className="hero-editorial-video" src="/images/hero/hero.mp4" autoPlay loop muted playsInline></video>
        <div className="container hero-editorial-content">
          <div className="animate-fade-up" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '999px', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-24)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25D366', display: 'inline-block' }}></span>
              {t('hero.availableAt') || 'Available at El Hamiz'}
            </div>
            
            <h1 className="hero-editorial-title">
              {t('hero.title')}
            </h1>
            <p className="hero-editorial-subtitle">
              {t('hero.subtitle')}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
              <a href="#offres" className="btn btn-primary" style={{ padding: 'var(--space-16) var(--space-32)', fontSize: '1.0625rem', borderRadius: '8px' }}>
                {t('hero.viewProducts')}
              </a>
              <Link to="/brands/media" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: 'var(--space-16) var(--space-32)', fontSize: '1.0625rem', borderRadius: '8px' }} onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'} onMouseOut={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}>
                {t('hero.exploreMidea') || 'Explore Midea'}
              </Link>
            </div>

            <div className="hero-trust-badges">
              <div className="hero-trust-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                {t('hero.authorizedDealer') || 'Authorized Dealer'}
              </div>
              <div className="hero-trust-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                {t('hero.officialWarranty') || 'Official Warranty'}
              </div>
              <div className="hero-trust-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {t('hero.fastSupport') || 'Fast Support'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM HOT DEALS */}
      <section id="offres" className="container section-spacing">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-64)' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-16)', letterSpacing: '-0.02em' }}>{t('deals.top')}</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>{t('deals.subtitle')}</p>
        </div>

        <div className="grid-catalog">
          {products.filter(p => Array.isArray(p.display_sections) && p.display_sections.includes('hot_deals')).slice(0, 4).map((product) => (
            <div key={product.id} className="product-card-premium">
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="product-card-image-wrap">
                  {product.image_url ? (
                    <img src={getImageUrl(product.image_url)} alt={product.name} className="product-card-image" loading="lazy" />
                  ) : (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <span style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--status-pending)', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('products.lowStock') || 'Low Stock'}</span>
                  )}
                  {getBrandLogo(product.brand_slug) && (
                    <img 
                      src={getBrandLogo(product.brand_slug)} 
                      alt={`${product.brand_name} logo`}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        height: 'auto',
                        maxHeight: '24px',
                        maxWidth: '60px',
                        objectFit: 'contain',
                        opacity: 0.9,
                        zIndex: 2,
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                </div>
                <div className="product-card-content">
                  <div className="product-card-brand-tag" style={{ color: `var(--brand-${product.brand_slug === 'arcodim' ? 'arcodym' : product.brand_slug})` }}>
                    {product.brand_name}
                  </div>
                  <h3 className="product-card-title">{product.name}</h3>
                  <div className="product-card-price-row">
                    <div className="product-card-price">{product.price.toLocaleString()} DZD</div>
                    <button className="product-action-btn" onClick={(e) => handleAddToCart(e, product)} title="Add to Cart">
                      {addedId === product.id ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: 'var(--space-48)' }}>
          <Link to="/products" className="btn" style={{ padding: 'var(--space-16) var(--space-48)', fontSize: '1.0625rem', borderRadius: '999px', background: 'var(--text-primary)', color: '#fff', fontWeight: 600 }}>{t('hero.viewProducts')}</Link>
        </div>
      </section>

      {/* BRAND SELECTION */}
      <section id="marques" className="section-spacing brand-selection-section">
        <div className="container">
          <div className="brand-selection-header">
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-16)', letterSpacing: '-0.02em' }}>{t('brandSection.title')}</h2>
            <p className="t-body brand-selection-copy">{t('brandSection.subtitle')}</p>
          </div>

          <div className="brand-cinematic-grid">
            {brands.map(brand => {
              const identity = brandIdentityMap[brand.slug] ?? brandIdentityMap.media;
              return (
                <Link to={`/brands/${brand.slug}`} key={brand.id} className={`brand-cinematic-card ${identity.themeClass}`}>
                  <div className="brand-card-top">
                    <img src={identity.logo} alt={`${brand.name} logo`} className="brand-card-logo" />
                    <span className="brand-card-name">{brand.name}</span>
                  </div>
                  <div className="brand-card-middle" aria-hidden="true">
                    <span className="brand-card-ambient-line"></span>
                  </div>
                  <div className="brand-card-bottom">
                    <p className="brand-card-tagline">{t(identity.taglineKey)}</p>
                    <span className="brand-card-cta">{t('brandSection.explore')} {brand.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="propos" className="container section-spacing split-layout" style={{ alignItems: 'center' }}>
        <div style={{ paddingRight: 'var(--space-32)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--brand-media)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-16)' }}>
            <span style={{ width: '32px', height: '2px', background: 'var(--brand-media)' }}></span>
            {t('about.title') || 'About Us'}
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-24)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{t('about.title')}</h2>
          <p className="t-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-32)', fontSize: '1.125rem', lineHeight: 1.7 }}>
            {t('about.text')}
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
            {(t('services.list') || []).map((service, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-12)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-completed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{service}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '-10px', background: 'linear-gradient(to bottom right, var(--brand-media), var(--brand-s-challenge))', opacity: '0.1', filter: 'blur(20px)', borderRadius: '24px', zIndex: -1 }}></div>
          <div className="surface-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '24px', boxShadow: 'var(--elevation-2)', border: '1px solid var(--border-subtle)' }}>
             <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12792.853096277636!2d3.2185207!3d36.7173663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128e51b14c3e8cd7%3A0x7d6f5546d1685e13!2sEl%20Hamiz%2C%20Algiers%2C%20Algeria!5e0!3m2!1sen!2sus!4v1714520938833!5m2!1sen!2sus" 
               width="100%" height="400" style={{ border: 0, display: 'block' }} 
               allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
               title="El Hamiz Store Location"
             ></iframe>
          </div>
        </div>
      </section>

      {/* REVIEWS MARQUEE SECTION */}
      <section className="section-spacing" style={{ overflow: 'hidden' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: 'var(--space-48)' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-16)', letterSpacing: '-0.02em' }}>{t('reviews.title')}</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>{t('reviews.subtitle') || 'Trusted by thousands of customers across Algeria'}</p>
        </div>
        
        <div className="review-marquee-container">
          <div className="review-marquee-track">
            {/* First Set */}
            <div className="review-marquee-set">
              {REVIEWS_DATA.map((review) => (
                <div key={`set1-${review.key}`} className="review-card-premium">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
                    <div className="review-stars">
                      {'★'.repeat(review.rating)}<span style={{ color: '#E5E7EB' }}>{'★'.repeat(5 - review.rating)}</span>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 'var(--space-24)', fontStyle: 'italic' }}>
                    "{t('reviews.' + review.key)}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{review.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{review.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Second Set for seamless loop */}
            <div className="review-marquee-set" aria-hidden="true">
              {REVIEWS_DATA.map((review) => (
                <div key={`set2-${review.key}`} className="review-card-premium">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
                    <div className="review-stars">
                      {'★'.repeat(review.rating)}<span style={{ color: '#E5E7EB' }}>{'★'.repeat(5 - review.rating)}</span>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 'var(--space-24)', fontStyle: 'italic' }}>
                    "{t('reviews.' + review.key)}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{review.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{review.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="container section-spacing split-layout">
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-16)', letterSpacing: '-0.02em' }}>{t('contact.title')}</h2>
          <p className="t-body" style={{ marginBottom: 'var(--space-48)', fontSize: '1.125rem' }}>{t('contact.text')}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', backgroundColor: '#F8FAFC', padding: 'var(--space-32)', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#fff', color: 'var(--text-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, boxShadow: 'var(--elevation-1)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{t('contact.locationLabel')}</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{t('contact.location')}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#fff', color: 'var(--text-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, boxShadow: 'var(--elevation-1)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{t('contact.phoneLabel')}</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{t('contact.phone')}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#fff', color: 'var(--text-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, boxShadow: 'var(--elevation-1)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{t('contact.emailLabel')}</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{t('contact.email')}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#fff', color: 'var(--text-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, boxShadow: 'var(--elevation-1)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{t('contact.hoursLabel')}</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{t('contact.hours')}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card" style={{ padding: 'var(--space-32)', borderRadius: '24px', boxShadow: 'var(--elevation-2)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-32)' }}>{t('contactPage.formSubmit')}</h3>
          {contactSent ? (
             <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #d1fae5', width: '100%', padding: 'var(--space-24)', borderRadius: '12px', fontSize: '1rem', textAlign: 'center', fontWeight: 500 }}>
               {t('contactPage.formSuccess')}
             </div>
          ) : (
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
              {contactError && (
                <div style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', padding: 'var(--space-12)', fontSize: '0.875rem', borderRadius: '8px' }}>
                  {contactError}
                </div>
              )}
              <div>
                <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)', fontSize: '0.875rem' }}>{t('contactPage.formName')}</label>
                <input name="name" className="input-field" required placeholder={t('cart.name')} style={{ padding: '14px 16px', background: '#F8FAFC' }} />
              </div>
              <div>
                <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)', fontSize: '0.875rem' }}>{t('contactPage.formEmail')}</label>
                <input name="email" className="input-field" type="email" required placeholder={t('cart.emailField')} style={{ padding: '14px 16px', background: '#F8FAFC' }} />
              </div>
              <div>
                <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)', fontSize: '0.875rem' }}>{t('contactPage.formPhone')}</label>
                <input name="phone" className="input-field" type="tel" placeholder={t('cart.phoneField')} style={{ padding: '14px 16px', background: '#F8FAFC' }} />
              </div>
              <div>
                <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)', fontSize: '0.875rem' }}>{t('contactPage.formMessage')}</label>
                <textarea name="message" className="input-field" required rows="4" placeholder={t('contactPage.formMessage')} style={{ padding: '14px 16px', background: '#F8FAFC', resize: 'vertical' }}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" disabled={contactSending} style={{ width: '100%', marginTop: 'var(--space-8)', padding: 'var(--space-16)', fontSize: '1rem', borderRadius: '12px' }}>
                {contactSending ? (t('contactPage.sending') || 'Sending...') : t('contactPage.formSubmit')}
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}
