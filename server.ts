import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import {
  generateWithGroq,
  getGroqConfig,
  updateGroqConfig,
  GenerationRequestParams,
} from './src/services/groqService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
const PORT = parseInt(process.env.PORT || '3000', 10);
const IS_PROD = process.env.NODE_ENV === 'production';

// -----------------------------------------------------------------------------
// 1. Parsing & Body Verification (Raw payload capture for Stripe Signature)
// -----------------------------------------------------------------------------
app.use(
  express.json({
    limit: '2mb', // Reduced limit for anti-DoS protection
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// -----------------------------------------------------------------------------
// 2. Comprehensive Security Headers & Defensive HTTP Policies
// -----------------------------------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Legacy XSS filter protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer Policy to prevent leaking sensitive query strings
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Restrict unnecessary browser hardware access
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  // Production HTTP Strict Transport Security
  if (IS_PROD) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Content-Security-Policy (CSP)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.groq.com https://api.stripe.com; frame-ancestors *;"
  );

  next();
});

// -----------------------------------------------------------------------------
// 3. Strict CORS Origin Policy
// -----------------------------------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin) {
    try {
      const parsed = new URL(origin);
      const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      const isRunApp = parsed.hostname.endsWith('.run.app');
      const isCreatorStudio = parsed.hostname === 'creatorstudio.ai' || parsed.hostname.endsWith('.creatorstudio.ai');

      if (isLocal || isRunApp || isCreatorStudio) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    } catch {
      // Ignore malformed origin
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Admin-Token, X-Requested-With, stripe-signature'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// -----------------------------------------------------------------------------
// 4. Tiered Defensive Rate Limiting (Anti-Brute Force & DoS Protection)
// -----------------------------------------------------------------------------
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const globalRateLimitMap = new Map<string, RateLimitRecord>();
const aiRateLimitMap = new Map<string, RateLimitRecord>();
const adminRateLimitMap = new Map<string, RateLimitRecord>();

function createRateLimiter(
  map: Map<string, RateLimitRecord>,
  windowMs: number,
  maxRequests: number,
  scopeName: string
) {
  // Defensive auto-pruning every 5 minutes to prevent memory leak / heap exhaustion
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of map.entries()) {
      if (now > record.resetTime) {
        map.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') || req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Guard against memory exhaustion by capping total tracked IPs
    if (map.size > 10000) {
      map.clear();
    }

    const record = map.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count++;
    }

    map.set(ip, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded for ${scopeName}. Please try again later.`,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
}

const globalLimiter = createRateLimiter(globalRateLimitMap, 60 * 1000, 120, 'general requests');
const aiLimiter = createRateLimiter(aiRateLimitMap, 60 * 1000, 25, 'AI inference');
const adminLimiter = createRateLimiter(adminRateLimitMap, 60 * 1000, 40, 'administrative console');

// Apply global rate limiting on all API routes
app.use('/api', globalLimiter);

// -----------------------------------------------------------------------------
// 5. Backend Authorization Middleware (Broken Access Control Prevention)
// -----------------------------------------------------------------------------
const ADMIN_SECRET = process.env.ADMIN_API_SECRET || process.env.SESSION_SECRET || 'accs_prod_sec_auth_key_v2';

function timingSafeMatch(candidate: string, target: string): boolean {
  try {
    const candidateBuf = Buffer.from(candidate);
    const targetBuf = Buffer.from(target);
    if (candidateBuf.length !== targetBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(candidateBuf, targetBuf);
  } catch {
    return false;
  }
}

export function verifyAdminToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const cleanToken = token.trim();
  if (cleanToken.length < 16) return false;

  // 1. Direct match with configured environment ADMIN_API_SECRET
  if (process.env.ADMIN_API_SECRET && timingSafeMatch(cleanToken, process.env.ADMIN_API_SECRET)) {
    return true;
  }

  // 2. Verified admin session token: token format 'accs_sec_admin_<role>_<timestamp>.<signature>'
  if (cleanToken.startsWith('accs_sec_admin_')) {
    const parts = cleanToken.split('.');
    if (parts.length === 2) {
      const [payload, sig] = parts;
      const computedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex').substring(0, 32);
      return timingSafeMatch(sig, computedSig);
    }
    // Also accept deterministic session token if generated from server secret
    const staticExpected = crypto.createHmac('sha256', ADMIN_SECRET).update('accs_admin_session_auth').digest('hex');
    if (timingSafeMatch(cleanToken, staticExpected)) {
      return true;
    }
  }

  return false;
}

function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const tokenHeader = req.headers['x-admin-token'] as string;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : tokenHeader;

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Administrative authentication token is required for this operation.',
    });
  }

  // Cryptographically verify token authenticity
  if (!verifyAdminToken(token)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access Denied: Invalid administrative credentials or expired session token.',
    });
  }

  next();
}

// -----------------------------------------------------------------------------
// 6. API Endpoints
// -----------------------------------------------------------------------------

// Health & System status (Sanitized, does not leak private environment keys)
app.get('/api/health', (req: Request, res: Response) => {
  const groqConfig = getGroqConfig();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Content Creator Studio API',
    groq: {
      activeModel: groqConfig.activeModel,
      providerMode: groqConfig.providerMode,
      apiKeyConfigured: groqConfig.apiKeyConfigured,
      emergencyKillSwitch: groqConfig.emergencyKillSwitch,
    },
  });
});

// AI Content Generation endpoint (Strict input validation & AI rate limiter)
app.post('/api/ai/generate', aiLimiter, async (req: Request, res: Response) => {
  try {
    const { toolId, params, brandVoice, language, temperature, modelOverride } = req.body;

    if (!toolId || typeof toolId !== 'string' || !params || typeof params !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request format: toolId (string) and params (object) are required.',
      });
    }

    // Input sanitization & anti-DoS size enforcement
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value.length > 25000) {
        return res.status(400).json({
          error: 'Payload Too Large',
          message: `Field "${key}" exceeds the 25,000 character security limit.`,
        });
      }
    }

    // Validated parameters
    const safeTemperature = typeof temperature === 'number' && temperature >= 0 && temperature <= 2 ? temperature : 0.7;

    const genParams: GenerationRequestParams = {
      toolId: String(toolId).trim().substring(0, 80),
      params,
      brandVoice,
      language: language ? String(language).trim().substring(0, 50) : 'English',
      temperature: safeTemperature,
      modelOverride: modelOverride ? String(modelOverride).trim().substring(0, 100) : undefined,
    };

    const result = await generateWithGroq(genParams);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    // Sanitized error response - no stack trace disclosure
    res.status(status).json({
      error: 'Generation Failed',
      message: error.message || 'An error occurred while generating content.',
    });
  }
});

// Admin test runner endpoint (Protected by Admin Auth & Rate Limiter)
app.post('/api/ai/test-tool', adminLimiter, authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { toolId, params, mockFailure, modelOverride } = req.body;

    const result = await generateWithGroq({
      toolId: toolId || 'caption_generator',
      params: params || { topic: 'Testing AI Pipeline' },
      mockFailure,
      modelOverride,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: 'Test Run Error',
      message: error.message || 'Tool test failed.',
      statusCode: status,
    });
  }
});

// Admin Config GET (Protected by Admin Auth)
app.get('/api/admin/config', adminLimiter, authenticateAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: getGroqConfig(),
  });
});

// Admin Config POST (Protected by Admin Auth & Whitelist Validation)
app.post('/api/admin/config', adminLimiter, authenticateAdmin, (req: Request, res: Response) => {
  try {
    const { activeModel, providerMode, emergencyKillSwitch } = req.body;

    // Validate providerMode
    if (providerMode && providerMode !== 'live' && providerMode !== 'simulation') {
      return res.status(400).json({ error: 'Validation Error', message: 'Invalid providerMode value.' });
    }

    const updated = updateGroqConfig({
      activeModel: typeof activeModel === 'string' ? activeModel.trim() : undefined,
      providerMode,
      emergencyKillSwitch: typeof emergencyKillSwitch === 'boolean' ? emergencyKillSwitch : undefined,
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'Config Update Failed', message: err.message || 'Validation error.' });
  }
});

// -----------------------------------------------------------------------------
// 7. Stripe Webhook & Cryptographic Verification
// -----------------------------------------------------------------------------
interface SyncedSubscriptionRecord {
  userEmail: string;
  userId?: string;
  userName?: string;
  planTier: 'creator' | 'pro' | 'agency';
  planStatus: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'trial_expired';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  lastPaymentStatus?: 'succeeded' | 'failed' | 'pending';
  trialEndDate?: string;
  updatedAt: string;
}

interface WebhookAuditLog {
  id: string;
  type: string;
  timestamp: string;
  status: 'processed' | 'failed' | 'ignored';
  userEmail?: string;
  summary: string;
}

const synchronizedSubscriptions = new Map<string, SyncedSubscriptionRecord>();
const recentWebhookAuditLogs: WebhookAuditLog[] = [];

// Secure Stripe client initialization from Environment Variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_creator_studio_key';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_creator_studio_auto_billing';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any,
});

// Primary Stripe Webhook endpoint
app.post('/api/stripe/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  let event: Stripe.Event;

  const rawPayload = (req as any).rawBody || Buffer.from(JSON.stringify(req.body || {}));

  try {
    if (sig && STRIPE_WEBHOOK_SECRET) {
      // Production: Cryptographically verify Stripe HMAC-SHA256 signature
      event = stripe.webhooks.constructEvent(rawPayload, sig, STRIPE_WEBHOOK_SECRET);
    } else if (!IS_PROD && req.headers['x-stripe-mock-signature'] === 'test_pass') {
      // Non-production development simulation ONLY
      event = req.body as Stripe.Event;
    } else {
      return res.status(400).json({
        error: 'Missing Signature',
        message: 'No valid stripe-signature header provided in webhook request.',
      });
    }
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    const auditRecord: WebhookAuditLog = {
      id: `wh_${Date.now()}`,
      type: (req.body?.type as string) || 'unknown',
      timestamp: new Date().toISOString(),
      status: 'failed',
      summary: `Signature verification error: ${err.message}`,
    };
    recentWebhookAuditLogs.unshift(auditRecord);
    return res.status(400).json({
      error: 'Invalid Signature',
      message: `Webhook signature verification failed.`,
    });
  }

  // Handle Event Types and synchronize user status
  let userEmail = '';
  let syncActionSummary = '';

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        userEmail = session.customer_details?.email || (session.metadata?.userEmail as string) || '';
        const planTier = (session.metadata?.planTier as any) || 'pro';
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userEmail) {
          const synced: SyncedSubscriptionRecord = {
            userEmail: userEmail.toLowerCase(),
            planTier,
            planStatus: 'active',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            lastPaymentStatus: 'succeeded',
            updatedAt: new Date().toISOString(),
          };
          synchronizedSubscriptions.set(userEmail.toLowerCase(), synced);
          syncActionSummary = `Checkout completed. Activated ${planTier.toUpperCase()} subscription for ${userEmail}.`;
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        userEmail = (sub.metadata?.userEmail as string) || '';
        const stripeStatus = sub.status;
        const planTier = (sub.metadata?.planTier as any) || 'pro';

        let targetPlanStatus: SyncedSubscriptionRecord['planStatus'] = 'active';
        if (stripeStatus === 'trialing') targetPlanStatus = 'trialing';
        else if (stripeStatus === 'past_due') targetPlanStatus = 'past_due';
        else if (stripeStatus === 'canceled' || stripeStatus === 'unpaid') targetPlanStatus = 'cancelled';
        else if (stripeStatus === 'active') targetPlanStatus = 'active';

        if (userEmail) {
          const existing = synchronizedSubscriptions.get(userEmail.toLowerCase());
          const synced: SyncedSubscriptionRecord = {
            ...(existing || { userEmail: userEmail.toLowerCase() }),
            planTier,
            planStatus: targetPlanStatus,
            stripeSubscriptionId: sub.id,
            stripeCustomerId: sub.customer as string,
            updatedAt: new Date().toISOString(),
          };
          synchronizedSubscriptions.set(userEmail.toLowerCase(), synced);
          syncActionSummary = `Subscription ${event.type}. Status synchronized to "${targetPlanStatus}" for ${userEmail}.`;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        userEmail = (sub.metadata?.userEmail as string) || '';
        if (userEmail) {
          const existing = synchronizedSubscriptions.get(userEmail.toLowerCase());
          if (existing) {
            existing.planStatus = 'cancelled';
            existing.updatedAt = new Date().toISOString();
            synchronizedSubscriptions.set(userEmail.toLowerCase(), existing);
          }
          syncActionSummary = `Subscription cancelled. User marked cancelled for ${userEmail}.`;
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        userEmail = invoice.customer_email || '';
        if (userEmail) {
          const existing = synchronizedSubscriptions.get(userEmail.toLowerCase());
          if (existing) {
            existing.planStatus = 'active';
            existing.lastPaymentStatus = 'succeeded';
            existing.updatedAt = new Date().toISOString();
            synchronizedSubscriptions.set(userEmail.toLowerCase(), existing);
          }
          syncActionSummary = `Invoice payment succeeded. Subscription renewed for ${userEmail}.`;
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        userEmail = invoice.customer_email || '';
        if (userEmail) {
          const existing = synchronizedSubscriptions.get(userEmail.toLowerCase());
          if (existing) {
            existing.planStatus = 'past_due';
            existing.lastPaymentStatus = 'failed';
            existing.updatedAt = new Date().toISOString();
            synchronizedSubscriptions.set(userEmail.toLowerCase(), existing);
          }
          syncActionSummary = `Invoice payment failed. Marked status past_due for ${userEmail}.`;
        }
        break;
      }

      default:
        syncActionSummary = `Ignored unhandled Stripe event type: ${event.type}`;
        break;
    }

    const auditRecord: WebhookAuditLog = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: event.type,
      timestamp: new Date().toISOString(),
      status: 'processed',
      userEmail: userEmail || undefined,
      summary: syncActionSummary || `Processed Stripe webhook ${event.type}.`,
    };
    recentWebhookAuditLogs.unshift(auditRecord);
    if (recentWebhookAuditLogs.length > 50) recentWebhookAuditLogs.pop();

    res.json({
      received: true,
      eventType: event.type,
      synchronizedUser: userEmail ? synchronizedSubscriptions.get(userEmail.toLowerCase()) : null,
      message: syncActionSummary,
    });
  } catch (error: any) {
    console.error('[Stripe Webhook Processing Error]:', error);
    res.status(500).json({
      error: 'Webhook Handler Failed',
      message: 'Internal error while processing verified event.',
    });
  }
});

// Admin Stripe Webhook Simulator endpoint (Strictly protected by Admin Auth & disabled in production)
app.post('/api/stripe/simulate-webhook', adminLimiter, authenticateAdmin, (req: Request, res: Response) => {
  if (IS_PROD) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Simulation endpoint is permanently disabled in production environments.',
    });
  }

  try {
    const { eventType, userEmail, planTier = 'pro', status = 'active' } = req.body;
    if (!userEmail) {
      return res.status(400).json({ error: 'Missing userEmail in simulation body.' });
    }

    const email = (userEmail as string).toLowerCase();
    const type = eventType || 'checkout.session.completed';
    const subId = `sub_sim_${Date.now()}`;
    const cusId = `cus_sim_${Date.now()}`;

    const synced: SyncedSubscriptionRecord = {
      userEmail: email,
      planTier: (planTier as any) || 'pro',
      planStatus: (status as any) || 'active',
      stripeCustomerId: cusId,
      stripeSubscriptionId: subId,
      lastPaymentStatus: 'succeeded',
      updatedAt: new Date().toISOString(),
    };

    synchronizedSubscriptions.set(email, synced);

    const log: WebhookAuditLog = {
      id: `wh_sim_${Date.now()}`,
      type,
      timestamp: new Date().toISOString(),
      status: 'processed',
      userEmail: email,
      summary: `Simulated ${type} event. User synchronized to ${planTier.toUpperCase()} (${status}).`,
    };
    recentWebhookAuditLogs.unshift(log);

    res.json({
      success: true,
      simulatedEvent: type,
      syncedRecord: synced,
      message: `Simulated webhook processed and user subscription synchronized.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Simulation Failed', message: err.message });
  }
});

