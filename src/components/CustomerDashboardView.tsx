import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Building2,
  Package,
  FileText,
  Bookmark,
  Store,
  Settings,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  ExternalLink,
  ChevronRight,
  LogOut,
  Edit3,
  Save,
  Trash2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { User, Product, CustomerInquiry, Language, AccountType, SellerStatus, SellerApplication } from '../types';
import { api } from '../services/api';

interface CustomerDashboardViewProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToSellerArea?: () => void;
  currentLang: Language;
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({
  currentUser,
  onUpdateUser,
  onLogout,
  onNavigateToCatalog,
  onNavigateToSellerArea,
  currentLang
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inquiries' | 'orders' | 'saved' | 'seller' | 'settings'>('overview');
  const [loading, setLoading] = useState(false);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [sellerApp, setSellerApp] = useState<SellerApplication | null>(null);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editAccountType, setEditAccountType] = useState<AccountType>(currentUser.accountType || 'personal');
  const [editFullName, setEditFullName] = useState(currentUser.personalProfile?.fullName || currentUser.name || '');
  const [editPhone, setEditPhone] = useState(currentUser.personalProfile?.phone || currentUser.businessProfile?.businessPhone || currentUser.phone || '');
  const [editCountry, setEditCountry] = useState(currentUser.personalProfile?.country || currentUser.businessProfile?.country || currentUser.country || '');
  const [editCity, setEditCity] = useState(currentUser.personalProfile?.city || currentUser.businessProfile?.city || currentUser.city || '');
  
  // Business fields
  const [editCompanyName, setEditCompanyName] = useState(currentUser.businessProfile?.companyName || '');
  const [editBusinessType, setEditBusinessType] = useState(currentUser.businessProfile?.businessType || 'Wholesaler / Distributor');
  const [editRegNumber, setEditRegNumber] = useState(currentUser.businessProfile?.registrationNumber || '');

  // Seller application form state
  const [appBusinessName, setAppBusinessName] = useState(currentUser.businessProfile?.companyName || currentUser.name || '');
  const [appBusinessType, setAppBusinessType] = useState(currentUser.businessProfile?.businessType || 'Producer / Exporter');
  const [appDescription, setAppDescription] = useState('');
  const [appCategories, setAppCategories] = useState('Agricultural Commodities, Handcrafted Goods');
  const [appRegNumber, setAppRegNumber] = useState(currentUser.businessProfile?.registrationNumber || '');
  const [appSubmitting, setAppSubmitting] = useState(false);
  const [appMessage, setAppMessage] = useState<string | null>(null);

  const isRtl = currentLang === 'fa' || currentLang === 'ps';

  // Load customer data
  const loadData = async () => {
    setLoading(true);
    try {
      // Saved products
      const prods = await api.getCustomerSavedProducts();
      setSavedProducts(prods);

      // Inquiries & quotation requests
      const inqs = await api.getCustomerInquiries();
      setInquiries(inqs);

      // Seller app status
      const appRes = await api.getSellerApplication();
      setSellerApp(appRes.application);
    } catch (err) {
      console.error('Error loading customer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updates: Partial<User> = {
        name: editAccountType === 'business' ? (editCompanyName || editFullName) : editFullName,
        accountType: editAccountType,
        phone: editPhone,
        country: editCountry,
        city: editCity
      };

      if (editAccountType === 'personal') {
        updates.personalProfile = {
          fullName: editFullName,
          phone: editPhone,
          country: editCountry,
          city: editCity
        };
      } else {
        updates.businessProfile = {
          contactPerson: editFullName,
          companyName: editCompanyName,
          country: editCountry,
          city: editCity,
          businessEmail: currentUser.email,
          businessPhone: editPhone,
          businessType: editBusinessType,
          registrationNumber: editRegNumber
        };
      }

      const res = await api.updateProfile(updates);
      onUpdateUser(res.user);
      setIsEditingProfile(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (productId: string) => {
    try {
      const res = await api.toggleSaveProduct(productId);
      setSavedProducts((prev) => prev.filter((p) => p.id !== productId));
      onUpdateUser({
        ...currentUser,
        savedProductIds: res.savedProductIds
      });
    } catch (err: any) {
      alert(err.message || 'Failed to remove saved product');
    }
  };

  const handleSubmitSellerApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppSubmitting(true);
    setAppMessage(null);
    try {
      const res = await api.submitSellerApplication({
        businessName: appBusinessName,
        businessType: appBusinessType,
        country: editCountry || 'Afghanistan',
        city: editCity || 'Kabul',
        phone: editPhone || '+93 700 000000',
        email: currentUser.email,
        description: appDescription,
        productCategories: appCategories.split(',').map((c) => c.trim()),
        registrationNumber: appRegNumber
      });
      setSellerApp(res.application);
      onUpdateUser({
        ...currentUser,
        sellerStatus: 'pending'
      });
      setAppMessage('Application submitted successfully! HEKA LTD Compliance will review your trade credentials.');
    } catch (err: any) {
      setAppMessage(`Error: ${err.message}`);
    } finally {
      setAppSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 text-[#172033] dark:text-[#E2E8F0]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Banner / Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-8 bg-white/70 dark:bg-[#101C35]/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A96E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-[#101C35] to-[#C9A96E] flex items-center justify-center text-white shadow-lg text-2xl font-bold">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#101C35]" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#101C35] dark:text-white">
                  {currentUser.name}
                </h1>
                {/* Account Type Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1 ${
                  currentUser.accountType === 'business'
                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                    : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                }`}>
                  {currentUser.accountType === 'business' ? <Building2 className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                  {currentUser.accountType === 'business' ? 'Business Account' : 'Personal Account'}
                </span>

                {/* Seller Status Badge */}
                {currentUser.sellerStatus === 'approved' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Approved Seller
                  </span>
                )}
                {currentUser.sellerStatus === 'pending' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Seller Pending Review
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <span>{currentUser.email}</span>
                <span>•</span>
                <span>{currentUser.city || 'London'}, {currentUser.country || 'United Kingdom'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white/40 dark:border-white/10 text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Edit3 className="w-4 h-4 text-[#C9A96E]" />
              <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Account Type & Profile'}</span>
            </button>

            {currentUser.sellerStatus === 'approved' && onNavigateToSellerArea && (
              <button
                onClick={onNavigateToSellerArea}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Store className="w-4 h-4" />
                <span>Seller Center</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl text-red-500 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inline Profile & Account Type Editor */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-black/10 dark:border-white/10 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#101C35] dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
                <span>Account Classification & Profile Details</span>
              </h3>
              <p className="text-xs text-gray-500">You can seamlessly change your account type without losing inquiries or saved items.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Account Type Toggle */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Account Type</label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setEditAccountType('personal')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      editAccountType === 'personal'
                        ? 'border-[#C9A96E] bg-[#C9A96E]/15 text-[#101C35] dark:text-white ring-1 ring-[#C9A96E]'
                        : 'border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-[#C9A96E]" />
                    <span className="text-xs font-semibold">Personal Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditAccountType('business')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      editAccountType === 'business'
                        ? 'border-[#C9A96E] bg-[#C9A96E]/15 text-[#101C35] dark:text-white ring-1 ring-[#C9A96E]'
                        : 'border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-[#C9A96E]" />
                    <span className="text-xs font-semibold">Business Account</span>
                  </button>
                </div>
              </div>

              {/* Business specific fields */}
              {editAccountType === 'business' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Company Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={editCompanyName}
                      onChange={(e) => setEditCompanyName(e.target.value)}
                      placeholder="e.g. Apex Global Trade Ltd"
                      className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Business Type</label>
                    <select
                      value={editBusinessType}
                      onChange={(e) => setEditBusinessType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
                    >
                      <option value="Wholesaler / Distributor">Wholesaler / Distributor</option>
                      <option value="Import / Export Company">Import / Export Company</option>
                      <option value="Manufacturer / Producer">Manufacturer / Producer</option>
                      <option value="Retail Chain">Retail Chain</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Registration Number</label>
                    <input
                      type="text"
                      value={editRegNumber}
                      onChange={(e) => setEditRegNumber(e.target.value)}
                      placeholder="e.g. REG-99120"
                      className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {editAccountType === 'business' ? 'Contact Person Name *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Country</label>
                <input
                  type="text"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">City</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-[#C9A96E] text-[#101C35] font-bold text-xs shadow-md hover:bg-[#B69255] transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-white/60 dark:bg-[#101C35]/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#101C35] text-white dark:bg-[#C9A96E] dark:text-[#101C35] shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Account Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'inquiries'
              ? 'bg-[#101C35] text-white dark:bg-[#C9A96E] dark:text-[#101C35] shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Quotations & Inquiries</span>
          {inquiries.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">
              {inquiries.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'saved'
              ? 'bg-[#101C35] text-white dark:bg-[#C9A96E] dark:text-[#101C35] shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Products</span>
          {savedProducts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">
              {savedProducts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('seller')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'seller'
              ? 'bg-[#101C35] text-white dark:bg-[#C9A96E] dark:text-[#101C35] shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Seller Application & Status</span>
          {currentUser.sellerStatus === 'approved' && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab Contents */}

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#101C35]/70 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-semibold uppercase">My Inquiries</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#101C35] dark:text-white">{inquiries.length}</div>
              <p className="text-[11px] text-gray-500 mt-1">Quotations & product queries</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#101C35]/70 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-semibold uppercase">Saved Items</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#101C35] dark:text-white">{savedProducts.length}</div>
              <p className="text-[11px] text-gray-500 mt-1">Bookmarked for quotation</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#101C35]/70 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-semibold uppercase">Seller Status</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Store className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base font-bold text-[#101C35] dark:text-white capitalize">
                {currentUser.sellerStatus === 'approved' ? 'Approved Merchant' : currentUser.sellerStatus === 'pending' ? 'Application Under Review' : 'Buyer Account'}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {currentUser.sellerStatus === 'approved' ? 'Can submit products' : 'Selling requires admin review'}
              </p>
            </div>
          </div>

          {/* Account Profile Card */}
          <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#101C35]/70 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-md">
            <h3 className="text-base font-bold text-[#101C35] dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C9A96E]" />
              <span>Customer Verification & Profile Record</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                <span className="text-gray-500">Account Classification</span>
                <p className="font-semibold text-sm capitalize">{currentUser.accountType || 'Personal'} Account</p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                <span className="text-gray-500">Buyer Status</span>
                <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Eligible to browse and request quotations</span>
                </p>
              </div>

              {currentUser.accountType === 'business' && currentUser.businessProfile && (
                <>
                  <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                    <span className="text-gray-500">Company Legal Name</span>
                    <p className="font-semibold text-sm">{currentUser.businessProfile.companyName}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                    <span className="text-gray-500">Business Sector / Type</span>
                    <p className="font-semibold text-sm">{currentUser.businessProfile.businessType}</p>
                  </div>
                </>
              )}

              <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                <span className="text-gray-500">Registered Email</span>
                <p className="font-semibold text-sm">{currentUser.email}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                <span className="text-gray-500">Contact Phone</span>
                <p className="font-semibold text-sm">{currentUser.phone || 'Not specified'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                <span className="text-gray-500">Geographic Jurisdiction</span>
                <p className="font-semibold text-sm">{currentUser.city || 'London'}, {currentUser.country || 'United Kingdom'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                <span className="text-gray-500">Seller Authorization</span>
                <p className="font-semibold text-sm">
                  {currentUser.sellerStatus === 'approved' ? (
                    <span className="text-emerald-500 font-bold">Approved Seller</span>
                  ) : currentUser.sellerStatus === 'pending' ? (
                    <span className="text-amber-500 font-bold">Pending HEKA Admin Approval</span>
                  ) : (
                    <span className="text-gray-500">No application submitted</span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onNavigateToCatalog}
                className="px-4 py-2.5 rounded-xl bg-[#101C35] dark:bg-[#C9A96E] text-white dark:text-[#101C35] text-xs font-bold flex items-center gap-2 hover:opacity-95 transition-all shadow-md"
              >
                <span>Browse HEKA Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {currentUser.sellerStatus !== 'approved' && (
                <button
                  onClick={() => setActiveTab('seller')}
                  className="px-4 py-2.5 rounded-xl bg-[#C9A96E]/15 hover:bg-[#C9A96E]/25 text-[#C9A96E] border border-[#C9A96E]/30 text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Apply to Become a Verified Seller</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. QUOTATIONS & INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-[#101C35] dark:text-white">My Quotation Requests & Communications</h3>
              <p className="text-xs text-gray-500">Real-time status of your wholesale quotes and product inquiries</p>
            </div>
            <button
              onClick={loadData}
              className="text-xs px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
            >
              Refresh
            </button>
          </div>

          {inquiries.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/70 dark:bg-[#101C35]/70 backdrop-blur-xl border border-white/40 dark:border-white/10">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h4 className="text-base font-bold text-[#101C35] dark:text-white">No Quotation Requests Yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                Browse our high-grade export catalog and submit wholesale quotation requests to receive verified quotes.
              </p>
              <button
                onClick={onNavigateToCatalog}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#C9A96E] text-[#101C35] text-xs font-bold shadow-md hover:bg-[#B69255]"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-5 rounded-2xl bg-white/80 dark:bg-[#101C35]/80 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#101C35] dark:text-white">
                        {inq.productName || 'General Inquiry'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        inq.status === 'replied' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                        inq.status === 'new' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' :
                        'bg-gray-500/15 text-gray-600 dark:text-gray-400'
                      }`}>
                        {inq.status === 'replied' ? 'Official Reply Ready' : inq.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-300 mb-3">
                    <span className="font-semibold text-gray-500 block mb-0.5">Your Request:</span>
                    <p>{inq.message}</p>
                    {inq.requestedQuantity && (
                      <p className="mt-1 text-gray-500">Requested Volume: <span className="font-bold text-[#101C35] dark:text-white">{inq.requestedQuantity} units</span></p>
                    )}
                  </div>

                  {inq.generatedReply && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#C9A96E]/15 to-transparent border border-[#C9A96E]/30 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#C9A96E] mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>HEKA LTD Sales Team Response</span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">{inq.generatedReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. SAVED PRODUCTS */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-[#101C35] dark:text-white">Saved Products & Bookmarks</h3>
              <p className="text-xs text-gray-500">Keep track of items you wish to negotiate or order</p>
            </div>
          </div>

          {savedProducts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/70 dark:bg-[#101C35]/70 backdrop-blur-xl border border-white/40 dark:border-white/10">
              <Bookmark className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h4 className="text-base font-bold text-[#101C35] dark:text-white">No Saved Products</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                You can bookmark any product in the public catalog by clicking the bookmark icon.
              </p>
              <button
                onClick={onNavigateToCatalog}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#C9A96E] text-[#101C35] text-xs font-bold shadow-md hover:bg-[#B69255]"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-2xl overflow-hidden bg-white/80 dark:bg-[#101C35]/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-black/20">
                    <img
                      src={prod.images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveSaved(prod.id)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-red-600 text-white transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#C9A96E]">
                        {prod.category}
                      </div>
                      <h4 className="font-bold text-sm text-[#101C35] dark:text-white mt-1">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {prod.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Indicative Price</span>
                        <span className="font-extrabold text-sm text-[#101C35] dark:text-white">
                          ${prod.retailPrice} <span className="text-[10px] font-normal text-gray-500">/{prod.unit}</span>
                        </span>
                      </div>

                      <button
                        onClick={onNavigateToCatalog}
                        className="px-3 py-1.5 rounded-lg bg-[#C9A96E] text-[#101C35] text-xs font-bold hover:bg-[#B69255] transition-colors"
                      >
                        Inquire
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SELLER APPLICATION & STATUS */}
      {activeTab === 'seller' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#101C35]/70 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-md">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#101C35] dark:text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#C9A96E]" />
                  <span>HEKA Verified Seller Program</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Sell premium products across HEKA's international distribution network.
                </p>
              </div>

              {/* Status pill */}
              <div className="text-right">
                {currentUser.sellerStatus === 'approved' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified & Approved Seller
                  </span>
                )}
                {currentUser.sellerStatus === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <Clock className="w-4 h-4" />
                    Application Pending Review
                  </span>
                )}
                {currentUser.sellerStatus === 'rejected' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                    <XCircle className="w-4 h-4" />
                    Application Rejected
                  </span>
                )}
                {(currentUser.sellerStatus === 'none' || !currentUser.sellerStatus) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-500/15 text-gray-600 dark:text-gray-400 border border-gray-500/30">
                    Not Applied
                  </span>
                )}
              </div>
            </div>

            {/* Crucial Explanatory Notice */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 mb-6">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Strict Seller Governance Notice</span>
              </p>
              <p>
                In accordance with HEKA LTD international compliance policy, <strong>Business Account registration alone does NOT grant seller permissions</strong>.
                All sellers must submit their trade credentials and undergo review by an authorized HEKA LTD administrator. Any products submitted by sellers remain unpublished until individually reviewed and approved.
              </p>
            </div>

            {/* Approved View */}
            {currentUser.sellerStatus === 'approved' && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#101C35] dark:text-white">Your Seller Account is Active</h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                    You have verified seller credentials. You can add new products, manage your inventory submissions, and respond to buyer quotation requests directly in the Seller Center.
                  </p>
                </div>
                {onNavigateToSellerArea && (
                  <button
                    onClick={onNavigateToSellerArea}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 mx-auto"
                  >
                    <Store className="w-4 h-4" />
                    <span>Open Seller Center Now</span>
                  </button>
                )}
              </div>
            )}

            {/* Pending View */}
            {currentUser.sellerStatus === 'pending' && (
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Clock className="w-6 h-6 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#101C35] dark:text-white">Application Under Active Review</h4>
                    <p className="text-xs text-gray-500">
                      Submitted on: {sellerApp ? new Date(sellerApp.submittedAt).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/60 dark:bg-[#101C35]/60 text-xs space-y-2">
                  <p><span className="text-gray-500">Applicant Business:</span> <strong>{sellerApp?.businessName || currentUser.name}</strong></p>
                  <p><span className="text-gray-500">Business Sector:</span> {sellerApp?.businessType}</p>
                  <p><span className="text-gray-500">Target Goods:</span> {sellerApp?.productCategories?.join(', ')}</p>
                  <p className="text-gray-600 dark:text-gray-400 italic">"{sellerApp?.description}"</p>
                </div>

                <p className="text-xs text-gray-500">
                  A HEKA LTD compliance officer will review your application. You will be notified once a determination has been made.
                </p>
              </div>
            )}

            {/* Not Applied or Rejected View: Application Form */}
            {(currentUser.sellerStatus === 'none' || currentUser.sellerStatus === 'rejected' || !currentUser.sellerStatus) && (
              <form onSubmit={handleSubmitSellerApplication} className="space-y-4">
                {currentUser.sellerStatus === 'rejected' && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 mb-4">
                    <p className="font-bold mb-1">Previous Application Status: Rejected</p>
                    {sellerApp?.rejectionReason && <p>Reason: {sellerApp.rejectionReason}</p>}
                    <p className="mt-1">You may revise your details and submit a new seller application below.</p>
                  </div>
                )}

                {appMessage && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${
                    appMessage.includes('Error') ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {appMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Business or Producer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={appBusinessName}
                      onChange={(e) => setAppBusinessName(e.target.value)}
                      placeholder="e.g. Herat Saffron Collective"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Producer / Business Type *
                    </label>
                    <input
                      type="text"
                      required
                      value={appBusinessType}
                      onChange={(e) => setAppBusinessType(e.target.value)}
                      placeholder="e.g. Agricultural Cooperative, Carpet Weavers"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Product Categories to Sell *
                  </label>
                  <input
                    type="text"
                    required
                    value={appCategories}
                    onChange={(e) => setAppCategories(e.target.value)}
                    placeholder="e.g. Saffron, Dry Fruits, Carpets, Precious Stones"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Business Profile & Quality Standards *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={appDescription}
                    onChange={(e) => setAppDescription(e.target.value)}
                    placeholder="Describe your manufacturing capacity, sourcing methods, certifications, and export history..."
                    className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Commercial License / Registration Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={appRegNumber}
                    onChange={(e) => setAppRegNumber(e.target.value)}
                    placeholder="e.g. AC-90218-AF"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-xs focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={appSubmitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C9A96E] hover:bg-[#B69255] text-[#101C35] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {appSubmitting ? (
                    <div className="w-4 h-4 border-2 border-[#101C35] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Seller Application for HEKA Review</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
