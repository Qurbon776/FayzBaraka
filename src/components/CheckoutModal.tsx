import { LoaderCircle, MapPinned, SendHorizonal, X } from 'lucide-react';
import { formatPrice } from '../lib/format';
import { t } from '../lib/i18n';
import type { CartItem, CheckoutForm, Language, Product } from '../types';

interface CheckoutModalProps {
  cart: CartItem[];
  products: Product[];
  language: Language;
  locale: string;
  open: boolean;
  isTelegram: boolean;
  form: CheckoutForm;
  requestingLocation: boolean;
  submitDisabled: boolean;
  onClose: () => void;
  onChange: (patch: Partial<CheckoutForm>) => void;
  onRequestLocation: () => void;
  onSubmit: () => void;
}

export function CheckoutModal({
  cart,
  products,
  language,
  locale,
  open,
  isTelegram,
  form,
  requestingLocation,
  submitDisabled,
  onClose,
  onChange,
  onRequestLocation,
  onSubmit,
}: CheckoutModalProps) {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const total = cart.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    if (!product) return sum;
    const price = product.discount
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className={`fixed inset-0 z-50 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div
        className={`glass-panel glass-soft absolute inset-x-3 top-1/2 max-h-[90vh] -translate-y-1/2 overflow-y-auto rounded-[34px] border border-white/15 bg-[var(--surface-strong)] p-5 shadow-2xl transition duration-300 ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/75">{t(language, 'checkout')}</p>
            <h2 className="font-display text-4xl text-[var(--text-primary)]">{t(language, 'orderNow')}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-3 text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--text-secondary)]">
            {t(language, 'checkoutHint')}
          </div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">{t(language, 'phone')}</span>
            <input
              value={form.phone}
              onChange={(event) => onChange({ phone: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-emerald-300/35"
              placeholder="+998 90 123 45 67"
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">{t(language, 'deliveryType')}</span>
            <div className="grid grid-cols-2 gap-3">
              {(['delivery', 'pickup'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange({ deliveryType: type, location: type === 'pickup' ? null : form.location })}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    form.deliveryType === type
                      ? 'border-emerald-300/40 bg-emerald-300/12 text-emerald-100'
                      : 'border-white/10 bg-black/10 text-[var(--text-secondary)]'
                  }`}
                >
                  {t(language, type)}
                </button>
              ))}
            </div>
          </div>

          {form.deliveryType === 'delivery' ? (
            <div className="glass-panel rounded-[26px] border border-white/10 bg-black/10 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-100">
                  <MapPinned size={18} />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{t(language, 'location')}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {form.location ? t(language, 'locationReady') : t(language, 'requestLocation')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onRequestLocation}
                className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-3 text-sm font-semibold text-[var(--text-primary)]"
              >
                {requestingLocation ? <LoaderCircle className="animate-spin" size={16} /> : <MapPinned size={16} />}
                {t(language, 'requestLocation')}
              </button>

              {form.location ? (
                <p className="mt-3 text-sm text-emerald-100">
                  {form.location.latitude.toFixed(5)}, {form.location.longitude.toFixed(5)}
                </p>
              ) : null}
            </div>
          ) : null}

          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">{t(language, 'notes')}</span>
            <textarea
              value={form.notes}
              onChange={(event) => onChange({ notes: event.target.value })}
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-emerald-300/35"
            />
          </label>
        </div>

        <div className="glass-panel mt-6 rounded-[28px] border border-white/10 bg-black/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">{t(language, 'total')}</span>
            <span className="text-2xl font-bold text-[var(--text-primary)]">{formatPrice(total, locale)}</span>
          </div>
          {!isTelegram ? <p className="mb-3 text-sm text-[var(--text-secondary)]">{t(language, 'orderFallback')}</p> : null}
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200 px-5 py-4 text-sm font-extrabold text-emerald-950 transition hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SendHorizonal size={16} />
            {t(language, 'submitOrder')}
          </button>
        </div>
      </div>
    </div>
  );
}
