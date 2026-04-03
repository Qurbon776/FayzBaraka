import { useEffect, useMemo, useRef, useState } from 'react';
import { Globe2, MoonStar, Search, Settings2, ShoppingBag, Sparkles, SunMedium } from 'lucide-react';
import { AdminPanel } from './components/AdminPanel';
import { BrandLogo } from './components/BrandLogo';
import { CartSheet } from './components/CartSheet';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductCard } from './components/ProductCard';
import { loadCategories, loadLanguage, loadProducts, saveCategories, saveLanguage, saveProducts } from './lib/storage';
import { t } from './lib/i18n';
import { formatPrice } from './lib/format';
import { requestTelegramLocation, useTelegram } from './lib/telegram';
import type { CartItem, Category, CheckoutForm, Language, Product, ThemeMode } from './types';

const adminIds = import.meta.env.VITE_ADMIN_IDS?.split(',')
  .map((value: string) => Number(value.trim()))
  .filter(Boolean) ?? [];

const createEmptyProduct = (categories: Category[]): Product => ({
  id: crypto.randomUUID(),
  name: { uz: '', ru: '' },
  description: { uz: '', ru: '' },
  price: 0,
  image: '',
  category: categories[0]?.id ?? 'sweets',
  stock: 0,
});

const createEmptyCategory = (): Category => ({
  id: '',
  name: { uz: '', ru: '' },
});

const initialCheckout: CheckoutForm = {
  phone: '',
  deliveryType: 'delivery',
  location: null,
  notes: '',
};

