import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      login(data.user, data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="admin-login-title">{t('admin.login.title')}</h2>
          <p className="admin-login-subtitle">{t('admin.login.subtitle')}</p>
        </div>

        {error && (
          <div className="admin-login-error">{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <div>
            <label className="t-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem' }}>{t('admin.login.email')}</label>
            <input name="email" type="email" className="input-field" style={{ borderRadius: 'var(--admin-radius-xs)' }} required placeholder="admin@system.com" />
          </div>
          <div>
            <label className="t-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem' }}>{t('admin.login.password')}</label>
            <input name="password" type="password" className="input-field" style={{ borderRadius: 'var(--admin-radius-xs)' }} required placeholder="••••••••" />
          </div>

          <button type="submit" className="btn btn-primary" style={{
            marginTop: 'var(--space-8)',
            width: '100%',
            padding: 'var(--space-16)',
            borderRadius: 'var(--admin-radius-xs)',
            background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
            fontWeight: 600,
            fontSize: '0.9375rem',
            letterSpacing: '-0.01em'
          }}>
            {t('admin.login.button')}
          </button>
        </form>
      </div>
    </div>
  );
}
