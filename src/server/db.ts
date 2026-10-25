import fs from 'fs';
import path from 'path';
import {
  Company,
  Product,
  User,
  CustomerInquiry,
  SecurityAuditResult,
  SupportTicket,
  SellerApplication,
  AccountType,
  SellerStatus,
  ProductApprovalStatus,
  PersonalProfile,
  BusinessProfile
} from '../types';

export interface DatabaseSchema {
  companies: Company[];
  users: User[];
  products: Product[];
  inquiries: CustomerInquiry[];
  supportTickets?: SupportTicket[];
  sellerApplications?: SellerApplication[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp_heka_ltd',
    slug: 'heka-ltd',
    name: 'HEKA LTD',
    industry: 'International Trade & Premium Distribution',
    country: 'United Kingdom / Global',
    currency: 'USD',
    logoUrl: '/heka-logo.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    brandColors: {
      primary: '#101C35', // Deep Navy Blue (#101C35) from official design system
      accent: '#C9A96E',  // Elegant Muted Gold (#C9A96E) from official design system
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
  },
  {
    id: 'comp_ziba_fashion',
    slug: 'ziba-fashion',
    name: 'Ziba Silk & Apparel',
    industry: 'Textile & Traditional Fashion',
    country: 'Afghanistan',
    currency: 'USD',
    logoUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=128&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
    brandColors: {
      primary: '#0f766e', // Teal 700
      accent: '#4f46e5',  // Indigo 600
      background: '#f8fafc'
    },
    contactPhone: '+93700987654',
    contactEmail: 'sales@zibafashion.com',
    address: 'Zarghoona Plaza, Shahr-e Naw, Kabul, Afghanistan',
    plan: 'starter',
    settings: {
      showRetailPricesPublicly: true,
      allowWholesaleQuoteRequests: true,
      supportedLanguages: ['fa', 'en'],
      defaultLanguage: 'fa',
      customGreetingEn: 'Ziba Silk: Handwoven Afghan silk, traditional chapans, and embroidered dresses.',
      customGreetingFa: 'زیبا فشن: البسه دست‌دوز، چپن‌های ابریشمی و پیراهن‌های سنتی هرات و کابل.'
    },
    createdAt: '2026-02-15T10:00:00Z'
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'user_owner',
    email: 'owner@dukanai.com',
    name: 'Platform Administrator',
    role: 'platform_owner',
    companyId: null,
    token: 'token_owner_secret'
  },
  {
    id: 'user_heka_admin',
    email: 'admin@hekaltd.com',
    name: 'HEKA Corporate Director',
    role: 'company_admin',
    companyId: 'comp_heka_ltd',
    token: 'token_heka_admin_secret'
  },
  {
    id: 'user_ziba_admin',
    email: 'admin@zibafashion.com',
    name: 'Ziba Samimi (Founder)',
    role: 'company_admin',
    companyId: 'comp_ziba_fashion',
    token: 'token_ziba_admin_secret'
  },
  {
    id: 'user_ziba_staff',
    email: 'sales@zibafashion.com',
    name: 'Ahmad Reshad (Sales Staff)',
    role: 'company_staff',
    companyId: 'comp_ziba_fashion',
    token: 'token_ziba_staff_secret'
  },
  // --- Seed Customer & Seller Accounts for Verification ---
  {
    id: 'user_sarah_buyer',
    email: 'sarah.jenkins@gmail.com',
    name: 'Sarah Jenkins',
    role: 'customer',
    companyId: null,
    token: 'token_sarah_buyer',
    accountType: 'personal',
    personalProfile: {
      fullName: 'Sarah Jenkins',
      country: 'United Kingdom',
      city: 'London',
      phone: '+44 7700 900123'
    },
    sellerStatus: 'none',
    preferredLanguage: 'en',
    savedProductIds: ['prod_heka_1'],
    phone: '+44 7700 900123',
    country: 'United Kingdom',
    city: 'London',
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    id: 'user_marcus_buyer',
    email: 'marcus.sterling@auraglobal.co.uk',
    name: 'Marcus Sterling',
    role: 'customer',
    companyId: null,
    token: 'token_marcus_buyer',
    accountType: 'business',
    businessProfile: {
      contactPerson: 'Marcus Sterling',
      companyName: 'Aura Global Trading UK',
      country: 'United Kingdom',
      city: 'London',
      businessEmail: 'marcus.sterling@auraglobal.co.uk',
      businessPhone: '+44 20 7946 0888',
      businessType: 'Wholesaler & Importer',
      registrationNumber: 'UK-COMP-998241',
      website: 'https://auraglobal.co.uk'
    },
    sellerStatus: 'none', // Business registration alone must NOT grant seller permissions (Specification Requirement #3)
    preferredLanguage: 'en',
    savedProductIds: ['prod_heka_2'],
    phone: '+44 20 7946 0888',
    country: 'United Kingdom',
    city: 'London',
    createdAt: '2026-02-10T12:00:00Z'
  },
  {
    id: 'user_zahir_seller',
    email: 'kabul.crafts@afghantrade.com',
    name: 'Mohammad Zahir',
    role: 'customer',
    companyId: null,
    token: 'token_zahir_seller',
    accountType: 'business',
    businessProfile: {
      contactPerson: 'Mohammad Zahir',
      companyName: 'Kabul Artisan Handicrafts Co.',
      country: 'Afghanistan',
      city: 'Kabul',
      businessEmail: 'kabul.crafts@afghantrade.com',
      businessPhone: '+93 700 123 456',
      businessType: 'Manufacturer & Producer',
      registrationNumber: 'AFG-MOC-7712'
    },
    sellerStatus: 'approved', // Approved HEKA Seller
    preferredLanguage: 'fa',
    savedProductIds: ['prod_heka_1'],
    phone: '+93 700 123 456',
    country: 'Afghanistan',
    city: 'Kabul',
    createdAt: '2026-02-12T10:00:00Z'
  },
  {
    id: 'user_farid_pending_seller',
    email: 'herat.saffron.coop@heratfarms.af',
    name: 'Ahmad Farid',
    role: 'customer',
    companyId: null,
    token: 'token_farid_pending_seller',
    accountType: 'business',
    businessProfile: {
      contactPerson: 'Ahmad Farid',
      companyName: 'Herat Organic Agricultural Cooperative',
      country: 'Afghanistan',
      city: 'Herat',
      businessEmail: 'herat.saffron.coop@heratfarms.af',
      businessPhone: '+93 799 456 789',
      businessType: 'Agricultural Producer Cooperative',
      registrationNumber: 'AFG-AGR-4409'
    },
    sellerStatus: 'pending', // Pending HEKA LTD administrator review
    preferredLanguage: 'fa',
    savedProductIds: [],
    phone: '+93 799 456 789',
    country: 'Afghanistan',
    city: 'Herat',
    createdAt: '2026-03-01T09:00:00Z'
  }
];

