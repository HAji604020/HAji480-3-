import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  User,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { SellerApplication, SellerStatus, Language } from '../types';
import { api } from '../services/api';

interface AdminSellerReviewProps {
  currentLang: Language;
}

export const AdminSellerReview: React.FC<AdminSellerReviewProps> = ({ currentLang }) => {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  // Rejection modal
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const isRtl = currentLang === 'fa' || currentLang === 'ps';

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminSellerApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load seller applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this merchant as a verified seller on HEKA LTD?')) return;
    setActionLoading(true);
    try {
      const updated = await api.reviewSellerApplication(id, 'approved', 'Approved by HEKA LTD Compliance');
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err: any) {
      alert(err.message || 'Failed to approve seller');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingAppId) return;
    setActionLoading(true);
    try {
      const updated = await api.reviewSellerApplication(
        rejectingAppId,
        'rejected',
        adminNotes || 'Trade credentials did not meet compliance criteria',
        rejectionReason || 'Incomplete documentation or unverified business registration'
      );
      setApplications((prev) => prev.map((a) => (a.id === rejectingAppId ? updated : a)));
      setRejectingAppId(null);
      setRejectionReason('');
      setAdminNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to reject seller');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (id: string) => {
    if (!confirm('Suspend seller permissions for this merchant?')) return;
    setActionLoading(true);
    try {
      const updated = await api.reviewSellerApplication(id, 'suspended', 'Suspended by Administrator');
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err: any) {
      alert(err.message || 'Failed to suspend seller');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (filter !== 'all' && app.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        app.businessName.toLowerCase().includes(q) ||
        app.applicantName.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.country.toLowerCase().includes(q)
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
            <ShieldCheck className="w-6 h-6 text-[#C9A96E]" />
            <h2 className="text-xl font-extrabold text-[#101C35] dark:text-white">
              Seller Applications & Compliance Review
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Authorize or reject merchant applications. Strictly governed: business accounts alone do NOT grant seller rights.
          </p>
        </div>

        <button
          onClick={loadApplications}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-1.5 p-1 rounded-xl bg-white/60 dark:bg-[#101C35]/60 backdrop-blur-md border border-white/40 dark:border-white/10 text-xs">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                filter === status
                  ? 'bg-[#101C35] text-white dark:bg-[#C9A96E] dark:text-[#101C35]'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business, applicant, country..."
            className="w-full px-3 py-2 pl-9 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-[#101C35]/60 backdrop-blur-xl border border-white/40 dark:border-white/10 text-xs text-gray-500">
          No seller applications found matching the selected filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-3xl bg-white/80 dark:bg-[#101C35]/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#101C35] dark:text-white">
                      {app.businessName}
                    </h3>
                    {app.status === 'pending' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending Review
                      </span>
                    )}
                    {app.status === 'approved' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                      </span>
                    )}
                    {app.status === 'rejected' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Rejected
                      </span>
                    )}
                    {app.status === 'suspended' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-500/15 text-gray-600 dark:text-gray-400 border border-gray-500/30">
                        Suspended
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {app.applicantName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {app.email}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {app.city}, {app.country}
                    </span>
                  </p>
                </div>

                {/* Review Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {app.status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(app.id)}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Seller</span>
                    </button>
                  )}

                  {app.status !== 'rejected' && (
                    <button
                      onClick={() => {
                        setRejectingAppId(app.id);
                        setRejectionReason('Insufficient documentation or verification mismatch');
                      }}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Application</span>
                    </button>
                  )}

                  {app.status === 'approved' && (
                    <button
                      onClick={() => handleSuspend(app.id)}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/20 text-xs font-bold transition-all"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>

              {/* Application Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-black/5 dark:bg-white/5 p-4 rounded-2xl mb-3">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Business Sector</span>
                  <span className="font-semibold">{app.businessType}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Product Categories</span>
                  <span className="font-semibold">{app.productCategories?.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Registration Number</span>
                  <span className="font-semibold">{app.registrationNumber || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Submission Date</span>
                  <span className="font-semibold">{new Date(app.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-xs text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-gray-400 block mb-0.5">Applicant Statement & Capacity:</span>
                <p className="italic">"{app.description}"</p>
              </div>

              {app.rejectionReason && (
                <div className="mt-3 p-3 rounded-xl bg-red-500/10 text-xs text-red-600 dark:text-red-400">
                  <span className="font-bold">Rejection Reason:</span> {app.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      {rejectingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-[#101C35] border border-white/20 shadow-2xl">
            <h3 className="text-base font-bold text-[#101C35] dark:text-white mb-2">
              Reject Seller Application
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Specify the reason for rejection. This will be visible to the applicant to allow them to rectify and re-apply.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Reason for Rejection *</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete export license or unverifiable company registry"
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Internal Admin Notes (Optional)</label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal reference notes"
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C9A96E]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setRejectingAppId(null)}
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
