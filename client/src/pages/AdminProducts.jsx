import { useState, useEffect, useRef, useMemo } from 'react';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useDialog } from '../context/DialogContext';

export default function AdminProducts() {
  const CATEGORY_OPTIONS = [
    { value: 'air_conditioner', label: 'Air Conditioner' },
    { value: 'refrigerator', label: 'Refrigerator' },
    { value: 'freezer', label: 'Freezer' },
    { value: 'washing_machine', label: 'Washing Machine' },
    { value: 'small_appliance', label: 'Small Appliance' }
  ];

  const { t } = useLanguage();
  const { showToast } = useToast();
  const dialog = useDialog();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '', brand_id: '', category: 'small_appliance', price: '', stock: '', description: '', image_url: '', display_sections: []
  });
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const placementOptions = [
    { id: 'hot_deals', label: 'Nos Meilleures Offres (Featured Homepage)' },
    { id: 'media', label: 'Media Highlights (Force push to Media page)' },
    { id: 'arcodym', label: 'Arcodym Highlights (Force push to Arcodym page)' },
    { id: 's_challenge', label: 'S-Challenge Highlights (Force push to S-Challenge page)' }
  ];

  const loadData = async () => {
    try {
      const [pData, bData] = await Promise.all([fetchApi('/products'), fetchApi('/brands')]);
      setProducts(pData);
      setBrands(bData);
    } catch (err) {
      console.error('Failed to sync data', err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setFormData({ name: '', brand_id: '', category: 'small_appliance', price: '', stock: '', description: '', image_url: '', display_sections: [] });
    setEditId(null);
    setIsFormOpen(false);
  };

  const handleOpenEdit = (p) => {
    setFormData({
      name: p.name, brand_id: p.brand_id, category: p.category || 'small_appliance', price: p.price,
      stock: p.stock, description: p.description || '', image_url: p.image_url || '',
      display_sections: Array.isArray(p.display_sections) ? p.display_sections : []
    });
    setEditId(p.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await dialog.confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to permanently delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      isDestructive: true
    });
    
    if (!confirmed) return;
    
    try {
      await fetchApi(`/products/${id}`, { method: 'DELETE' });
      await loadData();
      showToast('Product deleted successfully', 'success');
    } catch { 
      showToast(t('admin.products.deleteError') || 'Failed to delete product', 'error'); 
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { 
      showToast(t('admin.products.fileTooLarge') || 'File is too large', 'error'); 
      return; 
    }
    const data = new FormData();
    data.append('image', file);
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: data });
      if (!res.ok) throw new Error('Upload failed');
      const result = await res.json();
      setFormData(prev => ({ ...prev, image_url: result.image_url }));
      showToast('Image uploaded successfully', 'success');
    } catch (err) { 
      showToast(t('admin.products.uploadError') || 'Failed to upload image', 'error'); 
    }
    finally { setUploading(false); }
  };

  const toggleSection = (sectionId) => {
    setFormData(prev => ({
      ...prev,
      display_sections: prev.display_sections.includes(sectionId)
        ? prev.display_sections.filter(id => id !== sectionId)
        : [...prev.display_sections, sectionId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name, brand_id: parseInt(formData.brand_id, 10), category: formData.category,
        price: parseFloat(formData.price), stock: parseInt(formData.stock || 0, 10),
        description: formData.description, image_url: formData.image_url, display_sections: formData.display_sections
      };
      if (editId) { 
        await fetchApi(`/products/${editId}`, { method: 'PUT', body: JSON.stringify(payload) }); 
        showToast('Product updated successfully', 'success');
      } else { 
        await fetchApi('/products', { method: 'POST', body: JSON.stringify(payload) }); 
        showToast('Product created successfully', 'success');
      }
      await loadData();
      resetForm();
    } catch (err) { 
      showToast(t('admin.products.saveError') || 'Failed to save product', 'error'); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = filterBrand === 'all' || p.brand_id.toString() === filterBrand;
      const matchesCategory = filterCategory === 'all' || (p.category || 'small_appliance') === filterCategory;
      const parsedTags = Array.isArray(p.display_sections) ? p.display_sections : [];
      const matchesSection = filterSection === 'all' || parsedTags.includes(filterSection);
      return matchesSearch && matchesBrand && matchesCategory && matchesSection;
    });
  }, [products, searchQuery, filterBrand, filterCategory, filterSection]);

  const brandColorMap = {
    'media': 'var(--brand-media)', 'arcodim': 'var(--brand-arcodym)', 's-challenge': 'var(--brand-s-challenge)'
  };

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{t('admin.products.title')}</h1>
          <p className="admin-page-subtitle">{t('admin.products.subtitle')}</p>
        </div>
        {!isFormOpen && (
          <button className="btn btn-primary" onClick={() => setIsFormOpen(true)} style={{ borderRadius: 'var(--admin-radius-xs)', fontSize: '0.9375rem', padding: 'var(--space-12) var(--space-24)' }}>
            + {t('admin.products.create')}
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="admin-card" style={{ marginBottom: 'var(--space-48)' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title" style={{ fontSize: '1.125rem' }}>{editId ? t('admin.products.editTitle') : t('admin.products.newTitle')}</h2>
            <button className="admin-btn-sm" onClick={resetForm}>{t('admin.products.cancel')}</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
            {/* Basic Info */}
            <div>
              <h3 className="admin-form-section-title">{t('admin.products.section1')}</h3>
              <div className="admin-form-section">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="t-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.8125rem' }}>{t('admin.products.name')}</label>
                    <input required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Plaque chauffante..." />
                  </div>
                  <div>
                    <label className="t-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.8125rem' }}>{t('admin.products.brand')}</label>
                    <select required className="input-field" value={formData.brand_id} onChange={e => setFormData({...formData, brand_id: e.target.value})}>
                      <option value="">{t('admin.products.select')}</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="t-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.8125rem' }}>{t('admin.products.category')}</label>
                    <select required className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="t-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.8125rem' }}>{t('admin.products.stock')}</label>
                    <input type="number" className="input-field" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="10" />
                  </div>
                  <div>
                    <label className="t-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.8125rem' }}>{t('admin.products.price')}</label>
                    <input required type="number" step="0.01" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="15000" />
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <h3 className="admin-form-section-title">{t('admin.products.section2')}</h3>
              <div className="admin-form-section">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: '180px', height: '180px', border: '2px dashed var(--admin-border)', borderRadius: 'var(--admin-radius)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'border-color var(--admin-transition)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--admin-sidebar-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--admin-border)'}
                >
                  {uploading && <div style={{ position: 'absolute', inset: 0, display:'flex', alignItems: 'center', justifyContent:'center', background:'rgba(255,255,255,0.9)', zIndex: 10, fontWeight: 600, fontSize: '0.875rem' }}>{t('admin.products.uploading')}</div>}
                  {formData.image_url ? (
                    <img src={formData.image_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Preview" />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 8px' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{t('admin.products.uploadPrompt')}</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} />
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>{t('admin.products.uploadHint')}</p>
              </div>
            </div>

            {/* Placement */}
            <div>
              <h3 className="admin-form-section-title">{t('admin.products.section3')}</h3>
              <div className="admin-form-section">
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-12)' }}>{t('admin.products.placementHint')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {placementOptions.map(opt => (
                    <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 0' }}>
                      <input type="checkbox" checked={formData.display_sections.includes(opt.id)} onChange={() => toggleSection(opt.id)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--admin-sidebar-accent)' }} />
                      <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="admin-form-section-title">{t('admin.products.section4')}</h3>
              <div className="admin-form-section">
                <textarea rows="5" className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder={t('admin.products.descriptionHint')}></textarea>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--admin-border-light)', paddingTop: 'var(--space-24)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)' }}>
              <button type="button" onClick={resetForm} disabled={isSubmitting} className="admin-btn-sm">{t('admin.products.cancel')}</button>
              <button disabled={uploading || isSubmitting} type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--admin-radius-xs)', fontSize: '0.9375rem', opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Saving...' : (editId ? t('admin.products.save') : t('admin.products.publish'))}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="admin-filter-bar">
            <div className="admin-search-input">
              <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" className="input-field" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="admin-filter-select">
              <select className="input-field" value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
                <option value="all">{t('admin.products.allBrands')}</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="admin-filter-select">
              <select className="input-field" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="all">{t('admin.products.allCategories')}</option>
                {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="admin-filter-select">
              <select className="input-field" value={filterSection} onChange={e => setFilterSection(e.target.value)}>
                <option value="all">{t('admin.products.allPlacements')}</option>
                {placementOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="admin-table-wrap">
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('admin.products.tableProduct')}</th>
                    <th>{t('admin.products.tableBrand')}</th>
                    <th>{t('admin.products.category')}</th>
                    <th>{t('admin.products.tablePlacements')}</th>
                    <th style={{ textAlign: 'right' }}>{t('admin.products.tablePriceStock')}</th>
                    <th style={{ textAlign: 'center' }}>{t('admin.products.tableActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const parsedTags = Array.isArray(p.display_sections) ? p.display_sections : [];
                    const isLowStock = p.stock > 0 && p.stock <= 5;
                    const isOutOfStock = p.stock <= 0;

                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--admin-radius-xs)', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--admin-border-light)' }}>
                              {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                              )}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{p.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="admin-badge admin-badge--brand" style={{ background: brandColorMap[p.brand_slug] || '#64748B' }}>
                            {p.brand_name}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            {CATEGORY_OPTIONS.find(c => c.value === (p.category || 'small_appliance'))?.label || p.category}
                          </span>
                        </td>
                        <td>
                          {parsedTags.length === 0 ? <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Standard</span> : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {parsedTags.map(tag => (
                                <span key={tag} className="admin-badge admin-badge--info">
                                  {placementOptions.find(o => o.id === tag)?.label.split(' (')[0] || tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--admin-font-display)', fontWeight: 700, marginBottom: '4px' }}>{p.price.toLocaleString()} DZD</div>
                          {isOutOfStock ? (
                            <span className="admin-badge admin-badge--danger">{t('admin.products.outOfStock')}</span>
                          ) : isLowStock ? (
                            <span className="admin-badge admin-badge--pending">{t('admin.products.lowStock')} ({p.stock})</span>
                          ) : (
                            <span className="admin-badge admin-badge--completed">{t('admin.products.inStock')} ({p.stock})</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button onClick={() => handleOpenEdit(p)} className="admin-btn-sm">{t('admin.products.edit')}</button>
                            <button onClick={() => handleDelete(p.id)} className="admin-btn-sm admin-btn-sm--danger">{t('admin.products.delete')}</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        <div className="admin-empty-state">
                          <div className="admin-empty-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                          <p className="admin-empty-text">{t('admin.products.empty')}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
