import { useState } from 'react';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('cart.name'),
      email: formData.get('contact.email'),
      message: formData.get('message')
    };
    try {
      await fetchApi('/messages', { method: 'POST', body: JSON.stringify(data) });
      setSent(true);
      e.target.reset();
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  return (
    <div className="container section-spacing split-layout">
      <div>
        <h1 className="t-page-title" style={{ marginBottom: 'var(--space-24)' }}>{t('contactPage.title')}</h1>
        <p className="t-body" style={{ fontSize: '1.125rem', marginBottom: 'var(--space-32)' }}>
          {t('contactPage.subtitle')}
        </p>

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
        {sent ? (
          <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', width: '100%', padding: 'var(--space-16)', fontSize: '0.875rem', borderRadius: '12px', textAlign: 'center', fontWeight: 500 }}>
            {t('contactPage.formSuccess')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
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
              <textarea name="message" className="input-field" required rows="5" placeholder={t('contactPage.formMessage')}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-8)' }}>{t('contactPage.formSubmit')}</button>
          </form>
        )}
      </div>
    </div>
  );
}