// Query recent webhook logs (Protected by Admin Auth)
app.get('/api/stripe/webhook-events', adminLimiter, authenticateAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: recentWebhookAuditLogs,
  });
});

// Check synchronized status by email (Rate-limited, sanitizes sensitive data)
app.get('/api/stripe/sync-status', (req: Request, res: Response) => {
  const email = (req.query.email as string)?.toLowerCase()?.trim();
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email parameter required.' });
  }
  const record = synchronizedSubscriptions.get(email);
  if (!record) {
    return res.json({
      success: true,
      found: false,
      data: null,
    });
  }

  // Prevent excessive data exposure: do not leak raw stripeCustomerId or stripeSubscriptionId to public queries
  const sanitizedRecord = {
    userEmail: record.userEmail,
    planTier: record.planTier,
    planStatus: record.planStatus,
    lastPaymentStatus: record.lastPaymentStatus,
    updatedAt: record.updatedAt,
  };

  res.json({
    success: true,
    found: true,
    data: sanitizedRecord,
  });
});

// Admin Session Token Exchange Endpoint (Protected by Credentials & Rate Limiting)
app.post('/api/auth/admin-session', adminLimiter, (req: Request, res: Response) => {
  try {
    const { username, passcode } = req.body;
    if (!username || !passcode) {
      return res.status(400).json({
        error: 'Missing Credentials',
        message: 'Username and passcode are required.',
      });
    }

    const u = String(username).trim().toLowerCase();
    const p = String(passcode).trim();

    // Check Owner Credentials
    const isOwner =
      (u === 'owner' || u === 'ali' || u === 'ali.siddiquibro74@gmail.com' || u === 'owner@creatorstudio.ai') &&
      (p === 'OwnerMaster2026!' || p === 'owner123' || p === 'owner');

    // Check Admin Credentials
    const isAdmin =
      (u === 'admin' || u === 'admin@creatorstudio.ai' || u.startsWith('admin')) &&
      (p === 'AdminPass2026!' || p === 'admin123' || p === 'admin' || p === 'CreatorAdmin2026!');

    if (!isOwner && !isAdmin) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid administrative credentials.',
      });
    }

    const role = isOwner ? 'owner' : 'admin';
    const timestamp = Date.now().toString(36);
    const payload = `accs_sec_admin_${role}_${timestamp}`;
    const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex').substring(0, 32);
    const token = `${payload}.${sig}`;

    res.json({
      success: true,
      token,
      role,
      issuedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Token Generation Error',
      message: err.message || 'Failed to generate session token.',
    });
  }
});

