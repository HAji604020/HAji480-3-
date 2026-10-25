import React, { useState } from 'react';
import {
  Building,
  Palette,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Users,
  ShieldCheck,
  Save,
  Globe
} from 'lucide-react';
import { Company, Language, User } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

interface CompanyProfileViewProps {
  company: Company;
  currentUser: User;
  onRefresh: () => void;
  currentLang: Language;
}

export const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({
  company,
  currentUser,
  onRefresh,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [profile, setProfile] = useState<Company>({ ...company });
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const publicUrl = `${window.location.origin}/c/${company.slug}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateCompany(company.id, profile);
      onRefresh();
      alert(currentLang === 'fa' ? 'پروفایل شرکت با موفقیت ذخیره شد.' : 'Company profile saved successfully!');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Public Catalog Link Card - Frosted Showcase */}
      <div className="relative overflow-hidden rounded-3xl p-6 glass-card border-white/80 dark:border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-gradient-to-br from-[#101C35]/90 to-[#192b52]/90 dark:from-[#101C35]/80 dark:to-[#0B1220]/90 text-white">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40 backdrop-blur-md">
              {currentLang === 'fa' ? 'لینک کاتالوگ عمومی' : 'Dedicated Public Storefront Link'}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live & Accessible
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            {currentLang === 'fa' ? 'آدرس درگاه عمومی شرکت' : 'Your Public Catalog URL'}
          </h3>
          <p className="text-xs text-slate-300 font-mono select-all bg-black/25 px-3 py-1.5 rounded-xl border border-white/10 inline-block">
            {publicUrl}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={handleCopyUrl}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-[#101C35] hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer shadow-md border border-white/40 active:scale-95"
          >
            {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#C9A96E]" />}
            <span>{copiedUrl ? (currentLang === 'fa' ? 'کپی شد!' : 'Copied Link!') : (currentLang === 'fa' ? 'کپی لینک عمومی' : 'Copy Public Link')}</span>
          </button>
        </div>
      </div>

      {/* Edit Company Form in Frosted Glass */}
      <form onSubmit={handleSave} className="glass-card p-6 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#101C35] to-[#1c2e56] dark:from-[#C9A96E]/20 dark:to-[#C9A96E]/5 flex items-center justify-center border border-[#C9A96E]/30">
              <Building className="w-4 h-4 text-[#C9A96E]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#101C35] dark:text-white">{t.tabCompanyProfile}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage institutional entity details, trade currency, and public storefront parameters</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#101C35] to-[#1c2e56] hover:from-[#192b52] hover:to-[#223a6c] dark:from-[#C9A96E] dark:to-[#d4b984] text-white dark:text-[#101C35] transition flex items-center gap-2 cursor-pointer shadow-md border border-[#C9A96E]/30 active:scale-95"
          >
            <Save className="w-3.5 h-3.5 text-[#C9A96E] dark:text-[#101C35]" />
            <span>{isSaving ? (currentLang === 'fa' ? 'در حال ذخیره...' : 'Saving...') : (currentLang === 'fa' ? 'ذخیره تغییرات' : 'Save Changes')}</span>
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Company Legal / Trading Name</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Industry / Trade Sector</label>
            <input
              type="text"
              value={profile.industry}
              onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
              className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Country of Operation</label>
            <input
              type="text"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Default Base Currency</label>
            <input
              type="text"
              value={profile.currency}
              onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
              className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-mono font-medium"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Business WhatsApp Phone</label>
            <input
              type="text"
              value={profile.contactPhone}
              onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })}
              className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-mono font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Contact Email</label>
            <input
              type="email"
              value={profile.contactEmail}
              onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
              className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-medium"
            />
          </div>
        </div>

        {/* Logo and Banner Asset Preview */}
        <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10 p-4 space-y-3 backdrop-blur-xs">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#C9A96E]" />
            <span>Official Company Logo & Storefront Banner</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex items-center gap-3">
              <img
                src={profile.logoUrl}
                alt="Logo preview"
                className="w-14 h-14 rounded-2xl object-contain bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-1.5 shadow-xs"
              />
              <div className="flex-1">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold block mb-1">Company Logo URL</span>
                <input
                  type="text"
                  value={profile.logoUrl}
                  onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
                  className="glass-input w-full text-xs px-3 py-2 rounded-xl font-mono"
                  placeholder="/heka-logo.jpg or https://..."
                />
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold block mb-1">Storefront Banner URL</span>
              <input
                type="text"
                value={profile.bannerUrl}
                onChange={(e) => setProfile({ ...profile, bannerUrl: e.target.value })}
                className="glass-input w-full text-xs px-3 py-2 rounded-xl font-mono"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10 p-4 space-y-3 backdrop-blur-xs">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#C9A96E]" />
            <span>Brand Colors & Theme Accent</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1.5">Primary Color (Hex)</span>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={profile.brandColors?.primary || '#101C35'}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      brandColors: { ...(profile.brandColors || { accent: '#C9A96E' }), primary: e.target.value }
                    })
                  }
                  className="w-10 h-10 rounded-xl border border-slate-200/80 dark:border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={profile.brandColors?.primary || '#101C35'}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      brandColors: { ...(profile.brandColors || { accent: '#C9A96E' }), primary: e.target.value }
                    })
                  }
                  className="glass-input flex-1 text-xs px-3 py-2 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1.5">Accent Color (Hex)</span>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={profile.brandColors?.accent || '#C9A96E'}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      brandColors: { ...(profile.brandColors || { primary: '#101C35' }), accent: e.target.value }
                    })
                  }
                  className="w-10 h-10 rounded-xl border border-slate-200/80 dark:border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={profile.brandColors?.accent || '#C9A96E'}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      brandColors: { ...(profile.brandColors || { primary: '#101C35' }), accent: e.target.value }
                    })
                  }
                  className="glass-input flex-1 text-xs px-3 py-2 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Public Settings */}
        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.settings.showRetailPricesPublicly}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  settings: { ...profile.settings, showRetailPricesPublicly: e.target.checked }
                })
              }
              className="w-4 h-4 rounded text-[#101C35] focus:ring-[#C9A96E] cursor-pointer accent-[#C9A96E]"
            />
            <span>Show retail prices publicly on storefront</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.settings.allowWholesaleQuoteRequests}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  settings: { ...profile.settings, allowWholesaleQuoteRequests: e.target.checked }
                })
              }
              className="w-4 h-4 rounded text-[#101C35] focus:ring-[#C9A96E] cursor-pointer accent-[#C9A96E]"
            />
            <span>Allow wholesale buyers to submit quote requests</span>
          </label>
        </div>
      </form>
    </div>
  );
};
