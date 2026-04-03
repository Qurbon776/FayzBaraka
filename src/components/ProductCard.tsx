import { ShoppingBag, Sparkles } from 'lucide-react';
import { formatPrice } from '../lib/format';
import { t } from '../lib/i18n';
import type { Language, Product } from '../types';

interface ProductCardProps {
  language: Language;
  locale: string;
  product: Product;
  onAddToCart: (productId: string) => void;
}

export function ProductCard({
  language,
  locale,
  product,
  onAddToCart,
}: ProductCardProps) {
  const finalPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <article className="glass-panel glass-soft group relative overflow-hidden rounded-[28px] border border-white/15 bg-white/8 p-3 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-emerald-200/20 hover:shadow-glow">
      <div className="absolute inset-x-6 top-0 h-24 bg-gradient-to-b from-emerald-200/10 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/5">
        <img
          src={product.image}
          alt={product.name[language]}
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.discount ? (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-emerald-200/20 bg-black/30 px-3 py-1 text-xs font-semibold text-emerald-100 backdrop-blur-md">
            <Sparkles size={14} />
            {product.discount}% {t(language, 'off')}
          </div>
        ) : null}
      </div>

      <div className="relative space-y-4 px-1 pb-1 pt-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-2xl font-semibold leading-none text-[var(--text-primary)]">
              {product.name[language]}
            </h3>
            <div className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
              {product.stock > 0 ? `${product.stock} ${t(language, 'inStock')}` : t(language, 'outOfStock')}
            </div>
          </div>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {product.description[language]}
          </p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            {product.discount ? (
              <div className="text-sm text-[var(--text-muted)] line-through">
                {formatPrice(product.price, locale)}
              </div>
            ) : null}
            <div className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {formatPrice(finalPrice, locale)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(product.id)}
            disabled={product.stock === 0}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-gradient-to-r from-emerald-500/90 to-teal-400/90 px-4 py-3 text-sm font-bold text-emerald-950 shadow-lg transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag size={16} />
            {t(language, 'addToCart')}
          </button>
        </div>
      </div>
    </article>
  );
}
