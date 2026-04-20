import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../api/client';

const brandIdentityMap = {
  media: {
    logo: '/images/ui/midealogo.png',
    tagline: 'Designed for calm, modern homes.',
    themeClass: 'brand-theme-media'
  },
  arcodim: {
    logo: '/images/ui/arcodymlogo.png',
    tagline: 'Precision engineering with quiet confidence.',
    themeClass: 'brand-theme-arcodym'
  },
  arcodym: {
    logo: '/images/ui/arcodymlogo.png',
    tagline: 'Precision engineering with quiet confidence.',
    themeClass: 'brand-theme-arcodym'
  },
  's-challenge': {
    logo: '/images/ui/schalogo.png',
    tagline: 'Bold performance for everyday momentum.',
    themeClass: 'brand-theme-s-challenge'
  }
};

export default function Home() {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    fetchApi('/brands').then(setBrands).catch(console.error);
    fetchApi('/products').then(setProducts).catch(console.error);
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = { type: 'contact', name: formData.get('name'), email: formData.get('email'), message: formData.get('message') };
    try {
      await fetchApi('/requests', { method: 'POST', body: JSON.stringify(data) });
      setContactSent(true);  e.target.reset();
    } catch { alert('Erreur lors de l\'envoi.'); }
  };

  // Real image handling occurs straight from the mapped backend payload.
  
  return (
    <div>
      
      {/* -------------------------------------------------------------
          1. HERO SECTION (Cinematic Video Entry)
      -------------------------------------------------------------- */}
      <section className="hero-banner" style={{ background: '#000', padding: '0 var(--space-16)' }}>
        <video 
          className="hero-video" 
          src="/images/hero/hero.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
        ></video>
        <div className="hero-banner-overlay"></div>
        <div className="container" style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '15vh 0' }}>
          
          <div className="animate-fade-up">
            <h1 className="t-hero" style={{ marginBottom: 'var(--space-16)', color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              Media • Arcodym • El Hamiz
            </h1>
            <p className="t-body" style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: 'var(--space-8)', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
              Your best home appliance choice
            </p>
            <p className="t-body" style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: 'var(--space-48)', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
              Quality. Comfort. Trust.
            </p>
            <div>
              <a href="#offres" className="btn btn-primary" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '1.125rem', padding: 'var(--space-16) var(--space-32)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                Voir les produits
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. HOT DEALS (Meilleures Offres)
      -------------------------------------------------------------- */}
      <section id="offres" className="container section-spacing">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-48)' }}>
          <h2 className="t-section-title" style={{ fontSize: '2.5rem', marginBottom: 'var(--space-8)' }}>Nos Meilleures Offres</h2>
          <p className="t-body">Découvrez les produits les plus populaires choisis pour vous.</p>
        </div>

        <div className="grid-catalog">
          {products.filter(p => Array.isArray(p.display_sections) && p.display_sections.includes('hot_deals')).slice(0, 4).map((product, idx) => (
            <Link to={`/product/${product.id}`} key={product.id} className="product-card">
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
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: 'var(--space-48)' }}>
          <Link to="/products" className="btn btn-primary" style={{ padding: 'var(--space-12) var(--space-48)' }}>Voir tout le catalogue</Link>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. BRAND SELECTION
      -------------------------------------------------------------- */}
      <section id="marques" className="section-spacing brand-selection-section">
        <div className="container">
          <div className="brand-selection-header">
            <h2 className="t-section-title brand-selection-title">Our partner brands</h2>
            <p className="t-body brand-selection-copy">Step into each brand world and explore its signature collection.</p>
          </div>

          <div className="brand-cinematic-grid">
            {brands.map(brand => {
              const identity = brandIdentityMap[brand.slug] ?? brandIdentityMap.media;

              return (
                <Link
                  to={`/brands/${brand.slug}`}
                  key={brand.id}
                  className={`brand-cinematic-card ${identity.themeClass}`}
                >
                  <div className="brand-card-top">
                    <img src={identity.logo} alt={`${brand.name} logo`} className="brand-card-logo" />
                    <span className="brand-card-name">{brand.name}</span>
                  </div>

                  <div className="brand-card-middle" aria-hidden="true">
                    <span className="brand-card-ambient-line"></span>
                  </div>

                  <div className="brand-card-bottom">
                    <p className="brand-card-tagline">{identity.tagline}</p>
                    <span className="brand-card-cta">Explore {brand.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. ABOUT SECTION (Split Layout w/ Google Maps Embed)
      -------------------------------------------------------------- */}
      <section id="propos" className="container section-spacing split-layout" style={{ alignItems: 'center' }}>
        <div style={{ paddingRight: 'var(--space-24)' }}>
          <h2 className="t-section-title" style={{ fontSize: '2.5rem', marginBottom: 'var(--space-24)' }}>À propos de nous</h2>
          <p className="t-body" style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: 'var(--space-16)' }}>
            Nous sommes ici pour vous offrir les meilleurs appareils pour la maison à El Hamiz.
          </p>
          <p className="t-body" style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
            Notre engagement est de faciliter votre quotidien avec des produits fiables, performants et parfaitement adaptés à vos besoins familiaux. Venez nous rendre visite, nous serons ravis de vous conseiller en personne !
          </p>
        </div>

        <div className="surface-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', boxShadow: 'var(--elevation-1)' }}>
           {/* Embedded Google Map targeting El Hamiz area generally */}
           <iframe 
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12792.853096277636!2d3.2185207!3d36.7173663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128e51b14c3e8cd7%3A0x7d6f5546d1685e13!2sEl%20Hamiz%2C%20Algiers%2C%20Algeria!5e0!3m2!1sen!2sus!4v1714520938833!5m2!1sen!2sus" 
             width="100%" 
             height="350" 
             style={{ border: 0, display: 'block' }} 
             allowFullScreen="" 
             loading="lazy" 
             referrerPolicy="no-referrer-when-downgrade"
           ></iframe>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. REVIEWS SECTION
      -------------------------------------------------------------- */}
      <section className="section-spacing" style={{ backgroundColor: '#FEF3C7' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-48)' }}>
            <h2 className="t-section-title" style={{ fontSize: '2.5rem' }}>L'avis de nos clients</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-24)' }}>
            
            <div className="review-card">
              <div style={{ color: '#F59E0B', fontSize: '1.5rem' }}>★★★★★</div>
              <p className="t-body" style={{ color: '#451A03', fontWeight: 500, fontSize: '1.125rem', italic: true }}>
                "Livraison très rapide et les produits S-Challenge marchent parfaitement. Je recommande fortement ce magasin !"
              </p>
              <div style={{ marginTop: 'auto', fontWeight: 700, color: '#92400E' }}>— Amina B.</div>
            </div>

            <div className="review-card">
              <div style={{ color: '#F59E0B', fontSize: '1.5rem' }}>★★★★★</div>
              <p className="t-body" style={{ color: '#451A03', fontWeight: 500, fontSize: '1.125rem', italic: true }}>
                "Service client au top. J'avais des doutes sur un réfrigérateur Arcodym, ils ont su m'orienter avec le sourire."
              </p>
              <div style={{ marginTop: 'auto', fontWeight: 700, color: '#92400E' }}>— Yacine K.</div>
            </div>

            <div className="review-card">
              <div style={{ color: '#F59E0B', fontSize: '1.5rem' }}>★★★★★</div>
              <p className="t-body" style={{ color: '#451A03', fontWeight: 500, fontSize: '1.125rem', italic: true }}>
                "Des prix raisonnables et les appareils Media sont magnifiques dans ma nouvelle cuisine."
              </p>
              <div style={{ marginTop: 'auto', fontWeight: 700, color: '#92400E' }}>— Lilia M.</div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          6. CONTACT SECTION
      -------------------------------------------------------------- */}
      <section id="contact" className="container section-spacing split-layout">
        <div>
          <h2 className="t-section-title" style={{ fontSize: '2.5rem', marginBottom: 'var(--space-16)' }}>Nous Contacter</h2>
          <p className="t-body" style={{ marginBottom: 'var(--space-32)' }}>
            Vous avez une question ou besoin d'aide pour choisir un produit ? N'hésitez pas à nous écrire ou nous appeler directement.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', backgroundColor: '#F8FAFC', padding: 'var(--space-32)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand-media)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>📞</div>
              <div>
                <span className="t-label" style={{ display: 'block' }}>Appelez-nous au</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>05 00 00 00 00</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand-media)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>✉️</div>
              <div>
                <span className="t-label" style={{ display: 'block' }}>Envoyez un e-mail à</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>contact@elhamiz.dz</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card">
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-24)' }}>Envoyez un message rapide</h3>
          {contactSent ? (
             <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', width: '100%', padding: 'var(--space-24)', borderRadius: '12px', fontSize: '1.125rem', textAlign: 'center', fontWeight: 500 }}>
               Message envoyé avec succès ! Nous vous contacterons bientôt.
             </div>
          ) : (
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
              <div>
                <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>Votre Nom</label>
                <input name="name" className="input-field" required placeholder="Ex: Karim" />
              </div>
              <div>
                <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>Adresse Email</label>
                <input name="email" className="input-field" type="email" required placeholder="votre@email.com" />
              </div>
              <div>
                <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>Comment pouvons-nous vous aider ?</label>
                <textarea name="message" className="input-field" required rows="4" placeholder="Écrivez votre message ici..."></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.125rem', marginTop: 'var(--space-12)', padding: 'var(--space-16)' }}>
                Envoyer le message
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}
