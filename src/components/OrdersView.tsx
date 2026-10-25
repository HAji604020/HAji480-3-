import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Download,
  Info,
  Calendar,
  Building,
  CheckCircle2
} from 'lucide-react';
import { Order, Company, Language } from '../types';
import { translations } from '../translations';

interface OrdersViewProps {
  company: Company;
  orders: Order[];
  currentLang: Language;
  onSelectOrder: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  company,
  orders,
  currentLang,
  onSelectOrder,
}) => {
  const t = translations[currentLang];
  const isRtl = currentLang === 'fa' || currentLang === 'ps';
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currencySymbol = company.currency === 'USD' ? '$' : company.currency;

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchComp = order.clientCompany?.toLowerCase().includes(q) || false;
      const matchDest = order.customerLocation.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchComp && !matchDest) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Client Company', 'Destination', 'Total', 'Status', 'Payment'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName}"`,
      `"${o.clientCompany || ''}"`,
      `"${o.customerLocation}"`,
      o.totalAmount,
      o.status,
      o.paymentStatus
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${company.slug}-orders-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColors: Record<string, string> = {
    shipped: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20',
    processing: 'bg-[#C9A96E]/15 text-[#8C6D2E] dark:text-[#E6D2A8] border-[#C9A96E]/30',
    pending: 'bg-black/5 dark:bg-white/10 text-[#5A657D] dark:text-slate-300 border-slate-200/60 dark:border-white/10',
    cancelled: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#101C35] dark:text-slate-100 tracking-tight">
              {t.tabOrders || (isRtl ? 'سفارشات و محموله‌های تجارتی' : 'Commercial Orders & Consignments')}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-black/5 dark:bg-white/10 text-[#101C35] dark:text-slate-200 border border-slate-200/60 dark:border-white/10 tabular-nums">
              {filteredOrders.length} {isRtl ? 'سفارش' : (filteredOrders.length === 1 ? 'Order' : 'Orders')}
            </span>
          </div>
          <p className="text-xs text-[#5A657D] dark:text-slate-400 mt-1">
            {isRtl
              ? 'مدیریت بارنامه‌های صادراتی، پیگیری گمرکی و بازبینی فاکتورهای عمده‌فروشی'
              : 'Manage wholesale shipments, customs clearances, and inspect commercial invoices.'}
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl text-xs font-bold glass-card hover:border-[#C9A96E]/50 text-[#101C35] dark:text-slate-200 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <Download className="w-4 h-4 text-[#C9A96E]" />
          <span>{isRtl ? 'خروجی اکسل / CSV' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Demo Notice */}
      <div className="px-4 py-2.5 rounded-xl glass-card text-[#5A657D] dark:text-slate-300 text-xs flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#C9A96E] shrink-0" />
          <span>
            <strong className="text-[#101C35] dark:text-white font-bold">{isRtl ? 'محیط آزمایشی:' : 'Demo Staging:'}</strong>{' '}
            {isRtl
              ? `سفارشات زیر فرآیند ارسال و صدور پیش‌فاکتور برای ${company.name} را شبیه‌سازی می‌کنند.`
              : `Consignments below illustrate realistic B2B consignment workflows for ${company.name}.`}
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D2E] dark:text-[#E6D2A8] glass-badge-gold px-2 py-0.5 rounded">
          {isRtl ? 'داده‌های نمونه' : 'DEMO DATA'}
        </span>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-black/30 p-1 rounded-xl border border-slate-200/60 dark:border-white/10 text-xs font-semibold overflow-x-auto">
          {['all', 'processing', 'shipped', 'delivered', 'pending'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#101C35] dark:bg-[#C9A96E] text-white dark:text-[#0B1220] shadow-xs font-bold'
                  : 'text-[#5A657D] dark:text-slate-400 hover:text-[#101C35] dark:hover:text-white'
              }`}
            >
              {isRtl
                ? { all: 'همه', processing: 'در حال پردازش', shipped: 'ارسال شده', delivered: 'تحویل شده', pending: 'در انتظار' }[st] || st
                : st}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative flex-1 max-w-xs">
          <Search
            className={`w-4 h-4 text-[#5A657D] dark:text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${
              isRtl ? 'right-3' : 'left-3'
            }`}
          />
          <input
            type="text"
            placeholder={isRtl ? 'جستجو بر اساس شماره سفارش، مشتری، کشور...' : 'Search by order #, client, country...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs py-2 rounded-xl glass-input ${
              isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="glass-table-head text-[11px] font-bold text-[#5A657D] dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3 px-4">{isRtl ? 'سفارش' : 'Order'}</th>
                <th className="py-3 px-4">{isRtl ? 'مشتری / سازمان خریدار' : 'Client Organization'}</th>
                <th className="py-3 px-4">{isRtl ? 'اقلام محموله' : 'Consignment Items'}</th>
                <th className="py-3 px-4">{isRtl ? 'مبلغ و تسویه' : 'Amount & Payment'}</th>
                <th className="py-3 px-4">{isRtl ? 'باربری و رهگیری' : 'Carrier & Tracking'}</th>
                <th className="py-3 px-4">{isRtl ? 'وضعیت' : 'Status'}</th>
                <th className="py-3 px-4 text-right rtl:text-left">{isRtl ? 'مشاهده' : 'Invoice'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/10">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className="glass-table-row cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#101C35] dark:text-slate-100 block tabular-nums">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-[#5A657D] dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-[#101C35] dark:text-slate-100 block font-bold">
                        {order.customerName}
                      </strong>
                      <span className="text-[#5A657D] dark:text-slate-400 block text-[11px]">
                        {order.clientCompany || order.customerLocation}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="text-[#101C35] dark:text-slate-200 truncate">
                          <span className="font-mono font-bold text-[#C9A96E]">{it.quantity}x</span> {it.productName}
                        </div>
                      ))}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#101C35] dark:text-slate-100 text-sm block tabular-nums">
                        {order.currency}{order.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 capitalize font-medium">
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[#101C35] dark:text-slate-200 font-medium block truncate max-w-[150px]">
                        {order.shippingMethod}
                      </span>
                      {order.trackingNumber && (
                        <span className="font-mono text-[10px] text-[#C9A96E] block font-semibold">
                          {order.trackingNumber}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                          statusColors[order.status] || 'bg-black/5 text-[#5A657D]'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right rtl:text-left">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(order);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#101C35] dark:bg-[#C9A96E] hover:bg-[#192b52] dark:hover:bg-[#d8be8d] text-white dark:text-[#0B1220] transition shadow-2xs cursor-pointer"
                      >
                        {isRtl ? 'پیش‌فاکتور' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#5A657D] dark:text-slate-400">
                    {isRtl ? 'هیچ سفارشی با شرایط جستجو یافت نشد.' : 'No orders match your filter criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
