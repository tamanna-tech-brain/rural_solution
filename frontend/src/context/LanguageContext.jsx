/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, DICTIONARIES } from './translations';
import { translatePage } from '../api/googleTranslate';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('lang') || 'en';
  });

  const changeLanguage = async (code) => {
    if (!code) return;
    setCurrentLang(code);
    localStorage.setItem('lang', code);
    document.documentElement.lang = code;
    document.documentElement.dir = code === 'ur' ? 'rtl' : 'ltr';

    // Broadcast event for legacy listeners
    window.dispatchEvent(new CustomEvent('krishiLangChanged', { detail: { lang: code } }));

    // Deep translate remaining dynamic content
    try {
      await translatePage(code);
    } catch (err) {
      console.warn('Deep page translation notice:', err.message);
    }
  };

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ur' ? 'rtl' : 'ltr';
    if (currentLang !== 'en') {
      const timer = setTimeout(() => {
        translatePage(currentLang).catch(() => {});
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentLang]);

  // Reactive translation helper
  const t = (key, fallback = '') => {
    const langDict = DICTIONARIES[currentLang];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const defaultDict = DICTIONARIES.en;
    if (defaultDict && defaultDict[key]) {
      return defaultDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        changeLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      currentLang: localStorage.getItem('lang') || 'en',
      changeLanguage: () => {},
      t: (k, fb) => fb || k,
      languages: SUPPORTED_LANGUAGES,
    };
  }
  return context;
};

export default LanguageContext;