const INITIAL_SELLER_APPLICATIONS: SellerApplication[] = [
  {
    id: 'app_kabul_crafts',
    userId: 'user_zahir_seller',
    applicantName: 'Mohammad Zahir',
    businessName: 'Kabul Artisan Handicrafts Co.',
    businessType: 'Manufacturer & Producer',
    country: 'Afghanistan',
    city: 'Kabul',
    phone: '+93 700 123 456',
    email: 'kabul.crafts@afghantrade.com',
    description: 'Traditional Afghan hand-carved walnut wood boxes, brass inlay presentation cases, and Badakhshan lapis lazuli handicrafts for export distribution.',
    productCategories: ['Executive Gifts & Specialty Goods', 'Handicrafts & Decor'],
    registrationNumber: 'AFG-MOC-7712',
    documents: ['Commercial_License_AFG_7712.pdf', 'Artisan_Guild_Cert.jpg'],
    status: 'approved',
    submittedAt: '2026-02-12T10:30:00Z',
    reviewedAt: '2026-02-14T11:00:00Z',
    reviewedBy: 'admin@hekaltd.com',
    adminNotes: 'Verified registration with Ministry of Commerce & Chamber of Handicrafts. Approved for specialty catalog listing.'
  },
  {
    id: 'app_herat_saffron',
    userId: 'user_farid_pending_seller',
    applicantName: 'Ahmad Farid',
    businessName: 'Herat Organic Agricultural Cooperative',
    businessType: 'Agricultural Producer Cooperative',
    country: 'Afghanistan',
    city: 'Herat',
    phone: '+93 799 456 789',
    email: 'herat.saffron.coop@heratfarms.af',
    description: 'Union of 45 family farms producing certified Grade 1 Super Negin saffron and sun-dried organic figs for international bulk trade.',
    productCategories: ['Agricultural Export & Saffron', 'Organic Dried Fruits'],
    registrationNumber: 'AFG-AGR-4409',
    documents: ['Coop_Establishment_Charter.pdf', 'ISO_3632_Specimen.pdf'],
    status: 'pending',
    submittedAt: '2026-03-01T09:15:00Z',
    adminNotes: 'Application received and awaiting HEKA LTD directorate review.'
  }
];

