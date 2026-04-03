import { ChevronRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatPrice } from '../lib/format';
import { t } from '../lib/i18n';
import type { CartItem, Language, Product } from '../types';

interface CartSheetProps {
  cart: CartItem[];
  products: Product[];
  language: Language;
  locale: string;
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onQuantityChange: (productId: string, nextQuantity: number) => void;
}

export function CartSheet({
  cart,
  products,
  language,
  locale,
  open,
  onClose,
  onCheckout,
  onQuantityChange,
}: CartSheetProps) {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const enrichedItems = cart
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      const price = product.discount
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

      return {
        ...item,
        product,
        lineTotal: price * item.quantity,
        unitPrice: price,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const total = enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <div className={`fixed inset-0 z-40 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`glass-panel glass-soft absolute bottom-3 left-3 right-3 max-h-[68vh] rounded-[28px] border border-white/15 bg-[var(--surface-strong)] p-4 shadow-2xl transition duration-300 ${open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/15" />
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/12 p-2 text-emerald-200">
              <ShoppingBag size={15} />
            </div>
            <div>
              <h2 className="font-display text-[1.75rem] leading-none text-[var(--text-primary)]">{t(language, 'cart')}</h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{cart.length} {t(language, 'item')}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-2.5 text-[var(--text-primary)]">
            <X size={16} />
          </button>
        </div>

        {enrichedItems.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-white/10 bg-black/10 p-8 text-center text-sm text-[var(--text-secondary)]">
            {t(language, 'emptyCart')}
          </div>
        ) : (
          <div className="space-y-2.5 overflow-y-auto pb-20">
            {enrichedItems.map((item) => (
              <div key={item.product.id} className="flex gap-3 rounded-[20px] border border-white/10 bg-white/5 p-2.5">
                <img src={item.product.image} alt={item.product.name[language]} className="h-14 w-14 rounded-[18px] object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="line-clamp-1 text-sm font-semibold text-[var(--text-primary)]">{item.product.name[language]}</h3>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{formatPrice(item.unitPrice, locale)}</p>
                    </div>
                    <button type="button" onClick={() => onQuantityChange(item.product.id, 0)} className="rounded-full bg-white/5 p-1.5 text-[var(--text-secondary)]">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/10 p-1">
                      <button type="button" onClick={() => onQuantityChange(item.product.id, item.quantity - 1)} className="rounded-full bg-white/5 p-1.5 text-[var(--text-primary)]">
                        <Minus size={13} />
                      </button>
                      <span className="min-w-7 text-center text-sm font-semibold text-[var(--text-primary)]">{item.quantity}</span>
                      <button type="button" onClick={() => onQuantityChange(item.product.id, item.quantity + 1)} className="rounded-full bg-white/5 p-1.5 text-[var(--text-primary)]">
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{formatPrice(item.lineTotal, locale)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="absolute inset-x-4 bottom-4">
          <div className="glass-panel flex items-center justify-between rounded-[22px] border border-white/10 bg-black/20 p-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{t(language, 'total')}</div>
              <div className="mt-1 text-lg font-bold text-[var(--text-primary)]">{formatPrice(total, locale)}</div>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              disabled={enrichedItems.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-100 px-4 py-3 text-sm font-bold text-emerald-950 transition hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {t(language, 'orderNow')}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
