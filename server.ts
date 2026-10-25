import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbManager } from './src/server/db';
import { generateUniversalSalesReply } from './src/utils/salesAssistantEngine';
import { Language } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Auth middleware for extracting and checking user
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'UNAUTHENTICATED: Bearer token required' });
  }

  const user = dbManager.authenticateUser(authHeader);
  if (!user) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS: User session not found' });
  }

  (req as any).user = user;
  next();
}

// -------------------------------------------------------------
// PUBLIC API ENDPOINTS (No login required)
// -------------------------------------------------------------

// 1. Get Public Catalog for any company via slug
app.get('/api/public/catalog/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const company = dbManager.getCompanyBySlug(slug);
  if (!company) {
    return res.status(404).json({ error: 'Company catalog not found' });
  }

  // Strictly return ONLY published products
  const publishedProducts = dbManager.getProducts(company.id, null, false);

  res.json({
    company: {
      id: company.id,
      slug: company.slug,
      name: company.name,
      industry: company.industry,
      country: company.country,
      currency: company.currency,
      logoUrl: company.logoUrl,
      bannerUrl: company.bannerUrl,
      brandColors: company.brandColors,
      contactPhone: company.contactPhone,
      contactEmail: company.contactEmail,
      address: company.address,
      settings: company.settings
    },
    products: publishedProducts
  });
});

