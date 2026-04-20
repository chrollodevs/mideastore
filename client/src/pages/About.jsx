import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="container section-spacing split-layout">
      <div>
        <h1 className="t-page-title" style={{ marginBottom: 'var(--space-24)' }}>{t('aboutPage.title')}</h1>
        <p className="t-body" style={{ fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: 'var(--space-24)', lineHeight: 1.8 }}>
          {t('about.text')}
        </p>
      </div>
      
      <div className="surface-card">
        <h3 className="t-section-title" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-16)', marginBottom: 'var(--space-24)' }}>
          {t('services.title')}
        </h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          {(t('services.list') || []).map((service, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--status-completed)', fontWeight: 700, fontSize: '1.25rem' }}>✓</span>
              {service}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
