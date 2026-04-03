export const formatPrice = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'UZS',
    maximumFractionDigits: 0,
  }).format(value);
