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

  const handlePurchaseIntent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      type: 'purchase_intent',
      name: formData.get('cart.name'),
      phone: formData.get('contact.phone'),
      product_id: product.id,
      message: formData.get('message')
    };
    try {
      await fetchApi('/requests', { method: 'POST', body: JSON.stringify(data) });
      setIntentSent(true);
      e.target.reset();
    } catch (err) {
      alert('Failed to send request.');
    }
  };

  const handleAddToCart = () => {
    addItem(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  if (loading) return <div className="container section-spacing t-body">{t('products.loading')}</div>;
  if (!product) return <div className="container section-spacing t-body">{t('brandPage.notFound')}</div>;

  const brandTheme = `var(--brand-${product.brand_slug})`;
  const phoneNumber = '0540363699';

  return (
    <div>
      <div style={{ height: '4px', background: brandTheme, width: '100%' }}></div>

      <div className="container section-spacing split-layout">
        <div className="surface-card" style={{ padding: 'var(--space-16)', overflow: 'hidden', aspectRatio: '4/5', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} loading="lazy" />
          ) : (
            <span className="t-label" style={{ fontSize: '3rem' }}>📦</span>
          )}
        </div>

        <div style={{ padding: 'var(--space-16) 0' }}>
          <div className="t-label" style={{ color: brandTheme, marginBottom: 'var(--space-12)' }}>
            {product.brand_name}
          </div>

          <h1 className="t-page-title" style={{ marginBottom: 'var(--space-16)' }}>{product.name}</h1>
          <div style={{ fontSize: '1.75rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: 'var(--space-24)' }}>
            {product.price.toLocaleString()} DZD
          </div>

          {/* Trust Badges */}
          <div style={{ display: 'flex', gap: 'var(--space-16)', marginBottom: 'var(--space-24)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', padding: 'var(--space-8) var(--space-12)', background: '#ECFDF5', borderRadius: '8px', border: '1px solid #D1FAE5' }}>
              <span style={{ fontSize: '1.25rem' }}>✓</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#059669' }}>Official Warranty Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', padding: 'var(--space-8) var(--space-12)', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
              <span style={{ fontSize: '1.25rem' }}>🚚</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1D4ED8' }}>Delivery Available</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-12)', marginBottom: 'var(--space-32)', flexWrap: 'wrap' }}>
            <button onClick={handleAddToCart} className={`btn ${addedToCart ? 'btn-ghost' : 'btn-primary'}`} style={{ padding: 'var(--space-12) var(--space-32)', fontSize: '1rem' }}>
              {addedToCart ? '✓ ' + t('product.addedToCart') : '🛒 ' + t('product.addToCart')}
            </button>
            <a
              href={`https://wa.me/213540363699?text=Hi, I'm interested in ${encodeURIComponent(product.name)} (${product.price.toLocaleString()} DZD)`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ padding: 'var(--space-12) var(--space-24)', fontSize: '1rem', background: '#25D366', color: '#fff' }}
            >
              💬 WhatsApp
            </a>
            <a
              href={`tel:${phoneNumber}`}
              className="btn btn-ghost"
              style={{ padding: 'var(--space-12) var(--space-24)', fontSize: '1rem' }}
            >
              📞 {t('hero.call')}
            </a>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-24)', marginBottom: 'var(--space-64)' }}>
            <h3 className="t-label" style={{ marginBottom: 'var(--space-12)' }}>{t('product.description')}</h3>
            <p className="t-body">{product.description}</p>
            <div style={{ display: 'flex', gap: 'var(--space-48)', marginTop: 'var(--space-32)' }}>
              <div>
                <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>{t('product.availability')}</span>
                <span style={{ fontWeight: 500, fontSize: '1.125rem', color: product.stock > 0 ? 'var(--status-completed)' : 'var(--brand-arcodym)' }}>
                  {product.stock > 0 ? t('product.inStock') : t('product.outOfStock')}
                </span>
              </div>
            </div>
          </div>

          <div className="surface-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-8)' }}>{t('product.orderTitle')}</h3>
            <p className="t-body" style={{ marginBottom: 'var(--space-24)' }}>{t('product.orderSubtitle')}</p>

            {intentSent ? (
              <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', width: '100%', padding: 'var(--space-16)', borderRadius: '12px', fontSize: '1rem', fontWeight: 500 }}>
                {t('product.orderSuccess')}
              </div>
            ) : (
              <form onSubmit={handlePurchaseIntent} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
                <input name="name" className="input-field" required placeholder={t('cart.name')} />
                <input name="phone" className="input-field" required placeholder={t('cart.phoneField')} />
                <textarea name="message" className="input-field" rows="3" placeholder={t('cart.notes')}></textarea>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-8)' }}>{t('product.orderSubmit')}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
