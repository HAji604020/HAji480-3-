import React, { useState, useEffect } from 'react';
import {
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Store,
  DollarSign,
  RefreshCw,
  Search,
  AlertCircle
} from 'lucide-react';
import { Product, ProductApprovalStatus, Language } from '../types';
import { api } from '../services/api';

interface AdminProductReviewProps {
  currentLang: Language;
}

export const AdminProductReview: React.FC<AdminProductReviewProps> = ({ currentLang }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending_review' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  // Rejection state
  const [rejectingProdId, setRejectingProdId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const isRtl = currentLang === 'fa' || currentLang === 'ps';

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminProductReviews();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load review products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this seller product and immediately publish to the HEKA public catalog?')) return;
    setActionLoading(true);
    try {
      const updated = await api.reviewProductSubmission(id, 'approved');
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err: any) {
      alert(err.message || 'Failed to approve product');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingProdId) return;
    setActionLoading(true);
    try {
      const updated = await api.reviewProductSubmission(
        rejectingProdId,
        'rejected',
        rejectionReason || 'Specifications or imagery did not meet HEKA LTD quality standards'
      );
      setProducts((prev) => prev.map((p) => (p.id === rejectingProdId ? updated : p)));
      setRejectingProdId(null);
      setRejectionReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to reject product');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = products.filter((prod) => {
    if (filter !== 'all' && prod.approvalStatus !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        prod.name.toLowerCase().includes(q) ||
        (prod.sellerName && prod.sellerName.toLowerCase().includes(q)) ||
        prod.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-[#172033] dark:text-[#E2E8F0]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/70 dark:bg-[#101C35]/70 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-[#C9A96E]" />
            <h2 className="text-xl font-extrabold text-[#101C35] dark:text-white">
              Seller Product Submissions & Quality Review
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Review submissions from approved merchants. Seller products are unpublished until approved by HEKA LTD.
          </p>
        </div>

        <button
          onClick={loadProducts}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-1.5 p-1 rounded-xl bg-white/60 dark:bg-[#101C35]/60 backdrop-blur-md border border-white/40 dark:border-white/10 text-xs">
          {(['all', 'pending_review', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                filter === status
                  ? 'bg-[#101C35] text-white dark:bg-[#C9A96E] dark:text-[#101C35]'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {status === 'pending_review' ? 'Pending Review' : status}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, seller, category..."
            className="w-full px-3 py-2 pl-9 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-[#101C35]/60 backdrop-blur-xl border border-white/40 dark:border-white/10 text-xs text-gray-500">
          No products found matching review criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((prod) => (
            <div
              key={prod.id}
              className="rounded-3xl overflow-hidden bg-white/80 dark:bg-[#101C35]/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm flex flex-col justify-between"
            >
              <div className="relative h-48 w-full bg-gray-100 dark:bg-black/20">
                <img
                  src={prod.images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
                  alt={prod.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    prod.approvalStatus === 'approved' ? 'bg-emerald-500 text-white' :
                    prod.approvalStatus === 'pending_review' ? 'bg-amber-500 text-black' :
                    'bg-red-500 text-white'
                  }`}>
                    {prod.approvalStatus === 'approved' ? 'Approved (Published)' : prod.approvalStatus === 'pending_review' ? 'Pending Review (Unpublished)' : 'Rejected'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Store className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      {prod.sellerName || 'HEKA Official'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[#101C35] dark:text-white">{prod.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{prod.description}</p>
                </div>

                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Price</span>
                    <span className="font-bold text-[#101C35] dark:text-white">${prod.retailPrice} / {prod.unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Stock</span>
                    <span className="font-semibold">{prod.stock} {prod.unit}s</span>
                  </div>
                </div>

                {prod.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 text-xs text-red-600 dark:text-red-400">
                    <span className="font-bold">Rejection Reason:</span> {prod.rejectionReason}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex gap-2">
                  {prod.approvalStatus !== 'approved' && (
                    <button
                      onClick={() => handleApprove(prod.id)}
                      disabled={actionLoading}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>
                  )}

                  {prod.approvalStatus !== 'rejected' && (
                    <button
                      onClick={() => {
                        setRejectingProdId(prod.id);
                        setRejectionReason('Image resolution or specifications do not meet export catalog guidelines');
                      }}
                      disabled={actionLoading}
                      className="flex-1 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingProdId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-[#101C35] border border-white/20 shadow-2xl">
            <h3 className="text-base font-bold text-[#101C35] dark:text-white mb-2">
              Reject Product Submission
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Specify what needs revision. The merchant will see this feedback in their Seller Center.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please provide high-resolution unwatermarked photos and detailed laboratory grade documentation"
              className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E] mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingProdId(null)}
                className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {actionLoading ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
