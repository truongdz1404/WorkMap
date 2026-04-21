import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import enTranslations from './translations/en.json';
import viTranslations from './translations/vi.json';
import type { Language } from '../types';

type Dictionary = typeof viTranslations;

type TranslateParams = Record<string, string | number>;

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: TranslateParams) => string;
  formatRelativeTime: (timestamp: number) => string;
}

const dictionaries: Record<Language, Dictionary> = {
  vi: viTranslations,
  en: enTranslations,
};

const I18nContext = createContext<I18nContextValue | null>(null);

const isEnglishPath = (pathname: string) => pathname === '/en' || pathname.startsWith('/en/');

const getLanguageFromPath = (pathname: string): Language => (isEnglishPath(pathname) ? 'en' : 'vi');

const removeEnglishPrefix = (pathname: string) => {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3);
  return pathname;
};

const applyParams = (template: string, params?: TranslateParams) => {
  if (!params) return template;
  return Object.entries(params).reduce((result, [name, value]) => {
    return result.replaceAll(`{${name}}`, String(value));
  }, template);
};

const resolveKey = (dictionary: Dictionary, key: string): string | undefined => {
  const segments = key.split('.');
  let current: unknown = dictionary;

  for (const segment of segments) {
    if (typeof current !== 'object' || current === null || !(segment in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === 'string' ? current : undefined;
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => getLanguageFromPath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => {
      setLanguageState(getLanguageFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    const currentPath = window.location.pathname;
    const cleanPath = removeEnglishPrefix(currentPath);
    const nextPath = nextLanguage === 'en'
      ? `/en${cleanPath === '/' ? '' : cleanPath}`
      : cleanPath;

    if (nextPath !== currentPath) {
      window.history.pushState({}, '', `${nextPath}${window.location.search}${window.location.hash}`);
    }

    setLanguageState(nextLanguage);
  }, []);

  const t = useCallback((key: string, params?: TranslateParams) => {
    const dictionary = dictionaries[language];
    const fallback = dictionaries.vi;
    const raw = resolveKey(dictionary, key) ?? resolveKey(fallback, key) ?? key;
    return applyParams(raw, params);
  }, [language]);

  const formatRelativeTimeValue = useCallback((timestamp: number) => {
    return formatDistanceToNow(timestamp, {
      addSuffix: true,
      locale: language === 'vi' ? vi : enUS,
    });
  }, [language]);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t,
    formatRelativeTime: formatRelativeTimeValue,
  }), [language, setLanguage, t, formatRelativeTimeValue]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