const INITIAL_PRODUCTS: Product[] = [
  // --- Company 1: HEKA LTD Products ---
  {
    id: 'prod_heka_1',
    companyId: 'comp_heka_ltd',
    name: 'HEKA Signature Reserve Luxury Gift Collection',
    nameFa: 'بسته هدیه لوکس کلکسیون اختصاصی HEKA LTD',
    category: 'Executive Gifts & Specialty Goods',
    description: 'Handcrafted luxury executive presentation case featuring certified pure Grade 1 botanical extract, precision brass dispenser, and sealed airtight crystal containers.',
    descriptionFa: 'جعبه هدیه لوکس و تشریفاتی ساخته شده با روکش مخمل، ظروف کریستال پلمپ شده با استاندارد بین‌المللی و گواهی اصالت آزمایشگاهی.',
    images: [
      '/heka-logo.jpg',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80'
    ],
    unit: 'box',
    retailPrice: 48,
    currency: '$',
    stock: 50,
    packageSizes: [
      { id: 'size_standard', name: 'Standard Executive Set', weightOrSize: 'Standard Set', price: 48, stock: 35, isAvailable: true },
      { id: 'size_deluxe', name: 'Deluxe Grand Edition', weightOrSize: 'Deluxe Grand', price: 95, stock: 15, isAvailable: true }
    ],
    attributes: [
      { key: 'Grade', value: 'Premium Grade 1 Export Certified' },
      { key: 'Origin', value: 'Certified Verified Global Sourcing' },
      { key: 'Packaging', value: 'Airtight Sealed Crystal in Velvet Wood Chest' }
    ],
    wholesaleRules: {
      minQuantity: 10,
      discountPercent: 12,
      requireQuote: true,
      termsNote: '12% volume concession on orders of 20+ units. Bespoke corporate engraving provided on 50+ units.',
      termsNoteFa: '۱۲٪ تخفیف تجاری برای سفارش‌های بالای ۲۰ بسته. امکان سفارشی‌سازی برند شرکتی برای بالای ۵۰ عدد.',
      isConfirmed: true
    },
    shippingDetails: {
      fee: 'Free priority courier across UK & Europe; DHL Express worldwide dispatch quoted per destination.',
      transitTime: '24-48h domestic / EU, 3-5 business days global express',
      coverage: 'UK, EU, Middle East, North America, Central Asia',
      isConfirmed: true
    },
    qualityInfo: {
      grade: 'Grade 1 ISO Certified',
      standard: 'ISO 9001 / ISO 22000 Certified Batch',
      labReportNumber: 'HEKA-QC-2026-778',
      isConfirmed: true,
      notes: 'Purity, moisture tolerance, and full traceability verified.'
    },
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-15T12:00:00Z',
    updatedAt: '2026-03-01T09:30:00Z'
  },
  {
    id: 'prod_heka_2',
    companyId: 'comp_heka_ltd',
    name: 'HEKA Industrial & Commercial Grade Supply (Bulk Canister)',
    nameFa: 'محصول تجارتی فله و توزیع عمده HEKA LTD (کانتینر فلزی)',
    category: 'Commercial Wholesale & Export',
    description: 'Food & cosmetic-grade airtight nitrogen-flushed industrial containers engineered for international distributors, pharmaceutical formulators, and luxury hospitality chains.',
    descriptionFa: 'کانتینر آلومینیومی ایزوله تحت گاز خنثی نیتروژن جهت حفظ بالاترین استانداردهای کیفی برای صادرات و توزیع‌کنندگان بین‌المللی.',
    images: [
      '/heka-logo.jpg',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
    ],
    unit: 'canister',
    retailPrice: 1850,
    currency: '$',
    stock: 20,
    packageSizes: [
      { id: 'size_1kg', name: '1 KG Commercial Canister', weightOrSize: '1000g', price: 1850, stock: 15, isAvailable: true },
      { id: 'size_5kg', name: '5 KG Master Cask', weightOrSize: '5000g', price: 8200, stock: 5, isAvailable: true }
    ],
    attributes: [
      { key: 'Grade', value: 'International Industrial Grade 1' },
      { key: 'Certification', value: 'Certificate of Analysis & Chamber of Commerce Certified' }
    ],
    wholesaleRules: {
      minQuantity: 1,
      discountPercent: 8,
      requireQuote: true,
      termsNote: 'Tiered wholesale pricing: $1,650/unit for orders exceeding 5 units. Air cargo CIP major global hubs.',
      termsNoteFa: 'تخفیف ویژه سفارش‌های تیراژ بالا: ۱۶۵۰ دالر به ازای هر واحد برای سفارش ۵ واحد به بالا همراه با باربری هوایی CIP.',
      isConfirmed: true
    },
    shippingDetails: {
      fee: 'CIP air cargo dispatch to designated international airports.',
      transitTime: '3-5 business days upon customs clearance',
      coverage: 'London, Frankfurt, Dubai, Istanbul, Singapore, New York',
      isConfirmed: true
    },
    qualityInfo: {
      grade: 'Commercial Prime Grade',
      standard: 'ISO Standards & Phytosanitary Clearances',
      labReportNumber: 'EXP-HEKA-2026-90',
      isConfirmed: true,
      notes: 'Fully authenticated batch with laboratory spectrum validation.'
    },
    isPublished: true,
    isFeatured: false,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-28T14:00:00Z'
  },

  // --- Company 2: Ziba Silk & Apparel Products ---
  {
    id: 'prod_ziba_1',
    companyId: 'comp_ziba_fashion',
    name: 'Handcrafted Afghan Silk Chapan Robe',
    nameFa: 'چپن ابریشمی دست‌دوز سنتی افغانستان',
    category: 'Outerwear',
    description: 'Traditional Afghan long chapan coat handwoven from pure Herat raw silk, featuring intricate golden border embroidery and cotton lining.',
    descriptionFa: 'چپن اصیل ابریشمی بافته شده از ابریشم طبیعی هرات همراه با سوزن‌دوزی زرین و آستر نخی بسیار سبک و شیک.',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'
    ],
    unit: 'piece',
    retailPrice: 120,
    currency: '$',
    stock: 18,
    packageSizes: [
      { id: 'size_s', name: 'Size S (Chest 38")', weightOrSize: 'S', price: 120, stock: 4, isAvailable: true },
      { id: 'size_m', name: 'Size M (Chest 42")', weightOrSize: 'M', price: 120, stock: 8, isAvailable: true },
      { id: 'size_l', name: 'Size L (Chest 46")', weightOrSize: 'L', price: 125, stock: 6, isAvailable: true }
    ],
    attributes: [
      { key: 'Material', value: '100% Raw Herat Silk' },
      { key: 'Embroidery', value: 'Handmade Gold Thread' },
      { key: 'Care', value: 'Dry Clean Only' }
    ],
    wholesaleRules: {
      minQuantity: 10,
      discountPercent: 15,
      requireQuote: true,
      termsNote: '15% wholesale discount for boutique orders of 10+ pieces.',
      termsNoteFa: '۱۵٪ تخفیف برای سفارش‌های بالای ۱۰ عدد ویژه بوتیک‌ها.',
      isConfirmed: true
    },
    shippingDetails: {
      fee: 'Free courier in Kabul; provincial courier 200 AFN. International post available.',
      transitTime: '24-48 hours domestic, 7-10 days international',
      coverage: 'All provinces of Afghanistan & International',
      isConfirmed: true
    },
    qualityInfo: {
      grade: 'Artisan Grade Handcrafted',
      standard: '100% Pure Silk Certified',
      isConfirmed: true,
      notes: 'Handwoven by women artisans in Herat.'
    },
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-02-20T11:00:00Z',
    updatedAt: '2026-03-02T16:00:00Z'
  },
  {
    id: 'prod_ziba_2',
    companyId: 'comp_ziba_fashion',
    name: 'Traditional Embroidered Velvet Dress Set',
    nameFa: 'ست پیراهن و تنبان مخمل گند افغانی با سکه‌دوزی',
    category: 'Traditional Dresses',
    description: 'Festive Afghan Gand velvet dress with mirrored hand-embroidery, wide embroidered trousers, and silk chiffon shawl.',
    descriptionFa: 'لباس محلی سنتی گند افغانی با پارچه مخمل اعلا، آیینه‌دوزی ظریف دست، شلوار چین‌دار و شال حریر.',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80'
    ],
    unit: 'set',
    retailPrice: 85,
    currency: '$',
    stock: 24,
    packageSizes: [
      { id: 'dress_m', name: 'Medium (Bust 38-40)', weightOrSize: 'M', price: 85, stock: 14, isAvailable: true },
      { id: 'dress_l', name: 'Large (Bust 42-44)', weightOrSize: 'L', price: 85, stock: 10, isAvailable: true }
    ],
    attributes: [
      { key: 'Fabric', value: 'Premium Velvet & Chiffon' },
      { key: 'Work', value: 'Mirror Work & Needlepoint' }
    ],
    wholesaleRules: {
      minQuantity: 5,
      discountPercent: 12,
      requireQuote: false,
      termsNote: '12% discount for event planners & shops ordering 5+ sets.',
      termsNoteFa: '۱۲٪ تخفیف برای سفارش بیش از ۵ ست.',
      isConfirmed: true
    },
    shippingDetails: {
      fee: 'Courier delivery within 24-48 hours.',
      transitTime: '1-2 days',
      coverage: 'Domestic Afghanistan',
      isConfirmed: true
    },
    qualityInfo: {
      grade: 'Authentic Traditional Handicraft',
      isConfirmed: true
    },
    isPublished: true,
    isFeatured: false,
    approvalStatus: 'approved',
    createdAt: '2026-02-25T08:00:00Z',
    updatedAt: '2026-03-01T12:00:00Z'
  },
  // --- Seller-Submitted Products (Testing Permissions & Approvals) ---
  {
    id: 'prod_seller_kabul_1',
    companyId: 'comp_heka_ltd',
    sellerId: 'user_zahir_seller',
    sellerName: 'Kabul Artisan Handicrafts Co.',
    name: 'Hand-Carved Walnut Keepsake Chest with Brass Inlay',
    nameFa: 'صندوقچه چوبی دست‌ساز گردو با برنج‌کوبی اصیل کابل',
    category: 'Executive Gifts & Specialty Goods',
    description: 'Solid walnut keepsake presentation chest with geometric brass filigree inlays, velvet interior, and engraved brass clasp. Handcrafted by master woodworkers in Kabul.',
    descriptionFa: 'صندوقچه تشریفاتی چوب گردوی کوهستان با معرق‌کاری برنجی، آستر مخمل یشمی و قفل سنتی دست‌ساز.',
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80'
    ],
    unit: 'piece',
    retailPrice: 85,
    currency: '$',
    stock: 24,
    packageSizes: [
      { id: 'chest_standard', name: 'Standard Medium Chest', weightOrSize: '25x15x12 cm', price: 85, stock: 16, isAvailable: true },
      { id: 'chest_large', name: 'Executive Master Chest', weightOrSize: '35x20x15 cm', price: 135, stock: 8, isAvailable: true }
    ],
    attributes: [
      { key: 'Material', value: 'Old-Growth Mountain Walnut Wood' },
      { key: 'Inlay', value: 'Solid Pure Brass Filigree' },
      { key: 'Interior', value: 'Emerald Green Velvet Lining' }
    ],
    wholesaleRules: {
      minQuantity: 5,
      discountPercent: 10,
      requireQuote: true,
      termsNote: '10% volume discount for corporate orders of 5+ pieces.',
      isConfirmed: true
    },
    shippingDetails: {
      fee: 'Worldwide priority express dispatch with tracked packing.',
      transitTime: '3-5 business days international',
      coverage: 'UK, EU, Middle East, USA, Central Asia',
      isConfirmed: true
    },
    qualityInfo: {
      grade: 'Master Artisan Guild Certified Grade A',
      standard: '100% Solid Hardwood Verified',
      isConfirmed: true,
      notes: 'Individually authenticated and stamped by guild.'
    },
    approvalStatus: 'approved', // Approved by HEKA LTD Admin
    isPublished: true,
    isFeatured: false,
    createdAt: '2026-02-15T09:00:00Z',
    reviewedAt: '2026-02-16T10:00:00Z',
    updatedAt: '2026-02-16T10:00:00Z'
  },
  {
    id: 'prod_seller_kabul_2',
    companyId: 'comp_heka_ltd',
    sellerId: 'user_zahir_seller',
    sellerName: 'Kabul Artisan Handicrafts Co.',
    name: 'Badakhshan Lapis Lazuli Executive Desk Pen Stand & Plaque',
    nameFa: 'پایه قلم و تندیس رومیزی سنگ لاجورد بدخشان',
    category: 'Executive Gifts & Specialty Goods',
    description: 'Natural royal blue lapis lazuli stone desk stand with brass pen cradle and polished marble plinth. Mined from historic Badakhshan deposits.',
    descriptionFa: 'پایه قلم مدیریتی تراشیده شده از سنگ اصیل لاجورد آبی سلطنتی با پایه‌های برنجی و سنگ مرمر صیقلی.',
    images: [
      'https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=800&auto=format&fit=crop&q=80'
    ],
    unit: 'piece',
    retailPrice: 145,
    currency: '$',
    stock: 12,
    packageSizes: [],
    attributes: [
      { key: 'Stone', value: '100% Natural Royal Lapis Lazuli' },
      { key: 'Origin', value: 'Badakhshan, Afghanistan' },
      { key: 'Base', value: 'White Carrara Composite Marble' }
    ],
    wholesaleRules: {
      minQuantity: 3,
      discountPercent: 8,
      requireQuote: true,
      termsNote: 'Wholesale quotation on corporate gifts of 3+ units.',
      isConfirmed: true
    },
    shippingDetails: {
      fee: 'Secure foam-cushioned international dispatch.',
      transitTime: '4-6 business days',
      coverage: 'Global',
      isConfirmed: true
    },
    qualityInfo: {
      grade: 'Gemological Spectrum Verified',
      isConfirmed: true,
      notes: 'No dyes or artificial resins used.'
    },
    approvalStatus: 'pending_review', // PENDING REVIEW: Must remain unpublished until approved! (Specification Requirement #3)
    isPublished: false,
    isFeatured: false,
    submittedAt: '2026-03-02T11:00:00Z',
    createdAt: '2026-03-02T11:00:00Z',
    updatedAt: '2026-03-02T11:00:00Z'
  }
];

