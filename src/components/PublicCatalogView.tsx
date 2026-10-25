import React, { useState } from 'react';
import {
  Search,
  Filter,
  Package,
  MessageCircle,
  FileText,
  Truck,
  Award,
  CheckCircle2,
  Tag,
  ArrowRight,
  Send,
  X,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Layers,
  Lock,
  ShieldCheck,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
  Globe,
  SlidersHorizontal,
  Check,
  RotateCcw
} from 'lucide-react';
import { Company, Product, Language, CustomerInquiry } from '../types';
import { translations } from '../translations';
import { api } from '../services/api';
import { ThemeToggle } from './ThemeToggle';

interface PublicCatalogViewProps {
  company: Company;
  products: Product[];
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenManagementPortal: () => void;
}

export const PublicCatalogView: React.FC<PublicCatalogViewProps> = ({
  company,
  products,
  currentLang,
  onLanguageChange,
  onOpenManagementPortal,
}) => {
  const t = translations[currentLang] || translations.en;
  const isRtl = currentLang === 'fa' || currentLang === 'ps';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Modals
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Quote / Inquiry Form State
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Available categories
  const categories = ['ALL', ...Array.from(new Set(products.filter((p) => p.isPublished).map((p) => p.category)))];

  // Filtered products list (Strictly published products only)
  const filteredProducts = products.filter((p) => {
    if (!p.isPublished) return false;

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      (p.nameFa && p.nameFa.toLowerCase().includes(term)) ||
      p.description.toLowerCase().includes(term) ||
      (p.descriptionFa && p.descriptionFa.toLowerCase().includes(term)) ||
      p.category.toLowerCase().includes(term);

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStock = !onlyInStock || p.stock > 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleOpenDetailsModal = (product: Product) => {
    setSelectedProductForDetails(product);
    setActiveImageIndex(0);
  };

  const handleOpenQuoteModal = (product: Product) => {
    setSelectedProductForQuote(product);
    setSubmitSuccess(false);
    setRequestedQuantity(product.wholesaleRules?.minQuantity || 1);
    setMessage(
      currentLang === 'fa'
        ? `سلام و احترام، ما مایل به دریافت پیش‌فاکتور رسمی و شرایط خرید عمده برای محصول «${product.nameFa || product.name}» می‌باشیم.`
        : currentLang === 'ps'
        ? `سلام، موږ د «${product.nameFa || product.name}» محصول لپاره رسمي نرخ او د عمده پېر شرایط غواړو.`
        : `Hello, we would like to request an official wholesale quotation and delivery terms for "${product.name}".`
    );
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerContact.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await api.submitPublicInquiry({
        companyId: company.id,
        customerName: customerName || 'Prospective Commercial Buyer',
        customerContact,
        customerLocation,
        inquiryType: 'wholesale_quote',
        productId: selectedProductForQuote?.id,
        productName: selectedProductForQuote?.name,
        requestedQuantity,
        message,
        replyLanguage: currentLang
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSelectedProductForQuote(null);
        setSubmitSuccess(false);
        setCustomerName('');
        setCustomerContact('');
        setMessage('');
      }, 2500);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectWhatsApp = (product?: Product) => {
    const phone = company.contactPhone ? company.contactPhone.replace(/[^0-9]/g, '') : '442079460991';
    let text = `Hello ${company.name}, I am visiting your official product catalog.`;
    if (product) {
      text = `Hello ${company.name}, I would like to inquire about "${product.name}" (Ref: ${product.id}). What are the current wholesale terms and availability?`;
    }
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen text-[#101C35] dark:text-[#F8FAFC] flex flex-col antialiased">
      {/* 1. PROFESSIONAL PUBLIC NAVIGATION BAR */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 dark:border-white/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={company.logoUrl || '/heka-logo.jpg'}
                alt={company.name}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-contain p-1 bg-white border border-[#C9A96E]/50 shadow-sm"
              />
              <span className="absolute -bottom-1 -end-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#101C35]" title="Verified Enterprise" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#101C35] dark:text-white text-base sm:text-lg tracking-tight">
                  {company.name}
                </span>
                <span className="glass-badge-gold text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-flex">
                  Official Trade Catalog
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
                {company.industry}
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Hidden on small mobile) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a
              href="#catalog-grid"
              className="px-3.5 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>{isRtl ? 'کاتالوگ محصولات' : 'Products & Catalog'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#101C35]/10 dark:bg-white/10 text-[#101C35] dark:text-[#C9A96E]">
                {products.filter((p) => p.isPublished).length}
              </span>
            </a>
            <a
              href="#about-section"
              className="px-3.5 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isRtl ? 'استانداردها و مشخصات' : 'Quality & Specifications'}</span>
            </a>
            <a
              href="#about-section"
              className="px-3.5 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{isRtl ? 'درباره شرکت و تماس' : 'About & Contact'}</span>
            </a>
          </nav>

          {/* Right Action Tools: Language Selector, Theme Toggle, Staff Portal Access */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct WhatsApp Action */}
            {company.contactPhone && (
              <button
                type="button"
                onClick={() => handleDirectWhatsApp()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-xs transition active:scale-95 cursor-pointer"
                title={t.openWhatsApp}
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t.openWhatsApp}</span>
              </button>
            )}

            {/* Language Selector */}
            <div className="flex items-center bg-white/60 dark:bg-slate-800/60 p-0.5 rounded-xl border border-slate-200/80 dark:border-white/10 backdrop-blur-xs text-xs">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  currentLang === 'en'
                    ? 'bg-[#101C35] dark:bg-[#C9A96E] text-white dark:text-[#101C35] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('fa')}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  currentLang === 'fa'
                    ? 'bg-[#101C35] dark:bg-[#C9A96E] text-white dark:text-[#101C35] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                دری
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('ps')}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  currentLang === 'ps'
                    ? 'bg-[#101C35] dark:bg-[#C9A96E] text-white dark:text-[#101C35] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                پښتو
              </button>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle currentLang={currentLang} variant="compact" />

            {/* Protected Staff Portal Button */}
            <button
              type="button"
              onClick={onOpenManagementPortal}
              className="px-3.5 py-2 rounded-xl text-xs font-bold glass-card hover:border-[#C9A96E]/50 text-[#101C35] dark:text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 group"
              title="Restricted Staff & Admin Management Portal"
            >
              <Lock className="w-3.5 h-3.5 text-[#C9A96E] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">
                {isRtl ? 'پورتال مدیران' : 'Staff Portal'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. INSTITUTIONAL HERO SECTION */}
      <section className="relative overflow-hidden py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60 dark:border-white/10 bg-gradient-to-br from-[#101C35] via-[#152445] to-[#0B1220] text-white">
        {/* Subtle luminous decorative aura */}
        <div className="absolute top-0 start-1/4 w-96 h-96 bg-[#C9A96E]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 end-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40 backdrop-blur-md">
              {company.industry}
            </span>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>{company.address || '100 Bishopsgate, London EC2N 4AG, United Kingdom'}</span>
            </span>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {company.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
              {currentLang === 'fa' && company.settings.customGreetingFa
                ? company.settings.customGreetingFa
                : company.settings.customGreetingEn ||
                  'High-grade commercial supply, wholesale distribution, and certified international customer service.'}
            </p>
          </div>

          {/* Institutional Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-4xl">
            <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#C9A96E]">
                <Award className="w-4 h-4" />
                <span>ISO Certified Batches</span>
              </div>
              <p className="text-[11px] text-slate-300">Grade 1 Laboratory Verified</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#C9A96E]">
                <Truck className="w-4 h-4" />
                <span>Global Express Cargo</span>
              </div>
              <p className="text-[11px] text-slate-300">Air CIP & Expedited Courier</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#C9A96E]">
                <Tag className="w-4 h-4" />
                <span>Wholesale Pricing</span>
              </div>
              <p className="text-[11px] text-slate-300">Volume Discounts & Quotes</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strict Traceability</span>
              </div>
              <p className="text-[11px] text-slate-300">Phytosanitary Certificates</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT CATALOG CONTROLS (SEARCH & CATEGORIES) */}
      <section id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="glass-card rounded-3xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute start-4 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="glass-input w-full text-xs sm:text-sm ps-11 pe-4 py-3 rounded-2xl font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute end-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* In-Stock Toggle & Reset */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 rounded text-[#101C35] focus:ring-[#C9A96E] cursor-pointer accent-[#C9A96E]"
                />
                <span>{t.inStockOnly}</span>
              </label>

              {(searchTerm || selectedCategory !== 'ALL' || onlyInStock) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('ALL');
                    setOnlyInStock(false);
                  }}
                  className="text-xs text-[#C9A96E] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isRtl ? 'پاک‌کردن فیلترها' : 'Clear Filters'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 me-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Category:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap backdrop-blur-xs ${
                  selectedCategory === cat
                    ? 'bg-[#101C35] dark:bg-[#C9A96E] text-white dark:text-[#101C35] font-bold shadow-sm'
                    : 'bg-white/50 dark:bg-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10'
                }`}
              >
                {cat === 'ALL' ? t.allCategories : cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4. REAL PRODUCTS GRID */}
        {filteredProducts.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-[#C9A96E]" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              {isRtl ? 'هیچ کالایی مطابق جستجو یا فیلتر شما یافت نشد' : 'No products match your current search or filters.'}
            </h3>
            <p className="text-xs max-w-md mx-auto">
              {isRtl
                ? 'لطفاً نام یا دسته‌بندی دیگری را جستجو نمایید یا فیلترها را بازنشانی کنید.'
                : 'Try adjusting your search query, switching categories, or clearing the in-stock filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const displayName = currentLang === 'fa' && product.nameFa ? product.nameFa : product.name;
              const displayDesc = currentLang === 'fa' && product.descriptionFa ? product.descriptionFa : product.description;

              return (
                <div
                  key={product.id}
                  className="glass-card rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Product Visual Presentation */}
                  <div
                    onClick={() => handleOpenDetailsModal(product)}
                    className="relative aspect-4/3 w-full bg-slate-100/50 dark:bg-slate-800/40 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={product.images[0] || '/heka-logo.jpg'}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    {/* Category Tag */}
                    <div className="absolute top-3 start-3">
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#101C35]/85 text-white backdrop-blur-md border border-white/15">
                        {product.category}
                      </span>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 end-3">
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-xs backdrop-blur-md ${
                          product.stock > 0
                            ? 'bg-emerald-600/90 text-white border border-emerald-400/40'
                            : 'bg-rose-600/90 text-white border border-rose-400/40'
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} ${t.unitsInStock}` : t.outOfStock}
                      </span>
                    </div>

                    {/* Quick view overlay icon */}
                    <div className="absolute inset-0 bg-[#101C35]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-xl bg-white/90 text-[#101C35] text-xs font-bold shadow-md backdrop-blur-md flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-[#C9A96E]" />
                        <span>{isRtl ? 'مشاهده کامل مشخصات' : 'View Full Details'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Product Details Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <h3
                        onClick={() => handleOpenDetailsModal(product)}
                        className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#C9A96E] transition leading-snug cursor-pointer line-clamp-2"
                      >
                        {displayName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{displayDesc}</p>

                      {/* Package Sizes / Variants Preview */}
                      {product.packageSizes && product.packageSizes.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            {t.packageSizesLabel}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {product.packageSizes.map((size) => (
                              <span
                                key={size.id}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/60 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 font-medium border border-slate-200/80 dark:border-white/10 backdrop-blur-xs font-mono"
                              >
                                {size.name}: {product.currency}{size.price.toLocaleString()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quality & Lab Certification Chip */}
                      {product.qualityInfo?.isConfirmed && (
                        <div className="text-[11px] text-amber-900 dark:text-amber-200 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 backdrop-blur-xs">
                          <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="truncate font-medium">
                            {[product.qualityInfo.grade, product.qualityInfo.standard].filter(Boolean).join(' • ')}
                          </span>
                        </div>
                      )}

                      {/* Shipping Logistics */}
                      {product.shippingDetails?.isConfirmed && product.shippingDetails?.transitTime && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{product.shippingDetails.transitTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="pt-3.5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3">
                      <div>
                        {company.settings?.showRetailPricesPublicly ? (
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block">{t.retailPrice}</span>
                            <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                              {product.currency}{product.retailPrice.toLocaleString()}
                              <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> / {product.unit}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg">
                            Commercial Quote Only
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetailsModal(product)}
                          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                          title="View Specifications"
                        >
                          <Info className="w-4 h-4 text-[#C9A96E]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenQuoteModal(product)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#101C35] hover:bg-[#192b52] dark:bg-[#C9A96E] dark:hover:bg-[#d4b984] text-white dark:text-[#101C35] transition cursor-pointer shadow-sm border border-[#C9A96E]/30 active:scale-95"
                        >
                          {t.requestQuoteBtn}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. INSTITUTIONAL ABOUT & CONTACT SECTION */}
      <section id="about-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="glass-card rounded-3xl p-8 sm:p-10 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200/80 dark:border-white/10 pb-6">
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#C9A96E] block">
                {isRtl ? 'هویت سازمانی و ارتباط تجاری' : 'Corporate Entity & Trade Desk'}
              </span>
              <h2 className="text-2xl font-extrabold text-[#101C35] dark:text-white">
                {company.name} – {isRtl ? 'مرکز بازرگانی بین‌المللی' : 'Global Distribution Center'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                {isRtl
                  ? 'ارائه‌دهنده رسمی محصولات و زنجیره تأمین تجاری با بالاترین رتبه کیفی آزمایشگاهی و ترخیص بین‌المللی.'
                  : 'Licensed commercial supplier providing bulk consignments, certified luxury reserve editions, and verified international trade delivery.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDirectWhatsApp()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>{isRtl ? 'ارتباط مستقیم واتساپ' : 'Open WhatsApp Trade Desk'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Corporate Headquarters</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {company.address || '100 Bishopsgate, London EC2N 4AG'}
              </p>
              <span className="text-slate-500">{company.country || 'United Kingdom'}</span>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Verified Trade Contacts</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {company.contactPhone || '+44 20 7946 0991'}
              </p>
              <p className="text-slate-500 font-mono">{company.contactEmail || 'contact@hekaltd.com'}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">International Compliance</span>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>ISO 9001 / ISO 22000 Certified</span>
              </p>
              <span className="text-slate-500">Phytosanitary Certificates Provided</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PUBLIC FOOTER */}
      <footer className="mt-auto glass-panel border-t border-slate-200/80 dark:border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#101C35] dark:text-white">{company.name}</span>
            <span>·</span>
            <span>© {new Date().getFullYear()} All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#catalog-grid" className="hover:text-[#C9A96E] transition">
              {isRtl ? 'کاتالوگ محصولات' : 'Product Catalog'}
            </a>
            <span>·</span>
            <button
              type="button"
              onClick={onOpenManagementPortal}
              className="text-[#101C35] dark:text-[#C9A96E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isRtl ? 'ورود مدیران و همکاران' : 'Staff & Trade Portal'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 7. DETAILED PRODUCT SPECIFICATIONS MODAL */}
      {selectedProductForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101C35]/65 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-modal rounded-3xl max-w-3xl w-full my-8 overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#101C35] to-[#1c2e56] dark:from-[#C9A96E]/20 dark:to-[#C9A96E]/5 flex items-center justify-center border border-[#C9A96E]/30">
                  <Package className="w-4 h-4 text-[#C9A96E]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#101C35] dark:text-white text-base">
                    {isRtl ? 'مشخصات کامل و مدارک کیفی محصول' : 'Product Details & Technical Specifications'}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Ref: {selectedProductForDetails.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductForDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              {/* Product Gallery & Core Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10">
                    <img
                      src={selectedProductForDetails.images[activeImageIndex] || selectedProductForDetails.images[0] || '/heka-logo.jpg'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Thumbnail Row */}
                  {selectedProductForDetails.images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {selectedProductForDetails.images.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveImageIndex(i)}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                            activeImageIndex === i ? 'border-[#C9A96E]' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/70 text-slate-800 dark:text-slate-200">
                      {selectedProductForDetails.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        selectedProductForDetails.stock > 0
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {selectedProductForDetails.stock > 0
                        ? `${selectedProductForDetails.stock} units in stock`
                        : 'Out of Stock'}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-extrabold text-[#101C35] dark:text-white">
                    {currentLang === 'fa' && selectedProductForDetails.nameFa
                      ? selectedProductForDetails.nameFa
                      : selectedProductForDetails.name}
                  </h2>
                  {selectedProductForDetails.nameFa && currentLang === 'en' && (
                    <p className="text-xs text-slate-500">{selectedProductForDetails.nameFa}</p>
                  )}

                  {company.settings?.showRetailPricesPublicly && (
                    <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-xs flex items-baseline gap-2">
                      <span className="text-xs uppercase text-slate-400 font-bold">Standard Price:</span>
                      <strong className="text-xl font-extrabold text-[#101C35] dark:text-[#C9A96E] font-mono">
                        {selectedProductForDetails.currency}{selectedProductForDetails.retailPrice.toLocaleString()}
                      </strong>
                      <span className="text-xs text-slate-500">/ {selectedProductForDetails.unit}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {currentLang === 'fa' && selectedProductForDetails.descriptionFa
                      ? selectedProductForDetails.descriptionFa
                      : selectedProductForDetails.description}
                  </p>
                </div>
              </div>

              {/* Package Sizes / Variants Table */}
              {selectedProductForDetails.packageSizes && selectedProductForDetails.packageSizes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Commercial Package Sizes & Bulk Options</span>
                  </h4>
                  <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-slate-800/40">
                    <table className="w-full text-left rtl:text-right border-collapse text-xs">
                      <thead>
                        <tr className="glass-table-head text-[10px] uppercase text-slate-500">
                          <th className="py-2.5 px-3.5">Option Name</th>
                          <th className="py-2.5 px-3">Size / Weight</th>
                          <th className="py-2.5 px-3">Availability</th>
                          <th className="py-2.5 px-3.5 text-right rtl:text-left">Unit Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                        {selectedProductForDetails.packageSizes.map((size) => (
                          <tr key={size.id} className="glass-table-row">
                            <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">{size.name}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{size.weightOrSize}</td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold">
                                In Stock
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 text-right rtl:text-left font-mono font-bold text-[#101C35] dark:text-[#C9A96E]">
                              {selectedProductForDetails.currency}{size.price.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Attributes & Specifications Grid */}
              {selectedProductForDetails.attributes && selectedProductForDetails.attributes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Specifications & Technical Attributes</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {selectedProductForDetails.attributes.map((attr, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">{attr.key}</span>
                        <strong className="text-xs text-slate-900 dark:text-white block mt-0.5">{attr.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality & Laboratory Report */}
              {selectedProductForDetails.qualityInfo?.isConfirmed && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                    <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Quality Assurance & Official Laboratory Certification</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-950 dark:text-amber-100">
                    <div>
                      <span className="text-[10px] opacity-75 block">Standard:</span>
                      <strong>{selectedProductForDetails.qualityInfo.standard || 'ISO Standards Certified'}</strong>
                    </div>
                    {selectedProductForDetails.qualityInfo.labReportNumber && (
                      <div>
                        <span className="text-[10px] opacity-75 block">Lab Report Document:</span>
                        <strong className="font-mono">{selectedProductForDetails.qualityInfo.labReportNumber}</strong>
                      </div>
                    )}
                  </div>
                  {selectedProductForDetails.qualityInfo.notes && (
                    <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 italic pt-1 border-t border-amber-500/20">
                      &ldquo;{selectedProductForDetails.qualityInfo.notes}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Wholesale Rules & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedProductForDetails.wholesaleRules && (
                  <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10 space-y-1.5">
                    <span className="font-bold text-xs text-slate-800 dark:text-white block">
                      Wholesale Concessions & MOQ
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Minimum order: <strong className="font-mono">{selectedProductForDetails.wholesaleRules.minQuantity} units</strong>.
                      Tiered discount: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{selectedProductForDetails.wholesaleRules.discountPercent}% off</strong>.
                    </p>
                    {selectedProductForDetails.wholesaleRules.termsNote && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {currentLang === 'fa' && selectedProductForDetails.wholesaleRules.termsNoteFa
                          ? selectedProductForDetails.wholesaleRules.termsNoteFa
                          : selectedProductForDetails.wholesaleRules.termsNote}
                      </p>
                    )}
                  </div>
                )}

                {selectedProductForDetails.shippingDetails && (
                  <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10 space-y-1.5">
                    <span className="font-bold text-xs text-slate-800 dark:text-white block">
                      Dispatch & International Shipping
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Transit time: <strong>{selectedProductForDetails.shippingDetails.transitTime}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Coverage: {selectedProductForDetails.shippingDetails.coverage}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer CTAs */}
            <div className="px-6 py-4 border-t border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDirectWhatsApp(selectedProductForDetails)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isRtl ? 'استعلام در واتساپ' : 'Inquire on WhatsApp'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductForDetails(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                >
                  {t.closeModal}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const prod = selectedProductForDetails;
                    setSelectedProductForDetails(null);
                    handleOpenQuoteModal(prod);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#101C35] hover:bg-[#192b52] dark:bg-[#C9A96E] dark:hover:bg-[#d4b984] text-white dark:text-[#101C35] transition shadow-md border border-[#C9A96E]/30 cursor-pointer active:scale-95"
                >
                  {t.requestQuoteBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. REQUEST-A-QUOTATION / INQUIRY MODAL */}
      {selectedProductForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101C35]/65 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-modal rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#101C35] to-[#1c2e56] dark:from-[#C9A96E]/20 dark:to-[#C9A96E]/5 flex items-center justify-center border border-[#C9A96E]/30">
                  <FileText className="w-4 h-4 text-[#C9A96E]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#101C35] dark:text-white text-base">{t.quoteModalTitle}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct transmission to HEKA LTD Trade Desk</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductForQuote(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmitQuote} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              {submitSuccess ? (
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-8 text-center text-emerald-900 dark:text-emerald-200 space-y-2 backdrop-blur-xs">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <p className="font-bold text-base">{t.inquirySubmittedSuccess}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    A corporate trade specialist from HEKA LTD will contact you shortly with formal consignment rates.
                  </p>
                </div>
              ) : (
                <>
                  {/* Selected Product Snapshot */}
                  <div className="rounded-2xl bg-white/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10 p-3.5 flex items-center justify-between backdrop-blur-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-bold">Selected Item:</span>
                      <strong className="text-xs sm:text-sm text-slate-900 dark:text-white">{selectedProductForQuote.name}</strong>
                    </div>
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-[#101C35]/10 dark:bg-white/10 text-[#101C35] dark:text-[#C9A96E]">
                      {selectedProductForQuote.currency}{selectedProductForQuote.retailPrice.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.yourName}</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ahmad Khan or Global Trading Ltd"
                      className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t.contactInfo} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerContact}
                        onChange={(e) => setCustomerContact(e.target.value)}
                        placeholder="WhatsApp phone or email"
                        className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-medium font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.desiredQuantity}</label>
                      <input
                        type="number"
                        min="1"
                        value={requestedQuantity}
                        onChange={(e) => setRequestedQuantity(parseInt(e.target.value, 10) || 1)}
                        className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-mono font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.location}</label>
                    <input
                      type="text"
                      value={customerLocation}
                      onChange={(e) => setCustomerLocation(e.target.value)}
                      placeholder="e.g. Kabul, Dubai, Frankfurt, London, Istanbul"
                      className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.inquiryMessage} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="glass-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl resize-none leading-relaxed font-sans"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setSelectedProductForQuote(null)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      {t.cancelBtn}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#101C35] to-[#1c2e56] hover:from-[#192b52] hover:to-[#223a6c] dark:from-[#C9A96E] dark:to-[#d4b984] text-white dark:text-[#101C35] transition flex items-center gap-1.5 shadow-md cursor-pointer border border-[#C9A96E]/30 active:scale-95"
                    >
                      {isSubmitting ? (
                        <span>Sending to HEKA Trade Desk...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-[#C9A96E] dark:text-[#101C35]" />
                          <span>{t.submitInquiryBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