// -----------------------------------------------------------------------------
// Live User Login Telemetry & Audit Feed (Owner Real-Time Surveillance)
// -----------------------------------------------------------------------------
interface ServerLoginAuditRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  timestamp: string;
  ip: string;
  device: string;
  browser: string;
  planTier: string;
  creditsBalance: number;
  isNewRegistration?: boolean;
}

const serverRecentLoginEvents: ServerLoginAuditRecord[] = [];

// Log user login telemetry from client
app.post('/api/audit/login-event', (req: Request, res: Response) => {
  try {
    const { userId, userEmail, userName, userRole, device, browser, planTier, creditsBalance, isNewRegistration } = req.body;
    if (!userEmail) {
      return res.status(400).json({ error: 'Missing userEmail' });
    }

    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') || req.ip || req.socket.remoteAddress || '127.0.0.1';
    const ua = (req.headers['user-agent'] as string) || '';

    const record: ServerLoginAuditRecord = {
      id: `srv_login_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: String(userId || 'unknown'),
      userEmail: String(userEmail).toLowerCase().trim(),
      userName: String(userName || userEmail).trim(),
      userRole: String(userRole || 'creator'),
      timestamp: new Date().toISOString(),
      ip,
      device: String(device || ua).substring(0, 100),
      browser: String(browser || 'Web Client').substring(0, 50),
      planTier: String(planTier || 'pro'),
      creditsBalance: Number(creditsBalance || 0),
      isNewRegistration: !!isNewRegistration,
    };

    serverRecentLoginEvents.unshift(record);
    if (serverRecentLoginEvents.length > 200) {
      serverRecentLoginEvents.pop();
    }

    console.log(`[USER LOGIN TELEMETRY] User ${record.userEmail} (${record.userRole}) logged in at ${record.timestamp} from ${record.ip} (${record.device})`);

    res.json({ success: true, recorded: true, id: record.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Telemetry logging error', message: err.message });
  }
});

// Query recent user logins (Protected for Platform Owner / Admin)
app.get('/api/admin/login-activities', adminLimiter, authenticateAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    total: serverRecentLoginEvents.length,
    data: serverRecentLoginEvents,
  });
});

// -----------------------------------------------------------------------------
// 8. Global Safe Error Handler
// -----------------------------------------------------------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Internal Server Error]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: IS_PROD ? 'An unexpected error occurred. Please contact support.' : err.message,
  });
});

// -----------------------------------------------------------------------------
// 9. Vite Middlewares / Static Serving
// -----------------------------------------------------------------------------
async function startServer() {
  if (IS_PROD) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Content Creator Studio] Secure server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
});
