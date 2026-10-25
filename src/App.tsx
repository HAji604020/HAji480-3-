import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { CustomersView } from './components/CustomersView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { OrderDetailModal } from './components/OrderDetailModal';
import { NotificationsModal } from './components/NotificationsModal';
import { PublicCatalogView } from './components/PublicCatalogView';
import { ProductManagement } from './components/ProductManagement';
import { SalesAIView } from './components/SalesAIView';
import { InquiryManagement } from './components/InquiryManagement';
import { CompanyProfileView } from './components/CompanyProfileView';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SupportView } from './components/SupportView';
import { AuthModal } from './components/AuthModal';
import {
  Company,
  Product,
  User,
  CustomerInquiry,
  Language,
  Order,
  Customer,
  ActivityItem,
  AppNotification,
  SupportTicket
} from './types';
import {
  sampleOrders,
  sampleCustomers,
  sampleActivities,
  sampleNotifications,
  sampleSalesTrend
} from './data/sampleData';
import { translations } from './translations';
import { api } from './services/api';
import { ShieldCheck, ArrowLeft, Bell, Store, Lock } from 'lucide-react';

export default function App() {
  // Persist language across reloads
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('heka_lang');
      if (stored === 'fa' || stored === 'en' || stored === 'ps') return stored;
    } catch {
      // fallback
    }
    return 'en';
  });

  // Protected route checking: Default visitor view is ALWAYS 'public' (Customer-First Homepage)
  const getInitialRoute = (): 'public' | 'admin' => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = new URLSearchParams(window.location.search);
      const isAuthLoggedIn = localStorage.getItem('heka_auth_logged_in') === 'true';

      if (
        (path === '/admin' || path === '/dashboard' || path === '/portal' || hash === '#admin' || hash === '#dashboard' || search.get('view') === 'admin') &&
        isAuthLoggedIn
      ) {
        return 'admin';
      }
    } catch {
      // fallback
    }
    return 'public'; // DEFAULT is ALWAYS Customer-First Public Homepage & Catalog!
  };

  const [currentRoute, setCurrentRoute] = useState<'public' | 'admin'>(getInitialRoute);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('heka_auth_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState<boolean>(false);

  // Tenant & User state
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user_heka_admin',
    email: 'admin@hekaltd.com',
    name: 'HEKA Corporate Director',
    role: 'company_admin',
    companyId: 'comp_heka_ltd',
    token: 'token_heka_admin_secret'
  });

  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<Order[]>(sampleOrders['comp_heka_ltd'] || []);
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers['comp_heka_ltd'] || []);
  const [activities, setActivities] = useState<ActivityItem[]>(sampleActivities['comp_heka_ltd'] || []);
  const [notifications, setNotifications] = useState<AppNotification[]>(sampleNotifications['comp_heka_ltd'] || []);
  const [salesTrend, setSalesTrend] = useState<{ month: string; revenue: number; orders: number; target: number }[]>(
    sampleSalesTrend['comp_heka_ltd'] || []
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = useState<boolean>(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);

  // Transfer state from inquiry to AI Sales Assistant
  const [inquiryForAI, setInquiryForAI] = useState<CustomerInquiry | null>(null);

  const isRtl = currentLang === 'fa' || currentLang === 'ps';

  // Sync RTL/LTR & language in HTML document
  useEffect(() => {
    try {
      localStorage.setItem('heka_lang', currentLang);
    } catch {
      // fallback
    }
    document.documentElement.lang = currentLang;
    document.documentElement.dir = (currentLang === 'fa' || currentLang === 'ps') ? 'rtl' : 'ltr';
  }, [currentLang]);

  // Handle browser navigation & popstate
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === '#admin' || path === '/admin' || hash === '#dashboard' || path === '/dashboard') {
        const isAuth = localStorage.getItem('heka_auth_logged_in') === 'true';
        if (isAuth) {
          setCurrentRoute('admin');
        } else {
          setCurrentRoute('public');
          setIsAuthModalOpen(true);
        }
      } else {
        setCurrentRoute('public');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Load initial data from persistent backend
  const loadTenantData = async (companyId?: string) => {
    setIsLoading(true);
    try {
      // 1. Get companies
      const companies = await api.getCompanies();
      setAllCompanies(companies);

      const targetId = companyId || currentUser.companyId || companies[0]?.id;
      const comp = companies.find((c) => c.id === targetId) || companies[0] || null;
      setCurrentCompany(comp);

      if (comp) {
        // 2. Load private products for this tenant
        const prods = await api.getProducts(comp.id);
        setProducts(prods);

        // 3. Load private inquiries for this tenant
        const inqs = await api.getInquiries(comp.id);
        setInquiries(inqs);

        // 4. Load private support tickets for this tenant
        try {
          const tcks = await api.getSupportTickets(comp.id);
          setSupportTickets(tcks);
        } catch (e) {
          console.warn('Could not load persistent support tickets:', e);
        }

        // 5. Load tenant-specific demo orders & customers
        setOrders(sampleOrders[comp.id] || sampleOrders['comp_heka_ltd'] || []);
        setCustomers(sampleCustomers[comp.id] || sampleCustomers['comp_heka_ltd'] || []);
        setActivities(sampleActivities[comp.id] || sampleActivities['comp_heka_ltd'] || []);
        setNotifications(sampleNotifications[comp.id] || sampleNotifications['comp_heka_ltd'] || []);
        setSalesTrend(sampleSalesTrend[comp.id] || sampleSalesTrend['comp_heka_ltd'] || []);
      }
    } catch (err: any) {
      console.error('Failed to load tenant data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenantData();
  }, []);

  // Route switcher
  const navigateToRoute = (target: 'public' | 'admin') => {
    if (target === 'admin') {
      if (!isAuthenticated) {
        setIsAuthModalOpen(true);
        return;
      }
      setCurrentRoute('admin');
      try {
        window.history.pushState(null, '', '#admin');
      } catch {
        // fallback
      }
    } else {
      setCurrentRoute('public');
      try {
        window.history.pushState(null, '', window.location.pathname.replace(/#admin|#dashboard/, ''));
      } catch {
        // fallback
      }
    }
  };

  // Auth handler
  const handleAuthSuccess = (user: User, company: Company | null) => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem('heka_auth_logged_in', 'true');
    } catch {
      // fallback
    }
    setCurrentUser(user);
    if (company) {
      setCurrentCompany(company);
      loadTenantData(company.id);
    }
    setCurrentRoute('admin');
    try {
      window.history.pushState(null, '', '#admin');
    } catch {
      // fallback
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('heka_auth_logged_in');
    } catch {
      // fallback
    }
    navigateToRoute('public');
  };

  // Tenant switch
  const handleSelectCompany = async (companyId: string) => {
    const comp = allCompanies.find((c) => c.id === companyId);
    if (!comp) return;

    setCurrentCompany(comp);

    if (companyId === 'comp_heka_ltd' || companyId === 'comp_mehr_saffron') {
      api.setToken('token_heka_admin_secret');
      setCurrentUser({
        id: 'user_heka_admin',
        email: 'admin@hekaltd.com',
        name: 'HEKA Corporate Director',
        role: 'company_admin',
        companyId: 'comp_heka_ltd',
        token: 'token_heka_admin_secret'
      });
    } else if (companyId === 'comp_ziba_fashion') {
      api.setToken('token_ziba_admin_secret');
      setCurrentUser({
        id: 'user_ziba_admin',
        email: 'admin@zibafashion.com',
        name: 'Ziba Samimi (Founder)',
        role: 'company_admin',
        companyId: 'comp_ziba_fashion',
        token: 'token_ziba_admin_secret'
      });
    }

    try {
      const prods = await api.getProducts(companyId);
      setProducts(prods);
      const inqs = await api.getInquiries(companyId);
      setInquiries(inqs);
      setOrders(sampleOrders[companyId] || sampleOrders['comp_heka_ltd'] || []);
      setCustomers(sampleCustomers[companyId] || sampleCustomers['comp_heka_ltd'] || []);
      setActivities(sampleActivities[companyId] || sampleActivities['comp_heka_ltd'] || []);
      setNotifications(sampleNotifications[companyId] || sampleNotifications['comp_heka_ltd'] || []);
      setSalesTrend(sampleSalesTrend[companyId] || sampleSalesTrend['comp_heka_ltd'] || []);
    } catch (err: any) {
      console.warn('Tenant data reload error:', err);
    }
  };

  // Switch role directly
  const handleSwitchUserRole = async (email: string) => {
    try {
      const { user, company } = await api.login(email);
      setCurrentUser(user);
      if (company) {
        setCurrentCompany(company);
        const prods = await api.getProducts(company.id);
        setProducts(prods);
        const inqs = await api.getInquiries(company.id);
        setInquiries(inqs);
        setOrders(sampleOrders[company.id] || sampleOrders['comp_heka_ltd'] || []);
        setCustomers(sampleCustomers[company.id] || sampleCustomers['comp_heka_ltd'] || []);
        setActivities(sampleActivities[company.id] || sampleActivities['comp_heka_ltd'] || []);
        setNotifications(sampleNotifications[company.id] || sampleNotifications['comp_heka_ltd'] || []);
        setSalesTrend(sampleSalesTrend[company.id] || sampleSalesTrend['comp_heka_ltd'] || []);
      } else if (user.role === 'platform_owner') {
        if (allCompanies.length > 0) {
          const comp = allCompanies[0];
          setCurrentCompany(comp);
          const prods = await api.getProducts(comp.id);
          setProducts(prods);
          const inqs = await api.getInquiries(comp.id);
          setInquiries(inqs);
        }
      }
    } catch (err: any) {
      alert(`Role switch error: ${err.message}`);
    }
  };

  // Handle transfer from Inquiries tab to AI Sales Assistant
  const handleSelectInquiryForAI = (inq: CustomerInquiry) => {
    setInquiryForAI(inq);
    setActiveTab('sales_ai');
  };

  // Handle new company created via Onboarding wizard
  const handleCompanyCreated = (newCompany: Company) => {
    setAllCompanies((prev) => [...prev, newCompany]);
    setCurrentCompany(newCompany);
    setProducts([]);
    setInquiries([]);
    setOrders([]);
    setCustomers([]);
    setActiveTab('dashboard');
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSelectNotification = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.linkTab) {
      setActiveTab(notif.linkTab);
      setIsNotificationsModalOpen(false);
    }
  };

  const t = translations[currentLang] || translations.en;

  // Fallback HEKA LTD company object if initial fetch is pending
  const displayCompany: Company = currentCompany || {
    id: 'comp_heka_ltd',
    slug: 'heka-ltd',
    name: 'HEKA LTD',
    industry: 'International Trade & Premium Distribution',
    country: 'United Kingdom / Global',
    currency: 'USD',
    logoUrl: '/heka-logo.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    brandColors: {
      primary: '#101C35',
      accent: '#C9A96E',
      background: '#F5F7FA'
    },
    contactPhone: '+44 20 7946 0991',
    contactEmail: 'contact@hekaltd.com',
    address: '100 Bishopsgate, London EC2N 4AG, United Kingdom',
    plan: 'enterprise',
    settings: {
      showRetailPricesPublicly: true,
      allowWholesaleQuoteRequests: true,
      supportedLanguages: ['en', 'fa'],
      defaultLanguage: 'en',
      customGreetingEn: 'Welcome to HEKA LTD. High-grade commercial supply, wholesale distribution, and verified customer service.',
      customGreetingFa: 'به درگاه رسمی شرکت تجارتی و توزیع بین‌المللی HEKA LTD خوش آمدید.'
    },
    createdAt: '2026-01-10T08:00:00Z'
  };

  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-[#C9A96E]/30 selection:text-[#101C35] dark:selection:text-white transition-colors duration-200">
      {currentRoute === 'public' ? (
        /* ============================================================ */
        /* 1. CUSTOMER-FIRST HOMEPAGE AND REAL PRODUCT CATALOG          */
        /* Default landing experience for all visitors                  */
        /* ============================================================ */
        <PublicCatalogView
          company={displayCompany}
          products={products}
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
          onOpenManagementPortal={() => navigateToRoute('admin')}
        />
      ) : (
        /* ============================================================ */
        /* 2. PROTECTED INTERNAL ENTERPRISE MANAGEMENT PORTAL           */
        /* Only for authenticated corporate directors and staff        */
        /* ============================================================ */
        <div className="flex min-h-screen">
          {/* Sidebar Navigation */}
          <Sidebar
            currentCompany={displayCompany}
            currentUser={currentUser}
            activeTab={activeTab}
            onTabChange={(tab) => {
              if (tab === 'security_audit') {
                setIsSecurityAuditOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
            isOpenMobile={isOpenMobileSidebar}
            onCloseMobile={() => setIsOpenMobileSidebar(false)}
            currentLang={currentLang}
            unreadCount={notifications.filter((n) => !n.read).length}
            ordersCount={orders.length}
            inquiriesCount={inquiries.length}
            supportCount={supportTickets.filter((tk) => tk.status === 'new' || tk.status === 'open' || tk.status === 'in_progress').length}
            onTogglePublicView={() => navigateToRoute('public')}
          />

          {/* Main Content Area (automatically offsets by 18rem in LTR or RTL) */}
          <div className="flex-1 flex flex-col min-w-0 lg:ms-72 transition-all duration-200">
            {/* Top Navigation Bar with Public Catalog Return Trigger */}
            <TopHeader
              currentCompany={displayCompany}
              currentUser={currentUser}
              allCompanies={allCompanies}
              onSelectCompany={handleSelectCompany}
              onSwitchUserRole={handleSwitchUserRole}
              currentLang={currentLang}
              onLanguageChange={setCurrentLang}
              onToggleMobileSidebar={() => setIsOpenMobileSidebar(!isOpenMobileSidebar)}
              isPublicView={false}
              onTogglePublicView={() => navigateToRoute('public')}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onOpenSecurityAudit={() => setIsSecurityAuditOpen(true)}
              notifications={notifications}
              onOpenNotifications={() => setIsNotificationsModalOpen(true)}
              products={products}
              orders={orders}
              customers={customers}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />

            {/* Viewport Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Quick Bar to return to Public Storefront */}
              <div className="glass-card p-3 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#101C35] dark:text-[#C9A96E]">{displayCompany.name}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {isRtl ? 'پیشخوان اختصاصی و حفاظت‌شده مدیریت شرکت' : 'Protected Corporate Management Workspace'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateToRoute('public')}
                    className="px-3 py-1.5 rounded-xl glass-card hover:border-[#C9A96E]/50 text-[#101C35] dark:text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Store className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>{isRtl ? 'مشاهده کاتالوگ عمومی' : 'View Public Storefront'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 transition cursor-pointer font-medium"
                  >
                    {isRtl ? 'خروج از پنل' : 'Sign Out'}
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="py-24 text-center text-[#687386]">
                  {isRtl ? 'در حال بارگذاری اطلاعات پیشخوان...' : 'Loading operations hub...'}
                </div>
              ) : (
                <>
                  {/* 1. Dashboard View */}
                  {activeTab === 'dashboard' && (
                    <DashboardView
                      company={displayCompany}
                      products={products}
                      orders={orders}
                      customers={customers}
                      activities={activities}
                      salesTrend={salesTrend}
                      currentLang={currentLang}
                      onNavigateTab={(tab) => setActiveTab(tab)}
                      onOpenAddProduct={() => {
                        setIsAddingProduct(true);
                        setActiveTab('products');
                      }}
                      onTogglePublicView={() => navigateToRoute('public')}
                      onSelectOrderDetails={(ord) => setSelectedOrderForModal(ord)}
                    />
                  )}

                  {/* 2. Company Profile View */}
                  {activeTab === 'company_profile' && (
                    <CompanyProfileView
                      company={displayCompany}
                      currentUser={currentUser}
                      onRefresh={() => loadTenantData(displayCompany.id)}
                      currentLang={currentLang}
                    />
                  )}

                  {/* 3. Products Management View */}
                  {activeTab === 'products' && (
                    <ProductManagement
                      company={displayCompany}
                      products={products}
                      onRefresh={() => {
                        setIsAddingProduct(false);
                        loadTenantData(displayCompany.id);
                      }}
                      currentLang={currentLang}
                      initialIsAdding={isAddingProduct}
                    />
                  )}

                  {/* 4. Orders View */}
                  {activeTab === 'orders' && (
                    <OrdersView
                      company={displayCompany}
                      orders={orders}
                      currentLang={currentLang}
                      onSelectOrder={(ord) => setSelectedOrderForModal(ord)}
                    />
                  )}

                  {/* 5. Customers Directory View */}
                  {activeTab === 'customers' && (
                    <CustomersView
                      company={displayCompany}
                      customers={customers}
                      currentLang={currentLang}
                    />
                  )}

                  {/* 6. Analytics View */}
                  {activeTab === 'analytics' && (
                    <AnalyticsView
                      company={displayCompany}
                      products={products}
                      orders={orders}
                      salesTrend={salesTrend}
                      currentLang={currentLang}
                    />
                  )}

                  {/* 7. Notifications View */}
                  {activeTab === 'notifications' && (
                    <div className="glass-card p-6 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-[#101C35] dark:text-[#C9A96E]" />
                          <h2 className="text-lg font-extrabold text-[#101C35] dark:text-slate-100">
                            {t.tabNotifications || (isRtl ? 'اعلان‌ها و رویدادهای سیستم' : 'Notifications & System Logs')}
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={handleMarkAllNotificationsRead}
                          className="text-xs font-bold text-[#101C35] dark:text-[#C9A96E] hover:text-[#C9A96E] dark:hover:text-white cursor-pointer transition-colors"
                        >
                          {isRtl ? 'علامت‌گذاری همه به عنوان خوانده‌شده' : 'Mark all read'}
                        </button>
                      </div>

                      <div className="divide-y divide-slate-200/60 dark:divide-white/10">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleSelectNotification(notif)}
                            className="py-3.5 flex items-start gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer px-3 rounded-xl text-left rtl:text-right"
                          >
                            <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 border border-slate-200/60 dark:border-white/10 text-[#101C35] dark:text-slate-200 flex items-center justify-center shrink-0">
                              <Bell className="w-4 h-4 text-[#C9A96E]" />
                            </div>
                            <div className="flex-1 text-xs">
                              <div className="flex items-center justify-between">
                                <strong className="font-bold text-[#101C35] dark:text-slate-100">{notif.title}</strong>
                                <span className="text-[10px] text-[#5A657D] dark:text-slate-400 font-mono">{notif.timestamp}</span>
                              </div>
                              <p className="text-[#5A657D] dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8. Settings View */}
                  {activeTab === 'settings' && (
                    <SettingsView
                      company={displayCompany}
                      currentUser={currentUser}
                      onRefresh={() => loadTenantData(displayCompany.id)}
                      currentLang={currentLang}
                    />
                  )}

                  {/* 9. AI Sales Assistant */}
                  {activeTab === 'sales_ai' && (
                    <SalesAIView
                      company={displayCompany}
                      products={products}
                      currentLang={currentLang}
                      initialInquiryMessage={inquiryForAI?.message}
                      initialProductId={inquiryForAI?.productId}
                    />
                  )}

                  {/* 10. Inquiries & Quote Requests */}
                  {activeTab === 'inquiries' && (
                    <InquiryManagement
                      inquiries={inquiries}
                      onSelectForAIReply={handleSelectInquiryForAI}
                      currentLang={currentLang}
                    />
                  )}

                  {/* 11. Support & Corporate Ticket Desk */}
                  {activeTab === 'support' && (
                    <SupportView
                      company={displayCompany}
                      tickets={supportTickets}
                      currentLang={currentLang}
                      onRefresh={() => loadTenantData(displayCompany.id)}
                    />
                  )}
                </>
              )}
            </main>

            {/* Quiet Corporate Frosted Footer */}
            <footer className="border-t border-slate-200/60 dark:border-white/10 glass-panel py-4 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5A657D] dark:text-slate-400 gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#101C35] dark:text-slate-100">
                    {displayCompany.name}
                  </span>
                  <span>·</span>
                  <span>{displayCompany.id === 'comp_heka_ltd' ? (isRtl ? 'دفتر مرکزی لندن' : '100 Bishopsgate, London') : displayCompany.country}</span>
                  <span>·</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isRtl ? 'دامنه سازمانی ایزوله' : 'Isolated Tenant Domain'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSecurityAuditOpen(true)}
                    className="text-[#101C35] dark:text-slate-200 hover:text-[#C9A96E] dark:hover:text-[#C9A96E] underline cursor-pointer transition-colors"
                  >
                    {isRtl ? 'گزارش ممیزی امنیت' : 'Security Audit'}
                  </button>
                  <span>·</span>
                  <span>{isRtl ? 'معماری چندمستاجره سازمانی' : 'Multi-Tenant Architecture'}</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        currentLang={currentLang}
      />

      <OrderDetailModal
        order={selectedOrderForModal}
        company={displayCompany}
        onClose={() => setSelectedOrderForModal(null)}
        isRtl={isRtl}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onSelectNotification={handleSelectNotification}
        isRtl={isRtl}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onCompanyCreated={handleCompanyCreated}
        currentLang={currentLang}
      />

      <SecurityAuditModal
        isOpen={isSecurityAuditOpen}
        onClose={() => setIsSecurityAuditOpen(false)}
        currentLang={currentLang}
      />
    </div>
  );
}
