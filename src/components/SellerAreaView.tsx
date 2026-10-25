import React, { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit3,
  ExternalLink,
  ChevronLeft,
  ArrowRight,
  DollarSign,
  Tag,
  ShieldCheck,
  FileText,
  Mail,
  Send,
  Sparkles
} from 'lucide-react';
import { User, Product, CustomerInquiry, Language, ProductApprovalStatus } from '../types';
import { api } from '../services/api';

interface SellerAreaViewProps {
  currentUser: User;
  onBackToDashboard: () => void;
  onNavigateToCatalog: () => void;
  currentLang: Language;
}

export const SellerAreaView: React.FC<SellerAreaViewProps> = ({
  currentUser,
  onBackToDashboard,
  onNavigateToCatalog,
  currentLang
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'quotes'>('products');

  // Submit new product modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Agricultural Commodities');
  const [description, setDescription] = useState('');
  const [retailPrice, setRetailPrice] = useState('120');
  const [unit, setUnit] = useState('kg');
  const [stock, setStock] = useState('500');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800');
  const [minQuantity, setMinQuantity] = useState('10');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isRtl = currentLang === 'fa' || currentLang === 'ps';

  const loadSellerData = async () => {
    setLoading(true);
    try {
      const prods = await api.getSellerProducts();
      setProducts(prods);

      const inqs = await api.getSellerInquiries();
      setInquiries(inqs);
    } catch (err) {
      console.error('Failed to load seller products/inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);
    try {
      const newProd = await api.createSellerProduct({
        name,
        category,
        description,
        retailPrice: parseFloat(retailPrice) || 0,
        currency: 'USD',
        unit,
        stock: parseInt(stock, 10) || 0,
        images: [imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
        wholesaleRules: {
          minQuantity: parseInt(minQuantity, 10) || 5,
          discountPercent: 10,
          requireQuote: true,
          termsNote: 'Standard wholesale terms. Commercial invoice provided upon shipment.',
          isConfirmed: true
        }
      });

      setProducts([newProd, ...products]);
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setStatusMessage('Product successfully submitted for HEKA LTD admin review! It will remain unpublished until approved.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit product');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status?: ProductApprovalStatus, isPublished?: boolean) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Approved {isPublished ? '(Published in Catalog)' : '(Unpublished)'}
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Pending Admin Review (Unpublished)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            Rejected by Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-500/15 text-gray-600 dark:text-gray-400 border border-gray-500/30">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen pb-16 text-[#172033] dark:text-[#E2E8F0]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-8 bg-white/70 dark:bg-[#101C35]/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToDashboard}
              className="p-2.5 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white/40 dark:border-white/10 transition-colors"
              title="Back to Customer Dashboard"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#101C35] dark:text-white flex items-center gap-2">
                  <Store className="w-7 h-7 text-[#C9A96E]" />
                  <span>{currentUser.businessProfile?.companyName || currentUser.name} – Seller Center</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Approved Seller
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Manage your product catalog submissions and incoming wholesale inquiries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#B69255] text-[#101C35] font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New Product</span>
            </button>
            <button
              onClick={onNavigateToCatalog}
              className="px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white/40 dark:border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Public Catalog</span>
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-white/60 dark:bg-[#101C35]/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'products'
              ? 'bg-[#101C35] text-white dark:bg-[#C9A96E] dark:text-[#101C35] shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Product Submissions ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'quotes'
              ? 'bg-[#101C35] text-white dark:bg-[#C9A96E] dark:text-[#101C35] shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Buyer Quotation Inquiries ({inquiries.length})</span>
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/70 dark:bg-[#101C35]/70 backdrop-blur-xl border border-white/40 dark:border-white/10">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h4 className="text-base font-bold text-[#101C35] dark:text-white">No Products Submitted Yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                As an approved seller, you can submit items for HEKA LTD admin review. Approved items appear in the public catalog.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#C9A96E] text-[#101C35] text-xs font-bold shadow-md hover:bg-[#B69255]"
              >
                Submit First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl overflow-hidden bg-white/80 dark:bg-[#101C35]/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm flex flex-col justify-between"
                >
                  <div className="relative h-48 w-full bg-gray-100 dark:bg-black/20">
                    <img
                      src={p.images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      {getStatusBadge(p.approvalStatus, p.isPublished)}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-[11px] font-semibold text-[#C9A96E] uppercase tracking-wider">{p.category}</div>
                      <h3 className="font-bold text-base text-[#101C35] dark:text-white mt-1">{p.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{p.description}</p>
                    </div>

                    {p.rejectionReason && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                        <span className="font-bold block mb-0.5">Admin Review Feedback:</span>
                        <p>{p.rejectionReason}</p>
                      </div>
                    )}

                    <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Price</span>
                        <span className="font-extrabold text-sm text-[#101C35] dark:text-white">${p.retailPrice} / {p.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Stock</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{p.stock} {p.unit}s</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Submitted</span>
                        <span className="text-gray-500">{p.submittedAt ? new Date(p.submittedAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quotes Tab */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/70 dark:bg-[#101C35]/70 backdrop-blur-xl border border-white/40 dark:border-white/10">
              <Mail className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h4 className="text-base font-bold text-[#101C35] dark:text-white">No Inquiries for Your Products Yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                When buyers request quotations for your approved products, inquiries will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-5 rounded-2xl bg-white/80 dark:bg-[#101C35]/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#101C35] dark:text-white">
                      Quote for: {inq.productName}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(inq.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1 mb-3">
                    <p><span className="text-gray-400">Buyer Name:</span> {inq.customerName}</p>
                    <p><span className="text-gray-400">Buyer Contact:</span> {inq.customerContact}</p>
                    <p><span className="text-gray-400">Requested Volume:</span> {inq.requestedQuantity || 1} units</p>
                    <p><span className="text-gray-400">Message:</span> "{inq.message}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Submit New Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 bg-white dark:bg-[#101C35] border border-white/20 shadow-2xl">
            <h3 className="text-lg font-bold text-[#101C35] dark:text-white mb-2">
              Submit Product for HEKA Review
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              All submitted products remain unpublished until an authorized HEKA LTD administrator reviews and approves them.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Badakhshan Lapis Lazuli Polished Sphere"
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C9A96E]"
                  >
                    <option value="Agricultural Commodities">Agricultural Commodities</option>
                    <option value="Dry Fruits & Nuts">Dry Fruits & Nuts</option>
                    <option value="Carpets & Rugs">Carpets & Rugs</option>
                    <option value="Gemstones & Minerals">Gemstones & Minerals</option>
                    <option value="Handicrafts & Textiles">Handicrafts & Textiles</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Price (USD) *</label>
                  <input
                    type="number"
                    required
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. kg, piece, gram, m2"
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Available Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the specifications, origin, purity, processing method..."
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#C9A96E] text-[#101C35] font-bold shadow-md hover:bg-[#B69255]"
                >
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
