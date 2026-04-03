import { defaultCategories, defaultProducts } from '../data/defaults';
import type { Category, Product } from '../types';

const PRODUCTS_KEY = 'fayz-baraka-products';
const CATEGORIES_KEY = 'fayz-baraka-categories';
const LANGUAGE_KEY = 'fayz-baraka-language';

const parse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const loadProducts = () =>
  parse<Product[]>(window.localStorage.getItem(PRODUCTS_KEY), defaultProducts);

export const saveProducts = (products: Product[]) => {
  window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const loadCategories = () =>
  parse<Category[]>(window.localStorage.getItem(CATEGORIES_KEY), defaultCategories);

export const saveCategories = (categories: Category[]) => {
  window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const loadLanguage = () =>
  parse<'uz' | 'ru'>(window.localStorage.getItem(LANGUAGE_KEY), 'uz');

export const saveLanguage = (language: 'uz' | 'ru') => {
  window.localStorage.setItem(LANGUAGE_KEY, JSON.stringify(language));
};
