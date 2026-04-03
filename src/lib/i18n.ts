import type { Language, TranslationGroup } from '../types';

export const translations: TranslationGroup = {
  heroBadge: {
    uz: 'Premium mini do‘kon',
    ru: 'Премиальный мини-магазин',
  },
  heroTitle: {
    uz: 'Sovg‘a qilishga arzigulik qiziqarli va foydali mahsulotlar',
    ru: 'Интересные и полезные товары, которые хочется дарить',
  },
  heroText: {
    uz: 'Telegram ichida tez, nafis va qulay buyurtma. Har bir mahsulot premium kayfiyatda taqdim etiladi.',
    ru: 'Быстрый и элегантный заказ прямо в Telegram. Каждый товар оформлен с премиальным настроением.',
  },
  cart: {
    uz: 'Savat',
    ru: 'Корзина',
  },
  item: {
    uz: 'mahsulot',
    ru: 'товар',
  },
  addToCart: {
    uz: 'Savatga qo‘shish',
    ru: 'В корзину',
  },
  orderNow: {
    uz: 'Buyurtma berish',
    ru: 'Оформить заказ',
  },
  checkout: {
    uz: 'Buyurtma',
    ru: 'Оформление',
  },
  phone: {
    uz: 'Telefon raqam',
    ru: 'Номер телефона',
  },
  deliveryType: {
    uz: 'Yetkazib berish turi',
    ru: 'Тип получения',
  },
  delivery: {
    uz: 'Yetkazib berish',
    ru: 'Доставка',
  },
  pickup: {
    uz: 'Olib ketish',
    ru: 'Самовывоз',
  },
  location: {
    uz: 'Joylashuv',
    ru: 'Локация',
  },
  requestLocation: {
    uz: 'Joylashuvni yuborish',
    ru: 'Отправить локацию',
  },
  locationReady: {
    uz: 'Joylashuv olindi',
    ru: 'Локация получена',
  },
  notes: {
    uz: 'Izoh',
    ru: 'Комментарий',
  },
  total: {
    uz: 'Jami',
    ru: 'Итого',
  },
  emptyCart: {
    uz: 'Savat hozircha bo‘sh',
    ru: 'Корзина пока пуста',
  },
  inStock: {
    uz: 'mavjud',
    ru: 'в наличии',
  },
  outOfStock: {
    uz: 'Tugagan',
    ru: 'Нет в наличии',
  },
  off: {
    uz: 'chegirma',
    ru: 'скидка',
  },
  hiddenAdmin: {
    uz: 'Admin panel',
    ru: 'Админ-панель',
  },
  adminProducts: {
    uz: 'Mahsulotlar',
    ru: 'Товары',
  },
  adminCategories: {
    uz: 'Kategoriyalar',
    ru: 'Категории',
  },
  save: {
    uz: 'Saqlash',
    ru: 'Сохранить',
  },
  delete: {
    uz: 'O‘chirish',
    ru: 'Удалить',
  },
  edit: {
    uz: 'Tahrirlash',
    ru: 'Редактировать',
  },
  addProduct: {
    uz: 'Mahsulot qo‘shish',
    ru: 'Добавить товар',
  },
  addCategory: {
    uz: 'Kategoriya qo‘shish',
    ru: 'Добавить категорию',
  },
  nameUz: {
    uz: 'Nomi (UZ)',
    ru: 'Название (UZ)',
  },
  nameRu: {
    uz: 'Nomi (RU)',
    ru: 'Название (RU)',
  },
  descriptionUz: {
    uz: 'Tavsif (UZ)',
    ru: 'Описание (UZ)',
  },
  descriptionRu: {
    uz: 'Tavsif (RU)',
    ru: 'Описание (RU)',
  },
  image: {
    uz: 'Rasm',
    ru: 'Изображение',
  },
  uploadImage: {
    uz: 'Rasm yuklash',
    ru: 'Загрузить изображение',
  },
  stock: {
    uz: 'Qoldiq',
    ru: 'Остаток',
  },
  discount: {
    uz: 'Chegirma %',
    ru: 'Скидка %',
  },
  submitOrder: {
    uz: 'Telegramga yuborish',
    ru: 'Отправить в Telegram',
  },
  orderFallback: {
    uz: 'Telegram ichida ochilganda buyurtma tg.sendData orqali yuboriladi.',
    ru: 'При открытии внутри Telegram заказ отправится через tg.sendData.',
  },
  noAccess: {
    uz: 'Admin ruxsati yo‘q',
    ru: 'Нет доступа администратора',
  },
  search: {
    uz: 'Mahsulot qidirish',
    ru: 'Поиск товаров',
  },
  searchHint: {
    uz: 'Nom yoki tavsif bo‘yicha toping',
    ru: 'Ищите по названию или описанию',
  },
  results: {
    uz: 'ta mahsulot',
    ru: 'товаров',
  },
  loading: {
    uz: 'Yuklanmoqda',
    ru: 'Загрузка',
  },
  adminOrders: {
    uz: 'Buyurtmalar',
    ru: 'Заказы',
  },
  emptyOrders: {
    uz: 'Hozircha buyurtmalar yo‘q',
    ru: 'Пока заказов нет',
  },
  customer: {
    uz: 'Mijoz',
    ru: 'Клиент',
  },
  createdAt: {
    uz: 'Sana',
    ru: 'Дата',
  },
  noResultsTitle: {
    uz: 'Hech narsa topilmadi',
    ru: 'Ничего не найдено',
  },
  noResultsText: {
    uz: 'Boshqa kalit so‘z bilan qidirib ko‘ring yoki matnni tozalang.',
    ru: 'Попробуйте другой запрос или очистите поиск.',
  },
  checkoutHint: {
    uz: 'Buyurtma yuborishdan oldin aloqa ma’lumotlarini to‘ldiring.',
    ru: 'Перед отправкой заполните контактные данные.',
  },
  phoneRequired: {
    uz: 'Telefon raqamini kiriting.',
    ru: 'Введите номер телефона.',
  },
  locationRequired: {
    uz: 'Yetkazib berish uchun joylashuvni yuboring.',
    ru: 'Для доставки отправьте локацию.',
  },
};

export const t = (language: Language, key: string) =>
  translations[key]?.[language] ?? key;
