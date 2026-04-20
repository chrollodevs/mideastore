import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchApi } from '../api/client';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, itemCount, totalPrice } = useCart();
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    const payload = {
      type: 'cart_request',
      name: formData.get('cart.name'),
      email: formData.get('contact.email'),
      phone: formData.get('contact.phone'),
      message: formData.get('cart.notes') || '',
      products: items.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
    };
    try {
      await fetchApi('/requests', { method: 'POST', body: JSON.stringify(payload) });
      setSubmitted(true);
      clearCart();
    } catch (err) {
      alert('Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container section-spacing" style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto', padding: '12vh 24px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✅</div>
        <h1 className="t-page-title" style={{ marginBottom: '16px' }}>{t('cart.success')}</h1>
        <p className="t-body" style={{ marginBottom: '48px' }}>{t('cart.successSubtitle')}</p>
        <Link to="/" className="btn btn-primary" style={{ padding: '16px 48px' }}>{t('cart.backHome')}</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container section-spacing" style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto', padding: '12vh 24px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🛒</div>
        <h1 className="t-page-title" style={{ marginBottom: '16px' }}>{t('cart.empty')}</h1>
        <p className="t-body" style={{ marginBottom: '48px' }}>{t('cart.emptySubtitle')}</p>
        <Link to="/products" className="btn btn-primary" style={{ padding: '16px 48px' }}>{t('cart.browse')}</Link>
      </div>
    );
  }

  return (
    <div className="container section-spacing">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-24)', marginBottom: 'var(--space-48)' }}>
        <h1 className="t-page-title" style={{ marginBottom: 0 }}>{t('cart.title')}</h1>
        <button onClick={clearCart} className="btn btn-ghost" style={{ fontSize: '0.875rem' }}>{t('cart.clearAll')}</button>
      </div>

      <div className="cart-layout">
        <div className="cart-items-column">
          {items.map(item => (
            <div key={item.id} className="cart-item-card">
              <div className="cart-item-image">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '2rem' }}>📦</span>
                )}
              </div>
              <div className="cart-item-details">
                {item.brand_name && <span className="t-label" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>{item.brand_name}</span>}
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>{item.name}</h3>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-media)' }}>{item.price.toLocaleString()} DZD</div>
              </div>
              <div className="cart-item-controls">
                <div className="cart-qty-control">
                  <button onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)} className="cart-qty-btn">−</button>
                  <span className="cart-qty-value">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="cart-qty-btn">+</button>
                </div>
                <button onClick={() => removeItem(item.id)} className="cart-remove-btn">{t('cart.remove')}</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-checkout-column">
          <div className="surface-card" style={{ position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-24)' }}>{t('cart.summary')}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <span>{itemCount} {t('cart.items')}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalPrice.toLocaleString()} DZD</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '16px 0 24px' }}></div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>{t('cart.checkoutTitle')}</h3>
            <p className="t-body" style={{ fontSize: '0.875rem', marginBottom: '20px' }}>{t('cart.checkoutSubtitle')}</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input name="name" className="input-field" required placeholder={t('cart.name')} />
              <input name="email" className="input-field" type="email" required placeholder={t('cart.emailField')} />
              <input name="phone" className="input-field" type="tel" required placeholder={t('cart.phoneField')} />
              <textarea name="notes" className="input-field" rows="3" placeholder={t('cart.notes')}></textarea>
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '8px', padding: '14px' }}>
                {submitting ? '...' : t('cart.checkout')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
