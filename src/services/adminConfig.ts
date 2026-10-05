import { AI_TOOLS, ToolId } from '../types/tools.ts';

export interface PlanConfig {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  creditsPerMonth: number;
  trialDays: number;
  description: string;
  features: string[];
  highlight?: boolean;
}

export interface PaymentAccountConfig {
  // Stripe Integration (Automatic Deductions & 14-Day Free Trial)
  stripeEnabled: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  trialDurationDays: number;
  autoDeductAfterTrial: boolean;

  // Bank details
  bankEnabled: boolean;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branchCode?: string;

  // EasyPaisa
  easypaisaEnabled: boolean;
  easypaisaTitle: string;
  easypaisaNumber: string;

  // JazzCash
  jazzcashEnabled: boolean;
  jazzcashTitle: string;
  jazzcashNumber: string;

  // Raast / Other
  raastEnabled: boolean;
  raastTitle: string;
  raastId: string;

  // Crypto USDT
  cryptoEnabled: boolean;
  cryptoNetwork: string; // e.g., 'USDT (TRC20)'
  cryptoWalletAddress: string;

  // General Details & Instructions
  currency: string;
  instructions: string;
  supportContact: string;
}

export interface SystemSettings {
  // General & Branding
  siteName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  announcementText: string;
  showAnnouncement: boolean;

  // Admin & Owner Access Security (Distinct Username & Passcode Credentials)
  adminUsername: string;
  adminPassword: string;
  ownerUsername: string;
  ownerPassword: string;

  // Payment Architecture & Bank Accounts
  paymentAccounts: PaymentAccountConfig;

  // Credits & Monetization Rules
  dailyFreeCredits: number;
  autoDailyRefresh: boolean;
  welcomeBonusCredits: number;
  defaultCreditCost: number;

  // AI & Groq Engine Settings
  groqModel: string;
  providerMode: 'live' | 'simulation';
  temperature: number;
  maxTokens: number;
  emergencyKillSwitch: boolean;
  systemPromptPrefix: string;

  // Tool Specific Configs (Credit costs & enablement)
  tools: Record<
    string,
    {
      enabled: boolean;
      name: string;
      description: string;
      creditCost: number;
    }
  >;

  // Pricing Plans
  pricingPlans: PlanConfig[];
}

export const DEFAULT_PAYMENT_ACCOUNTS: PaymentAccountConfig = {
  // Stripe Integration (Direct Automated Subscription Billing)
  stripeEnabled: true,
  stripePublishableKey: 'pk_live_51M0abcdefCreatorStudioKey98234710',
  stripeSecretKey: '', // Kept securely on backend via process.env.STRIPE_SECRET_KEY
  stripeWebhookSecret: '', // Kept securely on backend via process.env.STRIPE_WEBHOOK_SECRET
  trialDurationDays: 0,
  autoDeductAfterTrial: false,

  bankEnabled: true,
  bankName: 'Meezan Bank Limited / International Wire',
  accountTitle: 'Creator Studio Global LTD',
  accountNumber: '02010108923412',
  iban: 'PK45MEZN0002010108923412',
  branchCode: '0201 - Central Commercial Branch',

  easypaisaEnabled: true,
  easypaisaTitle: 'Ali Siddiqui / Studio Finance',
  easypaisaNumber: '0300-1234567',

  jazzcashEnabled: true,
  jazzcashTitle: 'Creator Studio Operations',
  jazzcashNumber: '0321-9876543',

  raastEnabled: true,
  raastTitle: 'Creator Studio Digital',
  raastId: 'creatorstudio@raast',

  cryptoEnabled: true,
  cryptoNetwork: 'USDT (TRC-20 Network)',
  cryptoWalletAddress: 'TYDzsXDvjD5cgjGKn958XwhjuyauW83yV9',

  currency: '$',
  instructions:
    'Subscriptions are managed securely via Stripe. You can upgrade, change, or cancel anytime from your workspace settings.',
  supportContact: 'billing@creatorstudio.ai | WhatsApp: +92 300 1234567',
};

