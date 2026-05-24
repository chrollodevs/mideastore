import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi, getImageUrl } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

const MEDIA_VIDEO_SEQUENCE = ['/images/ui/mideahero.mp4', '/images/ui/ac.mp4'];

const MEDIA_CATEGORY_TABS = [
  { id: 'all', labelKey: 'mediaCategoryAll' },
  { id: 'air-conditioners', labelKey: 'mediaCategoryAirConditioners' },
  { id: 'refrigerators', labelKey: 'mediaCategoryRefrigerators' },
  { id: 'freezers', labelKey: 'mediaCategoryFreezers' },
  { id: 'washing-machines', labelKey: 'mediaCategoryWashingMachines' },
  { id: 'small-appliances', labelKey: 'mediaCategorySmallAppliances' }
];

const ARCODYM_CATEGORY_TABS = [
  { id: 'all', labelKey: 'arcodymCategoryAll' },
  { id: 'cookers-ovens', labelKey: 'arcodymCategoryCookersOvens' },
  { id: 'refrigerators', labelKey: 'arcodymCategoryRefrigerators' },
  { id: 'freezers', labelKey: 'arcodymCategoryFreezers' },
  { id: 'washing-machines', labelKey: 'arcodymCategoryWashingMachines' },
  { id: 'small-appliances', labelKey: 'arcodymCategorySmallAppliances' }
];

const SCHALLENGE_CATEGORY_TABS = [
  { id: 'all', labelKey: 'schallengeCategoryAll' },
  { id: 'air-conditioners', labelKey: 'schallengeCategoryAirConditioners' },
  { id: 'water-heaters', labelKey: 'schallengeCategoryWaterHeaters' },
  { id: 'vacuum-cleaners', labelKey: 'schallengeCategoryVacuumCleaners' },
  { id: 'small-appliances', labelKey: 'schallengeCategorySmallAppliances' },
  { id: 'misc-appliances', labelKey: 'schallengeCategoryMiscAppliances' }
];

function getMediaProductCategory(product) {
  const categoryToken = `${product?.category ?? ''}`.toLowerCase().replace(/[_-]/g, ' ');
  const searchable = `${categoryToken} ${product?.name ?? ''} ${product?.description ?? ''}`.toLowerCase();

  if (/\b(ac|air|split|conditioner|climat|inverter|btu)\b/.test(searchable)) return 'air-conditioners';
  if (/\b(refrigerator|refrigerateur|fridge|réfrig|cooler)\b/.test(searchable)) return 'refrigerators';
  if (/\b(freezer|congelateur|cong[eé]lateur|chest)\b/.test(searchable)) return 'freezers';
  if (/\b(washing|washer|lave[-\s]?linge|laveuse|machine\s*a\s*laver)\b/.test(searchable)) return 'washing-machines';
  return 'small-appliances';
}

function getArcodymProductCategory(product) {
  const categoryToken = `${product?.category ?? ''}`.toLowerCase().replace(/[_-]/g, ' ');
  const searchable = `${categoryToken} ${product?.name ?? ''} ${product?.description ?? ''}`.toLowerCase();

  if (/\b(cooker|cooking|oven|gas|burner|cuisiniere|cuisini[eè]re|four)\b/.test(searchable)) return 'cookers-ovens';
  if (/\b(refrigerator|refrigerateur|fridge|réfrig|cooler)\b/.test(searchable)) return 'refrigerators';
  if (/\b(freezer|congelateur|cong[eé]lateur|chest)\b/.test(searchable)) return 'freezers';
  if (/\b(washing|washer|lave[-\s]?linge|laveuse|machine\s*a\s*laver)\b/.test(searchable)) return 'washing-machines';
  return 'small-appliances';
}

