import React, { useState } from 'react';
import { Lock, ShieldCheck, UserCheck, ArrowRight, X, KeyRound, AlertCircle, Building2 } from 'lucide-react';
import { Company, Language, User } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, company: Company | null) => void;
  currentLang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentLang,
}) => {
  if (!isOpen) return null;
  const isRtl = currentLang === 'fa' || currentLang === 'ps';

  const [email, setEmail] = useState('admin@hekaltd.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const quickUsers = [
    {
      name: 'HEKA Corporate Director',
      email: 'admin@hekaltd.com',
      company: 'HEKA LTD (London)',
      role: 'company_admin'
    },
    {
      name: 'Platform Administrator',
      email: 'owner@dukanai.com',
      company: 'SaaS Platform Owner',
      role: 'platform_owner'
    },
    {
      name: 'Ziba Samimi (Founder)',
      email: 'admin@zibafashion.com',
      company: 'Ziba Silk & Apparel',
      role: 'company_admin'
    }
  ];

  const handleLogin = async (e?: React.FormEvent, selectedEmail?: string) => {
    if (e) e.preventDefault();
    const targetEmail = selectedEmail || email;
    if (!targetEmail.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.login(targetEmail.trim());
      onSuccess(res.user, res.company);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101C35]/65 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-modal rounded-3xl max-w-lg w-full overflow-hidden my-8 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#101C35] to-[#1c2e56] dark:from-[#C9A96E]/20 dark:to-[#C9A96E]/5 flex items-center justify-center border border-[#C9A96E]/30">
              <Lock className="w-4 h-4 text-[#C9A96E]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#101C35] dark:text-white text-base">
                {isRtl ? 'درگاه ورود به بخش مدیریت شرکت' : 'Staff & Corporate Portal Access'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isRtl ? 'بخش حفاظت‌شده ویژه مدیران و همکاران مجاز' : 'Restricted authorized personnel area'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Verified Profiles */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {isRtl ? 'انتخاب سریع حساب کاربری مجاز:' : 'Select Authorized Enterprise Account:'}
            </label>
            <div className="space-y-2">
              {quickUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => {
                    setEmail(u.email);
                    handleLogin(undefined, u.email);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left rtl:text-right transition flex items-center justify-between cursor-pointer ${
                    email === u.email
                      ? 'border-[#C9A96E] bg-[#C9A96E]/10 dark:bg-[#C9A96E]/15'
                      : 'border-slate-200/70 dark:border-white/10 bg-white/50 dark:bg-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#101C35]/10 dark:bg-white/10 flex items-center justify-center text-[#101C35] dark:text-[#C9A96E]">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 dark:text-white block">{u.name}</strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{u.company}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200/80 dark:border-white/10"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase tracking-wider">
              {isRtl ? 'یا ورود با برچسب سازمانی' : 'Or enter credentials'}
            </span>
            <div className="flex-grow border-t border-slate-200/80 dark:border-white/10"></div>
          </div>

          {/* Form */}
          <form onSubmit={(e) => handleLogin(e)} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRtl ? 'برچسب یا ایمیل سازمانی' : 'Corporate Email Address'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hekaltd.com"
                className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRtl ? 'کلید احراز هویت / گذرواژه' : 'Authorization Key / Password'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-mono"
              />
            </div>

            <div className="p-3 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-white/10 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {isRtl
                  ? 'ارتباط محافظت‌شده با پروتکل‌های احراز هویت ایزوله شرکت HEKA LTD'
                  : 'Isolated token-based authorization with tenant data boundary enforcement.'}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
              >
                {isRtl ? 'انصراف و بازگشت به کاتالوگ' : 'Back to Public Catalog'}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#101C35] to-[#1c2e56] hover:from-[#192b52] hover:to-[#223a6c] dark:from-[#C9A96E] dark:to-[#d4b984] text-white dark:text-[#101C35] transition flex items-center gap-2 shadow-md cursor-pointer border border-[#C9A96E]/30 active:scale-95"
              >
                {isLoading ? (
                  <span>{isRtl ? 'در حال ورود...' : 'Verifying...'}</span>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5 text-[#C9A96E] dark:text-[#101C35]" />
                    <span>{isRtl ? 'ورود به پنل مدیریت' : 'Access Management Portal'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
