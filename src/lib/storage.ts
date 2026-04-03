const LANGUAGE_KEY = 'fayz-baraka-language';
const STORAGE_VERSION_KEY = 'fayz-baraka-storage-version';
const PRODUCTS_KEY = 'fayz-baraka-products';
const CATEGORIES_KEY = 'fayz-baraka-categories';
const STORAGE_VERSION = '3';

const parse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const loadLanguage = () =>
  parse<'uz' | 'ru'>(window.localStorage.getItem(LANGUAGE_KEY), 'uz');

export const saveLanguage = (language: 'uz' | 'ru') => {
  window.localStorage.setItem(LANGUAGE_KEY, JSON.stringify(language));
};

export const ensureStorageVersion = () => {
  const currentVersion = window.localStorage.getItem(STORAGE_VERSION_KEY);
  if (currentVersion === STORAGE_VERSION) return;

  window.localStorage.removeItem(PRODUCTS_KEY);
  window.localStorage.removeItem(CATEGORIES_KEY);
  window.localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
};
