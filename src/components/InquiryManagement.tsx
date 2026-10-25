import React from 'react';
import { MessageSquare, Phone, MapPin, Package, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { CustomerInquiry, Language } from '../types';
import { translations } from '../translations';

interface InquiryManagementProps {
  inquiries: CustomerInquiry[];
  onSelectForAIReply: (inquiry: CustomerInquiry) => void;
  currentLang: Language;
}

export const InquiryManagement: React.FC<InquiryManagementProps> = ({
  inquiries,
  onSelectForAIReply,
  currentLang,
}) => {
  const t = translations[currentLang];

  return (
    <div className="space-y-5">
      {/* Title Header with Frosted Glass */}
      <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-extrabold text-[#101C35] dark:text-white">{t.tabInquiries}</h2>
            <span className="glass-badge-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {inquiries.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {currentLang === 'fa'
              ? 'مدیریت استعلام‌های دریافتی از کاتالوگ عمومی و درخواست‌های پیش‌فاکتور عمده'
              : 'Manage buyer questions and wholesale quote requests submitted from your public storefront'}
          </p>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8 text-[#C9A96E]" />
          </div>
          <p className="font-bold text-slate-900 dark:text-white text-base">No customer inquiries yet.</p>
          <p className="text-xs max-w-md mx-auto">Incoming trade inquiries and wholesale RFQs from your public catalog will appear here in real-time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="glass-card rounded-3xl p-6 transition-all duration-200 hover:shadow-lg space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-200/80 dark:border-white/10 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-xs ${
                      inq.inquiryType === 'wholesale_quote'
                        ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                        : inq.inquiryType === 'export_inquiry'
                        ? 'bg-blue-500/10 text-blue-900 dark:text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {inq.inquiryType.toUpperCase().replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-sm text-[#101C35] dark:text-white">{inq.customerName}</h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(inq.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Inquiry Details Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 backdrop-blur-xs">
                  <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span className="font-mono text-slate-900 dark:text-slate-200">{inq.customerContact}</span>
                </div>

                {inq.customerLocation && (
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 backdrop-blur-xs">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-slate-900 dark:text-slate-200">{inq.customerLocation}</span>
                  </div>
                )}

                {inq.productName && (
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 backdrop-blur-xs">
                    <Package className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
                    <span className="truncate text-slate-900 dark:text-slate-200 font-medium">
                      {inq.productName} ({inq.requestedQuantity} units)
                    </span>
                  </div>
                )}
              </div>

              {/* Message text */}
              <div className="bg-white/60 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-sans shadow-inner backdrop-blur-xs">
                {inq.message}
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => onSelectForAIReply(inq)}
                  className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#101C35] to-[#1c2e56] hover:from-[#192b52] hover:to-[#223a6c] dark:from-[#C9A96E] dark:to-[#d4b984] text-white dark:text-[#101C35] transition flex items-center gap-2 shadow-md cursor-pointer active:scale-95 border border-[#C9A96E]/30"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A96E] dark:text-[#101C35]" />
                  <span>{currentLang === 'fa' ? 'پاسخ هوشمند با هوش مصنوعی' : 'Draft Reply with AI Sales Assistant'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
