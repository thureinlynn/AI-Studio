import { EN_TRANSLATIONS, TranslationKey } from './en';

export type Language = 'en' | 'my' | 'zh' | 'ar' | 'es' | 'de' | 'fr' | 'it' | 'ja' | 'ko' | 'hi' | 'th';

export const VALID_LANGUAGES: readonly Language[] = [
  'en',
  'my',
  'zh',
  'ar',
  'es',
  'de',
  'fr',
  'it',
  'ja',
  'ko',
  'hi',
  'th',
] as const;

type LocaleModule = {
  default: Partial<Record<TranslationKey, string>>;
  ITEM_TRANSLATIONS?: Record<string, string>;
};

const localeCache = new Map<Language, Partial<Record<TranslationKey, string>>>([
  ['en', EN_TRANSLATIONS],
]);

const itemLocaleCache = new Map<Language, Record<string, string>>();
const pendingLoads = new Map<Language, Promise<void>>();

export function isValidLanguage(value: string | null | undefined): value is Language {
  return Boolean(value && (VALID_LANGUAGES as readonly string[]).includes(value));
}

export function isLocaleLoaded(language: Language): boolean {
  return localeCache.has(language);
}

async function importLocaleModule(language: Exclude<Language, 'en'>): Promise<LocaleModule> {
  switch (language) {
    case 'my':
      return import('./locales/my');
    case 'zh':
      return import('./locales/zh');
    case 'ar':
      return import('./locales/ar');
    case 'es':
      return import('./locales/es');
    case 'de':
      return import('./locales/de');
    case 'fr':
      return import('./locales/fr');
    case 'it':
      return import('./locales/it');
    case 'ja':
      return import('./locales/ja');
    case 'ko':
      return import('./locales/ko');
    case 'hi':
      return import('./locales/hi');
    case 'th':
      return import('./locales/th');
  }
}

export async function loadLocale(language: Language): Promise<void> {
  if (language === 'en' || localeCache.has(language)) {
    return;
  }

  const existing = pendingLoads.get(language);
  if (existing) {
    return existing;
  }

  const loadPromise = importLocaleModule(language)
    .then((mod) => {
      if (mod?.default) {
        localeCache.set(language, mod.default);
      }
      if (mod?.ITEM_TRANSLATIONS) {
        itemLocaleCache.set(language, mod.ITEM_TRANSLATIONS);
      }
    })
    .finally(() => {
      pendingLoads.delete(language);
    });

  pendingLoads.set(language, loadPromise);
  return loadPromise;
}

export function translateText(key: TranslationKey | string, language: Language): string {
  const dict = localeCache.get(language);
  if (dict && Object.prototype.hasOwnProperty.call(dict, key)) {
    const val = dict[key as TranslationKey];
    if (val) return val;
  }
  if (Object.prototype.hasOwnProperty.call(EN_TRANSLATIONS, key)) {
    return EN_TRANSLATIONS[key as TranslationKey];
  }
  return String(key);
}

export function translateItemText(item: string, language: Language): string {
  const dict = itemLocaleCache.get(language);
  if (dict && dict[item]) {
    return dict[item];
  }
  return item;
}