function getSChallengeProductCategory(product) {
  const categoryToken = `${product?.category ?? ''}`.toLowerCase().replace(/[_-]/g, ' ');
  const searchable = `${categoryToken} ${product?.name ?? ''} ${product?.description ?? ''}`.toLowerCase();

  if (/\b(ac|air|split|conditioner|climat|inverter|btu)\b/.test(searchable)) return 'air-conditioners';
  if (/\b(water\s*heater|heater|chauffe|boiler|thermo)\b/.test(searchable)) return 'water-heaters';
  if (/\b(vacuum|aspirateur|cleaner|dust)\b/.test(searchable)) return 'vacuum-cleaners';
  if (/\b(blender|kettle|mixer|microwave|toaster|coffee|fryer|iron)\b/.test(searchable)) return 'small-appliances';
  return 'misc-appliances';
}

export default function BrandPage() {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState(null);
  const [activeMediaVideo, setActiveMediaVideo] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchApi(`/brands/${slug}`)
      .then(setBrand)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ ...product, brand_name: brand.name });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  useEffect(() => {
    setActiveMediaVideo(0);
    setActiveCategory('all');
  }, [slug]);

  const normalizedThemeKey = brand?.slug === 'arcodim' ? 'arcodym' : (brand?.slug === 's_challenge' ? 's-challenge' : brand?.slug);
  const isMedia = brand?.slug === 'media';
  const isArcodym = brand?.slug === 'arcodym' || brand?.slug === 'arcodim';
  const isSChallenge = brand?.slug === 's-challenge' || brand?.slug === 's_challenge';
  const products = brand?.products || [];
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    if (isMedia) return products.filter(product => getMediaProductCategory(product) === activeCategory);
    if (isArcodym) return products.filter(product => getArcodymProductCategory(product) === activeCategory);
    if (isSChallenge) return products.filter(product => getSChallengeProductCategory(product) === activeCategory);
    return products;
  }, [isMedia, isArcodym, isSChallenge, products, activeCategory]);
  const nextMediaVideo = MEDIA_VIDEO_SEQUENCE[(activeMediaVideo + 1) % MEDIA_VIDEO_SEQUENCE.length];

  if (loading) return <div className="container section-spacing t-body">{t('brandPage.loading')}</div>;
  if (!brand) return <div className="container section-spacing t-body">{t('brandPage.notFound')}</div>;

  if (isMedia) {
    return (
      <div className="media-brand-page" style={{ '--theme-color': `var(--brand-${normalizedThemeKey})` }}>
        <section className="media-brand-hero">
          <video
            key={MEDIA_VIDEO_SEQUENCE[activeMediaVideo]}
            className="media-brand-hero-video"
            src={MEDIA_VIDEO_SEQUENCE[activeMediaVideo]}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => setActiveMediaVideo((current) => (current + 1) % MEDIA_VIDEO_SEQUENCE.length)}
          />
          <video
            className="media-brand-preload-video"
            src={nextMediaVideo}
            preload="auto"
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="media-brand-hero-overlay"></div>
          <div className="container media-brand-hero-content">
            <div className="media-brand-hero-copy">
              <div className="media-brand-logo-shell">
                <img src="/images/ui/midealogo.png" alt="Midea logo" className="media-brand-logo" />
              </div>
              <p className="media-brand-tagline">{t('brandPage.mediaHeroTagline')}</p>
              <span className="media-brand-subtitle">{t('brandPage.mediaHeroStoreSubtitle')}</span>
            </div>
          </div>
        </section>

        <section className="media-brand-intro">
          <div className="container media-brand-intro-layout">
            <div>
              <div className="media-brand-intro-lockup">
                <img src="/images/ui/midealogo.png" alt="Midea brand mark" className="media-brand-intro-logo" />
              </div>
              <span className="media-brand-kicker">{t('brandPage.mediaBrandKicker')}</span>
              <h2 className="t-page-title media-brand-intro-title">{t('brandPage.mediaBrandIntroTitle')}</h2>
            </div>
            <p className="t-body media-brand-intro-copy">{t('brandPage.mediaBrandIntroBody')}</p>
          </div>
        </section>

        <section className="container section-spacing">
          <div className="media-category-tabs" role="tablist" aria-label={t('brandPage.mediaCategoryTabsLabel')}>
            {MEDIA_CATEGORY_TABS.map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === category.id}
                className={`media-category-tab ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {t(category.labelKey)}
              </button>
            ))}
          </div>

          <div className="media-products-header">
            <h2 className="t-section-title">{t('brandPage.products')}</h2>
            <span className="t-label">{filteredProducts.length} {t('products.count')}</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="media-category-empty t-body">{t('brandPage.mediaCategoryEmpty')}</div>
          ) : (
            <div key={activeCategory} className="grid-catalog media-products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card" style={{ position: 'relative' }}>
                  <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="product-card-img-wrapper" style={{ padding: 'var(--space-16)', backgroundColor: '#F1F5F9' }}>
                      {product.image_url ? (
                        <img src={getImageUrl(product.image_url)} alt={product.name} className="product-card-img-placeholder" />
                      ) : (
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '2rem' }}>📦</div>
                      )}
                    </div>
                    <div className="product-card-meta">
                      <h3 className="product-card-title">{product.name}</h3>
                      <div className="product-card-price">{product.price.toLocaleString()} DZD</div>
                    </div>
                  </Link>
                  <button className={`btn add-to-cart-btn ${addedId === product.id ? 'added' : ''}`} onClick={(e) => handleAddToCart(e, product)}>
                    {addedId === product.id ? '✓ ' + t('product.addedToCart') : t('product.addToCart')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="media-brand-trust">
          <div className="container media-brand-trust-grid">
            <article className="media-brand-trust-item">
              <h3>{t('brandPage.mediaTrustWarrantyTitle')}</h3>
              <p>{t('brandPage.mediaTrustWarrantyBody')}</p>
            </article>
            <article className="media-brand-trust-item">
              <h3>{t('brandPage.mediaTrustDeliveryTitle')}</h3>
              <p>{t('brandPage.mediaTrustDeliveryBody')}</p>
            </article>
            <article className="media-brand-trust-item">
              <h3>{t('brandPage.mediaTrustSupportTitle')}</h3>
              <p>{t('brandPage.mediaTrustSupportBody')}</p>
            </article>
          </div>
        </section>
      </div>
    );
  }

  if (isArcodym) {
    return (
      <div className="arcodym-brand-page" style={{ '--theme-color': `var(--brand-${normalizedThemeKey})` }}>
        <section className="arcodym-brand-hero">
          <img
            src="/images/ui/arcodymhero.jpg"
            alt="Arcodym hero background"
            className="arcodym-brand-hero-image"
          />
          <div className="arcodym-brand-hero-overlay"></div>
          <div className="container arcodym-brand-hero-content">
            <div className="arcodym-brand-hero-copy">
              <div className="arcodym-brand-logo-shell">
                <img src="/images/ui/arcodymlogo.svg" alt="Arcodym logo" className="arcodym-brand-logo" />
              </div>
              <h1 className="arcodym-brand-title">Arcodym</h1>
              <p className="arcodym-brand-tagline">{t('brandPage.arcodymHeroTagline')}</p>
              <span className="arcodym-brand-subtitle">{t('brandPage.arcodymHeroStoreSubtitle')}</span>
            </div>
          </div>
        </section>

        <section className="arcodym-brand-intro">
          <div className="container arcodym-brand-intro-layout">
            <div>
              <div className="arcodym-brand-intro-lockup">
                <img src="/images/ui/arcodymlogo.svg" alt="Arcodym brand mark" className="arcodym-brand-intro-logo" />
              </div>
              <span className="arcodym-brand-kicker">{t('brandPage.arcodymBrandKicker')}</span>
              <h2 className="t-page-title arcodym-brand-intro-title">{t('brandPage.arcodymBrandIntroTitle')}</h2>
            </div>
            <p className="t-body arcodym-brand-intro-copy">{t('brandPage.arcodymBrandIntroBody')}</p>
          </div>
        </section>

        <section className="arcodym-filter-section">
          <div className="container section-spacing">
            <div className="arcodym-category-tabs" role="tablist" aria-label={t('brandPage.arcodymCategoryTabsLabel')}>
              {ARCODYM_CATEGORY_TABS.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category.id}
                  className={`arcodym-category-tab ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {t(category.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="arcodym-products-section">
          <div className="container section-spacing">
            <div className="arcodym-products-header">
              <h2 className="t-section-title">{t('brandPage.products')}</h2>
              <span className="t-label">{filteredProducts.length} {t('products.count')}</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="arcodym-category-empty t-body">{t('brandPage.arcodymCategoryEmpty')}</div>
            ) : (
              <div key={activeCategory} className="grid-catalog arcodym-products-grid">
                {filteredProducts.map(product => (
                  <div key={product.id} className="product-card" style={{ position: 'relative' }}>
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="product-card-img-wrapper" style={{ padding: 'var(--space-16)', backgroundColor: '#f4f4f5' }}>
                        {product.image_url ? (
                          <img src={getImageUrl(product.image_url)} alt={product.name} className="product-card-img-placeholder" />
                        ) : (
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '2rem' }}>📦</div>
                        )}
                      </div>
                      <div className="product-card-meta">
                        <h3 className="product-card-title">{product.name}</h3>
                        <div className="product-card-price">{product.price.toLocaleString()} DZD</div>
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
        </section>

        <section className="arcodym-brand-trust">
          <div className="container arcodym-brand-trust-grid">
            <article className="arcodym-brand-trust-item">
              <h3>{t('brandPage.arcodymTrustWarrantyTitle')}</h3>
              <p>{t('brandPage.arcodymTrustWarrantyBody')}</p>
            </article>
            <article className="arcodym-brand-trust-item">
              <h3>{t('brandPage.arcodymTrustDeliveryTitle')}</h3>
              <p>{t('brandPage.arcodymTrustDeliveryBody')}</p>
            </article>
            <article className="arcodym-brand-trust-item">
              <h3>{t('brandPage.arcodymTrustSupportTitle')}</h3>
              <p>{t('brandPage.arcodymTrustSupportBody')}</p>
            </article>
          </div>
        </section>
      </div>
    );
  }

  if (isSChallenge) {
    return (
      <div className="schallenge-brand-page" style={{ '--theme-color': `var(--brand-${normalizedThemeKey})` }}>
        <section className="schallenge-brand-hero">
          <img src="/images/ui/schalhero.jpg" alt="S-Challenge hero background" className="schallenge-brand-hero-image" />
          <div className="schallenge-brand-hero-overlay"></div>
          <div className="container schallenge-brand-hero-content">
            <div className="schallenge-brand-hero-copy">
              <div className="schallenge-brand-logo-shell">
                <img src="/images/ui/schalogo.png" alt="S-Challenge logo" className="schallenge-brand-logo" />
              </div>
              <h1 className="schallenge-brand-title">S-Challenge</h1>
              <p className="schallenge-brand-tagline">{t('brandPage.schallengeHeroTagline')}</p>
              <span className="schallenge-brand-subtitle">{t('brandPage.schallengeHeroStoreSubtitle')}</span>
            </div>
          </div>
        </section>

        <section className="schallenge-brand-intro">
          <div className="container schallenge-brand-intro-layout">
            <div>
              <span className="schallenge-brand-kicker">{t('brandPage.schallengeBrandKicker')}</span>
              <h2 className="t-page-title schallenge-brand-intro-title">{t('brandPage.schallengeBrandIntroTitle')}</h2>
            </div>
            <p className="t-body schallenge-brand-intro-copy">{t('brandPage.schallengeBrandIntroBody')}</p>
          </div>
        </section>

        <section className="schallenge-filter-section">
          <div className="container section-spacing">
            <div className="schallenge-category-tabs" role="tablist" aria-label={t('brandPage.schallengeCategoryTabsLabel')}>
              {SCHALLENGE_CATEGORY_TABS.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category.id}
                  className={`schallenge-category-tab ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {t(category.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="schallenge-products-section">
          <div className="container section-spacing">
            <div className="schallenge-products-header">
              <h2 className="t-section-title">{t('brandPage.products')}</h2>
              <span className="t-label">{filteredProducts.length} {t('products.count')}</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="schallenge-category-empty t-body">{t('brandPage.schallengeCategoryEmpty')}</div>
            ) : (
              <div key={activeCategory} className="grid-catalog schallenge-products-grid">
                {filteredProducts.map(product => (
                  <div key={product.id} className="product-card" style={{ position: 'relative' }}>
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="product-card-img-wrapper" style={{ padding: 'var(--space-16)', backgroundColor: '#fdf2f8' }}>
                        {product.image_url ? (
                          <img src={getImageUrl(product.image_url)} alt={product.name} className="product-card-img-placeholder" />
                        ) : (
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '2rem' }}>📦</div>
                        )}
                      </div>
                      <div className="product-card-meta">
                        <h3 className="product-card-title">{product.name}</h3>
                        <div className="product-card-price">{product.price.toLocaleString()} DZD</div>
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
        </section>

        <section className="schallenge-brand-trust">
          <div className="container schallenge-brand-trust-grid">
            <article className="schallenge-brand-trust-item">
              <h3>{t('brandPage.schallengeTrustWarrantyTitle')}</h3>
              <p>{t('brandPage.schallengeTrustWarrantyBody')}</p>
            </article>
            <article className="schallenge-brand-trust-item">
              <h3>{t('brandPage.schallengeTrustDeliveryTitle')}</h3>
              <p>{t('brandPage.schallengeTrustDeliveryBody')}</p>
            </article>
            <article className="schallenge-brand-trust-item">
              <h3>{t('brandPage.schallengeTrustSupportTitle')}</h3>
              <p>{t('brandPage.schallengeTrustSupportBody')}</p>
            </article>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{ '--theme-color': `var(--brand-${normalizedThemeKey})` }}>
      <section style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', borderTop: '6px solid var(--theme-color)' }}>
        <div className="container section-spacing split-layout">
          <div>
            <h1 className="t-page-title" style={{ marginBottom: 'var(--space-12)' }}>{brand.name}</h1>
          </div>
          <p className="t-body" style={{ fontSize: '1.25rem' }}>{brand.description}</p>
        </div>
      </section>

      <section className="container section-spacing">
        <div style={{ marginBottom: 'var(--space-48)' }}>
          <h2 className="t-section-title">{t('brandPage.products')}</h2>
        </div>

        <div className="grid-catalog">
          {products.map(product => (
            <div key={product.id} className="product-card" style={{ position: 'relative' }}>
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-card-img-wrapper" style={{ padding: 'var(--space-16)', backgroundColor: '#F8FAFC' }}>
                  {product.image_url ? (
                    <img src={getImageUrl(product.image_url)} alt={product.name} className="product-card-img-placeholder" />
                  ) : (
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '2rem' }}>📦</div>
                  )}
                </div>
                <div className="product-card-meta">
                  <h3 className="product-card-title">{product.name}</h3>
                  <div className="product-card-price">{product.price.toLocaleString()} DZD</div>
                </div>
              </Link>
              <button className={`btn add-to-cart-btn ${addedId === product.id ? 'added' : ''}`} onClick={(e) => handleAddToCart(e, product)}>
                {addedId === product.id ? '✓ ' + t('product.addedToCart') : t('product.addToCart')}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
