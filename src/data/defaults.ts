import type { Category, Product } from '../types';

export const defaultCategories: Category[] = [
  {
    id: 'sweets',
    name: {
      uz: 'Shirinliklar',
      ru: 'Сладости',
    },
  },
  {
    id: 'toys',
    name: {
      uz: 'O‘yinchoqlar',
      ru: 'Игрушки',
    },
  },
];

export const defaultProducts: Product[] = [
  {
    id: 'emerald-truffles',
    name: {
      uz: 'Emerald truffle to‘plami',
      ru: 'Набор Emerald Truffle',
    },
    description: {
      uz: 'Pista, qora shokolad va oltin bezakli premium qo‘lbola truffle.',
      ru: 'Премиальные ручные трюфели с фисташкой, тёмным шоколадом и золотым декором.',
    },
    price: 89000,
    image: '/assets/products/emerald-truffles.svg',
    category: 'sweets',
    stock: 18,
    discount: 10,
  },
  {
    id: 'gift-box-deluxe',
    name: {
      uz: 'Deluxe sovg‘a qutisi',
      ru: 'Подарочный набор Deluxe',
    },
    description: {
      uz: 'Bayram uchun karamel, draje va yumshoq marshmallow aralashmasi.',
      ru: 'Праздничный набор с карамелью, драже и нежным маршмеллоу.',
    },
    price: 129000,
    image: '/assets/products/gift-box.svg',
    category: 'sweets',
    stock: 9,
    discount: 12,
  },
  {
    id: 'caramel-cupcakes',
    name: {
      uz: 'Karamelli mini desertlar',
      ru: 'Карамельные мини-десерты',
    },
    description: {
      uz: 'Sovg‘a uchun qulay, yumshoq krem va karamel notali desert set.',
      ru: 'Нежный сет десертов с кремом и карамельными нотами.',
    },
    price: 76000,
    image: '/assets/products/caramel-cupcakes.svg',
    category: 'sweets',
    stock: 14,
  },
  {
    id: 'bunny-plush',
    name: {
      uz: 'Velvet quyoncha',
      ru: 'Плюшевый зайчик Velvet',
    },
    description: {
      uz: 'Yumshoq premium matodan tikilgan, sovg‘abop quyoncha o‘yinchoq.',
      ru: 'Подарочный плюшевый зайчик из мягкой премиальной ткани.',
    },
    price: 149000,
    image: '/assets/products/bunny-plush.svg',
    category: 'toys',
    stock: 6,
  },
  {
    id: 'wooden-bear',
    name: {
      uz: 'Wood Bear dekor o‘yinchog‘i',
      ru: 'Игрушка Wood Bear',
    },
    description: {
      uz: 'Tabiiy ranglarda, bolalar xonasi uchun nafis ayiqcha.',
      ru: 'Элегантный мишка в натуральных оттенках для детской комнаты.',
    },
    price: 119000,
    image: '/assets/products/wooden-bear.svg',
    category: 'toys',
    stock: 8,
  },
  {
    id: 'star-rattle',
    name: {
      uz: 'Golden Star rattle',
      ru: 'Погремушка Golden Star',
    },
    description: {
      uz: 'Minimal uslubdagi, yengil va xavfsiz premium rattle.',
      ru: 'Лёгкая и безопасная премиальная погремушка в минималистичном стиле.',
    },
    price: 68000,
    image: '/assets/products/star-rattle.svg',
    category: 'toys',
    stock: 12,
    discount: 8,
  },
  {
    id: 'anti-stress-tasbeh',
    name: {
      uz: 'Antistress tasbeh',
      ru: 'Антистресс перекидные чётки',
    },
    description: {
      uz: 'Uslubli dizayndagi, qo‘lni band qiluvchi va tinchlantiruvchi antistress tasbeh.',
      ru: 'Стильные антистресс-перекидные чётки, которые успокаивают и увлекают.',
    },
    price: 79000,
    image: '/assets/products/tasbeh-1.webp',
    images: [
      '/assets/products/tasbeh-1.webp',
      '/assets/products/tasbeh-2.webp',
      '/assets/products/tasbeh-3.webp',
      '/assets/products/tasbeh-4.webp'
    ],
    category: 'toys',
    stock: 15,
    discount: 5,
  },
];

export const productMediaById: Record<string, string[]> = {
  'anti-stress-tasbeh': [
    '/assets/products/tasbeh-1.webp',
    '/assets/products/tasbeh-2.webp',
    '/assets/products/tasbeh-3.webp',
    '/assets/products/tasbeh-4.webp',
  ],
};
