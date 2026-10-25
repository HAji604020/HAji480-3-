import React, { useState } from 'react';
import { Save, Check, Sun, Moon, Laptop, Sparkles } from 'lucide-react';
import { Company, User, Language } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface SettingsViewProps {
  company: Company;
  currentUser: User;
  onRefresh: () => void;
  currentLang: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  company,
  currentUser,
  onRefresh,
  currentLang,
}) => {
  const { theme, effectiveTheme, setTheme } = useTheme();
  const t = translations[currentLang] || translations.en;
  const isRtl = currentLang === 'fa' || currentLang === 'ps';

  const [formData, setFormData] = useState({
    name: company.name,
    industry: company.industry,
    contactPhone: company.contactPhone,
    contactEmail: company.contactEmail,
    address: company.address,
    currency: company.currency,
    showRetailPricesPublicly: company.settings.showRetailPricesPublicly,
    allowWholesaleQuoteRequests: company.settings.allowWholesaleQuoteRequests,
    primaryColor: company.brandColors.primary || '#101C35',
    accentColor: company.brandColors.accent || '#C9A96E'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateCompany(company.id, {
        name: formData.name,
        industry: formData.industry,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        address: formData.address,
        currency: formData.currency,
        brandColors: {
          primary: formData.primaryColor,
          accent: formData.accentColor,
          background: company.brandColors.background || '#F5F7FA'
        },
        settings: {
          ...company.settings,
          showRetailPricesPublicly: formData.showRetailPricesPublicly,
          allowWholesaleQuoteRequests: formData.allowWholesaleQuoteRequests
        }
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      onRefresh();
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const themeOptions: {
    id: ThemeMode;
    title: string;
    description: string;
    icon: typeof Sun;
    previewBg: string;
    previewBorder: string;
  }[] = [
    {
      id: 'light',
      title: t.themeLight || (isRtl ? 'شیشه مات روشن (Light Glass)' : 'Light Glass'),
      description: isRtl
        ? 'سطوح شیشه‌ای مات سفید، پس‌زمینه تمیز روشن، خطوط مرزی ظریف و متن خوانای سرمه‌ای'
        : 'White frosted-glass surfaces, translucent panels with visible subtle blur, and navy typography.',
      icon: Sun,
      previewBg: 'bg-white/80',
      previewBorder: 'border-slate-300'
    },
    {
      id: 'dark',
      title: t.themeDark || (isRtl ? 'شیشه مات تیره (Dark Navy Glass)' : 'Dark Navy Glass'),
      description: isRtl
        ? 'سطوح شیشه‌ای مات سرمه‌ای تیره (#101C35) روی پس‌زمینه #0B1220، متن روشن و خطوط طلایی'
        : 'Dark navy frosted surfaces (#101C35) over #0B1220 background, subtle borders, and gold accents.',
      icon: Moon,
      previewBg: 'bg-[#101C35]/90 text-white',
      previewBorder: 'border-[#C9A96E]/50'
    },
    {
      id: 'system',
      title: t.themeSystem || (isRtl ? 'هماهنگ با سیستم (System)' : 'System Mode'),
      description: isRtl
        ? 'هماهنگی خودکار با تنظیمات سیستم‌عامل کاربر (تاریک یا روشن) همراه با گوش‌به‌زنگ زنده'
        : 'Automatically respects operating system dark/light preferences and listens for real-time changes.',
      icon: Laptop,
      previewBg: 'bg-gradient-to-r from-white/70 to-[#101C35]/80',
      previewBorder: 'border-slate-400'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#101C35] dark:text-slate-100 tracking-tight">
              {t.tabSettings || (isRtl ? 'تنظیمات رسمی پلتفرم تجارتی' : 'Enterprise Platform Settings')}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md glass-badge-gold uppercase tracking-wider">
              {t.glassDesignBadge || (isRtl ? 'شیشه‌ای مات' : 'Frosted Glass UI')}
            </span>
          </div>
          <p className="text-xs text-[#5A657D] dark:text-slate-400 mt-1">
            {isRtl
              ? 'پیکربندی هویت شرکتی، تم ظاهری گلس‌مورفیسم، ارز مبادلاتی و تنظیمات کاتالوگ عمومی'
              : 'Configure corporate identity, frosted glass themes, settlement currencies, and public storefront preferences.'}
          </p>
        </div>
      </div>

      {/* 1. Theme & Appearance Section (Specification Requirement #2, #3, #4, #5) */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="border-b border-slate-200/60 dark:border-white/10 pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-[#101C35] dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A96E]" />
              <span>{t.themeLabel || (isRtl ? 'تم ظاهری گلس‌مورفیسم (Glassmorphism Theme)' : 'Glassmorphism Theme & Appearance')}</span>
            </h2>
            <p className="text-xs text-[#5A657D] dark:text-slate-400 mt-0.5">
              {t.themeDesc || (isRtl
                ? 'پشتیبانی کامل از شیشه مات سفید در تم روشن و شیشه مات سرمه‌ای در تم تاریک با ذخیره فوری در حافظه دستگاه'
                : 'Consistent translucent surfaces, backdrop blur, subtle borders, and soft shadows across all pages.')}
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#C9A96E] bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-white/10">
            {effectiveTheme === 'dark' ? 'Dark Active (#0B1220 / #101C35)' : 'Light Active (#F5F7FA / White Glass)'}
          </span>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={`p-4 rounded-xl border text-left rtl:text-right transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-[#C9A96E] ring-2 ring-[#C9A96E]/30 bg-white/90 dark:bg-[#101C35]/90 shadow-md'
                    : 'border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#101C35] dark:bg-[#C9A96E] text-[#C9A96E] dark:text-[#0B1220]' : 'bg-black/5 dark:bg-white/10 text-[#5A657D] dark:text-slate-300'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#C9A96E]" />
                  )}
                </div>

                <div>
                  <strong className="block text-xs font-bold text-[#101C35] dark:text-slate-100">
                    {opt.title}
                  </strong>
                  <p className="text-[11px] text-[#5A657D] dark:text-slate-400 mt-1 leading-relaxed">
                    {opt.description}
                  </p>
                </div>

                {/* Surface texture mini-preview bar */}
                <div className="h-2 rounded-full w-full bg-gradient-to-r from-white/80 via-[#C9A96E]/50 to-[#101C35]/80 border border-black/5 dark:border-white/10" />
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Company Identity */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-extrabold text-[#101C35] dark:text-slate-100 border-b border-slate-200/60 dark:border-white/10 pb-2">
            {isRtl ? 'مشخصات رسمی شرکت و اطلاعات ثبت بازرگانی' : 'Company Identity & Registered Commerce Details'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#101C35] dark:text-slate-200 mb-1">
                {isRtl ? 'نام رسمی شرکت' : 'Company Legal Name'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block font-bold text-[#101C35] dark:text-slate-200 mb-1">
                {isRtl ? 'صنعت و حوزه فعالیت' : 'Commercial Industry'}
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block font-bold text-[#101C35] dark:text-slate-200 mb-1">
                {isRtl ? 'شماره تماس رسمی (واتساپ)' : 'Official WhatsApp Phone'}
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block font-bold text-[#101C35] dark:text-slate-200 mb-1">
                {isRtl ? 'ایمیل رسمی تماس' : 'Official Contact Email'}
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl glass-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#101C35] dark:text-slate-200 mb-1">
                {isRtl ? 'آدرس ثبتی دفتر مرکزی' : 'Registered Corporate Address'}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl glass-input"
              />
            </div>
          </div>
        </div>

        {/* Commercial Currency & Public Storefront Visibility */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-extrabold text-[#101C35] dark:text-slate-100 border-b border-slate-200/60 dark:border-white/10 pb-2">
            {isRtl ? 'ارز تسویه و تنظیمات کاتالوگ عمومی' : 'Storefront & Commercial Preferences'}
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#101C35] dark:text-slate-200 mb-1">
                {isRtl ? 'ارز اصلی تسویه حساب' : 'Settlement Currency'}
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full sm:w-64 px-3.5 py-2 rounded-xl glass-input font-mono font-bold"
              >
                <option value="USD" className="dark:bg-[#101C35] dark:text-white">USD ($ - United States Dollar)</option>
                <option value="GBP" className="dark:bg-[#101C35] dark:text-white">GBP (£ - British Pound Sterling)</option>
                <option value="EUR" className="dark:bg-[#101C35] dark:text-white">EUR (€ - Euro)</option>
                <option value="AED" className="dark:bg-[#101C35] dark:text-white">AED (د.إ - UAE Dirham)</option>
                <option value="AFN" className="dark:bg-[#101C35] dark:text-white">AFN (؋ - Afghan Afghani)</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showRetailPricesPublicly}
                  onChange={(e) =>
                    setFormData({ ...formData, showRetailPricesPublicly: e.target.checked })
                  }
                  className="rounded text-[#101C35] dark:text-[#C9A96E] focus:ring-[#C9A96E] w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-[#101C35] dark:text-slate-100 block">
                    {isRtl ? 'نمایش عمومی قیمت‌های تکی / پرچون' : 'Show Retail Prices Publicly'}
                  </span>
                  <span className="text-[#5A657D] dark:text-slate-400 text-[11px] block">
                    {isRtl
                      ? 'در صورت غیرفعال بودن، قیمت‌ها مخفی شده و بازدیدکنندگان باید استعلام پیش‌فاکتور ارسال کنند.'
                      : 'When disabled, prices are hidden and visitors must request a quotation.'}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowWholesaleQuoteRequests}
                  onChange={(e) =>
                    setFormData({ ...formData, allowWholesaleQuoteRequests: e.target.checked })
                  }
                  className="rounded text-[#101C35] dark:text-[#C9A96E] focus:ring-[#C9A96E] w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-[#101C35] dark:text-slate-100 block">
                    {isRtl ? 'امکان ثبت درخواست استعلام عمده در کاتالوگ' : 'Allow Wholesale Quote Requests'}
                  </span>
                  <span className="text-[#5A657D] dark:text-slate-400 text-[11px] block">
                    {isRtl
                      ? 'دکمه درخواست پیش‌فاکتور عمده را در صفحه محصولات کاتالوگ عمومی فعال می‌کند.'
                      : 'Enables quote request modal on public storefront product pages.'}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Corporate Branding Colors */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-extrabold text-[#101C35] dark:text-slate-100 border-b border-slate-200/60 dark:border-white/10 pb-2">
            {isRtl ? 'پالت رنگ برند شرکتی' : 'Corporate Brand Palette'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#101C35] dark:text-slate-200 mb-1">
                {isRtl ? 'رنگ اصلی (سرمه‌ای تیره)' : 'Primary Color (Hex)'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-slate-200/60 dark:border-white/15 cursor-pointer p-0.5 bg-transparent"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl glass-input font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#101C35] dark:text-slate-200 mb-1">
                {isRtl ? 'رنگ تاکیدی (طلایی لوکس)' : 'Accent Color (Hex)'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-slate-200/60 dark:border-white/15 cursor-pointer p-0.5 bg-transparent"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl glass-input font-mono text-xs uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isRtl ? 'تنظیمات با موفقیت ذخیره شد!' : 'Settings updated successfully!'}</span>
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-6 rounded-xl font-bold text-xs bg-[#101C35] dark:bg-[#C9A96E] hover:bg-[#192b52] dark:hover:bg-[#d8be8d] text-white dark:text-[#0B1220] transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4 text-[#C9A96E] dark:text-[#0B1220]" />
            <span>{isSaving ? (isRtl ? 'در حال ذخیره‌سازی...' : 'Saving Changes...') : (isRtl ? 'ذخیره تنظیمات شرکت' : 'Save Company Settings')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
