import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../api/client';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

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
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <div className="surface-card" style={{ width: '100%', maxWidth: '440px', padding: 'var(--space-48)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-32)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 'var(--space-8)' }}>System Authentication</h2>
          <p className="t-body">Terminal access requires clearance.</p>
        </div>
        
        {error && (
          <div style={{ color: 'var(--brand-arcodim)', fontSize: '0.875rem', marginBottom: 'var(--space-24)', padding: 'var(--space-12)', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <div>
            <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>AUTHORIZATION ID</label>
            <input name="email" type="email" className="input-field" style={{ marginBottom: 0 }} required placeholder="admin@system.com" />
          </div>
          <div>
            <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>PASSPHRASE</label>
            <input name="password" type="password" className="input-field" style={{ marginBottom: 0 }} required placeholder="••••••••" />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-16)', width: '100%', padding: 'var(--space-16)' }}>
            Establish Connection
          </button>
        </form>
      </div>
    </div>
  );
}
