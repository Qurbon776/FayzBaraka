export type Language = 'uz' | 'ru';
export type ThemeMode = 'dark' | 'light';
export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: Record<Language, string>;
}

export interface Product {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  price: number;
  image: string;
  category: CategoryId;
  stock: number;
  discount?: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface TelegramLocation {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  horizontal_accuracy?: number | null;
}

export interface CheckoutForm {
  phone: string;
  deliveryType: 'delivery' | 'pickup';
  location?: TelegramLocation | null;
  notes: string;
}

export interface TranslationGroup {
  [key: string]: Record<Language, string>;
}
