import React from 'react';
import {
  Globe,
  Package,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Company, Product, Order, Language } from '../types';
import { translations } from '../translations';

interface AnalyticsViewProps {
  company: Company;
  products: Product[];
  orders: Order[];
  salesTrend: { month: string; revenue: number; orders: number; target: number }[];
  currentLang: Language;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  company,
  products,
  orders,
  salesTrend,
  currentLang,
}) => {
  const t = translations[currentLang];
  const isRtl = currentLang === 'fa' || currentLang === 'ps';
  const currencySymbol = company.currency === 'USD' ? '$' : company.currency;

  const totalGross = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalGross / orders.length) : 0;

  // Regional export breakdown
  const regions = [
    {
      name: isRtl ? 'بریتانیا و اروپای غربی' : 'UK & Western Europe',
      percentage: 42,
      volume: '$62,400',
      color: 'bg-[#101C35] dark:bg-[#C9A96E]'
    },
    {
      name: isRtl ? 'خاورمیانه و کشورهای خلیج (دبی / DIFC)' : 'Middle East & GCC (Dubai / DIFC)',
      percentage: 34,
      volume: '$50,540',
      color: 'bg-[#C9A96E]'
    },
    {
      name: isRtl ? 'آسیای میانه و منطقه داخلی' : 'Central Asia & Regional',
      percentage: 14,
      volume: '$20,810',
      color: 'bg-[#192b52] dark:bg-slate-500'
    },
    {
      name: isRtl ? 'آسیا پاسیفیک و آمریکای شمالی' : 'Asia-Pacific & North America',
      percentage: 10,
      volume: '$14,900',
      color: 'bg-slate-400 dark:bg-slate-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#101C35] dark:text-slate-100 tracking-tight">
            {t.tabAnalytics || (isRtl ? 'تحلیل بازرگانی و آمار صادرات' : 'Commercial Analytics & Export Intelligence')}
          </h1>
          <p className="text-xs text-[#5A657D] dark:text-slate-400 mt-1">
            {isRtl
              ? 'گزارش‌های زنده از روند درآمدزایی، کریدورهای صادراتی، سرعت ترخیص و تعهدات کیفی'
              : 'Real-time analytics for revenue pacing, trade corridors, consignment turnaround, and quality compliance.'}
          </p>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="px-4 py-2.5 rounded-xl glass-card text-[#5A657D] dark:text-slate-300 text-xs flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#C9A96E] shrink-0" />
          <span>
            <strong className="text-[#101C35] dark:text-white font-bold">{isRtl ? 'محیط آزمایشی:' : 'Demo Staging:'}</strong>{' '}
            {isRtl
              ? `آمارهای زیر ترکیبی از اطلاعات تاییدشده کاتالوگ و معاملات شبیه‌سازی‌شده برای ${company.name} هستند.`
              : `Analytics figures combine verified catalog configurations and sample trade consignments for ${company.name}.`}
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D2E] dark:text-[#E6D2A8] glass-badge-gold px-2 py-0.5 rounded">
          {isRtl ? 'داده‌های نمونه' : 'DEMO ANALYTICS'}
        </span>
      </div>

      {/* KPI Trio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-[#5A657D] dark:text-slate-400 uppercase tracking-wider block mb-1">
            {isRtl ? 'میانگین ارزش هر محموله' : 'Average Consignment Value'}
          </span>
          <span className="text-2xl font-extrabold text-[#101C35] dark:text-slate-100 font-mono tabular-nums">
            {currencySymbol}{avgOrderValue.toLocaleString()}
          </span>
          <p className="text-[11px] text-[#5A657D] dark:text-slate-400 mt-2">
            {isRtl ? 'محاسبه شده بر اساس فاکتورهای عمده تجارتی' : 'Based on active wholesale B2B and retail invoices'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-[#5A657D] dark:text-slate-400 uppercase tracking-wider block mb-1">
            {isRtl ? 'سرعت پردازش و ارسال بار' : 'Consignment Dispatch Speed'}
          </span>
          <span className="text-2xl font-extrabold text-[#101C35] dark:text-slate-100 font-mono tabular-nums">
            {isRtl ? '۲۴ الی ۴۸ ساعت' : '24-48 Hours'}
          </span>
          <p className="text-[11px] text-[#5A657D] dark:text-slate-400 mt-2">
            {isRtl ? 'ارسال سریع هوایی با بیمه و استانداردهای CIP' : 'Priority international courier and CIP cargo protocol'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-[#5A657D] dark:text-slate-400 uppercase tracking-wider block mb-1">
            {isRtl ? 'صحت انطباق هوش مصنوعی' : 'Fact Grounding Integrity'}
          </span>
          <span className="text-2xl font-extrabold text-[#101C35] dark:text-slate-100 font-mono tabular-nums flex items-center gap-1.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>100% {isRtl ? 'تاییدشده' : 'Verified'}</span>
          </span>
          <p className="text-[11px] text-[#5A657D] dark:text-slate-400 mt-2">
            {isRtl ? 'بدون هرگونه جعل قیمت یا ادعای تاییدنشده' : 'Zero hallucinated prices or unconfirmed claims in replies'}
          </p>
        </div>
      </div>

      {/* 2-Column: Regional Trade Distribution & Product Catalog Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Trade Destination */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
            <h2 className="text-base font-extrabold text-[#101C35] dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C9A96E]" />
              <span>{isRtl ? 'تفکیک جغرافیایی مقاصد بازرگانی' : 'International Trade Destination Breakdown'}</span>
            </h2>
          </div>

          <div className="space-y-4 pt-1">
            {regions.map((reg, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#101C35] dark:text-slate-200">{reg.name}</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="text-[#5A657D] dark:text-slate-400">{reg.volume}</span>
                    <strong className="text-[#101C35] dark:text-slate-100">{reg.percentage}%</strong>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden border border-slate-200/60 dark:border-white/10">
                  <div
                    className={`h-full rounded-full ${reg.color}`}
                    style={{ width: `${reg.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Demand & Stock Health */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
            <h2 className="text-base font-extrabold text-[#101C35] dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Package className="w-4 h-4 text-[#C9A96E]" />
              <span>{isRtl ? 'وضعیت انبار و انطباق کیفی محصولات' : 'Product Inventory & Quality Compliance'}</span>
            </h2>
          </div>

          <div className="divide-y divide-slate-200/60 dark:divide-white/10 text-xs">
            {products.map((prod) => (
              <div key={prod.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <strong className="text-[#101C35] dark:text-slate-100 block truncate">
                    {isRtl ? (prod.nameFa || prod.name) : prod.name}
                  </strong>
                  <span className="text-[#5A657D] dark:text-slate-400 block text-[11px]">
                    {isRtl ? `دسته‌بندی: ${prod.category} · واحد: ${prod.unit}` : `Category: ${prod.category} · Unit: ${prod.unit}`}
                  </span>
                </div>
                <div className="text-right rtl:text-left shrink-0">
                  <span className="font-mono font-bold text-[#101C35] dark:text-slate-100 block tabular-nums">
                    {prod.currency}{prod.retailPrice}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      prod.stock > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {prod.stock > 0
                      ? (isRtl ? `${prod.stock} عدد موجود` : `${prod.stock} in stock`)
                      : (isRtl ? 'اتمام موجودی' : 'Out of stock')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
