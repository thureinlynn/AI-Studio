import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { EN_TRANSLATIONS, TranslationKey } from '../i18n/en';
import {
  Language,
  isValidLanguage,
  isLocaleLoaded,
  loadLocale,
  translateText,
  translateItemText,
} from '../i18n/loader';

export type { Language, TranslationKey };
export { translateItemText };
export const translations = EN_TRANSLATIONS;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  translateItem: (item: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('luukyone_lang');
      if (isValidLanguage(saved)) return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const [localeRevision, setLocaleRevision] = useState(0);

  useEffect(() => {
    if (language === 'en' || isLocaleLoaded(language)) return;
    let active = true;
    loadLocale(language)
      .then(() => {
        if (active) setLocaleRevision((r) => r + 1);
      })
      .catch(() => {
        // Fallback to English safely
      });
    return () => {
      active = false;
    };
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('luukyone_lang', lang);
    } catch {
      // ignore
    }
    if (lang !== 'en' && !isLocaleLoaded(lang)) {
      loadLocale(lang)
        .then(() => setLocaleRevision((r) => r + 1))
        .catch(() => {});
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'my' : 'en');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: TranslationKey): string => {
      void localeRevision;
      return translateText(key, language);
    },
    [language, localeRevision]
  );

  const translateItem = useCallback(
    (item: string): string => {
      void localeRevision;
      return translateItemText(item, language);
    },
    [language, localeRevision]
  );

  const contextValue = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t, translateItem }),
    [language, setLanguage, toggleLanguage, t, translateItem]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
