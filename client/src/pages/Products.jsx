import { useState, useEffect, useMemo } from 'react';
import { fetchApi, getImageUrl } from '../api/client';
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 'var(--space-24)', marginBottom: 'var(--space-16)' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>{t('products.pageTitle')}</h1>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{filteredProducts.length} of {products.length} {t('products.count')}</span>
      </div>

      {/* Filters Bar */}
      <div style={{ marginBottom: 'var(--space-48)', display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
        
        {/* Search & Selects */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-16)', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              className="input-field"
              placeholder={t('products.searchPlaceholder') || 'Search appliances...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '16px 16px 16px 48px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--elevation-1)' }}
            />
          </div>
          <select className="input-field" style={{ flex: '0 0 200px', padding: '16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--elevation-1)' }} value={priceRange} onChange={e => setPriceRange(e.target.value)}>
            <option value="all">{t('products.anyPrice') || 'Any Price'}</option>
            <option value="0-30000">{t('products.priceUnder30') || 'Under 30,000 DZD'}</option>
            <option value="30000-60000">{t('products.price30to60') || '30,000 - 60,000 DZD'}</option>
            <option value="60000-100000">{t('products.price60to100') || '60,000 - 100,000 DZD'}</option>
            <option value="100000-">{t('products.price100plus') || '100,000+ DZD'}</option>
          </select>
          <select className="input-field" style={{ flex: '0 0 200px', padding: '16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--elevation-1)' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">{t('products.sortNewest') || 'Newest First'}</option>
            <option value="price-asc">{t('products.sortPriceAsc') || 'Price: Low to High'}</option>
            <option value="price-desc">{t('products.sortPriceDesc') || 'Price: High to Low'}</option>
            <option value="name-asc">{t('products.sortNameAsc') || 'Name: A to Z'}</option>
          </select>
        </div>

        {/* Brand Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '8px' }}>{t('products.brandsLabel') || 'Brands:'}</span>
          <button 
            className={`filter-pill ${filterBrand === 'all' ? 'active' : ''}`}
            onClick={() => setFilterBrand('all')}
          >
            {t('products.allBrands') || 'All Brands'}
          </button>
          {brands.map(b => (
            <button 
              key={b.id} 
              className={`filter-pill ${filterBrand === b.id.toString() ? 'active' : ''}`}
              onClick={() => setFilterBrand(b.id.toString())}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid-catalog">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="product-card-premium" style={{ border: 'none', boxShadow: 'none' }}>
              <div className="product-card-image-wrap" style={{ background: '#F1F5F9' }}></div>
              <div className="product-card-content" style={{ gap: '12px' }}>
                <div style={{ width: '40%', height: '12px', background: '#E2E8F0', borderRadius: '4px' }}></div>
                <div style={{ width: '80%', height: '20px', background: '#E2E8F0', borderRadius: '4px' }}></div>
                <div style={{ width: '30%', height: '24px', background: '#E2E8F0', borderRadius: '4px', marginTop: 'auto' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-64)', background: 'var(--bg-surface)', borderRadius: '24px', border: '1px dashed var(--border-strong)' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-24)', margin: '0 auto' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-8)' }}>{t('products.noProductsFound') || 'No products found'}</h3>
          <p className="t-body" style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-24)' }}>{t('products.noProductsSubtitle') || 'Try adjusting your filters or search query.'}</p>
          <button
            className="btn btn-primary"
            style={{ borderRadius: '999px', padding: 'var(--space-12) var(--space-24)' }}
            onClick={() => {
              setSearchQuery('');
              setFilterBrand('all');
              setPriceRange('all');
              setSortBy('newest');
            }}
          >
            {t('products.clearFilters') || 'Clear All Filters'}
          </button>
        </div>
      ) : (
        <div className="grid-catalog">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card-premium">
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="product-card-image-wrap">
                  <div className="product-card-image-container">
                    <img src={getImageUrl(product.image_url)} alt={product.name} className="product-card-image" loading="lazy" />
                  </div>
                  {(!product.image_url) && (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <span style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--status-pending)', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('products.lowStock') || 'Low Stock'}</span>
                  )}
                </div>
                <div className="product-card-content">
                  <div className="product-card-brand-tag" style={{ color: `var(--brand-${product.brand_slug === 'arcodim' ? 'arcodym' : product.brand_slug})` }}>{product.brand_name}</div>
                  <h3 className="product-card-title">{product.name}</h3>
                  <div className="product-card-price-row">
                    <div className="product-card-price">{product.price.toLocaleString()} DZD</div>
                    <button className="product-action-btn" onClick={(e) => handleAddToCart(e, product)} title={t('product.addToCart') || 'Add to Cart'}>
                      {addedId === product.id ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