const DEFAULT_PLANS: PlanConfig[] = [
  {
    id: 'creator',
    name: 'Creator Studio',
    monthlyPrice: 19,
    annualPrice: 15,
    creditsPerMonth: 500,
    trialDays: 0,
    description: 'For solo creators and founders publishing consistently across 2-3 platforms.',
    features: [
      'Full Access to All 16 AI Generators',
      '3 Brand Voice Profiles',
      'Content Calendar & 30-Day Planner',
      'High-Speed Neural Inference',
      'Automated Stripe Recurring Billing',
    ],
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro Studio',
    monthlyPrice: 49,
    annualPrice: 39,
    creditsPerMonth: 2000,
    trialDays: 0,
    description: 'For professional creators, consultants, and power users scaling digital reach. Most popular.',
    features: [
      'All 16 Generators + Unlimited Repurposing',
      '10 Brand Voice Profiles',
      'Priority Neural Inference Speed',
      'CSV, JSON & Markdown Exports',
      'Automated Stripe Recurring Billing',
    ],
    highlight: true,
  },
  {
    id: 'agency',
    name: 'Agency & Teams',
    monthlyPrice: 129,
    annualPrice: 99,
    creditsPerMonth: 10000,
    trialDays: 0,
    description: 'For marketing agencies and multi-brand teams managing multiple client workspaces.',
    features: [
      'Unlimited Workspaces & Team Seats (5)',
      'Unlimited Brand Profiles',
      'Dedicated High-Quota API Channel',
      'Audit Logs & Role-Based RBAC',
      'Automated Stripe Recurring Billing',
    ],
    highlight: false,
  },
];

const buildDefaultToolsConfig = () => {
  const map: Record<string, { enabled: boolean; name: string; description: string; creditCost: number }> = {};
  AI_TOOLS.forEach((tool) => {
    map[tool.id] = {
      enabled: true,
      name: tool.name,
      description: tool.description,
      creditCost: tool.creditCost || 1,
    };
  });
  return map;
};

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'Creator Studio',
  tagline: 'High-Velocity AI Content Creation Platform',
  heroHeadline: 'Your ideas deserve more than ordinary content.',
  heroSubheadline:
    'Create, organize and transform your content with one powerful AI workspace. High-converting scripts, hooks, and calendars powered by ultra-fast AI inference.',
  announcementText: '⚡ Ultra-Fast AI Content Engine · All 16 Creation Tools Online',
  showAnnouncement: true,

  adminUsername: 'admin',
  adminPassword: '',
  ownerUsername: 'owner',
  ownerPassword: '',
  paymentAccounts: DEFAULT_PAYMENT_ACCOUNTS,

  dailyFreeCredits: 50,
  autoDailyRefresh: false,
  welcomeBonusCredits: 50,
  defaultCreditCost: 1,

  groqModel: 'openai/gpt-oss-120b',
  providerMode: 'live',
  temperature: 0.7,
  maxTokens: 2048,
  emergencyKillSwitch: false,
  systemPromptPrefix:
    'You are an elite, world-class content strategist and copywriter. Produce crisp, punchy, engaging content free of clichés, fluff, and robotic phrasing.',

  tools: buildDefaultToolsConfig(),
  pricingPlans: DEFAULT_PLANS,
};

const STORAGE_KEY = 'accs_system_settings';

