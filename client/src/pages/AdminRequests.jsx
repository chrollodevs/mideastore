import { useState, useEffect } from 'react';
import { fetchApi } from '../api/client';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await fetchApi('/requests');
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await fetchApi(`/requests/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      loadRequests();
    } catch (err) {
      alert('Status update failed.');
    }
  };

  return (
    <div>
      <h1 className="t-page-title" style={{ marginBottom: 'var(--space-48)' }}>Inbound Requests Pipeline</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
        {requests.map(req => {
          return (
            <div key={req.id} className="surface-card" style={{ borderLeft: `6px solid var(--status-${req.status})`, padding: 'var(--space-32)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-24)' }}>
                
                {/* Information Segment */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginBottom: 'var(--space-16)' }}>
                    <span className="t-label" style={{ padding: 'var(--space-4) var(--space-8)', background: `var(--status-${req.status})`, color: 'var(--bg-surface)', borderRadius: '2px' }}>
                      {req.status}
                    </span>
                    <span className="t-label">
                      {req.type.replace('_', ' ').toUpperCase()} SIGNAL
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: 'var(--space-8)' }}>{req.name}</h3>
                  <div className="t-body" style={{ display: 'flex', gap: 'var(--space-24)', flexWrap: 'wrap', marginBottom: 'var(--space-16)' }}>
                    {req.email && <span>Email: <strong style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{req.email}</strong></span>}
                    {req.phone && <span>Phone: <strong style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{req.phone}</strong></span>}
                  </div>

                  {req.product_name && (
                    <div style={{ padding: 'var(--space-12) var(--space-16)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '0.875rem', marginBottom: 'var(--space-24)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                      <span className="t-label">TARGET ASSET</span> 
                      <strong style={{ color: 'var(--text-primary)' }}>{req.product_name}</strong>
                    </div>
                  )}

                  {req.message && (
                    <div style={{ background: 'var(--bg-base)', padding: 'var(--space-16)', borderLeft: '3px solid var(--border-strong)', borderRadius: '0 4px 4px 0' }}>
                      <p className="t-body" style={{ margin: 0, fontStyle: 'italic' }}>"{req.message}"</p>
                    </div>
                  )}
                </div>

                {/* Control Segment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', background: 'var(--bg-base)', padding: 'var(--space-16)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <label className="t-label">Pipeline State</label>
                  <select 
                    value={req.status} 
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    className="input-field"
                    style={{ marginBottom: 0, padding: 'var(--space-8) var(--space-12)' }}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="reviewed">Active Processing</option>
                    <option value="completed">Cycle Completed</option>
                  </select>
                </div>

              </div>
            </div>
          );
        })}
        {requests.length === 0 && <div className="surface-card t-body">Pipeline is currently empty.</div>}
      </div>
    </div>
  );
}
