import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
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
        className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`glass-panel glass-soft absolute bottom-0 left-0 right-0 max-h-[86vh] rounded-t-[34px] border border-white/15 bg-[var(--surface-strong)] p-5 shadow-2xl transition duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/15" />
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-200">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="font-display text-3xl text-[var(--text-primary)]">{t(language, 'cart')}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{cart.length} item</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-3 text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        {enrichedItems.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-white/10 bg-black/10 p-8 text-center text-sm text-[var(--text-secondary)]">
            {t(language, 'emptyCart')}
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pb-28">
            {enrichedItems.map((item) => (
              <div key={item.product.id} className="flex gap-3 rounded-[26px] border border-white/10 bg-white/5 p-3">
                <img src={item.product.image} alt={item.product.name[language]} className="h-20 w-20 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{item.product.name[language]}</h3>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">{formatPrice(item.unitPrice, locale)}</p>
                    </div>
                    <button type="button" onClick={() => onQuantityChange(item.product.id, 0)} className="rounded-full bg-white/5 p-2 text-[var(--text-secondary)]">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/10 p-1">
                      <button type="button" onClick={() => onQuantityChange(item.product.id, item.quantity - 1)} className="rounded-full bg-white/5 p-2 text-[var(--text-primary)]">
                        <Minus size={14} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-[var(--text-primary)]">{item.quantity}</span>
                      <button type="button" onClick={() => onQuantityChange(item.product.id, item.quantity + 1)} className="rounded-full bg-white/5 p-2 text-[var(--text-primary)]">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-base font-bold text-[var(--text-primary)]">{formatPrice(item.lineTotal, locale)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="glass-panel absolute inset-x-5 bottom-5 rounded-[28px] border border-white/10 bg-black/20 p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">{t(language, 'total')}</span>
            <span className="text-2xl font-bold text-[var(--text-primary)]">{formatPrice(total, locale)}</span>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            disabled={enrichedItems.length === 0}
            className="w-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200 px-5 py-4 text-sm font-extrabold text-emerald-950 transition hover:scale-[1.01] active:scale-95 disabled:opacity-50"
          >
            {t(language, 'orderNow')}
          </button>
        </div>
      </aside>
    </div>
  );
}
