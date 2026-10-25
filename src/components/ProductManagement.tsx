import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  DollarSign,
  Layers,
  Percent,
  Truck,
  Award,
  Check,
  X,
  UploadCloud,
  FileText
} from 'lucide-react';
import { Product, Company, Language, ProductPackageSize, ProductAttribute } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

interface ProductManagementProps {
  company: Company;
  products: Product[];
  onRefresh: () => void;
  currentLang: Language;
  initialIsAdding?: boolean;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  company,
  products,
  onRefresh,
  currentLang,
  initialIsAdding = false,
}) => {
  const t = translations[currentLang];
  const [isEditing, setIsEditing] = useState(initialIsAdding);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form helpers
  const handleAddNew = () => {
    setEditingProduct({
      companyId: company.id,
      name: '',
      nameFa: '',
      category: 'General',
      description: '',
      descriptionFa: '',
      images: ['https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&auto=format&fit=crop&q=80'],
      unit: 'unit',
      retailPrice: 20,
      currency: company.currency || '$',
      stock: 10,
      packageSizes: [],
      attributes: [],
      wholesaleRules: {
        minQuantity: 10,
        discountPercent: 10,
        requireQuote: false,
        termsNote: '',
        isConfirmed: true
      },
      shippingDetails: {
        fee: 'Courier delivery available.',
        transitTime: '24-48 hours',
        coverage: 'Domestic & Regional',
        isConfirmed: true
      },
      qualityInfo: {
        grade: 'Premium Quality Verified',
        isConfirmed: true
      },
      isPublished: true
    });
    setIsEditing(true);
  };

  const handleEdit = (prod: Product) => {
    setEditingProduct(JSON.parse(JSON.stringify(prod)));
    setIsEditing(true);
  };

  const handleTogglePublish = async (prod: Product) => {
    try {
      await api.updateProduct(prod.id, { isPublished: !prod.isPublished });
      onRefresh();
    } catch (err: any) {
      alert(`Publish toggle failed: ${err.message}`);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await api.deleteProduct(productId);
      onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    setIsSaving(true);
    try {
      if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, editingProduct);
      } else {
        await api.createProduct({
          ...editingProduct,
          companyId: company.id
        });
      }
      setIsEditing(false);
      setEditingProduct(null);
      onRefresh();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Package size helpers
  const handleAddPackageSize = () => {
    if (!editingProduct) return;
    const sizes = editingProduct.packageSizes || [];
    const newSize: ProductPackageSize = {
      id: `size_${Date.now()}`,
      name: 'Standard Option',
      weightOrSize: '1 unit',
      price: editingProduct.retailPrice || 10,
      stock: 10,
      isAvailable: true
    };
    setEditingProduct({
      ...editingProduct,
      packageSizes: [...sizes, newSize]
    });
  };

  const handleRemovePackageSize = (id: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      packageSizes: (editingProduct.packageSizes || []).filter((s) => s.id !== id)
    });
  };

  // Attribute helpers
  const handleAddAttribute = () => {
    if (!editingProduct) return;
    const attrs = editingProduct.attributes || [];
    setEditingProduct({
      ...editingProduct,
      attributes: [...attrs, { key: 'Specification', value: 'Confirmed' }]
    });
  };

  const handleRemoveAttribute = (idx: number) => {
    if (!editingProduct) return;
    const attrs = [...(editingProduct.attributes || [])];
    attrs.splice(idx, 1);
    setEditingProduct({
      ...editingProduct,
      attributes: attrs
    });
  };

  // Image helpers
  const handleAddImageUrl = () => {
    if (!editingProduct) return;
    const promptUrl = window.prompt('Enter Image URL:');
    if (promptUrl && promptUrl.startsWith('http')) {
      setEditingProduct({
        ...editingProduct,
        images: [...(editingProduct.images || []), promptUrl]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar with Frosted Glass */}
      <div className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-[#101C35] dark:text-white">{t.manageProductsTitle}</h2>
            <span className="glass-badge-gold text-[10px] font-bold px-2 py-0.5 rounded-full">
              {products.length} Items
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.manageProductsDesc}</p>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#101C35] to-[#1c2e56] hover:from-[#192b52] hover:to-[#223a6c] dark:from-[#C9A96E] dark:to-[#d4b984] text-white dark:text-[#101C35] transition flex items-center gap-2 shadow-md cursor-pointer active:scale-95 border border-[#C9A96E]/30"
        >
          <Plus className="w-4 h-4 text-[#C9A96E] dark:text-[#101C35]" />
          <span>{t.addNewProductBtn}</span>
        </button>
      </div>

      {/* Product List Table / Grid with Frosted Glass Surfaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((prod) => (
          <div
            key={prod.id}
            className={`glass-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${
              prod.isPublished
                ? 'border-white/80 dark:border-white/10'
                : 'border-amber-400/50 bg-amber-500/5'
            }`}
          >
            <div>
              {/* Product Card Image */}
              <div className="relative aspect-16/9 bg-slate-100/50 dark:bg-slate-800/40 overflow-hidden">
                <img
                  src={prod.images[0] || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&auto=format&fit=crop&q=80'}
                  alt={prod.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-2.5 start-2.5">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-md ${
                      prod.isPublished
                        ? 'bg-emerald-600/90 text-white border border-emerald-400/40'
                        : 'bg-amber-600/90 text-white border border-amber-400/40'
                    }`}
                  >
                    {prod.isPublished ? t.publishedStatus : t.privateStatus}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{prod.name}</h3>
                    {prod.nameFa && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{prod.nameFa}</p>}
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-300/40 dark:border-white/10 shrink-0">
                    {prod.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white/60 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/10 backdrop-blur-xs">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block">{t.retailPrice}</span>
                    <strong className="text-slate-900 dark:text-white font-mono text-sm">
                      {prod.currency}{prod.retailPrice} <span className="text-xs font-normal text-slate-500">/{prod.unit}</span>
                    </strong>
                  </div>
                  <div className="bg-white/60 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/10 backdrop-blur-xs">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block">{t.stockLabel}</span>
                    <strong className={prod.stock > 0 ? 'text-emerald-600 dark:text-emerald-400 font-mono text-sm' : 'text-rose-600 dark:text-rose-400 font-mono text-sm'}>
                      {prod.stock} {prod.unit}s
                    </strong>
                  </div>
                </div>

                {prod.packageSizes && prod.packageSizes.length > 0 && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    Variants: {prod.packageSizes.map((s) => s.name).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-3 bg-white/40 dark:bg-slate-800/30 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs gap-2">
              <button
                type="button"
                onClick={() => handleTogglePublish(prod)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer backdrop-blur-xs ${
                  prod.isPublished
                    ? 'text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
                    : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10'
                }`}
                title={prod.isPublished ? 'Unpublish from Public Store' : 'Publish to Public Store'}
              >
                {prod.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                <span>{prod.isPublished ? t.unpublishProduct : t.publishProduct}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleEdit(prod)}
                  className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition cursor-pointer"
                  title="Edit Product"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(prod.id)}
                  className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Delete Product"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Modal for Create / Edit Product with Glassmorphism */}
      {isEditing && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101C35]/60 dark:bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="glass-modal rounded-3xl max-w-2xl w-full my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#101C35] to-[#1c2e56] dark:from-[#C9A96E]/20 dark:to-[#C9A96E]/5 flex items-center justify-center border border-[#C9A96E]/30">
                  <Package className="w-4 h-4 text-[#C9A96E]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#101C35] dark:text-white text-base">
                    {editingProduct.id ? t.editProduct : t.addNewProductBtn}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">HEKA LTD Trading Catalog Specification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              {/* Product Name (En & Fa) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.productNameLabel} (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.productNameLabel} (فارسی / دری)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.nameFa || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameFa: e.target.value })}
                    className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.categoryLabel}</label>
                  <input
                    type="text"
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.unitLabel}</label>
                  <input
                    type="text"
                    value={editingProduct.unit || 'piece'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Retail Price, Currency, and Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.retailPriceLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.retailPrice ?? ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, retailPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                  <select
                    value={editingProduct.currency || '$'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, currency: e.target.value })}
                    className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-medium cursor-pointer"
                  >
                    <option value="$" className="dark:bg-[#101C35]">$ (USD)</option>
                    <option value="AFN" className="dark:bg-[#101C35]">AFN (افغانی)</option>
                    <option value="€" className="dark:bg-[#101C35]">€ (EUR)</option>
                    <option value="AED" className="dark:bg-[#101C35]">AED (درهم)</option>
                    <option value="TRY" className="dark:bg-[#101C35]">TRY (لیره)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t.stockLabel}</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stock ?? 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })
                    }
                    className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-mono font-medium"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl resize-none font-medium"
                />
              </div>

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>{t.imagesLabel}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="text-xs text-[#C9A96E] hover:text-[#b39255] font-bold cursor-pointer"
                  >
                    {t.addImageUrl}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(editingProduct.images || []).map((imgUrl, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl border border-white/60 dark:border-white/10 overflow-hidden group shadow-xs">
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingProduct.images || []).filter((_, idx) => idx !== i);
                          setEditingProduct({ ...editingProduct, images: updated });
                        }}
                        className="absolute inset-0 bg-rose-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Package Sizes / Variants Section */}
              <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10 p-3.5 space-y-2.5 backdrop-blur-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>{t.packageSizesTitle}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPackageSize}
                    className="text-xs text-[#C9A96E] font-bold hover:underline cursor-pointer"
                  >
                    {t.addPackageSize}
                  </button>
                </div>
                {(editingProduct.packageSizes || []).map((size, idx) => (
                  <div key={size.id} className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200/60 dark:border-white/10 text-xs">
                    <input
                      type="text"
                      placeholder="Size Name (e.g. 10g or M)"
                      value={size.name}
                      onChange={(e) => {
                        const sizes = [...(editingProduct.packageSizes || [])];
                        sizes[idx].name = e.target.value;
                        setEditingProduct({ ...editingProduct, packageSizes: sizes });
                      }}
                      className="glass-input flex-1 px-2.5 py-1 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Weight/Size"
                      value={size.weightOrSize}
                      onChange={(e) => {
                        const sizes = [...(editingProduct.packageSizes || [])];
                        sizes[idx].weightOrSize = e.target.value;
                        setEditingProduct({ ...editingProduct, packageSizes: sizes });
                      }}
                      className="glass-input w-24 px-2.5 py-1 rounded-lg font-mono"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={size.price}
                      onChange={(e) => {
                        const sizes = [...(editingProduct.packageSizes || [])];
                        sizes[idx].price = parseFloat(e.target.value) || 0;
                        setEditingProduct({ ...editingProduct, packageSizes: sizes });
                      }}
                      className="glass-input w-20 px-2.5 py-1 rounded-lg font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePackageSize(size.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Wholesale Rules */}
              <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10 p-3.5 space-y-2.5 backdrop-blur-xs">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.wholesaleSectionTitle}</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">{t.minQuantity}</label>
                    <input
                      type="number"
                      min="1"
                      value={editingProduct.wholesaleRules?.minQuantity || 10}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          wholesaleRules: {
                            ...(editingProduct.wholesaleRules || { minQuantity: 10, discountPercent: 0, requireQuote: false, isConfirmed: true, termsNote: '' }),
                            minQuantity: parseInt(e.target.value, 10) || 1
                          }
                        })
                      }
                      className="glass-input w-full text-xs px-3 py-2 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">{t.discountPercent}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingProduct.wholesaleRules?.discountPercent || 0}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          wholesaleRules: {
                            ...(editingProduct.wholesaleRules || { minQuantity: 10, requireQuote: false, isConfirmed: true, termsNote: '' }),
                            discountPercent: parseFloat(e.target.value) || 0
                          }
                        })
                      }
                      className="glass-input w-full text-xs px-3 py-2 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Published Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 backdrop-blur-xs">
                <div>
                  <span className="font-bold text-xs text-slate-800 dark:text-white block">Catalog Visibility</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {editingProduct.isPublished ? t.publishedStatus : t.privateStatus}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={!!editingProduct.isPublished}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-[#101C35] focus:ring-[#C9A96E] cursor-pointer accent-[#C9A96E]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#101C35] to-[#1c2e56] hover:from-[#192b52] hover:to-[#223a6c] dark:from-[#C9A96E] dark:to-[#d4b984] text-white dark:text-[#101C35] transition shadow-md cursor-pointer active:scale-95 border border-[#C9A96E]/30"
                >
                  {isSaving ? 'Saving...' : t.saveProductBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
