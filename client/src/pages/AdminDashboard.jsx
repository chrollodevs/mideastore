import { useState, useEffect } from 'react';
import { fetchApi } from '../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchApi('/admin/stats').then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div className="t-body">Synchronizing telemetry...</div>;

  return (
    <div>
      <h1 className="t-page-title" style={{ marginBottom: 'var(--space-48)' }}>System Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-24)' }}>
        <div className="surface-card">
          <h3 className="t-label" style={{ marginBottom: 'var(--space-8)' }}>Connected Products</h3>
          <p style={{ fontSize: '3rem', fontWeight: '700', lineHeight: 1, letterSpacing: '-0.02em' }}>{stats.products}</p>
        </div>
        <div className="surface-card">
          <h3 className="t-label" style={{ marginBottom: 'var(--space-8)' }}>Brand Schemas</h3>
          <p style={{ fontSize: '3rem', fontWeight: '700', lineHeight: 1, letterSpacing: '-0.02em' }}>{stats.brands}</p>
        </div>
        <div className="surface-card">
          <h3 className="t-label" style={{ marginBottom: 'var(--space-8)' }}>Total Requests</h3>
          <p style={{ fontSize: '3rem', fontWeight: '700', lineHeight: 1, letterSpacing: '-0.02em' }}>{stats.requests}</p>
        </div>
        <div className="surface-card" style={{ borderBottom: '4px solid var(--status-pending)' }}>
          <h3 className="t-label" style={{ color: 'var(--status-pending)', marginBottom: 'var(--space-8)' }}>Pending Actions</h3>
          <p style={{ fontSize: '3rem', fontWeight: '700', lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--status-pending)' }}>{stats.pendingRequests}</p>
        </div>
      </div>
    </div>
  );
}