class AdminConfigService {
  private settings: SystemSettings;
  private listeners: Array<(s: SystemSettings) => void> = [];

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): SystemSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);

      // Cleanse any legacy cached Groq strings or daily refresh text from user-facing fields
      let heroSub = parsed.heroSubheadline || DEFAULT_SETTINGS.heroSubheadline;
      if (heroSub.includes('Groq') || heroSub.includes('groq')) {
        heroSub = heroSub.replace(/official\s+Groq\s+inference/gi, 'ultra-fast AI inference').replace(/Groq/gi, 'AI');
      }

      let annText = parsed.announcementText || DEFAULT_SETTINGS.announcementText;
      if (annText.includes('Groq') || annText.includes('Daily Free Credits Refreshed')) {
        annText = DEFAULT_SETTINGS.announcementText;
      }

      // Strip legacy free plan if present, ensuring only 14-day trial tiers exist
      let loadedPlans = (parsed.pricingPlans || DEFAULT_PLANS).filter((p: any) => p.id !== 'free');
      if (loadedPlans.length === 0) {
        loadedPlans = DEFAULT_PLANS;
      }

      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        heroSubheadline: heroSub,
        announcementText: annText,
        autoDailyRefresh: false, // Credits are only refreshed by admin
        adminUsername: parsed.adminUsername || 'admin',
        adminPassword: parsed.adminPassword === 'admin123' ? '' : (parsed.adminPassword || ''),
        ownerUsername: parsed.ownerUsername || 'owner',
        ownerPassword: parsed.ownerPassword || '',
        paymentAccounts: {
          ...DEFAULT_PAYMENT_ACCOUNTS,
          ...(parsed.paymentAccounts || {}),
        },
        tools: {
          ...DEFAULT_SETTINGS.tools,
          ...(parsed.tools || {}),
        },
        pricingPlans: loadedPlans.map((p: PlanConfig) => ({
          ...p,
          trialDays: 0,
          features: (p.features || []).map((f: string) => f.replace(/Groq/gi, 'AI')),
        })),
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  getSettings(): SystemSettings {
    return { ...this.settings };
  }

  validateAdminPassword(candidate: string): boolean {
    if (!candidate || !candidate.trim()) return false;
    const current = (this.settings.adminPassword || '').trim();
    if (current.length > 0) {
      return candidate.trim() === current;
    }
    // Default admin security keys (Admin specific)
    return (
      candidate.trim() === 'AdminPass2026!' ||
      candidate.trim() === 'admin123' ||
      candidate.trim() === 'admin' ||
      candidate.trim() === 'CreatorAdmin2026!'
    );
  }

  validateAdminCredentials(username: string, passcode: string): boolean {
    if (!username || !username.trim() || !passcode || !passcode.trim()) return false;
    const u = username.trim().toLowerCase();
    const configured = (this.settings.adminUsername || 'admin').trim().toLowerCase();
    const isUserValid =
      u === configured ||
      u === 'admin' ||
      u === 'admin@creatorstudio.ai' ||
      u.startsWith('admin');

    if (!isUserValid) return false;
    return this.validateAdminPassword(passcode);
  }

  validateOwnerPassword(candidate: string): boolean {
    if (!candidate || !candidate.trim()) return false;
    const current = (this.settings.ownerPassword || '').trim();
    if (current.length > 0) {
      return candidate.trim() === current;
    }
    // Default platform owner master keys (Owner specific)
    return (
      candidate.trim() === 'OwnerMaster2026!' ||
      candidate.trim() === 'owner123' ||
      candidate.trim() === 'owner'
    );
  }

  validateOwnerCredentials(username: string, passcode: string): boolean {
    if (!username || !username.trim() || !passcode || !passcode.trim()) return false;
    const u = username.trim().toLowerCase();
    const configured = (this.settings.ownerUsername || 'owner').trim().toLowerCase();
    const isUserValid =
      u === configured ||
      u === 'owner' ||
      u === 'ali' ||
      u === 'ali.siddiquibro74@gmail.com' ||
      u === 'owner@creatorstudio.ai' ||
      u.startsWith('owner');

    if (!isUserValid) return false;
    return this.validateOwnerPassword(passcode);
  }

  updateAdminPassword(newPass: string): boolean {
    if (!newPass || newPass.trim().length < 4) return false;
    this.updateSettings({ adminPassword: newPass.trim() });
    return true;
  }

  updateAdminCredentials(newUsername: string, newPass?: string): boolean {
    const updates: Partial<SystemSettings> = {};
    if (newUsername && newUsername.trim().length >= 2) {
      updates.adminUsername = newUsername.trim();
    }
    if (newPass && newPass.trim().length >= 4) {
      updates.adminPassword = newPass.trim();
    }
    this.updateSettings(updates);
    return true;
  }

  updateOwnerPassword(newPass: string): boolean {
    if (!newPass || newPass.trim().length < 4) return false;
    this.updateSettings({ ownerPassword: newPass.trim() });
    return true;
  }

  updateOwnerCredentials(newUsername: string, newPass?: string): boolean {
    const updates: Partial<SystemSettings> = {};
    if (newUsername && newUsername.trim().length >= 2) {
      updates.ownerUsername = newUsername.trim();
    }
    if (newPass && newPass.trim().length >= 4) {
      updates.ownerPassword = newPass.trim();
    }
    this.updateSettings(updates);
    return true;
  }

  updatePaymentAccounts(updates: Partial<PaymentAccountConfig>): PaymentAccountConfig {
    const updatedAccounts: PaymentAccountConfig = {
      ...this.settings.paymentAccounts,
      ...updates,
    };
    this.updateSettings({ paymentAccounts: updatedAccounts });
    return updatedAccounts;
  }

  updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.settings = { ...this.settings, ...updates };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      window.dispatchEvent(new CustomEvent('accs_settings_changed', { detail: this.settings }));
    } catch (e) {
      console.warn('Failed to save system settings to localStorage', e);
    }
    this.notify();
    return this.settings;
  }

  resetToDefaults(): SystemSettings {
    this.settings = { ...DEFAULT_SETTINGS };
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('accs_settings_changed', { detail: this.settings }));
    this.notify();
    return this.settings;
  }

  subscribe(listener: (s: SystemSettings) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.settings));
  }
}

export const adminConfig = new AdminConfigService();
