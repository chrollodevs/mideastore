import { useState, useEffect } from 'react';
import { fetchApi } from '../api/client';
import { Link } from 'react-router-dom';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/products')
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container section-spacing">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-24)', marginBottom: 'var(--space-64)' }}>
        <h1 className="t-page-title" style={{ marginBottom: 0 }}>Tous nos produits</h1>
        <span className="t-label">{products.length} articles</span>
      </div>

      {loading ? (
        <div className="t-body">Chargement du catalogue...</div>
      ) : (
        <div className="grid-catalog">
          {products.map(product => (
            <Link to={`/product/${product.id}`} key={product.id} className="product-card">
              <div className="product-card-img-wrapper" style={{ padding: 'var(--space-16)', backgroundColor: '#F8FAFC' }}>
                {product.image_url ? (
                   <img src={product.image_url} alt={product.name} className="product-card-img-placeholder" />
                ) : (
                   <div style={{ color: 'var(--text-tertiary)', fontSize: '2rem' }}>📦</div>
                )}
              </div>
              <div className="product-card-meta">
                <div className="product-card-brand" style={{ color: `var(--brand-${product.brand_slug === 'arcodim' ? 'arcodym' : product.brand_slug})` }}>{product.brand_name}</div>
                <h3 className="product-card-title">{product.name}</h3>
                <div className="product-card-price" style={{ color: 'var(--brand-media)' }}>{product.price.toLocaleString()} DZD</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
