export default function About() {
  return (
    <div className="container section-spacing split-layout">
      <div>
        <h1 className="t-page-title" style={{ marginBottom: 'var(--space-24)' }}>Engineered Infrastructure.</h1>
        <p className="t-body" style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: 'var(--space-24)' }}>
          We are not a traditional store. We are a direct distribution pipeline connecting premium industrial and home appliances to precise requirements.
        </p>
        <p className="t-body">
          Partnering at the source with Media, Arcodim, and S-Challenge ensures that architectural integrity meets domestic environments without the friction of conventional retail layers.
        </p>
      </div>
      
      <div className="surface-card">
        <h3 className="t-section-title" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-16)', marginBottom: 'var(--space-24)' }}>
          Core Vitals
        </h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="t-label">Registry No.</span> 
            <strong style={{ fontWeight: '600' }}>1020-SYS-X</strong>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="t-label">Logistics Hub</span> 
            <strong style={{ fontWeight: '600' }}>Sector 4, Central Base</strong>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="t-label">Network Uptime</span> 
            <strong style={{ fontWeight: '600', color: 'var(--status-completed)' }}>99.98%</strong>
          </li>
        </ul>
      </div>
    </div>
  );
}