// 2. Submit Public Customer Inquiry or Wholesale Quote Request
app.post('/api/public/inquiries', (req: Request, res: Response) => {
  try {
    const {
      companyId,
      customerName,
      customerContact,
      customerLocation,
      inquiryType,
      productId,
      productName,
      requestedQuantity,
      message,
      replyLanguage,
      customerId,
      customerEmail
    } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    // Lookup sellerId if product belongs to a seller
    let sellerId: string | undefined = undefined;
    if (productId) {
      const prod = dbManager.getProductById(productId);
      if (prod && prod.sellerId) {
        sellerId = prod.sellerId;
      }
    }

    const inquiry = dbManager.createInquiry({
      companyId,
      customerName,
      customerContact,
      customerLocation,
      inquiryType,
      productId,
      productName,
      sellerId,
      customerId,
      customerEmail,
      requestedQuantity: parseInt(requestedQuantity, 10) || 1,
      message,
      replyLanguage: replyLanguage || 'fa'
    });

    res.status(201).json(inquiry);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Image Upload Endpoint (Persists data URLs / base64 image strings)
app.post('/api/upload-image', (req: Request, res: Response) => {
  const { imageData, name } = req.body;
  if (!imageData) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  // Returns persistent image URI
  res.json({
    url: imageData,
    filename: name || `product-image-${Date.now()}`
  });
});

// -------------------------------------------------------------
// AUTHENTICATION & ONBOARDING
// -------------------------------------------------------------

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { token, email } = req.body;
  const users = dbManager.getUsers();

  let user = null;
  if (token) {
    user = dbManager.authenticateUser(token);
  } else if (email) {
    user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  if (!user) {
    return res.status(401).json({ error: 'User not found or invalid token' });
  }

  const company = user.companyId ? dbManager.getCompanyById(user.companyId) : null;
  res.json({ user, company });
});

// Self-service Company Registration Flow
app.post('/api/auth/register-company', (req: Request, res: Response) => {
  try {
    const { name, industry, country, currency, adminEmail, adminName, contactPhone, brandColors } = req.body;
    if (!name || !adminEmail) {
      return res.status(400).json({ error: 'Company name and admin email are required' });
    }

    const result = dbManager.registerCompany(
      {
        name,
        industry: industry || 'Retail & Trade',
        country: country || 'Afghanistan',
        currency: currency || 'USD',
        contactPhone: contactPhone || '+93700000000',
        brandColors: brandColors || { primary: '#1e3a8a', accent: '#3b82f6' }
      },
      adminEmail,
      adminName || 'Company Administrator'
    );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// SECURE MULTI-TENANT PRIVATE ENDPOINTS
// -------------------------------------------------------------

// List companies (Platform Owner sees all; regular users only see their own)
app.get('/api/companies', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role === 'platform_owner') {
    return res.json(dbManager.getCompanies());
  }
  if (user.companyId) {
    const myComp = dbManager.getCompanyById(user.companyId);
    return res.json(myComp ? [myComp] : []);
  }
  res.json([]);
});

// Update company profile and branding (Tenant Admin only)
app.put('/api/companies/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const companyId = req.params.id;

  try {
    const updated = dbManager.updateCompany(companyId, req.body, user);
    res.json(updated);
  } catch (err: any) {
    if (err.message.startsWith('SECURITY_VIOLATION')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// Products: List private inventory for authenticated company
app.get('/api/products', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const requestedCompanyId = (req.query.companyId as string) || user.companyId;

  if (!requestedCompanyId) {
    return res.status(400).json({ error: 'companyId query param required' });
  }

  try {
    const products = dbManager.getProducts(requestedCompanyId, user, true);
    res.json(products);
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }
});

// Create product (Authenticated company admin or staff)
app.post('/api/products', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const newProduct = dbManager.createProduct(req.body, user);
    res.status(201).json(newProduct);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Update product (Strict Tenant Check: product must belong to user's company!)
app.put('/api/products/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const productId = req.params.id;

  try {
    const updated = dbManager.updateProduct(productId, req.body, user);
    res.json(updated);
  } catch (err: any) {
    if (err.message.startsWith('SECURITY_BREACH_ATTEMPT')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete product (Strict Tenant Check)
app.delete('/api/products/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const productId = req.params.id;

  try {
    const success = dbManager.deleteProduct(productId, user);
    res.json({ success });
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Inquiries: List private leads for company
app.get('/api/inquiries', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const companyId = (req.query.companyId as string) || user.companyId;

  if (!companyId) {
    return res.status(400).json({ error: 'companyId required' });
  }

  try {
    const inquiries = dbManager.getInquiries(companyId, user);
    res.json(inquiries);
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }
});

// Support Tickets: List private tickets for company
app.get('/api/support/tickets', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const companyId = (req.query.companyId as string) || user.companyId;

  if (!companyId) {
    return res.status(400).json({ error: 'companyId required' });
  }

  try {
    const tickets = dbManager.getSupportTickets(companyId, user);
    res.json(tickets);
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }
});

// Support Tickets: Create a new support ticket
app.post('/api/support/tickets', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const newTicket = dbManager.createSupportTicket(req.body, user);
    res.status(201).json(newTicket);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Support Tickets: Update ticket status or fields
app.patch('/api/support/tickets/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const ticketId = req.params.id;
  try {
    const updated = dbManager.updateSupportTicket(ticketId, req.body, user);
    res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CUSTOMER & SELLER PLATFORM ENDPOINTS
// -------------------------------------------------------------

// Customer Registration (Personal or Business)
app.post('/api/auth/register-customer', (req: Request, res: Response) => {
  try {
    const { name, email, accountType, personalProfile, businessProfile, country, city, phone, preferredLanguage } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const newUser = dbManager.registerCustomer({
      name,
      email,
      accountType: accountType || 'personal',
      personalProfile,
      businessProfile,
      country,
      city,
      phone,
      preferredLanguage
    });

    res.status(201).json({ user: newUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get Current User Profile
app.get('/api/users/profile', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ user });
});

// Update User Profile (Switch Account Type, Update Personal/Business Details)
app.put('/api/users/profile', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const updatedUser = dbManager.updateUserProfile(user.id, req.body, user);
    res.json({ user: updatedUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Bookmark / Save Product
app.post('/api/users/save-product', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  try {
    const savedProductIds = dbManager.toggleSaveProduct(user.id, productId, user);
    res.json({ savedProductIds });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Customer Quotation Requests & Inquiries
app.get('/api/customer/inquiries', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const inquiries = dbManager.getCustomerInquiries(user.id, user.email, user);
    res.json(inquiries);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Customer Saved Products Full Details
app.get('/api/customer/saved-products', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const savedIds = user.savedProductIds || [];
  const products = savedIds.map((id: string) => dbManager.getProductById(id)).filter(Boolean);
  res.json(products);
});

// Seller Application: Get Current Status
app.get('/api/seller/application', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const appData = dbManager.getSellerApplication(user.id, user);
    res.json({ application: appData, sellerStatus: user.sellerStatus || 'none' });
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Seller Application: Submit Application
app.post('/api/seller/application', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const { businessName, businessType, country, city, phone, email, description, productCategories, registrationNumber, documents } = req.body;
    if (!businessName || !description) {
      return res.status(400).json({ error: 'Business name and description are required.' });
    }

    const application = dbManager.submitSellerApplication({
      userId: user.id,
      applicantName: user.name,
      businessName,
      businessType: businessType || (user.businessProfile?.businessType || 'Wholesale / Distribution'),
      country: country || user.country || 'United Kingdom',
      city: city || user.city || 'London',
      phone: phone || user.phone || '',
      email: email || user.email,
      description,
      productCategories: productCategories || ['General'],
      registrationNumber,
      documents
    }, user);

    res.status(201).json({ application });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Seller: List My Products
app.get('/api/seller/products', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const products = dbManager.getSellerProducts(user.id, user);
    res.json(products);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Seller: Submit New Product for Admin Review (Unpublished by default)
app.post('/api/seller/products', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const product = dbManager.createSellerProduct(req.body, user);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Seller: Update My Product (Triggers re-review by Admin)
app.put('/api/seller/products/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const productId = req.params.id;
  try {
    const product = dbManager.updateSellerProduct(productId, req.body, user);
    res.json(product);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Seller: Incoming Customer Quotes & Inquiries for My Products
app.get('/api/seller/inquiries', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const inquiries = dbManager.getSellerInquiries(user.id, user);
    res.json(inquiries);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// HEKA LTD ADMIN: SELLER & PRODUCT APPROVAL MANAGEMENT
// -------------------------------------------------------------

// Admin: Get All Seller Applications
app.get('/api/admin/seller-applications', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const applications = dbManager.getAllSellerApplications(user);
    res.json(applications);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Admin: Review Seller Application (Approve / Reject / Suspend)
app.put('/api/admin/seller-applications/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const applicationId = req.params.id;
  const { status, adminNotes, rejectionReason } = req.body;

  if (!status || !['approved', 'rejected', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (approved, rejected, suspended) is required' });
  }

  try {
    const appResult = dbManager.reviewSellerApplication(applicationId, status, adminNotes, rejectionReason, user);
    res.json(appResult);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Admin: Get All Submitted Products for Review
app.get('/api/admin/product-reviews', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const products = dbManager.getAllProductsForReview(user);
    res.json(products);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Admin: Review Product Submission (Approve / Reject / Suspend)
app.put('/api/admin/product-reviews/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const productId = req.params.id;
  const { approvalStatus, rejectionReason } = req.body;

  if (!approvalStatus || !['approved', 'pending_review', 'rejected', 'draft', 'suspended'].includes(approvalStatus)) {
    return res.status(400).json({ error: 'Valid approvalStatus is required' });
  }

  try {
    const product = dbManager.reviewProductSubmission(productId, approvalStatus, rejectionReason, user);
    res.json(product);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Admin: Get All Customer Accounts
app.get('/api/admin/customers', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const customers = dbManager.getCustomerAccounts(user);
    res.json(customers);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// AI Sales Assistant endpoint (strictly grounded in company & product facts)
app.post('/api/ai/generate-reply', authenticate, async (req: Request, res: Response) => {
  const { productId, customerMessage, targetLang } = req.body;
  if (!productId || !customerMessage) {
    return res.status(400).json({ error: 'productId and customerMessage required' });
  }

  const product = dbManager.getProductById(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const company = dbManager.getCompanyById(product.companyId);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }

  const reply = generateUniversalSalesReply(product, company, customerMessage, (targetLang as Language) || 'fa');

  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI();
      const prompt = `You are a professional B2B customer sales assistant for "${company.name}".
A customer sent the following message:
"${customerMessage}"

Product Name: ${targetLang === 'fa' ? (product.nameFa || product.name) : product.name}
Facts verified from catalog:
${reply.factsUsed.map((f) => `- ${f}`).join('\n')}

Unconfirmed/missing items:
${reply.unconfirmedItems.length > 0 ? reply.unconfirmedItems.map((u) => `- ${u} (UNCONFIRMED - do NOT promise or invent)`).join('\n') : 'None'}

Target Language: ${targetLang === 'fa' ? 'Persian (Farsi/Dari)' : targetLang === 'ps' ? 'Pashto' : 'English'}

Write a polite, professional sales response directly answering the customer based ONLY on the verified facts above.
DO NOT hallucinate or promise unconfirmed information. If something is unconfirmed, politely state that it will need to be confirmed directly with sales management.
Keep the tone natural, helpful, and concise.`;

      const geminiRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      if (geminiRes.text) {
        reply.text = geminiRes.text.trim();
        reply.engineUsed = 'gemini';
      }
    } catch (geminiErr) {
      console.warn('Gemini generation fallback to local engine:', geminiErr);
    }
  }

  res.json(reply);
});

// Automated Cross-Tenant Security Audit endpoint
app.post('/api/tests/cross-tenant-isolation', authenticate, (req: Request, res: Response) => {
  const auditResults = dbManager.runCrossTenantSecurityAudit();
  res.json({
    timestamp: new Date().toISOString(),
    totalTests: auditResults.length,
    allPassed: auditResults.every((r) => r.isIsolated),
    results: auditResults
  });
});

// -------------------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DukanAI SaaS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
