import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../api/client';

export default function BrandPage() {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi(`/brands/${slug}`)
      .then(setBrand)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container section-spacing t-body">Initializing environment...</div>;
  if (!brand) return <div className="container section-spacing t-body">System fault: Brand unlocated.</div>;

  return (
    <div style={{ '--theme-color': `var(--brand-${brand.slug})` }}>
      {/* Brand Hero (Minimal Premium) */}
      <section style={{ 
        background: 'var(--bg-surface)', 
        borderBottom: '1px solid var(--border-subtle)', 
        borderTop: '6px solid var(--theme-color)',
      }}>
        <div className="container section-spacing split-layout">
          <div>
            <h1 className="t-page-title" style={{ marginBottom: 'var(--space-12)' }}>{brand.name}</h1>
            <span className="t-label" style={{ color: 'var(--text-tertiary)' }}>SYS. / {brand.slug.toUpperCase()}</span>
          </div>
          <p className="t-body" style={{ fontSize: '1.25rem' }}>{brand.description}</p>
        </div>
      </section>

      {/* Catalog Listing */}
      <section className="container section-spacing">
        <div style={{ marginBottom: 'var(--space-48)' }}>
          <h2 className="t-section-title">Available Assets</h2>
        </div>
        
        <div className="grid-catalog">
          {brand.products.map(product => (
            <Link to={`/product/${product.id}`} key={product.id} className="product-card">
              <div className="product-card-img-wrapper" style={{ borderBottom: '2px solid transparent', transition: 'border-color var(--transition-smooth)' }}>
                <div className="product-card-img-placeholder" style={{ backgroundColor: 'var(--bg-surface)' }}>Asset Proxy</div>
              </div>
              <div className="product-card-meta">
                <h3 className="product-card-title">{product.name}</h3>
                <div className="product-card-price">{product.price.toLocaleString()} DZD</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
