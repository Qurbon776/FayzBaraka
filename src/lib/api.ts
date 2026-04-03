import type { Category, Order, Product } from '../types';

interface RequestOptions extends RequestInit {
  telegramUserId?: number | null;
  telegramInitData?: string;
}

const createHeaders = (options: RequestOptions) => {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (options.telegramUserId) headers.set('x-telegram-user-id', String(options.telegramUserId));
  if (options.telegramInitData) headers.set('x-telegram-init-data', options.telegramInitData);
  return headers;
};

async function request<T>(url: string, options: RequestOptions = {}) {
  const response = await fetch(url, {
    ...options,
    headers: createHeaders(options),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'Request failed.' }));
    throw new Error(payload.message || 'Request failed.');
  }

  return response.json() as Promise<T>;
}

export const api = {
  getStore: () => request<{ categories: Category[]; products: Product[] }>('/api/store'),
  getOrders: (telegramUserId?: number | null, telegramInitData?: string) =>
    request<{ orders: Order[] }>('/api/admin/orders', {
      telegramUserId,
      telegramInitData,
    }),
  createOrder: (body: unknown) =>
    request<{ ok: true; orderId: string }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  createProduct: (product: Product, telegramUserId?: number | null, telegramInitData?: string) =>
    request<{ product: Product }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
      telegramUserId,
      telegramInitData,
    }),
  updateProduct: (id: string, product: Product, telegramUserId?: number | null, telegramInitData?: string) =>
    request<{ product: Product }>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
      telegramUserId,
      telegramInitData,
    }),
  deleteProduct: (id: string, telegramUserId?: number | null, telegramInitData?: string) =>
    request<{ ok: true }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
      telegramUserId,
      telegramInitData,
    }),
  createCategory: (category: Category, telegramUserId?: number | null, telegramInitData?: string) =>
    request<{ category: Category }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(category),
      telegramUserId,
      telegramInitData,
    }),
  deleteCategory: (id: string, telegramUserId?: number | null, telegramInitData?: string) =>
    request<{ ok: true }>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      telegramUserId,
      telegramInitData,
    }),
  uploadImage: async (file: File, telegramUserId?: number | null, telegramInitData?: string) => {
    const form = new FormData();
    form.append('image', file);

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        ...(telegramUserId ? { 'x-telegram-user-id': String(telegramUserId) } : {}),
        ...(telegramInitData ? { 'x-telegram-init-data': telegramInitData } : {}),
      },
      body: form,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ message: 'Upload failed.' }));
      throw new Error(payload.message || 'Upload failed.');
    }

    return response.json() as Promise<{ url: string }>;
  },
};
