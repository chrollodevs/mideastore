import { useState } from 'react';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.target);
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const phone = formData.get('phone')?.trim();
    const message = formData.get('message')?.trim();

    if (!name || !message) {
      setError(t('contactPage.validationError') || 'Name and message are required.');
      return;
    }

    setSending(true);
    try {
      await fetchApi('/messages', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, message })
      });
      setSent(true);
      e.target.reset();
    } catch (err) {
      setError(t('contactPage.formError') || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container section-spacing split-layout">
      <div>
        <h1 className="t-page-title" style={{ marginBottom: 'var(--space-24)' }}>{t('contactPage.title')}</h1>
        <p className="t-body" style={{ marginBottom: 'var(--space-32)' }}>
          {t('contactPage.subtitle')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', backgroundColor: '#F8FAFC', padding: 'var(--space-32)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#F1F5F9', color: 'var(--brand-media)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <span className="t-label" style={{ display: 'block' }}>{t('contact.locationLabel')}</span>
              <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{t('contact.location')}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#F1F5F9', color: 'var(--brand-media)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            </div>
            <div>
              <span className="t-label" style={{ display: 'block' }}>{t('contact.phoneLabel')}</span>
              <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{t('contact.phone')}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#F1F5F9', color: 'var(--brand-media)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div>
              <span className="t-label" style={{ display: 'block' }}>{t('contact.emailLabel')}</span>
              <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{t('contact.email')}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#F1F5F9', color: 'var(--brand-media)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <span className="t-label" style={{ display: 'block' }}>{t('contact.hoursLabel')}</span>
              <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{t('contact.hours')}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card">
        {sent ? (
          <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #d1fae5', width: '100%', padding: 'var(--space-16)', fontSize: '0.875rem', borderRadius: '12px', textAlign: 'center', fontWeight: 500 }}>
            {t('contactPage.formSuccess')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            {error && (
              <div style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', padding: 'var(--space-12)', fontSize: '0.875rem', borderRadius: '8px' }}>
                {error}
              </div>
            )}
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>{t('contactPage.formName')}</label>
              <input name="name" className="input-field" required placeholder={t('cart.name')} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--elevation-1)' }} />
            </div>
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>{t('contactPage.formEmail')}</label>
              <input name="email" className="input-field" type="email" required placeholder={t('cart.emailField')} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--elevation-1)' }} />
            </div>
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>{t('contactPage.formPhone')}</label>
              <input name="phone" className="input-field" type="tel" placeholder={t('cart.phoneField')} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--elevation-1)' }} />
            </div>
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>{t('contactPage.formMessage')}</label>
              <textarea name="message" className="input-field" required rows="5" placeholder={t('contactPage.formMessage')} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--elevation-1)', resize: 'vertical' }}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={sending} style={{ alignSelf: 'flex-start', marginTop: 'var(--space-8)' }}>
              {sending ? (t('contactPage.sending') || 'Sending...') : t('contactPage.formSubmit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