const INITIAL_INQUIRIES: CustomerInquiry[] = [
  {
    id: 'inq_1',
    companyId: 'comp_heka_ltd',
    customerName: 'Marcus Sterling (Aura Global)',
    customerContact: 'm.sterling@auraglobal.co.uk',
    customerLocation: 'London / Dubai Hub',
    inquiryType: 'export_inquiry',
    productId: 'prod_heka_2',
    productName: 'HEKA Industrial & Commercial Grade Supply (Bulk Canister)',
    requestedQuantity: 5,
    message: 'Good day, we require 5 units of your commercial grade canister for our regional distribution hub in Dubai. What is your CIP quote and estimated delivery timeline?',
    replyLanguage: 'en',
    status: 'new',
    createdAt: '2026-03-02T10:15:00Z'
  },
  {
    id: 'inq_2',
    companyId: 'comp_ziba_fashion',
    customerName: 'Fatima Sultani',
    customerContact: '+93788998877',
    customerLocation: 'Kabul',
    inquiryType: 'retail_question',
    productId: 'prod_ziba_1',
    productName: 'Handcrafted Afghan Silk Chapan Robe',
    requestedQuantity: 2,
    message: 'سلام، آیا سایز مدیوم این چپن ابریشمی را موجود دارید و با ارسال به شهر نو کابل چقدر می‌شود؟',
    replyLanguage: 'fa',
    status: 'new',
    createdAt: '2026-03-03T14:20:00Z'
  }
];

