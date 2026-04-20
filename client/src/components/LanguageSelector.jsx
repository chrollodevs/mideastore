import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage, SUPPORTED_LANGUAGES } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="lang-selector" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="btn btn-ghost" 
        style={{ padding: 'var(--space-8) var(--space-12)', display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit' }}
      >
        <span>{currentLang.label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: language === 'ar' ? 'auto' : 0,
          left: language === 'ar' ? 0 : 'auto',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          minWidth: '120px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '4px'
        }}>
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLanguage(lang.code); setIsOpen(false); }}
              style={{
                padding: '12px 16px',
                textAlign: language === 'ar' ? 'right' : 'left',
                background: language === lang.code ? '#f3f4f6' : 'transparent',
                border: 'none',
                width: '100%',
                cursor: 'pointer',
                fontWeight: language === lang.code ? '600' : '400',
                color: '#111827',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                 if (language !== lang.code) e.currentTarget.style.background = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                 if (language !== lang.code) e.currentTarget.style.background = 'transparent';
              }}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
