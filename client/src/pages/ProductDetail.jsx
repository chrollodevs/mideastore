import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchApi } from '../api/client';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [intentSent, setIntentSent] = useState(false);

  useEffect(() => {
    fetchApi(`/products/${id}`)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handlePurchaseIntent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      type: 'purchase_intent',
      name: formData.get('name'),
      phone: formData.get('phone'),
      product_id: product.id,
      message: formData.get('message')
    };

    try {
      await fetchApi('/requests', { method: 'POST', body: JSON.stringify(data) });
      setIntentSent(true);
      e.target.reset();
    } catch (err) {
      alert('Failed to transmit request. System fault.');
    }
  };

  if (loading) return <div className="container section-spacing t-body">Chargement du produit...</div>;
  if (!product) return <div className="container section-spacing t-body">Produit introuvable.</div>;

  const brandTheme = `var(--brand-${product.brand_slug})`;

  return (
    <div>
      {/* Thin brand ribbon */}
      <div style={{ height: '4px', background: brandTheme, width: '100%' }}></div>
      
      <div className="container section-spacing split-layout">
        {/* Visual Asset (Elevated) */}
        <div className="surface-card" style={{ padding: 'var(--space-16)', overflow: 'hidden', aspectRatio: '4/5', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span className="t-label" style={{ fontSize: '3rem' }}>📦</span>
          )}
        </div>

        {/* Data & Conversion Engine */}
        <div style={{ padding: 'var(--space-16) 0' }}>
          <div className="t-label" style={{ color: brandTheme, marginBottom: 'var(--space-12)' }}>
            {product.brand_name}
          </div>
          
          <h1 className="t-page-title" style={{ marginBottom: 'var(--space-16)' }}>{product.name}</h1>
          <div style={{ fontSize: '1.75rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: 'var(--space-48)' }}>
            {product.price.toLocaleString()} DZD
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-24)', marginBottom: 'var(--space-64)' }}>
            <h3 className="t-label" style={{ marginBottom: 'var(--space-12)' }}>Description</h3>
            <p className="t-body">{product.description}</p>
            
            <div style={{ display: 'flex', gap: 'var(--space-48)', marginTop: 'var(--space-32)' }}>
              <div>
                <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>Disponibilité</span>
                <span style={{ fontWeight: 500, fontSize: '1.125rem', color: product.stock > 0 ? 'var(--status-completed)' : 'var(--brand-arcodym)' }}>
                  {product.stock > 0 ? `En stock` : 'Rupture de stock'}
                </span>
              </div>
            </div>
          </div>

          {/* Elevated Inquiry Form */}
          <div className="surface-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-8)' }}>Commander ce produit</h3>
            <p className="t-body" style={{ marginBottom: 'var(--space-24)' }}>Envoyez une demande rapide, nous vous contacterons pour finaliser votre commande.</p>
            
            {intentSent ? (
              <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', width: '100%', padding: 'var(--space-16)', borderRadius: '12px', fontSize: '1rem', fontWeight: 500 }}>
                Votre demande a bien été envoyée !
              </div>
            ) : (
              <form onSubmit={handlePurchaseIntent} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
                <input name="name" className="input-field" required placeholder="Votre Nom complet" />
                <input name="phone" className="input-field" required placeholder="Numéro de téléphone" />
                <textarea name="message" className="input-field" rows="3" placeholder="Informations supplémentaires (Optionnel)"></textarea>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-8)' }}>Demander ce produit</button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