const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tck_101',
    ticketNumber: 'TCK-2026-101',
    companyId: 'comp_heka_ltd',
    subject: 'Consignment Clearance Documents - Air-Cargo Consignment #HK-8821',
    description: 'Requesting verified phytosanitary and export certificate of origin for the latest air-cargo consignment to Frankfurt hub.',
    category: 'logistics',
    priority: 'high',
    status: 'in_progress',
    conversationLanguage: 'en',
    attachments: ['Certificate_Of_Origin_Draft.pdf', 'AirWayBill_HK8821.pdf'],
    createdBy: 'HEKA Logistics Office',
    customerContact: 'logistics@hekaltd.com',
    createdAt: '2026-03-01T09:30:00Z',
    updatedAt: '2026-03-02T11:15:00Z'
  },
  {
    id: 'tck_102',
    ticketNumber: 'TCK-2026-102',
    companyId: 'comp_heka_ltd',
    subject: 'درخواست پیش‌فاکتور رسمی برای ارسال محموله زعفران سوپر نگین به دبی',
    description: 'جهت نهایی‌سازی سفارش عمده ۱۰ کیلوگرمی، لطفاً پیش‌فاکتور رسمی با تفکیک هزینه‌های بسته‌بندی هرمتیک و بیمه ارسال فرمایید.',
    category: 'billing',
    priority: 'medium',
    status: 'open',
    conversationLanguage: 'fa',
    attachments: ['Proforma_Request_Details.docx'],
    createdBy: 'Aura Global Trading Dubai',
    customerContact: 'm.sterling@auraglobal.co.uk',
    createdAt: '2026-03-02T14:00:00Z',
    updatedAt: '2026-03-02T14:00:00Z'
  },
  {
    id: 'tck_103',
    ticketNumber: 'TCK-2026-103',
    companyId: 'comp_heka_ltd',
    subject: 'د کیفیت لابراتواري اسنادو او ISO 3632 تصدیق‌پاڼې غوښتنه',
    description: 'د اروپایي ټولنې د ګمرک لپاره د ISO 3632 معیاري لابراتواري ټېسټ راپور ته اړتیا لرو ترڅو محموله ژر تر ژره ترخیص شي.',
    category: 'quality',
    priority: 'urgent',
    status: 'waiting_customer',
    conversationLanguage: 'ps',
    attachments: ['Lab_Test_Specimen.pdf'],
    createdBy: 'Kabul Trade Logistics',
    customerContact: '+93700112233',
    createdAt: '2026-03-03T10:00:00Z',
    updatedAt: '2026-03-03T16:45:00Z'
  },
  {
    id: 'tck_104',
    ticketNumber: 'TCK-2026-104',
    companyId: 'comp_heka_ltd',
    subject: 'B2B Customer Portal API Credential Rotation',
    description: 'Scheduled quarterly API credential refresh for B2B wholesale consignment inventory automated sync.',
    category: 'technical',
    priority: 'low',
    status: 'resolved',
    conversationLanguage: 'en',
    attachments: ['API_Rotation_Checklist.pdf'],
    createdBy: 'Enterprise Integrations Team',
    customerContact: 'devops@hekaltd.com',
    createdAt: '2026-02-20T08:00:00Z',
    updatedAt: '2026-02-22T17:30:00Z'
  },
  {
    id: 'tck_201',
    ticketNumber: 'TCK-2026-201',
    companyId: 'comp_ziba_fashion',
    subject: 'د لاسي ګلدوزۍ او ابریشمي ټوکر د عمده پېر پوښتنه',
    description: 'د هرات د ابریشمي ټوکر د لاسي جوړ شویو نمونو د رنګونو او لېږد د لګښت په اړه پوښتنه لرو.',
    category: 'general',
    priority: 'medium',
    status: 'new',
    conversationLanguage: 'ps',
    createdBy: 'Farhad Qasimi',
    customerContact: '+93799887766',
    createdAt: '2026-03-04T11:00:00Z',
    updatedAt: '2026-03-04T11:00:00Z'
  }
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(raw);
        let changed = false;

        if (!parsed.supportTickets) {
          parsed.supportTickets = INITIAL_SUPPORT_TICKETS;
          changed = true;
        }

        if (!parsed.sellerApplications) {
          parsed.sellerApplications = INITIAL_SELLER_APPLICATIONS;
          changed = true;
        }

        // Ensure seed customer and seller accounts exist for testing
        for (const seedUser of INITIAL_USERS) {
          if (!parsed.users.some((u) => u.email.toLowerCase() === seedUser.email.toLowerCase())) {
            parsed.users.push(seedUser);
            changed = true;
          }
        }

        // Ensure seller products exist
        for (const seedProd of INITIAL_PRODUCTS) {
          if (!parsed.products.some((p) => p.id === seedProd.id)) {
            parsed.products.push(seedProd);
            changed = true;
          }
        }

        // Ensure approvalStatus is set on all products
        for (const prod of parsed.products) {
          if (!prod.approvalStatus) {
            prod.approvalStatus = prod.isPublished ? 'approved' : 'draft';
            changed = true;
          }
        }

        if (changed) {
          this.saveToDisk(parsed);
        }

        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing db.json, initializing fresh seed.', e);
    }

    const initialData: DatabaseSchema = {
      companies: INITIAL_COMPANIES,
      users: INITIAL_USERS,
      products: INITIAL_PRODUCTS,
      inquiries: INITIAL_INQUIRIES,
      supportTickets: INITIAL_SUPPORT_TICKETS,
      sellerApplications: INITIAL_SELLER_APPLICATIONS
    };

    this.saveToDisk(initialData);
    return initialData;
  }

  private saveToDisk(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db.json to disk:', e);
    }
  }

  // Auth & User Management
  public authenticateUser(token: string): User | null {
    if (!token) return null;
    const cleanToken = token.replace('Bearer ', '').trim();
    // Allow backwards compatibility alias for demo
    if (cleanToken === 'token_mehr_admin_secret') {
      return this.data.users.find((u) => u.token === 'token_heka_admin_secret' || u.token === 'token_mehr_admin_secret') || null;
    }
    return this.data.users.find((u) => u.token === cleanToken) || null;
  }

  public getUsers(): User[] {
    return this.data.users;
  }

  // Companies
  public getCompanies(): Company[] {
    return this.data.companies;
  }

  public getCompanyById(id: string): Company | null {
    if (id === 'comp_mehr_saffron') {
      return this.data.companies.find((c) => c.id === 'comp_heka_ltd' || c.id === 'comp_mehr_saffron') || null;
    }
    return this.data.companies.find((c) => c.id === id) || null;
  }

  public getCompanyBySlug(slug: string): Company | null {
    const s = slug.toLowerCase();
    const found = this.data.companies.find((c) => c.slug === s);
    if (found) return found;
    if (s === 'mehr-saffron') {
      return this.data.companies.find((c) => c.slug === 'heka-ltd' || c.id === 'comp_heka_ltd') || null;
    }
    return null;
  }

  public registerCompany(companyData: Partial<Company>, adminEmail: string, adminName: string): { company: Company; user: User } {
    const slug = (companyData.slug || companyData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `company-${Date.now()}`)
      .replace(/^-+|-+$/g, '');
    const companyId = `comp_${slug.replace(/-/g, '_')}_${Date.now()}`;

    const newCompany: Company = {
      id: companyId,
      slug,
      name: companyData.name || 'Untitled Enterprise',
      industry: companyData.industry || 'General Commerce',
      country: companyData.country || 'Afghanistan',
      currency: companyData.currency || 'USD',
      logoUrl: companyData.logoUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=128&auto=format&fit=crop&q=80',
      bannerUrl: companyData.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
      brandColors: companyData.brandColors || {
        primary: '#1e3a8a',
        accent: '#3b82f6',
        background: '#f8fafc'
      },
      contactPhone: companyData.contactPhone || '+93700000000',
      contactEmail: companyData.contactEmail || adminEmail,
      address: companyData.address || 'Kabul, Afghanistan',
      plan: 'starter',
      settings: {
        showRetailPricesPublicly: true,
        allowWholesaleQuoteRequests: true,
        supportedLanguages: ['fa', 'en'],
        defaultLanguage: 'fa'
      },
      createdAt: new Date().toISOString()
    };

    const newUser: User = {
      id: `user_${Date.now()}`,
      email: adminEmail,
      name: adminName,
      role: 'company_admin',
      companyId: newCompany.id,
      token: `token_${companyId}_admin_${Math.random().toString(36).substring(2)}`
    };

    this.data.companies.push(newCompany);
    this.data.users.push(newUser);
    this.saveToDisk(this.data);

    return { company: newCompany, user: newUser };
  }

  public updateCompany(companyId: string, updates: Partial<Company>, requester: User): Company {
    if (requester.role !== 'platform_owner' && requester.companyId !== companyId) {
      throw new Error(`SECURITY_VIOLATION: User ${requester.id} cannot modify company ${companyId}`);
    }

    const idx = this.data.companies.findIndex((c) => c.id === companyId);
    if (idx === -1) throw new Error('Company not found');

    this.data.companies[idx] = {
      ...this.data.companies[idx],
      ...updates,
      id: companyId // Immutable ID
    };

    this.saveToDisk(this.data);
    return this.data.companies[idx];
  }

  // Products with Strict Tenant Isolation
  public getProducts(companyId: string, requester?: User | null, includeUnpublished = false): Product[] {
    // If authenticated company member, only return for their authorized company
    if (requester && requester.role !== 'platform_owner') {
      if (requester.companyId !== companyId) {
        throw new Error(`TENANT_ISOLATION_ERROR: Cross-tenant data read blocked for ${requester.email}`);
      }
    }

    return this.data.products.filter((p) => {
      if (p.companyId !== companyId) return false;
      if (!includeUnpublished && !p.isPublished) return false;
      return true;
    });
  }

  public getProductById(productId: string): Product | null {
    return this.data.products.find((p) => p.id === productId) || null;
  }

  public createProduct(productData: Partial<Product>, requester: User): Product {
    if (!requester.companyId && requester.role !== 'platform_owner') {
      throw new Error('Unauthorized');
    }

    const targetCompanyId = requester.role === 'platform_owner'
      ? (productData.companyId || 'comp_heka_ltd')
      : requester.companyId!;

    const newProduct: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      companyId: targetCompanyId,
      name: productData.name || 'New Product',
      nameFa: productData.nameFa,
      category: productData.category || 'General',
      description: productData.description || '',
      descriptionFa: productData.descriptionFa,
      images: productData.images && productData.images.length > 0
        ? productData.images
        : ['https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&auto=format&fit=crop&q=80'],
      unit: productData.unit || 'unit',
      retailPrice: typeof productData.retailPrice === 'number' ? productData.retailPrice : 10,
      currency: productData.currency || '$',
      stock: typeof productData.stock === 'number' ? productData.stock : 0,
      packageSizes: productData.packageSizes || [],
      attributes: productData.attributes || [],
      wholesaleRules: productData.wholesaleRules || {
        minQuantity: 10,
        discountPercent: 0,
        requireQuote: false,
        termsNote: '',
        isConfirmed: false
      },
      shippingDetails: productData.shippingDetails || {
        fee: '',
        transitTime: '',
        coverage: '',
        isConfirmed: false
      },
      qualityInfo: productData.qualityInfo || {
        isConfirmed: false
      },
      isPublished: productData.isPublished !== undefined ? productData.isPublished : true,
      isFeatured: !!productData.isFeatured,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.products.push(newProduct);
    this.saveToDisk(this.data);
    return newProduct;
  }

  public updateProduct(productId: string, updates: Partial<Product>, requester: User): Product {
    const idx = this.data.products.findIndex((p) => p.id === productId);
    if (idx === -1) throw new Error('Product not found');

    const existing = this.data.products[idx];

    // STRICT MULTI-TENANT AUTHORIZATION GUARD
    if (requester.role !== 'platform_owner' && requester.companyId !== existing.companyId) {
      throw new Error(`SECURITY_BREACH_ATTEMPT: User ${requester.email} (Tenant: ${requester.companyId}) attempted to mutate Product ${productId} belonging to Tenant: ${existing.companyId}`);
    }

    this.data.products[idx] = {
      ...existing,
      ...updates,
      id: existing.id,
      companyId: existing.companyId, // CANNOT transfer ownership to another tenant
      updatedAt: new Date().toISOString()
    };

    this.saveToDisk(this.data);
    return this.data.products[idx];
  }

  public deleteProduct(productId: string, requester: User): boolean {
    const idx = this.data.products.findIndex((p) => p.id === productId);
    if (idx === -1) return false;

    const existing = this.data.products[idx];
    if (requester.role !== 'platform_owner' && requester.companyId !== existing.companyId) {
      throw new Error(`SECURITY_BREACH_ATTEMPT: Tenant ${requester.companyId} cannot delete item from Tenant ${existing.companyId}`);
    }

    this.data.products.splice(idx, 1);
    this.saveToDisk(this.data);
    return true;
  }

  // Customer Inquiries
  public getInquiries(companyId: string, requester: User): CustomerInquiry[] {
    if (requester.role !== 'platform_owner' && requester.companyId !== companyId) {
      throw new Error(`SECURITY_VIOLATION: Cannot read private customer inquiries for company ${companyId}`);
    }
    return this.data.inquiries.filter((inq) => inq.companyId === companyId);
  }

  public createInquiry(inquiryData: Partial<CustomerInquiry>): CustomerInquiry {
    if (!inquiryData.companyId) throw new Error('Company ID is required');

    const newInq: CustomerInquiry = {
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      companyId: inquiryData.companyId,
      customerName: inquiryData.customerName || 'Prospective Buyer',
      customerContact: inquiryData.customerContact || '',
      customerLocation: inquiryData.customerLocation,
      inquiryType: inquiryData.inquiryType || 'retail_question',
      productId: inquiryData.productId,
      productName: inquiryData.productName,
      requestedQuantity: inquiryData.requestedQuantity || 1,
      message: inquiryData.message || '',
      replyLanguage: inquiryData.replyLanguage || 'fa',
      status: 'new',
      createdAt: new Date().toISOString()
    };

    this.data.inquiries.unshift(newInq);
    this.saveToDisk(this.data);
    return newInq;
  }

  // Support Tickets (Tenant-scoped)
  public getSupportTickets(companyId: string, requester?: User | null): SupportTicket[] {
    if (requester && requester.role !== 'platform_owner' && requester.companyId !== companyId) {
      if (requester.companyId === 'comp_heka_ltd' && companyId === 'comp_mehr_saffron') {
        // allowed alias
      } else {
        throw new Error(`SECURITY_BREACH_ATTEMPT: User ${requester.id} of ${requester.companyId} denied access to tickets of ${companyId}`);
      }
    }

    const tickets = this.data.supportTickets || [];
    return tickets.filter((t) => t.companyId === companyId || (companyId === 'comp_heka_ltd' && t.companyId === 'comp_mehr_saffron'));
  }

  public createSupportTicket(ticketData: Partial<SupportTicket>, requester?: User | null): SupportTicket {
    const targetCompId = ticketData.companyId || (requester ? requester.companyId : 'comp_heka_ltd') || 'comp_heka_ltd';
    const randNum = Math.floor(100 + Math.random() * 900);
    const count = (this.data.supportTickets || []).length + 1;
    const ticketNumber = ticketData.ticketNumber || `TCK-2026-${count * 10 + (randNum % 10)}`;

    const newTicket: SupportTicket = {
      id: `tck_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ticketNumber,
      companyId: targetCompId,
      subject: ticketData.subject || 'Support Request',
      description: ticketData.description || '',
      category: ticketData.category || 'general',
      priority: ticketData.priority || 'medium',
      status: ticketData.status || 'new',
      conversationLanguage: ticketData.conversationLanguage || 'en',
      attachments: ticketData.attachments || [],
      createdBy: ticketData.createdBy || (requester ? requester.name : 'Corporate User'),
      customerContact: ticketData.customerContact,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!this.data.supportTickets) {
      this.data.supportTickets = [];
    }
    this.data.supportTickets.unshift(newTicket);
    this.saveToDisk(this.data);
    return newTicket;
  }

  public updateSupportTicket(ticketId: string, updates: Partial<SupportTicket>, requester?: User | null): SupportTicket {
    if (!this.data.supportTickets) {
      this.data.supportTickets = [];
    }
    const idx = this.data.supportTickets.findIndex((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (idx === -1) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const ticket = this.data.supportTickets[idx];
    if (requester && requester.role !== 'platform_owner' && requester.companyId !== ticket.companyId) {
      throw new Error(`SECURITY_BREACH_ATTEMPT: User cannot update ticket belonging to another tenant`);
    }

    const updated: SupportTicket = {
      ...ticket,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.data.supportTickets[idx] = updated;
    this.saveToDisk(this.data);
    return updated;
  }

  // ==========================================
  // CUSTOMER ACCOUNTS & PROFILES
  // ==========================================

  public registerCustomer(payload: {
    name: string;
    email: string;
    accountType: AccountType;
    personalProfile?: PersonalProfile;
    businessProfile?: BusinessProfile;
    country?: string;
    city?: string;
    phone?: string;
    preferredLanguage?: Language;
  }): User {
    const existing = this.data.users.find(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (existing) {
      throw new Error(`An account with email ${payload.email} already exists.`);
    }

    const timestamp = Date.now();
    const newUser: User = {
      id: `user_cust_${timestamp}`,
      email: payload.email.trim(),
      name: payload.name.trim(),
      role: 'customer',
      companyId: null,
      token: `token_cust_${timestamp}`,
      accountType: payload.accountType || 'personal',
      personalProfile: payload.personalProfile || (payload.accountType === 'personal' ? {
        fullName: payload.name,
        country: payload.country || 'United Kingdom',
        city: payload.city || 'London',
        phone: payload.phone || '+44 7700 900123'
      } : undefined),
      businessProfile: payload.businessProfile || (payload.accountType === 'business' ? {
        contactPerson: payload.name,
        companyName: payload.name + ' Trading Ltd',
        country: payload.country || 'United Kingdom',
        city: payload.city || 'London',
        businessEmail: payload.email,
        businessPhone: payload.phone || '+44 7700 900123',
        businessType: 'Wholesaler / Distributor'
      } : undefined),
      sellerStatus: 'none',
      preferredLanguage: payload.preferredLanguage || 'en',
      savedProductIds: [],
      phone: payload.phone || '',
      country: payload.country || 'United Kingdom',
      city: payload.city || 'London',
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.saveToDisk(this.data);
    return newUser;
  }

  public updateUserProfile(userId: string, updates: Partial<User>, requester: User): User {
    if (requester.id !== userId && requester.role !== 'company_admin' && requester.role !== 'platform_owner') {
      throw new Error(`SECURITY_BREACH_ATTEMPT: You can only update your own profile.`);
    }

    const userIdx = this.data.users.findIndex((u) => u.id === userId);
    if (userIdx === -1) {
      throw new Error(`User not found: ${userId}`);
    }

    const currentUser = this.data.users[userIdx];
    const updated: User = {
      ...currentUser,
      ...updates,
      // Security guard: cannot elevate own role to admin or platform_owner
      role: requester.role === 'platform_owner' || requester.role === 'company_admin' ? (updates.role || currentUser.role) : currentUser.role,
      // Security guard: cannot self-approve seller status
      sellerStatus: requester.role === 'company_admin' || requester.role === 'platform_owner' ? (updates.sellerStatus || currentUser.sellerStatus) : currentUser.sellerStatus,
      id: currentUser.id,
      token: currentUser.token
    };

    this.data.users[userIdx] = updated;
    this.saveToDisk(this.data);
    return updated;
  }

  public toggleSaveProduct(userId: string, productId: string, requester: User): string[] {
    if (requester.id !== userId) {
      throw new Error(`SECURITY_BREACH_ATTEMPT: Unauthorized access to saved items.`);
    }

    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    const currentSaved = user.savedProductIds || [];
    const exists = currentSaved.includes(productId);
    const updatedSaved = exists ? currentSaved.filter((id) => id !== productId) : [...currentSaved, productId];

    user.savedProductIds = updatedSaved;
    this.saveToDisk(this.data);
    return updatedSaved;
  }

  public getCustomerInquiries(userId: string, userEmail: string, requester: User): CustomerInquiry[] {
    if (requester.id !== userId && requester.role !== 'company_admin' && requester.role !== 'platform_owner') {
      throw new Error(`SECURITY_BREACH_ATTEMPT: Unauthorized access to inquiries.`);
    }

    return this.data.inquiries.filter((inq) => 
      inq.customerId === userId ||
      inq.customerEmail?.toLowerCase() === userEmail.toLowerCase() ||
      inq.customerContact?.toLowerCase() === userEmail.toLowerCase()
    );
  }

  public getCustomerAccounts(requester: User): User[] {
    if (requester.role !== 'company_admin' && requester.role !== 'platform_owner') {
      throw new Error(`SECURITY_BREACH_ATTEMPT: Admin permission required to list customer accounts.`);
    }

    return this.data.users.filter((u) => u.role === 'customer');
  }

  // ==========================================
  // SELLER APPLICATIONS & WORKFLOW
  // ==========================================

  public submitSellerApplication(
    data: Omit<SellerApplication, 'id' | 'status' | 'submittedAt'>,
    requester: User
  ): SellerApplication {
    if (requester.id !== data.userId) {
      throw new Error(`SECURITY_BREACH_ATTEMPT: Cannot submit seller application for another user.`);
    }

    if (!this.data.sellerApplications) {
      this.data.sellerApplications = [];
    }

    // Check if user already has an active pending or approved application
    const existing = this.data.sellerApplications.find(
      (app) => app.userId === data.userId && (app.status === 'pending' || app.status === 'approved')
    );
    if (existing) {
      if (existing.status === 'approved') {
        throw new Error('Your seller account is already approved.');
      }
      throw new Error('You already have a pending seller application under review.');
    }

    const newApp: SellerApplication = {
      ...data,
      id: `app_${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    this.data.sellerApplications.push(newApp);

    // Update user's seller status to 'pending'
    const user = this.data.users.find((u) => u.id === data.userId);
    if (user) {
      user.sellerStatus = 'pending';
    }

    this.saveToDisk(this.data);
    return newApp;
  }

  public getSellerApplication(userId: string, requester: User): SellerApplication | null {
    if (requester.id !== userId && requester.role !== 'company_admin' && requester.role !== 'platform_owner') {
      throw new Error(`SECURITY_BREACH_ATTEMPT: Unauthorized.`);
    }

    if (!this.data.sellerApplications) return null;
    return this.data.sellerApplications.find((app) => app.userId === userId) || null;
  }

  public getAllSellerApplications(requester: User): SellerApplication[] {
    if (requester.role !== 'company_admin' && requester.role !== 'platform_owner') {
      throw new Error(`SECURITY_BREACH_ATTEMPT: Admin permission required to view seller applications.`);
    }

    return this.data.sellerApplications || [];
  }

  public reviewSellerApplication(
    applicationId: string,
    status: 'approved' | 'rejected' | 'suspended',
    adminNotes: string | undefined,
    rejectionReason: string | undefined,
    requester: User
  ): SellerApplication {
    if (requester.role !== 'company_admin' && requester.role !== 'platform_owner') {
      throw new Error(`SECURITY_BREACH_ATTEMPT: Admin permission required to review seller applications.`);
    }

    if (!this.data.sellerApplications) {
      this.data.sellerApplications = [];
    }

    const app = this.data.sellerApplications.find((a) => a.id === applicationId);
    if (!app) {
      throw new Error(`Seller application ${applicationId} not found.`);
    }

    app.status = status;
    app.reviewedAt = new Date().toISOString();
    app.reviewedBy = requester.name;
    if (adminNotes !== undefined) app.adminNotes = adminNotes;
    if (rejectionReason !== undefined) app.rejectionReason = rejectionReason;

    // Update the applicant user's sellerStatus
    const user = this.data.users.find((u) => u.id === app.userId);
    if (user) {
      user.sellerStatus = status;
    }

    this.saveToDisk(this.data);
    return app;
  }

  // ==========================================
  // SELLER PRODUCTS & WORKFLOW
  // ==========================================

  public getSellerProducts(sellerId: string, requester: User): Product[] {
    if (requester.id !== sellerId && requester.role !== 'company_admin' && requester.role !== 'platform_owner') {
      throw new Error(`SECURITY_BREACH_ATTEMPT: Unauthorized to view these seller products.`);
    }

    return this.data.products.filter((p) => p.sellerId === sellerId);
  }

  public createSellerProduct(payload: Partial<Product>, requester: User): Product {
    if (requester.sellerStatus !== 'approved') {
      throw new Error(`FORBIDDEN: Only approved sellers may submit products for catalog review.`);
    }

    const now = new Date().toISOString();
    const newProduct: Product = {
      id: `prod_seller_${Date.now()}`,
      companyId: 'comp_heka_ltd', // Registered on HEKA platform
      name: payload.name || 'Untitled Seller Product',
      nameFa: payload.nameFa || payload.name || '',
      category: payload.category || 'General',
      description: payload.description || '',
      descriptionFa: payload.descriptionFa || '',
      images: payload.images && payload.images.length > 0 ? payload.images : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'],
      unit: payload.unit || 'piece',
      retailPrice: Number(payload.retailPrice) || 0,
      currency: payload.currency || 'USD',
      stock: Number(payload.stock) || 0,
      packageSizes: payload.packageSizes || [],
      attributes: payload.attributes || [],
      wholesaleRules: payload.wholesaleRules || {
        minQuantity: 10,
        discountPercent: 10,
        requireQuote: true,
        termsNote: 'Standard wholesale terms apply',
        isConfirmed: true
      },
      shippingDetails: payload.shippingDetails || {
        fee: 'Calculated upon order destination',
        transitTime: '3-7 business days',
        coverage: 'International',
        isConfirmed: true
      },
      qualityInfo: payload.qualityInfo || {
        grade: 'Commercial Grade A',
        isConfirmed: true
      },
      // CRITICAL: Seller products MUST remain unpublished until HEKA admin reviews and approves!
      isPublished: false,
      sellerId: requester.id,
      sellerName: requester.businessProfile?.companyName || requester.name,
      approvalStatus: 'pending_review',
      submittedAt: now,
      createdAt: now,
      updatedAt: now
    };

    this.data.products.push(newProduct);
    this.saveToDisk(this.data);
    return newProduct;
  }

  public updateSellerProduct(productId: string, updates: Partial<Product>, requester: User): Product {
    const idx = this.data.products.findIndex((p) => p.id === productId);
    if (idx === -1) {
      throw new Error(`Product not found: ${productId}`);
    }

    const existing = this.data.products[idx];
    if (existing.sellerId !== requester.id && requester.role !== 'company_admin' && requester.role !== 'platform_owner') {
      throw new Error(`SECURITY_BREACH_ATTEMPT: You can only edit your own products.`);
    }

    if (requester.role === 'customer' && requester.sellerStatus !== 'approved') {
      throw new Error(`FORBIDDEN: Approved seller status is required.`);
    }

    const isSeller = requester.role === 'customer' || existing.sellerId === requester.id;

    // If seller updates product, status resets to pending_review and isPublished resets to false
    const updated: Product = {
      ...existing,
      ...updates,
      id: existing.id,
      companyId: existing.companyId,
      sellerId: existing.sellerId,
      sellerName: existing.sellerName,
      // If a seller modifies product, it requires re-approval
      approvalStatus: isSeller ? 'pending_review' : (updates.approvalStatus || existing.approvalStatus),
      isPublished: isSeller ? false : (updates.isPublished !== undefined ? updates.isPublished : existing.isPublished),
      submittedAt: isSeller ? new Date().toISOString() : existing.submittedAt,
      updatedAt: new Date().toISOString()
    };

    this.data.products[idx] = updated;
    this.saveToDisk(this.data);
    return updated;
  }

  public getAllProductsForReview(requester: User): Product[] {
    if (requester.role !== 'company_admin' && requester.role !== 'platform_owner') {
      throw new Error(`SECURITY_BREACH_ATTEMPT: Admin permission required to review products.`);
    }

    // Return all seller submitted products or products pending review
    return this.data.products.filter(
      (p) => Boolean(p.sellerId) || p.approvalStatus === 'pending_review' || p.approvalStatus === 'rejected'
    );
  }

  public reviewProductSubmission(
    productId: string,
    approvalStatus: ProductApprovalStatus,
    rejectionReason: string | undefined,
    requester: User
  ): Product {
    if (requester.role !== 'company_admin' && requester.role !== 'platform_owner') {
      throw new Error(`SECURITY_BREACH_ATTEMPT: Admin permission required to review products.`);
    }

    const idx = this.data.products.findIndex((p) => p.id === productId);
    if (idx === -1) {
      throw new Error(`Product not found: ${productId}`);
    }

    const prod = this.data.products[idx];
    prod.approvalStatus = approvalStatus;
    prod.reviewedAt = new Date().toISOString();
    if (rejectionReason !== undefined) {
      prod.rejectionReason = rejectionReason;
    }

    // Only approved products can be published
    if (approvalStatus === 'approved') {
      prod.isPublished = true;
    } else {
      prod.isPublished = false;
    }
    prod.updatedAt = new Date().toISOString();

    this.data.products[idx] = prod;
    this.saveToDisk(this.data);
    return prod;
  }

  public getSellerInquiries(sellerId: string, requester: User): CustomerInquiry[] {
    if (requester.id !== sellerId && requester.role !== 'company_admin' && requester.role !== 'platform_owner') {
      throw new Error(`SECURITY_BREACH_ATTEMPT: Unauthorized to view seller inquiries.`);
    }

    return this.data.inquiries.filter((inq) => inq.sellerId === sellerId);
  }

  // Automated Cross-Tenant Security Audit Test Suite
  public runCrossTenantSecurityAudit(): SecurityAuditResult[] {
    const results: SecurityAuditResult[] = [];

    // Test 1: HEKA Admin attempts to READ Ziba Fashion private data
    const hekaAdmin = this.data.users.find((u) => u.email === 'admin@hekaltd.com' || u.email === 'admin@mehrsaffron.com')!;
    try {
      this.getProducts('comp_ziba_fashion', hekaAdmin, true);
      results.push({
        testId: 'SEC-01',
        testName: 'Cross-Tenant Private Read Attack',
        testDescription: 'Tenant A (HEKA LTD) attempts to read Tenant B (Ziba Fashion) private inventory.',
        targetCompany: 'Ziba Silk & Apparel',
        attackingCompany: 'HEKA LTD',
        actionAttempted: 'GET /api/products (companyId: comp_ziba_fashion)',
        statusCodeReceived: 200,
        expectedStatus: 403,
        isIsolated: false,
        details: 'FAILED: Cross-tenant read was allowed!'
      });
    } catch (err: any) {
      results.push({
        testId: 'SEC-01',
        testName: 'Cross-Tenant Private Read Attack',
        testDescription: 'Tenant A (HEKA LTD) attempts to read Tenant B (Ziba Fashion) private inventory.',
        targetCompany: 'Ziba Silk & Apparel',
        attackingCompany: 'HEKA LTD',
        actionAttempted: 'GET /api/products (companyId: comp_ziba_fashion)',
        statusCodeReceived: 403,
        expectedStatus: 403,
        isIsolated: true,
        details: `PASSED: Blocked with ${err.message}`
      });
    }

    // Test 2: HEKA Admin attempts to EDIT Ziba Fashion product price
    try {
      this.updateProduct('prod_ziba_1', { retailPrice: 1 }, hekaAdmin);
      results.push({
        testId: 'SEC-02',
        testName: 'Cross-Tenant Unauthorized Price Tampering',
        testDescription: 'Tenant A (HEKA LTD) attempts to update product price of Tenant B.',
        targetCompany: 'Ziba Silk & Apparel',
        attackingCompany: 'HEKA LTD',
        actionAttempted: 'PUT /api/products/prod_ziba_1 (price: $1)',
        statusCodeReceived: 200,
        expectedStatus: 403,
        isIsolated: false,
        details: 'FAILED: Price tampering was permitted!'
      });
    } catch (err: any) {
      results.push({
        testId: 'SEC-02',
        testName: 'Cross-Tenant Unauthorized Price Tampering',
        testDescription: 'Tenant A (HEKA LTD) attempts to update product price of Tenant B.',
        targetCompany: 'Ziba Silk & Apparel',
        attackingCompany: 'HEKA LTD',
        actionAttempted: 'PUT /api/products/prod_ziba_1 (price: $1)',
        statusCodeReceived: 403,
        expectedStatus: 403,
        isIsolated: true,
        details: `PASSED: Blocked with ${err.message}`
      });
    }

    // Test 3: Ziba Admin attempts to DELETE HEKA LTD product
    const zibaAdmin = this.data.users.find((u) => u.email === 'admin@zibafashion.com')!;
    const hekaProduct = this.data.products.find((p) => p.companyId === 'comp_heka_ltd' || p.companyId === 'comp_mehr_saffron') || { id: 'prod_heka_1' };
    try {
      this.deleteProduct(hekaProduct.id, zibaAdmin);
      results.push({
        testId: 'SEC-03',
        testName: 'Cross-Tenant Deletion Attack',
        testDescription: 'Tenant B attempts to delete a product owned by Tenant A (HEKA LTD).',
        targetCompany: 'HEKA LTD',
        attackingCompany: 'Ziba Silk & Apparel',
        actionAttempted: `DELETE /api/products/${hekaProduct.id}`,
        statusCodeReceived: 200,
        expectedStatus: 403,
        isIsolated: false,
        details: 'FAILED: Cross-tenant deletion succeeded!'
      });
    } catch (err: any) {
      results.push({
        testId: 'SEC-03',
        testName: 'Cross-Tenant Deletion Attack',
        testDescription: 'Tenant B attempts to delete a product owned by Tenant A (HEKA LTD).',
        targetCompany: 'HEKA LTD',
        attackingCompany: 'Ziba Silk & Apparel',
        actionAttempted: `DELETE /api/products/${hekaProduct.id}`,
        statusCodeReceived: 403,
        expectedStatus: 403,
        isIsolated: true,
        details: `PASSED: Blocked with ${err.message}`
      });
    }

    // Test 4: Ziba Staff attempts to READ HEKA LTD customer inquiries and phones
    const targetCompId = this.data.companies.find((c) => c.slug === 'heka-ltd')?.id || 'comp_heka_ltd';
    try {
      this.getInquiries(targetCompId, zibaAdmin);
      results.push({
        testId: 'SEC-04',
        testName: 'Customer PII & Lead Theft Attack',
        testDescription: 'Tenant B attempts to harvest customer leads & inquiries from Tenant A (HEKA LTD).',
        targetCompany: 'HEKA LTD',
        attackingCompany: 'Ziba Silk & Apparel',
        actionAttempted: `GET /api/inquiries (companyId: ${targetCompId})`,
        statusCodeReceived: 200,
        expectedStatus: 403,
        isIsolated: false,
        details: 'FAILED: Customer leads leaked!'
      });
    } catch (err: any) {
      results.push({
        testId: 'SEC-04',
        testName: 'Customer PII & Lead Theft Attack',
        testDescription: 'Tenant B attempts to harvest customer leads & inquiries from Tenant A (HEKA LTD).',
        targetCompany: 'HEKA LTD',
        attackingCompany: 'Ziba Silk & Apparel',
        actionAttempted: `GET /api/inquiries (companyId: ${targetCompId})`,
        statusCodeReceived: 403,
        expectedStatus: 403,
        isIsolated: true,
        details: `PASSED: Blocked with ${err.message}`
      });
    }

    return results;
  }
}

export const dbManager = new DatabaseManager();
