import { Edit3, PackagePlus, ShieldCheck, Trash2, X } from 'lucide-react';
import { t } from '../lib/i18n';
import type { Category, Language, Product } from '../types';

interface AdminPanelProps {
  open: boolean;
  hasAccess: boolean;
  language: Language;
  categories: Category[];
  products: Product[];
  draftProduct: Product;
  draftCategory: Category;
  editingId: string | null;
  onClose: () => void;
  onProductDraftChange: (draft: Product) => void;
  onCategoryDraftChange: (draft: Category) => void;
  onEditProduct: (product: Product) => void;
  onSaveProduct: () => void;
  onDeleteProduct: (id: string) => void;
  onSaveCategory: () => void;
  onDeleteCategory: (id: string) => void;
  onImageUpload: (file: File | null) => void;
}

export function AdminPanel({
  open,
  hasAccess,
  language,
  categories,
  products,
  draftProduct,
  draftCategory,
  editingId,
  onClose,
  onProductDraftChange,
  onCategoryDraftChange,
  onEditProduct,
  onSaveProduct,
  onDeleteProduct,
  onSaveCategory,
  onDeleteCategory,
  onImageUpload,
}: AdminPanelProps) {
  return (
    <div className={`fixed inset-0 z-[60] transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <section
        className={`glass-panel glass-soft absolute inset-x-3 bottom-3 top-3 overflow-y-auto rounded-[34px] border border-white/15 bg-[var(--surface-strong)] p-5 shadow-2xl transition duration-300 ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-100">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-200/75">{t(language, 'hiddenAdmin')}</p>
              <h2 className="font-display text-4xl text-[var(--text-primary)]">{t(language, 'hiddenAdmin')}</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-3 text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        {!hasAccess ? (
          <div className="rounded-[26px] border border-white/10 bg-black/10 p-6 text-sm text-[var(--text-secondary)]">
            {t(language, 'noAccess')}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="glass-panel rounded-[30px] border border-white/10 bg-black/10 p-5">
              <div className="mb-4 flex items-center gap-3">
                <PackagePlus size={18} className="text-emerald-100" />
                <h3 className="font-display text-3xl text-[var(--text-primary)]">{t(language, 'adminProducts')}</h3>
              </div>
              <div className="grid gap-3">
                <Input label={t(language, 'nameUz')} value={draftProduct.name.uz} onChange={(value) => onProductDraftChange({ ...draftProduct, name: { ...draftProduct.name, uz: value } })} />
                <Input label={t(language, 'nameRu')} value={draftProduct.name.ru} onChange={(value) => onProductDraftChange({ ...draftProduct, name: { ...draftProduct.name, ru: value } })} />
                <Textarea label={t(language, 'descriptionUz')} value={draftProduct.description.uz} onChange={(value) => onProductDraftChange({ ...draftProduct, description: { ...draftProduct.description, uz: value } })} />
                <Textarea label={t(language, 'descriptionRu')} value={draftProduct.description.ru} onChange={(value) => onProductDraftChange({ ...draftProduct, description: { ...draftProduct.description, ru: value } })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Price" type="number" value={String(draftProduct.price)} onChange={(value) => onProductDraftChange({ ...draftProduct, price: Number(value) || 0 })} />
                  <Input label={t(language, 'stock')} type="number" value={String(draftProduct.stock)} onChange={(value) => onProductDraftChange({ ...draftProduct, stock: Number(value) || 0 })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Category" value={draftProduct.category} options={categories.map((category) => ({ value: category.id, label: category.name[language] }))} onChange={(value) => onProductDraftChange({ ...draftProduct, category: value })} />
                  <Input label={t(language, 'discount')} type="number" value={String(draftProduct.discount ?? 0)} onChange={(value) => onProductDraftChange({ ...draftProduct, discount: Number(value) || undefined })} />
                </div>
                <Input label={`${t(language, 'image')} URL`} value={draftProduct.image} onChange={(value) => onProductDraftChange({ ...draftProduct, image: value })} />
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">{t(language, 'uploadImage')}</span>
                  <input type="file" accept="image/*" onChange={(event) => onImageUpload(event.target.files?.[0] ?? null)} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-[var(--text-secondary)]" />
                </label>
                {draftProduct.image ? <img src={draftProduct.image} alt="Preview" className="h-40 w-full rounded-[24px] object-cover" /> : null}
                <button type="button" onClick={onSaveProduct} className="rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200 px-5 py-4 text-sm font-extrabold text-emerald-950">
                  {editingId ? t(language, 'save') : t(language, 'addProduct')}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-panel rounded-[30px] border border-white/10 bg-black/10 p-5">
                <h3 className="mb-4 font-display text-3xl text-[var(--text-primary)]">{t(language, 'adminCategories')}</h3>
                <div className="grid gap-3">
                  <Input label={t(language, 'nameUz')} value={draftCategory.name.uz} onChange={(value) => onCategoryDraftChange({ ...draftCategory, name: { ...draftCategory.name, uz: value } })} />
                  <Input label={t(language, 'nameRu')} value={draftCategory.name.ru} onChange={(value) => onCategoryDraftChange({ ...draftCategory, name: { ...draftCategory.name, ru: value } })} />
                  <Input label="Slug" value={draftCategory.id} onChange={(value) => onCategoryDraftChange({ ...draftCategory, id: value })} />
                  <button type="button" onClick={onSaveCategory} className="rounded-full border border-white/10 bg-white/10 px-5 py-4 text-sm font-bold text-[var(--text-primary)]">
                    {t(language, 'addCategory')}
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{category.name[language]}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{category.id}</p>
                      </div>
                      {!['sweets', 'toys'].includes(category.id) ? (
                        <button type="button" onClick={() => onDeleteCategory(category.id)} className="rounded-full bg-white/5 p-2 text-[var(--text-secondary)]">
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-[30px] border border-white/10 bg-black/10 p-5">
                <h3 className="mb-4 font-display text-3xl text-[var(--text-primary)]">{t(language, 'adminProducts')}</h3>
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex gap-3 rounded-[24px] border border-white/10 bg-white/5 p-3">
                      <img src={product.image} alt={product.name[language]} className="h-20 w-20 rounded-2xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">{product.name[language]}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{product.stock} | {product.price}</p>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => onEditProduct(product)} className="rounded-full bg-white/5 p-2 text-[var(--text-secondary)]">
                              <Edit3 size={16} />
                            </button>
                            <button type="button" onClick={() => onDeleteProduct(product.id)} className="rounded-full bg-white/5 p-2 text-[var(--text-secondary)]">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

function Input({ label, value, onChange, type = 'text' }: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-emerald-300/35" />
    </label>
  );
}

function Textarea({ label, value, onChange }: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-emerald-300/35" />
    </label>
  );
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-emerald-300/35">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
