import React, { useState } from 'react';
import {
  X,
  User,
  Building2,
  Mail,
  Lock,
  Phone,
  Globe,
  MapPin,
  CheckCircle2,
  Briefcase,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { User as UserType, AccountType, Language } from '../types';
import { api } from '../services/api';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  currentLang: Language;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentLang
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [accountType, setAccountType] = useState<AccountType>('personal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [city, setCity] = useState('London');

  // Business specific fields
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('Wholesaler / Distributor');
  const [regNumber, setRegNumber] = useState('');

  if (!isOpen) return null;

  const isRtl = currentLang === 'fa' || currentLang === 'ps';

  const handleQuickLogin = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      api.setToken(token);
      const res = await api.login('', token);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        const res = await api.login(email);
        onSuccess(res.user);
        onClose();
      } else {
        // Sign up
        const payload: any = {
          name: accountType === 'business' ? fullName || companyName : fullName,
          email,
          accountType,
          country,
          city,
          phone,
          preferredLanguage: currentLang
        };

        if (accountType === 'personal') {
          payload.personalProfile = {
            fullName,
            country,
            city,
            phone
          };
        } else {
          payload.businessProfile = {
            contactPerson: fullName,
            companyName,
            country,
            city,
            businessEmail: email,
            businessPhone: phone,
            businessType,
            registrationNumber: regNumber
          };
        }

        const res = await api.registerCustomer(payload);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 bg-white/90 dark:bg-[#101C35]/90 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl text-[#172033] dark:text-[#E2E8F0]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#101C35] to-[#C9A96E] text-white shadow-lg shadow-[#C9A96E]/20 mb-3">
            <ShieldCheck className="w-7 h-7 text-[#C9A96E]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#101C35] dark:text-white">
            {mode === 'signin' 
              ? (currentLang === 'fa' ? 'ورود به حساب کاربری' : currentLang === 'ps' ? 'حساب ته ننوتل' : 'Sign In to HEKA LTD')
              : (currentLang === 'fa' ? 'ایجاد حساب کاربری جدید' : currentLang === 'ps' ? 'نوی حساب جوړول' : 'Create Customer Account')
            }
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {mode === 'signin'
              ? (currentLang === 'fa' ? 'برای مدیریت سفارشات، درخواست پیش‌فاکتور و ذخیره کالاها وارد شوید' : currentLang === 'ps' ? 'د فرمایشونو او نرخ اخیستنې د څارنې لپاره ننوځئ' : 'Access your quotation requests, orders, saved products, and seller center')
              : (currentLang === 'fa' ? 'حساب شخصی یا تجارتی خود را در کمتر از یک دقیقه فعال کنید' : currentLang === 'ps' ? 'شخصي یا سوداګریز حساب په اسانۍ فعال کړئ' : 'Choose personal or business account. Upgrade anytime.')
            }
          </p>
        </div>

        {/* Quick Demo Switcher for Evaluation */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-[#C9A96E]/30">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#C9A96E]">
            <Sparkles className="w-4 h-4" />
            <span>Instant Role Evaluation (One-Click Sign In)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('token_sarah_buyer')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-white/5 hover:bg-[#C9A96E]/15 border border-white/50 dark:border-white/10 text-left transition-all group"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-[#C9A96E]">Sarah Jenkins</p>
                <p className="text-[10px] text-gray-500">Personal Buyer • UK</p>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">Buyer</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('token_marcus_buyer')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-white/5 hover:bg-[#C9A96E]/15 border border-white/50 dark:border-white/10 text-left transition-all group"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-[#C9A96E]">Marcus Sterling</p>
                <p className="text-[10px] text-gray-500">Business Buyer • Aura Global</p>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400">Business</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('token_zahir_seller')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-white/5 hover:bg-[#C9A96E]/15 border border-white/50 dark:border-white/10 text-left transition-all group"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-[#C9A96E]">Zahir Afghan</p>
                <p className="text-[10px] text-gray-500">Approved Seller • Kabul Crafts</p>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Approved Seller</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('token_farid_pending_seller')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-white/5 hover:bg-[#C9A96E]/15 border border-white/50 dark:border-white/10 text-left transition-all group"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-[#C9A96E]">Farid Saffron</p>
                <p className="text-[10px] text-gray-500">Pending Seller • Herat Coop</p>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">Pending Seller</span>
            </button>
          </div>
        </div>

        {/* Mode switcher tabs (Sign In vs Register) */}
        <div className="flex p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/5 mb-6">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'signin'
                ? 'bg-white dark:bg-[#101C35] text-[#101C35] dark:text-[#C9A96E] shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {currentLang === 'fa' ? 'ورود به حساب' : currentLang === 'ps' ? 'ننوتل' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-[#101C35] text-[#101C35] dark:text-[#C9A96E] shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {currentLang === 'fa' ? 'ثبت‌نام جدید' : currentLang === 'ps' ? 'نوی نوم لیکنه' : 'Register New Account'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-4">
              {/* Account Type Selector: Personal vs Business */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {currentLang === 'fa' ? 'نوع حساب کاربری' : currentLang === 'ps' ? 'د حساب ډول' : 'Select Account Type'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('personal')}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      accountType === 'personal'
                        ? 'border-[#C9A96E] bg-[#C9A96E]/10 dark:bg-[#C9A96E]/15 text-[#101C35] dark:text-white ring-1 ring-[#C9A96E]'
                        : 'border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white dark:bg-white/10 text-[#C9A96E]">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {currentLang === 'fa' ? 'حساب شخصی' : currentLang === 'ps' ? 'شخصي حساب' : 'Personal Account'}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {currentLang === 'fa' ? 'برای خرید انفرادی و استعلام' : 'For individual buyers'}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('business')}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      accountType === 'business'
                        ? 'border-[#C9A96E] bg-[#C9A96E]/10 dark:bg-[#C9A96E]/15 text-[#101C35] dark:text-white ring-1 ring-[#C9A96E]'
                        : 'border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white dark:bg-white/10 text-[#C9A96E]">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {currentLang === 'fa' ? 'حساب تجارتی / شرکتی' : currentLang === 'ps' ? 'سوداګریز حساب' : 'Business Account'}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {currentLang === 'fa' ? 'شرکت‌ها، عمده‌فروشان' : 'Companies & B2B trade'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Personal vs Business Fields */}
              {accountType === 'business' && (
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/10 space-y-3">
                  <div className="text-xs font-semibold text-[#C9A96E] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Business Entity Details</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Company Legal Name *</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Apex Global Trading Ltd"
                        className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-sm focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Business Type</label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-sm focus:outline-none focus:border-[#C9A96E]"
                      >
                        <option value="Wholesaler / Distributor">Wholesaler / Distributor</option>
                        <option value="Import / Export Company">Import / Export Company</option>
                        <option value="Manufacturer / Producer">Manufacturer / Producer</option>
                        <option value="Retail Chain / Supermarket">Retail Chain / Supermarket</option>
                        <option value="Commercial Broker / Agency">Commercial Broker / Agency</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Commercial Registration Number (Optional)</label>
                    <input
                      type="text"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="e.g. CR-8839210-UK"
                      className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-sm focus:outline-none focus:border-[#C9A96E]"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {accountType === 'business' ? 'Contact Person Name *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-sm focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 7700 900123"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-sm focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United Kingdom"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-sm focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="London"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-sm focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {mode === 'signup' && accountType === 'business' ? 'Official Business Email *' : 'Email Address *'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2.5 rounded-xl bg-white/80 dark:bg-[#0B1220]/60 border border-white/40 dark:border-white/10 text-sm focus:outline-none focus:border-[#C9A96E]"
              />
              <Mail className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#101C35] to-[#1E2E4F] dark:from-[#C9A96E] dark:to-[#B69255] text-white dark:text-[#101C35] font-bold text-sm shadow-xl shadow-[#101C35]/15 dark:shadow-[#C9A96E]/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white dark:border-[#101C35] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signin'
                    ? (currentLang === 'fa' ? 'ورود به حساب کاربری' : currentLang === 'ps' ? 'ننوتل' : 'Sign In')
                    : (currentLang === 'fa' ? 'ثبت و ورود فوری' : currentLang === 'ps' ? 'نوم لیکنه او ننوتل' : 'Complete Registration & Continue')
                  }
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10 text-center text-xs text-gray-500">
          <p>
            {currentLang === 'fa'
              ? 'اطلاعات شما با پروتکل‌های امنیتی HEKA LTD رمزگذاری و محافظت می‌شود.'
              : 'Your data is encrypted and protected under HEKA LTD enterprise security standards.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
