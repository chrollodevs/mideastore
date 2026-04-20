import { useState, useEffect, useRef, useMemo } from 'react';
import { fetchApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function AdminProducts() {
  const CATEGORY_OPTIONS = [
    { value: 'air_conditioner', label: 'Air Conditioner' },
    { value: 'refrigerator', label: 'Refrigerator' },
    { value: 'freezer', label: 'Freezer' },
    { value: 'washing_machine', label: 'Washing Machine' },
    { value: 'small_appliance', label: 'Small Appliance' }
  ];

  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', brand_id: '', category: 'small_appliance', price: '', stock: '', description: '', image_url: '', display_sections: []
  });
  const [uploading, setUploading] = useState(false);
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
    if (!window.confirm(t('admin.products.confirmDelete'))) return;
    try {
      await fetchApi(`/products/${id}`, { method: 'DELETE' });
      await loadData();
    } catch { alert(t('admin.products.deleteError')); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert(t('admin.products.fileTooLarge'));
      return;
    }

    const data = new FormData();
    data.append('image', file);
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      if (!res.ok) throw new Error('Upload failed');
      const result = await res.json();
      setFormData(prev => ({ ...prev, image_url: result.image_url }));
    } catch (err) {
      alert(t('admin.products.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const toggleSection = (sectionId) => {
    setFormData(prev => {
      const active = prev.display_sections.includes(sectionId);
      return {
        ...prev,
        display_sections: active 
          ? prev.display_sections.filter(id => id !== sectionId)
          : [...prev.display_sections, sectionId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        brand_id: parseInt(formData.brand_id, 10),
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock || 0, 10),
        description: formData.description,
        image_url: formData.image_url,
        display_sections: formData.display_sections
      };

      if (editId) {
        await fetchApi(`/products/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await fetchApi('/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      
      await loadData();
      resetForm();
    } catch (err) {
      alert(t('admin.products.saveError'));
    }
  };

  // Memoized Filter Logic
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
    'media': 'var(--brand-media)',
    'arcodim': 'var(--brand-arcodym)',
    's-challenge': 'var(--brand-s-challenge)'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-24)', paddingBottom: 'var(--space-96)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-48)' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{t('admin.products.title')}</h1>
          <p className="t-body" style={{ fontSize: '1.125rem' }}>{t('admin.products.subtitle')}</p>
        </div>
        {!isFormOpen && (
          <button className="btn btn-primary" onClick={() => setIsFormOpen(true)} style={{ fontSize: '1rem', padding: 'var(--space-16) var(--space-24)' }}>
            + {t('admin.products.create')}
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="surface-card" style={{ marginBottom: 'var(--space-48)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-32)', paddingBottom: 'var(--space-16)', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{editId ? t('admin.products.editTitle') : t('admin.products.newTitle')}</h2>
            <button className="btn btn-ghost" onClick={resetForm}>{t('admin.products.cancel')}</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-48)' }}>
            
            {/* SECTION 1: BASIC INFO */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-16)', color: 'var(--text-primary)' }}>{t('admin.products.section1')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-24)', background: '#F9FAFB', padding: 'var(--space-24)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="t-label" style={{ display: 'block', marginBottom: '8px' }}>{t('admin.products.name')}</label>
                  <input required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Plaque chauffante..." />
                </div>
                <div>
                  <label className="t-label" style={{ display: 'block', marginBottom: '8px' }}>{t('admin.products.brand')}</label>
                  <select required className="input-field" value={formData.brand_id} onChange={e => setFormData({...formData, brand_id: e.target.value})}>
                    <option value="">{t('admin.products.select')}</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="t-label" style={{ display: 'block', marginBottom: '8px' }}>{t('admin.products.category')}</label>
                  <select required className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="t-label" style={{ display: 'block', marginBottom: '8px' }}>{t('admin.products.stock')}</label>
                  <input type="number" className="input-field" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="10" />
                </div>
                <div>
                  <label className="t-label" style={{ display: 'block', marginBottom: '8px' }}>{t('admin.products.price')}</label>
                  <input required type="number" step="0.01" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="15000" />
                </div>
              </div>
            </div>

            {/* SECTION 2: VISUALS */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-16)', color: 'var(--text-primary)' }}>{t('admin.products.section2')}</h3>
              <div style={{ background: '#F9FAFB', padding: 'var(--space-24)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: '200px', height: '200px', border: '2px dashed var(--border-strong)', borderRadius: '12px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                >
                  {uploading && <div style={{ position: 'absolute', inset: 0, display:'flex', alignItems: 'center', justifyContent:'center', background:'rgba(255,255,255,0.8)', zIndex: 10, fontWeight: 600 }}>{t('admin.products.uploading')}</div>}
                  {formData.image_url ? (
                    <img src={`http://localhost:3001${formData.image_url}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Preview" />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <span style={{ fontSize: '2rem', display:'block', marginBottom:'8px' }}>📷</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t('admin.products.uploadPrompt')}</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} />
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>{t('admin.products.uploadHint')}</p>
              </div>
            </div>

            {/* SECTION 3: PLACEMENT */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-16)', color: 'var(--text-primary)' }}>{t('admin.products.section3')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#F9FAFB', padding: 'var(--space-24)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('admin.products.placementHint')}</p>
                {placementOptions.map(opt => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.display_sections.includes(opt.id)}
                      onChange={() => toggleSection(opt.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SECTION 4: DESCRIPTION */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-16)', color: 'var(--text-primary)' }}>{t('admin.products.section4')}</h3>
              <div style={{ background: '#F9FAFB', padding: 'var(--space-24)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <textarea rows="6" className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="{t('admin.products.descriptionHint')}"></textarea>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-24)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)' }}>
               <button type="button" onClick={resetForm} className="btn btn-ghost" style={{ fontSize:'1.125rem' }}>{t('admin.products.cancel')}</button>
               <button disabled={uploading} type="submit" className="btn btn-primary" style={{ fontSize:'1.125rem' }}>
                 {editId ? t('admin.products.save') : t('admin.products.publish')}
               </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* SEARCH & FILTERS */}
          <div className="surface-card" style={{ padding: 'var(--space-16) var(--space-24)', marginBottom: 'var(--space-24)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-16)', alignItems: 'center' }}>
            <div style={{ flex: '1 1 300px' }}>
              <input type="text" className="input-field" placeholder="{t('admin.products.search')}" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <select className="input-field" style={{ flex: '0 0 200px' }} value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
               <option value="all">{t('admin.products.allBrands')}</option>
               {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="input-field" style={{ flex: '0 0 220px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
               <option value="all">{t('admin.products.allCategories')}</option>
               {CATEGORY_OPTIONS.map((category) => (
                 <option key={category.value} value={category.value}>{category.label}</option>
               ))}
            </select>
            <select className="input-field" style={{ flex: '0 0 250px' }} value={filterSection} onChange={e => setFilterSection(e.target.value)}>
               <option value="all">{t('admin.products.allPlacements')}</option>
               {placementOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>

          {/* STRUCTURED TABLE VIEW */}
          <div className="surface-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-strong)' }}>
                  <tr>
                    <th style={{ padding: 'var(--space-16) var(--space-24)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t('admin.products.tableProduct')}</th>
                    <th style={{ padding: 'var(--space-16) var(--space-24)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t('admin.products.tableBrand')}</th>
                    <th style={{ padding: 'var(--space-16) var(--space-24)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t('admin.products.category')}</th>
                    <th style={{ padding: 'var(--space-16) var(--space-24)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t('admin.products.tablePlacements')}</th>
                    <th style={{ padding: 'var(--space-16) var(--space-24)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>{t('admin.products.tablePriceStock')}</th>
                    <th style={{ padding: 'var(--space-16) var(--space-24)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>{t('admin.products.tableActions')}</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {filteredProducts.map(p => {
                    const parsedTags = Array.isArray(p.display_sections) ? p.display_sections : [];
                    const isLowStock = p.stock > 0 && p.stock <= 5;
                    const isOutOfStock = p.stock <= 0;

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color var(--transition-fast)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor='#F9FAFB'} onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                        <td style={{ padding: 'var(--space-16) var(--space-24)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                               {p.image_url ? <img src={`http://localhost:3001${p.image_url}`} alt="..." style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '1.25rem', color: '#94A3B8' }}>📦</span>}
                            </div>
                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: 'var(--space-16) var(--space-24)' }}>
                           <span style={{ 
                             display: 'inline-block', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, 
                             color: '#fff', background: brandColorMap[p.brand_slug] || '#64748B' 
                           }}>
                             {p.brand_name}
                           </span>
                        </td>
                        <td style={{ padding: 'var(--space-16) var(--space-24)' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {CATEGORY_OPTIONS.find((category) => category.value === (p.category || 'small_appliance'))?.label || (p.category || 'small_appliance')}
                          </span>
                        </td>
                        <td style={{ padding: 'var(--space-16) var(--space-24)' }}>
                          {parsedTags.length === 0 ? <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Standard</span> : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {parsedTags.map(t => (
                                <span key={t} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: '#E0F2FE', color: '#0369A1', fontSize: '0.75rem', fontWeight: 600 }}>
                                  {placementOptions.find(o => o.id === t)?.label.split(' (')[0] || t}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: 'var(--space-16) var(--space-24)', textAlign: 'right' }}>
                           <div style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>{p.price.toLocaleString()} DZD</div>
                           {isOutOfStock ? (
                             <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: '#FEE2E2', color: '#B91C1C', fontSize: '0.75rem', fontWeight: 700 }}>{t('admin.products.outOfStock')}</span>
                           ) : isLowStock ? (
                             <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: '#FEF3C7', color: '#D97706', fontSize: '0.75rem', fontWeight: 700 }}>{t('admin.products.lowStock')} ({p.stock})</span>
                           ) : (
                             <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: '#D1FAE5', color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>{t('admin.products.inStock')} ({p.stock})</span>
                           )}
                        </td>
                        <td style={{ padding: 'var(--space-16) var(--space-24)', textAlign: 'center' }}>
                          <button onClick={() => handleOpenEdit(p)} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '0.875rem', marginRight: '8px' }}>{t('admin.products.edit')}</button>
                          <button onClick={() => handleDelete(p.id)} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: '0.875rem', color: '#EF4444' }}>{t('admin.products.delete')}</button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: 'var(--space-48)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '1.125rem' }}>
                        {t('admin.products.empty')}
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
