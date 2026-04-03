import { useEffect, useMemo, useRef, useState } from 'react';
import { Globe2, MoonStar, Search, Settings2, ShoppingBag, Sparkles, SunMedium } from 'lucide-react';
import { AdminPanel } from './components/AdminPanel';
import { BrandLogo } from './components/BrandLogo';
import { CartSheet } from './components/CartSheet';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductCard } from './components/ProductCard';
import { defaultCategories, defaultProducts } from './data/defaults';
import { api } from './lib/api';
import { loadLanguage, saveLanguage } from './lib/storage';
import { t } from './lib/i18n';
import { requestTelegramLocation, useTelegram } from './lib/telegram';
import type { CartItem, Category, CheckoutForm, Language, Order, Product, ThemeMode } from './types';

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
  const { telegram, theme: telegramTheme, user, initData, isTelegram } = useTelegram();
  const [language, setLanguage] = useState<Language>(loadLanguage());
  const [themeMode, setThemeMode] = useState<ThemeMode>(telegramTheme);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>(initialCheckout);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [loadingStore, setLoadingStore] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftProduct, setDraftProduct] = useState<Product>(createEmptyProduct(defaultCategories));
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
    const loadStore = async () => {
      setLoadingStore(true);
      try {
        const store = await api.getStore();
        setCategories(store.categories);
        setProducts(store.products);
        setDraftProduct(createEmptyProduct(store.categories.length ? store.categories : defaultCategories));
      } catch {
        setCategories(defaultCategories);
        setProducts(defaultProducts);
        setDraftProduct(createEmptyProduct(defaultCategories));
      } finally {
        setLoadingStore(false);
      }
    };

    loadStore();
  }, []);

  const locale = language === 'uz' ? 'uz-UZ' : 'ru-RU';
  const hasAdminAccess = user ? adminIds.includes(user.id) : false;

  useEffect(() => {
    if (!adminOpen || !hasAdminAccess) return;

    api
      .getOrders(user?.id, initData)
      .then((response) => setOrders(response.orders))
      .catch(() => setOrders([]));
  }, [adminOpen, hasAdminAccess, initData, user?.id]);

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

  useEffect(() => {
    if (cartQuantity === 0) {
      setCartOpen(false);
    }
  }, [cartQuantity]);

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

  const handleSubmitOrder = async () => {
    if (!checkoutForm.phone.trim()) {
      telegram?.showAlert?.(t(language, 'phoneRequired')) ?? window.alert(t(language, 'phoneRequired'));
      return;
    }

    if (checkoutForm.deliveryType === 'delivery' && !checkoutForm.location) {
      telegram?.showAlert?.(t(language, 'locationRequired')) ?? window.alert(t(language, 'locationRequired'));
      return;
    }

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

    try {
      await api.createOrder(payload);
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Order failed.';
      telegram?.showAlert?.(message) ?? window.alert(message);
    }
  };

  const handleSaveProduct = async () => {
    const normalized: Product = {
      ...draftProduct,
      id: editingId ?? draftProduct.id ?? crypto.randomUUID(),
      category: draftProduct.category || categories[0]?.id || 'sweets',
    };

    if (!normalized.name.uz || !normalized.name.ru || !normalized.image) return;
    try {
      const exists = products.some((item) => item.id === normalized.id);
      if (exists) {
        await api.updateProduct(normalized.id, normalized, user?.id, initData);
        setProducts((current) => current.map((item) => (item.id === normalized.id ? normalized : item)));
      } else {
        await api.createProduct(normalized, user?.id, initData);
        setProducts((current) => [normalized, ...current]);
      }
      setEditingId(null);
      setDraftProduct(createEmptyProduct(categories));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save failed.';
      telegram?.showAlert?.(message) ?? window.alert(message);
    }
  };

  const handleSaveCategory = async () => {
    if (!draftCategory.id || !draftCategory.name.uz || !draftCategory.name.ru) return;
    if (categories.some((category) => category.id === draftCategory.id)) return;
    try {
      await api.createCategory(draftCategory, user?.id, initData);
      setCategories((current) => [...current, draftCategory]);
      setDraftCategory(createEmptyCategory());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Category save failed.';
      telegram?.showAlert?.(message) ?? window.alert(message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await api.deleteCategory(id, user?.id, initData);
      setCategories((current) => current.filter((category) => category.id !== id));
      setProducts((current) => current.filter((product) => product.category !== id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed.';
      telegram?.showAlert?.(message) ?? window.alert(message);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setDraftProduct(product);
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const uploaded = await api.uploadImage(file, user?.id, initData);
      setDraftProduct((current) => ({ ...current, image: uploaded.url }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.';
      telegram?.showAlert?.(message) ?? window.alert(message);
    }
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
      <div className="liquid-orb left-[-5rem] top-24 h-56 w-56 bg-emerald-200/12" />
      <div className="liquid-orb right-[-3rem] top-40 h-72 w-72 bg-white/8" />
      <div className="liquid-orb left-1/2 top-0 h-80 w-80 -translate-x-1/2 bg-emerald-300/10" />
      <div className="liquid-orb bottom-20 right-[-4rem] h-64 w-64 bg-teal-200/10" />

      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-32 pt-4 sm:px-5">
        <header className="glass-panel glass-soft rounded-[32px] border border-white/15 bg-[var(--surface)] p-4 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setLanguage((current) => (current === 'uz' ? 'ru' : 'uz'))} className="premium-ring inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[var(--text-primary)]">
              <Globe2 size={16} />
              {language.toUpperCase()}
            </button>

            <button type="button" onClick={revealAdmin} className="flex-1">
              <BrandLogo className="mx-auto h-auto w-[170px] max-w-full" />
            </button>

            <button type="button" onClick={() => setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'))} className="premium-ring inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[var(--text-primary)]">
              {themeMode === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
            </button>
          </div>

          <div className="glass-panel mt-5 overflow-hidden rounded-[34px] border border-white/10 bg-black/10 p-5">
            <div className="absolute inset-x-12 top-0 h-24 rounded-full bg-white/10 blur-3xl" />
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-300/12 px-3 py-1 text-xs uppercase tracking-[0.28em] text-emerald-100/80">
              <Sparkles size={12} />
              {t(language, 'heroBadge')}
            </div>
            <h1 className="mt-4 max-w-2xl font-display text-[2.85rem] leading-[0.95] text-[var(--text-primary)] sm:text-[3.4rem]">{t(language, 'heroTitle')}</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">{t(language, 'heroText')}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="glass-panel min-w-[220px] flex-1 rounded-[30px] border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Search size={16} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t(language, 'search')} className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
                </div>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{t(language, 'searchHint')}</p>
              </div>
              <button type="button" onClick={() => setAdminOpen(true)} className={`premium-ring hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm text-[var(--text-secondary)] md:inline-flex ${hasAdminAccess ? '' : 'invisible'}`}>
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
              {loadingStore ? '...' : filteredProducts.length} {t(language, 'results')}
            </h2>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loadingStore ? (
            <div className="glass-panel glass-soft rounded-[30px] border border-white/15 px-5 py-8 text-center sm:col-span-2 xl:col-span-3">
              <h3 className="font-display text-3xl text-[var(--text-primary)]">{t(language, 'loading')}</h3>
            </div>
          ) : null}
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} language={language} locale={locale} onAddToCart={handleAddToCart} />
          ))}
        </section>

        {!loadingStore && filteredProducts.length === 0 ? (
          <section className="glass-panel glass-soft mt-4 rounded-[30px] border border-white/15 px-5 py-8 text-center">
            <h3 className="font-display text-3xl text-[var(--text-primary)]">{t(language, 'noResultsTitle')}</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{t(language, 'noResultsText')}</p>
          </section>
        ) : null}
      </main>

      {cartQuantity > 0 ? (
        <button type="button" onClick={() => setCartOpen(true)} className="glass-panel glass-soft fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-[320px] -translate-x-1/2 items-center gap-3 rounded-[24px] border border-white/15 bg-[var(--surface-strong)] px-3.5 py-3 shadow-glow">
          <span className="premium-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-emerald-300 to-emerald-100 text-emerald-950">
            <ShoppingBag size={18} />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              {t(language, 'cart')}
            </span>
            <span className="mt-1 block text-sm font-semibold leading-none text-[var(--text-primary)]">
              {cartQuantity} {t(language, 'item')}
            </span>
          </span>
          <span className="text-right">
            <span className="block text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {t(language, 'total')}
            </span>
            <span className="mt-1 block text-sm font-bold text-[var(--text-primary)]">{cartTotal.toLocaleString(locale)} so‘m</span>
          </span>
        </button>
      ) : null}

      {cartQuantity > 0 ? (
        <CartSheet cart={cart} products={products} language={language} locale={locale} open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => setCheckoutOpen(true)} onQuantityChange={handleQuantityChange} />
      ) : null}

      <CheckoutModal
        cart={cart}
        products={products}
        language={language}
        locale={locale}
        open={checkoutOpen}
        isTelegram={isTelegram}
        form={checkoutForm}
        requestingLocation={requestingLocation}
        submitDisabled={!checkoutForm.phone.trim() || (checkoutForm.deliveryType === 'delivery' && !checkoutForm.location)}
        onClose={() => setCheckoutOpen(false)}
        onChange={(patch) => setCheckoutForm((current) => ({ ...current, ...patch }))}
        onRequestLocation={handleRequestLocation}
        onSubmit={handleSubmitOrder}
      />

      <AdminPanel
        open={adminOpen}
        hasAccess={hasAdminAccess}
        language={language}
        locale={locale}
        categories={categories}
        products={products}
        orders={orders}
        draftProduct={draftProduct}
        draftCategory={draftCategory}
        editingId={editingId}
        onClose={() => setAdminOpen(false)}
        onProductDraftChange={setDraftProduct}
        onCategoryDraftChange={setDraftCategory}
        onEditProduct={handleEditProduct}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={async (id) => {
          try {
            await api.deleteProduct(id, user?.id, initData);
            setProducts((current) => current.filter((product) => product.id !== id));
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Delete failed.';
            telegram?.showAlert?.(message) ?? window.alert(message);
          }
        }}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
}

export default App;
