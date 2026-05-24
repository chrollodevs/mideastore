import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [intentSent, setIntentSent] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { t } = useLanguage();
  const { addItem } = useCart();

  useEffect(() => {
    fetchApi(`/products/${id}`)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const [intentError, setIntentError] = useState('');

  const handlePurchaseIntent = async (e) => {
    e.preventDefault();
    setIntentError('');
    const formData = new FormData(e.target);
    const data = {
      type: 'purchase_intent',
      idempotency_key: crypto.randomUUID(),
      name: formData.get('name'),
      phone: formData.get('phone'),
      product_id: product.id,
      message: formData.get('message')
    };
    try {
      await fetchApi('/requests', { method: 'POST', body: JSON.stringify(data) });
      setIntentSent(true);
      e.target.reset();
    } catch (err) {
      setIntentError(err.message || t('contactPage.formError') || 'Failed to send request.');
    }
  };

  const handleAddToCart = () => {
    addItem(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  if (loading) return <div className="container section-spacing t-body">{t('products.loading') || 'Loading...'}</div>;
  if (!product) return <div className="container section-spacing t-body">{t('brandPage.notFound') || 'Product not found.'}</div>;

  const brandTheme = `var(--brand-${product.brand_slug})`;
  const phoneNumber = '0540363699';

  return (
    <div style={{ paddingBottom: 'var(--space-96)' }}>
      {/* Top Accent Bar */}
      <div style={{ height: '4px', background: brandTheme, width: '100%' }}></div>

      <div className="container" style={{ marginTop: 'var(--space-48)' }}>
        <div className="split-layout" style={{ gap: 'var(--space-64)' }}>
          
          {/* Left Column: Image */}
          <div className="surface-card" style={{ padding: 'var(--space-32)', height: '100%', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)' }}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }} loading="lazy" />
            ) : (
              <div style={{ color: 'var(--text-tertiary)', fontSize: '1rem', fontWeight: 500 }}>{t('product.noImage') || 'No Image Available'}</div>
            )}
          </div>

          {/* Right Column: Details */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Context & Title */}
            <div className="t-label" style={{ color: brandTheme, marginBottom: 'var(--space-12)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.brand_name}
            </div>
            <h1 className="t-hero" style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', marginBottom: 'var(--space-16)', lineHeight: 1.1 }}>
              {product.name}
            </h1>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: 'var(--space-32)' }}>
              {product.price.toLocaleString()} DZD
            </div>

            {/* Trust Features (Clean Minimalist Badges) */}
            <div style={{ display: 'flex', gap: 'var(--space-16)', marginBottom: 'var(--space-48)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#059669' }}>
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{t('hero.officialWarranty') || 'Official Warranty'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-media)' }}>
                  <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{t('hero.deliveryAvailable') || 'Delivery Available'}</span>
              </div>
            </div>

            {/* Primary Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-16)', marginBottom: 'var(--space-32)', flexWrap: 'wrap' }}>
              <button onClick={handleAddToCart} className={`btn ${addedToCart ? 'btn-ghost' : 'btn-primary'}`} style={{ flex: '1', minWidth: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-8)', padding: 'var(--space-16)', fontSize: '1rem' }}>
                {addedToCart ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {t('product.addedToCart')}
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                    {t('product.addToCart')}
                  </>
                )}
              </button>
              
              <div style={{ display: 'flex', gap: 'var(--space-12)', flex: '1', minWidth: '200px' }}>
                <a
                  href={`https://wa.me/213540363699?text=Hi, I'm interested in ${encodeURIComponent(product.name)} (${product.price.toLocaleString()} DZD)`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-8)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  {t('hero.whatsapp') || 'WhatsApp'}
                </a>
                <a
                  href={`tel:${phoneNumber}`}
                  className="btn btn-ghost"
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-8)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  {t('hero.call')}
                </a>
              </div>
            </div>

            {/* Description & Specs */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-32)', marginBottom: 'var(--space-48)' }}>
              <h3 className="t-label" style={{ marginBottom: 'var(--space-12)', color: 'var(--text-primary)' }}>{t('product.description')}</h3>
              <p className="t-body" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{product.description}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginTop: 'var(--space-24)' }}>
                <span className="t-label">{t('product.availability')}:</span>
                <span style={{ fontWeight: 600, color: product.stock > 0 ? 'var(--status-completed)' : 'var(--brand-s-challenge)' }}>
                  {product.stock > 0 ? t('product.inStock') : t('product.outOfStock')}
                </span>
              </div>
            </div>

            {/* Quick Order Form */}
            <div className="surface-card" style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-8)' }}>{t('product.orderTitle')}</h3>
              <p className="t-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-24)' }}>{t('product.orderSubtitle')}</p>

              {intentSent ? (
                <div style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #D1FAE5', width: '100%', padding: 'var(--space-16)', borderRadius: '12px', fontSize: '1rem', fontWeight: 500, textAlign: 'center' }}>
                  {t('product.orderSuccess') || 'Request sent successfully. We will contact you soon.'}
                </div>
              ) : (
                <form onSubmit={handlePurchaseIntent} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
                  <input name="name" className="input-field" required placeholder={t('cart.name') || 'Your Name'} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--elevation-1)' }} />
                  <input name="phone" className="input-field" required placeholder={t('cart.phoneField') || 'Your Phone Number'} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--elevation-1)' }} />
                  <textarea name="message" className="input-field" rows="3" placeholder={t('cart.notes') || 'Any specific requests or questions?'} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--elevation-1)', resize: 'vertical' }}></textarea>
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-8)', padding: 'var(--space-12) var(--space-32)' }}>
                    {t('product.orderSubmit') || 'Send Request'}
                  </button>
                  {intentError && (
                    <div style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', padding: '12px 16px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 500, marginTop: '4px' }}>
                      {intentError}
                    </div>
                  )}
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
