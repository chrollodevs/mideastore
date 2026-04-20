import { useState } from 'react';
import { fetchApi } from '../api/client';

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      type: 'contact',
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message')
    };
    try {
      await fetchApi('/requests', { method: 'POST', body: JSON.stringify(data) });
      setSent(true);
      e.target.reset();
    } catch (err) {
      alert('Transmission failed.');
    }
  };

  return (
    <div className="container section-spacing split-layout">
      <div>
        <h1 className="t-page-title" style={{ marginBottom: 'var(--space-24)' }}>Communications Channel</h1>
        <p className="t-body" style={{ fontSize: '1.125rem' }}>
          Direct priority line to our support matrix. Please await a response within standard operational hours (0900 - 1800).
        </p>
      </div>

      <div className="surface-card">
        {sent ? (
          <div className="badge badge-completed" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', width: '100%', padding: 'var(--space-16)', fontSize: '0.875rem' }}>
            Transmission logged successfully.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>IDENTIFIER</label>
              <input name="name" className="input-field" style={{ marginBottom: 0 }} required placeholder="Full Name or Org" />
            </div>
            
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>RETURN VECTOR</label>
              <input name="email" className="input-field" type="email" style={{ marginBottom: 0 }} required placeholder="Email Address" />
            </div>
            
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>DATA PAYLOAD</label>
              <textarea name="message" className="input-field" style={{ marginBottom: 0 }} required rows="5" placeholder="Query details..."></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-8)' }}>Transmit Signal</button>
          </form>
        )}
      </div>
    </div>
  );
}
