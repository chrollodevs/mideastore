import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

const brandIdentityMap = {
  media: {
    logo: '/images/ui/midealogo.png',
    taglineKey: 'brandMidea',
    themeClass: 'brand-theme-media'
  },
  arcodim: {
    logo: '/images/ui/arcodymlogo.svg',
    taglineKey: 'brandArcodym',
    themeClass: 'brand-theme-arcodym'
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

export default function Home() {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [contactSent, setContactSent] = useState(false);
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetchApi('/brands').then(setBrands).catch(console.error);
    fetchApi('/products').then(setProducts).catch(console.error);
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = { name: formData.get('cart.name'), email: formData.get('contact.email'), message: formData.get('message') };
    try {
      await fetchApi('/messages', { method: 'POST', body: JSON.stringify(data) });
      setContactSent(true); e.target.reset();
    } catch { alert('Error sending message.'); }
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
      
      {/* HERO SECTION */}
      <section className="hero-banner home-hero">
        <video className="hero-video" src="/images/hero/hero.mp4" autoPlay loop muted playsInline></video>
        <div className="hero-banner-overlay home-hero-overlay"></div>
        <div className="container home-hero-container">
          <div className="animate-fade-up home-hero-copy">
            <div className="home-hero-logo-shell">
              <img src="/images/ui/logo.png" alt="El Hamiz store logo" className="home-hero-logo" />
            </div>
            <h1 className="t-hero home-hero-title">
              {t('hero.title')}
            </h1>
            <p className="t-body home-hero-subtitle">
              {t('hero.subtitle')}
            </p>
            <div className="home-hero-actions">
              <a href="#offres" className="btn home-hero-cta">
                {t('hero.viewProducts')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* HOT DEALS */}
      <section id="offres" className="container section-spacing">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-48)' }}>
          <h2 className="t-section-title" style={{ fontSize: '2.5rem', marginBottom: 'var(--space-8)' }}>{t('deals.top')}</h2>
          <p className="t-body">{t('deals.subtitle')}</p>
        </div>

        <div className="grid-catalog">
          {products.filter(p => Array.isArray(p.display_sections) && p.display_sections.includes('hot_deals')).slice(0, 4).map((product) => (
            <div key={product.id} className="product-card" style={{ position: 'relative' }}>
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-card-img-wrapper" style={{ padding: 'var(--space-16)', backgroundColor: '#F8FAFC' }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="product-card-img-placeholder" />
                  ) : (
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '2rem' }}>📦</div>
                  )}
                </div>
                <div className="product-card-meta">
                  <div className="product-card-brand" style={{ color: `var(--brand-${product.brand_slug === 'arcodim' ? 'arcodym' : product.brand_slug})` }}>
                    {product.brand_name}
                  </div>
                  <h3 className="product-card-title">{product.name}</h3>
                  <div className="product-card-price" style={{ color: 'var(--brand-media)' }}>
                    {product.price.toLocaleString()} DZD
                  </div>
                </div>
              </Link>
              <button className={`btn add-to-cart-btn ${addedId === product.id ? 'added' : ''}`} onClick={(e) => handleAddToCart(e, product)}>
                {addedId === product.id ? '✓ ' + t('product.addedToCart') : t('product.addToCart')}
              </button>
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: 'var(--space-48)' }}>
          <Link to="/products" className="btn btn-primary" style={{ padding: 'var(--space-12) var(--space-48)' }}>{t('hero.viewProducts')}</Link>
        </div>
      </section>

      {/* BRAND SELECTION */}
      <section id="marques" className="section-spacing brand-selection-section">
        <div className="container">
          <div className="brand-selection-header">
            <h2 className="t-section-title brand-selection-title">{t('brandSection.title')}</h2>
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
        <div style={{ paddingRight: 'var(--space-24)' }}>
          <h2 className="t-section-title" style={{ fontSize: '2.5rem', marginBottom: 'var(--space-24)' }}>{t('about.title')}</h2>
          <p className="t-body" style={{ fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: 'var(--space-24)', lineHeight: 1.8 }}>
            {t('about.text')}
          </p>
          <h3 className="t-section-title" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-16)' }}>{t('services.title')}</h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {(t('services.list') || []).map((service, idx) => (
              <li key={idx} className="t-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <span style={{ color: 'var(--status-completed)', fontWeight: 700 }}>✓</span> {service}
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', boxShadow: 'var(--elevation-1)' }}>
           <iframe 
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12792.853096277636!2d3.2185207!3d36.7173663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128e51b14c3e8cd7%3A0x7d6f5546d1685e13!2sEl%20Hamiz%2C%20Algiers%2C%20Algeria!5e0!3m2!1sen!2sus!4v1714520938833!5m2!1sen!2sus" 
             width="100%" height="350" style={{ border: 0, display: 'block' }} 
             allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
           ></iframe>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="section-spacing" style={{ backgroundColor: '#FEF3C7' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-48)' }}>
            <h2 className="t-section-title" style={{ fontSize: '2.5rem' }}>{t('reviews.title')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-24)' }}>
            {['review1', 'review2', 'review3'].map((key, idx) => {
              const names = ['Amina B.', 'Yacine K.', 'Lilia M.'];
              return (
                <div key={key} className="review-card">
                  <div style={{ color: '#F59E0B', fontSize: '1.5rem' }}>★★★★★</div>
                  <p className="t-body" style={{ color: '#451A03', fontWeight: 500, fontSize: '1.125rem', fontStyle: 'italic' }}>
                    "{t(key)}"
                  </p>
                  <div style={{ marginTop: 'auto', fontWeight: 700, color: '#92400E' }}>— {names[idx]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="container section-spacing split-layout">
        <div>
          <h2 className="t-section-title" style={{ fontSize: '2.5rem', marginBottom: 'var(--space-16)' }}>{t('contact.title')}</h2>
          <p className="t-body" style={{ marginBottom: 'var(--space-32)' }}>{t('contact.text')}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', backgroundColor: '#F8FAFC', padding: 'var(--space-32)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand-media)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📍</div>
              <div>
                <span className="t-label" style={{ display: 'block' }}>{t('contact.locationLabel')}</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t('contact.location')}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand-media)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📞</div>
              <div>
                <span className="t-label" style={{ display: 'block' }}>{t('contact.phoneLabel')}</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t('contact.phone')}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand-media)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', flexShrink: 0 }}>✉️</div>
              <div>
                <span className="t-label" style={{ display: 'block' }}>{t('contact.emailLabel')}</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t('contact.email')}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand-media)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🕐</div>
              <div>
                <span className="t-label" style={{ display: 'block' }}>{t('contact.hoursLabel')}</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t('contact.hours')}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card">
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-24)' }}>{t('contactPage.formSubmit')}</h3>
          {contactSent ? (
             <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', width: '100%', padding: 'var(--space-24)', borderRadius: '12px', fontSize: '1.125rem', textAlign: 'center', fontWeight: 500 }}>
               {t('contactPage.formSuccess')}
             </div>
          ) : (
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
              <div>
                <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>{t('contactPage.formName')}</label>
                <input name="name" className="input-field" required placeholder={t('cart.name')} />
              </div>
              <div>
                <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>{t('contactPage.formEmail')}</label>
                <input name="email" className="input-field" type="email" required placeholder={t('cart.emailField')} />
              </div>
              <div>
                <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>{t('contactPage.formMessage')}</label>
                <textarea name="message" className="input-field" required rows="4" placeholder={t('contactPage.formMessage')}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.125rem', marginTop: 'var(--space-12)', padding: 'var(--space-16)' }}>
                {t('contactPage.formSubmit')}
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}
