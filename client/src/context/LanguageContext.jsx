import { createContext, useState, useContext, useCallback, useEffect } from 'react';
import enTranslations from '../i18n/en.json';
import frTranslations from '../i18n/fr.json';
import arTranslations from '../i18n/ar.json';

const LanguageContext = createContext();

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'ar', label: 'AR', name: 'العربية' },
];

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  // Apply RTL when Arabic is selected
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  }, []);

  // Translation helper — resolves nested keys (e.g. "navbar.home")
  const t = useCallback((key) => {
    let translations;
    if (language === 'ar') translations = arTranslations;
    else if (language === 'fr') translations = frTranslations;
    else translations = enTranslations;

    // Helper to traverse object
    const resolvePath = (obj, path) => path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);

    let value = resolvePath(translations, key);
    if (value !== undefined) return value;

    // Fallback to English
    value = resolvePath(enTranslations, key);
    return value !== undefined ? value : key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