function App() {
  const { telegram, theme: telegramTheme, user, isTelegram } = useTelegram();
  const [language, setLanguage] = useState<Language>(loadLanguage());
  const [themeMode, setThemeMode] = useState<ThemeMode>(telegramTheme);
  const [categories, setCategories] = useState<Category[]>(loadCategories());
  const [products, setProducts] = useState<Product[]>(loadProducts());
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>(initialCheckout);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftProduct, setDraftProduct] = useState<Product>(createEmptyProduct(categories));
  const [draftCategory, setDraftCategory] = useState<Category>(createEmptyCategory());
  const adminTapCountRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsSplashVisible(false), 1300);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setThemeMode(telegramTheme ?? 'dark');
  }, [telegramTheme]);

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  const locale = language === 'uz' ? 'uz-UZ' : 'ru-RU';
  const hasAdminAccess = user ? adminIds.includes(user.id) : false;

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    return products.filter((product) => {
      const matchSearch =
        !query ||
        product.name.uz.toLowerCase().includes(query) ||
        product.name.ru.toLowerCase().includes(query) ||
        product.description.uz.toLowerCase().includes(query) ||
        product.description.ru.toLowerCase().includes(query);
      return matchSearch;
    });
  }, [products, search]);

  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) return sum;
    const finalPrice = product.discount ? Math.round(product.price * (1 - product.discount / 100)) : product.price;
    return sum + finalPrice * item.quantity;
  }, 0);

  const handleAddToCart = (productId: string) => {
    telegram?.HapticFeedback?.impactOccurred?.('light');
    setCart((current) => {
      const product = products.find((entry) => entry.id === productId);
      if (!product || product.stock <= 0) return current;
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item,
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
  };

  const handleQuantityChange = (productId: string, nextQuantity: number) => {
    setCart((current) => {
      const product = products.find((entry) => entry.id === productId);
      if (!product) return current;
      if (nextQuantity <= 0) {
        return current.filter((item) => item.productId !== productId);
      }
      return current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(nextQuantity, product.stock) }
          : item,
      );
    });
  };

  const handleRequestLocation = async () => {
    setRequestingLocation(true);
    const location = await requestTelegramLocation();
    setRequestingLocation(false);
    if (location) {
      setCheckoutForm((current) => ({ ...current, location }));
      telegram?.HapticFeedback?.notificationOccurred?.('success');
      return;
    }
    telegram?.showAlert?.('Location access is unavailable.');
  };

  const handleSubmitOrder = () => {
    const items = cart.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      const price = product ? (product.discount ? Math.round(product.price * (1 - product.discount / 100)) : product.price) : 0;
      return {
        productId: item.productId,
        name: product?.name[language] ?? item.productId,
        quantity: item.quantity,
        unitPrice: price,
      };
    });

    const payload = {
      brand: 'FAYZ BARAKA',
      customer: {
        id: user?.id ?? null,
        name: [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim(),
        username: user?.username ?? null,
      },
      checkout: checkoutForm,
      items,
      total: cartTotal,
      createdAt: new Date().toISOString(),
    };

    if (telegram?.sendData) {
      telegram.sendData(JSON.stringify(payload));
      telegram.HapticFeedback?.notificationOccurred?.('success');
    } else {
      window.alert(`${t(language, 'orderFallback')}\n\n${JSON.stringify(payload, null, 2)}`);
    }

    setCart([]);
    setCheckoutForm(initialCheckout);
    setCheckoutOpen(false);
    setCartOpen(false);
  };

  const handleSaveProduct = () => {
    const normalized: Product = {
      ...draftProduct,
      id: editingId ?? draftProduct.id ?? crypto.randomUUID(),
      category: draftProduct.category || categories[0]?.id || 'sweets',
    };

    if (!normalized.name.uz || !normalized.name.ru || !normalized.image) return;
    setProducts((current) => {
      const exists = current.some((item) => item.id === normalized.id);
      return exists ? current.map((item) => (item.id === normalized.id ? normalized : item)) : [normalized, ...current];
    });
    setEditingId(null);
    setDraftProduct(createEmptyProduct(categories));
  };

  const handleSaveCategory = () => {
    if (!draftCategory.id || !draftCategory.name.uz || !draftCategory.name.ru) return;
    if (categories.some((category) => category.id === draftCategory.id)) return;
    setCategories((current) => [...current, draftCategory]);
    setDraftCategory(createEmptyCategory());
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((current) => current.filter((category) => category.id !== id));
    setProducts((current) => current.filter((product) => product.category !== id));
  };

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setDraftProduct(product);
  };

  const handleImageUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result;
      if (typeof imageData === 'string') {
        setDraftProduct((current) => ({ ...current, image: imageData }));
      }
    };
    reader.readAsDataURL(file);
  };

  const revealAdmin = () => {
    adminTapCountRef.current += 1;
    if (adminTapCountRef.current >= 7) {
      setAdminOpen(true);
      adminTapCountRef.current = 0;
    }
  };

  return (
    <div data-theme={themeMode} className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      {isSplashVisible ? (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-main)]">
          <div className="absolute inset-0 bg-emerald-mesh opacity-90" />
          <div className="absolute top-24 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />
          <BrandLogo className="relative z-10 w-[220px] animate-float" />
          <p className="relative z-10 mt-5 font-display text-3xl tracking-[0.3em] text-emerald-50/90">FAYZ BARAKA</p>
        </div>
      ) : null}

      <div className="fixed inset-0 -z-10 bg-emerald-mesh opacity-90" />
      <div className="fixed left-1/2 top-0 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/10 blur-3xl" />

      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-32 pt-4 sm:px-5">
        <header className="glass-panel glass-soft rounded-[32px] border border-white/15 bg-[var(--surface)] p-4 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setLanguage((current) => (current === 'uz' ? 'ru' : 'uz'))} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-primary)]">
              <Globe2 size={16} />
              {language.toUpperCase()}
            </button>

            <button type="button" onClick={revealAdmin} className="flex-1">
              <BrandLogo className="mx-auto h-auto w-[170px] max-w-full" />
            </button>

            <button type="button" onClick={() => setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'))} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-primary)]">
              {themeMode === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
            </button>
          </div>

          <div className="glass-panel rounded-[30px] border border-white/10 bg-black/10 p-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-emerald-100/80">
              <Sparkles size={12} />
              {t(language, 'heroBadge')}
            </div>
            <h1 className="mt-4 max-w-xl font-display text-5xl leading-tight text-[var(--text-primary)]">{t(language, 'heroTitle')}</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">{t(language, 'heroText')}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="glass-panel min-w-[220px] flex-1 rounded-[28px] border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Search size={16} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t(language, 'search')} className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
                </div>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{t(language, 'searchHint')}</p>
              </div>
              <button type="button" onClick={() => setAdminOpen(true)} className={`hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--text-secondary)] md:inline-flex ${hasAdminAccess ? '' : 'invisible'}`}>
                <Settings2 size={16} />
                {t(language, 'hiddenAdmin')}
              </button>
            </div>
          </div>
        </header>

        <section className="mt-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">{t(language, 'search')}</p>
            <h2 className="font-display text-3xl text-[var(--text-primary)]">
              {filteredProducts.length} {t(language, 'results')}
            </h2>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} language={language} locale={locale} onAddToCart={handleAddToCart} />
          ))}
        </section>
      </main>

      <button type="button" onClick={() => setCartOpen(true)} className="glass-panel glass-soft fixed bottom-5 left-1/2 z-30 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-full border border-white/15 bg-[var(--surface-strong)] px-5 py-4 shadow-glow">
        <span className="flex items-center gap-3">
          <span className="rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200 p-3 text-emerald-950">
            <ShoppingBag size={18} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-[var(--text-primary)]">{t(language, 'cart')}</span>
            <span className="block text-xs text-[var(--text-secondary)]">{cartQuantity} item</span>
          </span>
        </span>
        <span className="text-right">
          <span className="block text-xs text-[var(--text-secondary)]">{t(language, 'total')}</span>
          <span className="block text-base font-bold text-[var(--text-primary)]">{formatPrice(cartTotal, locale)}</span>
        </span>
      </button>

      <CartSheet cart={cart} products={products} language={language} locale={locale} open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => setCheckoutOpen(true)} onQuantityChange={handleQuantityChange} />

      <CheckoutModal
        cart={cart}
        products={products}
        language={language}
        locale={locale}
        open={checkoutOpen}
        isTelegram={isTelegram}
        form={checkoutForm}
        requestingLocation={requestingLocation}
        onClose={() => setCheckoutOpen(false)}
        onChange={(patch) => setCheckoutForm((current) => ({ ...current, ...patch }))}
        onRequestLocation={handleRequestLocation}
        onSubmit={handleSubmitOrder}
      />

      <AdminPanel
        open={adminOpen}
        hasAccess={hasAdminAccess}
        language={language}
        categories={categories}
        products={products}
        draftProduct={draftProduct}
        draftCategory={draftCategory}
        editingId={editingId}
        onClose={() => setAdminOpen(false)}
        onProductDraftChange={setDraftProduct}
        onCategoryDraftChange={setDraftCategory}
        onEditProduct={handleEditProduct}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={(id) => setProducts((current) => current.filter((product) => product.id !== id))}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
}

export default App;
