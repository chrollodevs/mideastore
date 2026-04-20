import { useState, useEffect, useMemo } from 'react';
import { fetchApi } from '../api/client';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchApi('/products')
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Brand filter
    if (filterBrand !== 'all') {
      result = result.filter(p => p.brand_id.toString() === filterBrand);
    }

    // Price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      result = result.filter(p => {
        if (max) return p.price >= min && p.price <= max;
        return p.price >= min; // No max means "and above"
      });
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [products, searchQuery, filterBrand, priceRange, sortBy]);

  const brands = useMemo(() => {
    const unique = new Map();
    products.forEach(p => {
      if (!unique.has(p.brand_id)) {
        unique.set(p.brand_id, { id: p.brand_id, name: p.brand_name, slug: p.brand_slug });
      }
    });
    return Array.from(unique.values());
  }, [products]);

  return (
    <div className="container section-spacing">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-24)', marginBottom: 'var(--space-32)' }}>
        <h1 className="t-page-title" style={{ marginBottom: 0 }}>{t('products.pageTitle')}</h1>
        <span className="t-label">{filteredProducts.length} of {products.length} {t('products.count')}</span>
      </div>

      {/* Filters Bar */}
      <div className="surface-card" style={{ padding: 'var(--space-16) var(--space-24)', marginBottom: 'var(--space-32)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-16)', alignItems: 'center' }}>
        <div style={{ flex: '1 1 280px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: 'var(--space-12) var(--space-16)' }}
          />
        </div>
        <select className="input-field" style={{ flex: '0 0 160px' }} value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
          <option value="all">All Brands</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select className="input-field" style={{ flex: '0 0 160px' }} value={priceRange} onChange={e => setPriceRange(e.target.value)}>
          <option value="all">Any Price</option>
          <option value="0-30000">Under 30,000 DZD</option>
          <option value="30000-60000">30,000 - 60,000 DZD</option>
          <option value="60000-100000">60,000 - 100,000 DZD</option>
          <option value="100000-">100,000+ DZD</option>
        </select>
        <select className="input-field" style={{ flex: '0 0 160px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>

      {loading ? (
        <div className="t-body">{t('products.loading')}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="surface-card" style={{ textAlign: 'center', padding: 'var(--space-64)' }}>
          <p className="t-body" style={{ color: 'var(--text-tertiary)', fontSize: '1.125rem' }}>No products match your filters</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 'var(--space-24)' }}
            onClick={() => {
              setSearchQuery('');
              setFilterBrand('all');
              setPriceRange('all');
              setSortBy('newest');
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid-catalog">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card" style={{ position: 'relative' }}>
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-card-img-wrapper" style={{ padding: 'var(--space-16)', backgroundColor: '#F8FAFC' }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="product-card-img-placeholder" loading="lazy" />
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
              <button className={`btn add-to-cart-btn ${addedId === product.id ? 'added' : ''}`} onClick={(e) => handleAddToCart(e, product)}>
                {addedId === product.id ? '✓ ' + t('product.addedToCart') : t('product.addToCart')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
