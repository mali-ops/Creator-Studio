import {
  UserProfile,
  BrandVoice,
  Project,
  ContentItem,
  ContentVersion,
  CalendarEntry,
  ContentPlan,
  TemplateItem,
  Workspace,
  WorkspaceMember,
  WorkspaceInvite,
  SupportTicket,
  AIGenerationLog,
  PaymentUpgradeRequest,
  StripeSubscriptionRecord,
  AdminPermissions,
  MediaPhotoAsset,
  PlatformEmailLog,
} from '../types/index.ts';
import { AdminPromptConfig, AdminAuditRecord, UserLoginEvent } from '../types/admin.ts';
import { AI_TOOLS } from '../types/tools.ts';
import { adminConfig } from './adminConfig.ts';

export function getClientDeviceInfo(): { device: string; browser: string; os: string } {
  if (typeof window === 'undefined' || !navigator) {
    return { device: 'Server/API', browser: 'Node.js', os: 'Linux' };
  }
  const ua = navigator.userAgent || '';
  let browser = 'Chrome/Safari';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Apple Safari';

  let os = 'Unknown OS';
  if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Windows NT 10.0')) os = 'Windows 11/10';
  else if (ua.includes('Windows')) os = 'Windows PC';
  else if (ua.includes('Android')) os = 'Android Mobile';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS Mobile';
  else if (ua.includes('Linux')) os = 'Linux';

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const device = isMobile ? `${os} (${browser} Mobile)` : `${os} Desktop (${browser})`;

  return { device, browser, os };
}

const STORAGE_KEYS = {
  USER: 'accs_user',
  TOKEN: 'accs_token',
  ALL_USERS: 'accs_all_users',
  SESSION_ACTIVE: 'accs_session_active',
  WORKSPACES: 'accs_workspaces',
  CURRENT_WORKSPACE: 'accs_current_workspace_id',
  MEMBERS: 'accs_workspace_members',
  INVITES: 'accs_workspace_invites',
  BRAND_VOICES: 'accs_brand_voices',
  PROJECTS: 'accs_projects',
  CONTENT_ITEMS: 'accs_content_items',
  CONTENT_VERSIONS: 'accs_content_versions',
  CALENDAR: 'accs_calendar',
  PLANS: 'accs_content_plans',
  TEMPLATES: 'accs_templates',
  TEMPLATE_FAVORITES: 'accs_template_favorites',
  SUPPORT_TICKETS: 'accs_support_tickets',
  AI_LOGS: 'accs_ai_logs',
  ADMIN_PROMPTS: 'accs_admin_prompts',
  ADMIN_AUDIT: 'accs_admin_audit',
  SYSTEM_THEME: 'accs_theme',
  PAYMENT_REQUESTS: 'accs_payment_requests',
  STRIPE_SUBSCRIPTIONS: 'accs_stripe_subscriptions',
  PHOTO_ASSETS: 'accs_photo_assets',
  EMAIL_LOGS: 'accs_platform_emails',
  USER_CREDENTIALS: 'accs_user_credentials',
  LOGIN_EVENTS: 'accs_user_login_events',
};

// Security helper: Superadmin / Owner / Admin verification (strict & immutable)
export const isSuperadminUser = (user?: { role?: string; email?: string } | null): boolean => {
  if (!user) return false;
  return (
    user.role === 'superadmin' ||
    user.role === 'owner' ||
    user.role === 'admin' ||
    user.email?.toLowerCase() === 'ali.siddiquibro74@gmail.com' ||
    user.email?.toLowerCase() === 'admin@creatorstudio.ai' ||
    user.email?.toLowerCase() === 'owner@creatorstudio.ai' ||
    Boolean(user.email && user.email.toLowerCase().startsWith('admin@')) ||
    Boolean(user.email && user.email.toLowerCase().startsWith('owner@'))
  );
};

export const isOwnerUser = (user?: { role?: string; email?: string } | null): boolean => {
  if (!user) return false;
  return (
    user.role === 'owner' ||
    user.role === 'superadmin' ||
    user.email?.toLowerCase() === 'ali.siddiquibro74@gmail.com' ||
    user.email?.toLowerCase() === 'owner@creatorstudio.ai' ||
    Boolean(user.email && user.email.toLowerCase().startsWith('owner@'))
  );
};

export const isAdminUser = (user?: { role?: string; email?: string } | null): boolean => {
  if (!user) return false;
  return isSuperadminUser(user);
};

export const isClientUser = (user?: { role?: string; email?: string } | null): boolean => {
  if (!user) return true;
  return !isAdminUser(user);
};

// Default seed user
export const DEFAULT_USER: UserProfile = {
  id: 'usr_creator_01',
  email: 'creator@example.com',
  fullName: 'Alex Vance',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  company: 'Aura Studio Digital',
  country: 'United States',
  bio: 'Independent creative director & tech founder scaling digital product brands.',
  creatorType: 'Solo Creator & Founder',
  industry: 'Tech & B2B SaaS',
  preferredPlatforms: ['Instagram', 'LinkedIn', 'YouTube', 'X'],
  contentGoals: ['Audience Growth', 'Authority Building', 'Lead Generation'],
  onboardingCompleted: true,
  role: 'creator',
  creditsBalance: 500,
  creditsTotalUsed: 152,
  lastDailyCreditRefresh: new Date().toISOString().split('T')[0],
  planTier: 'pro',
  planStatus: 'active',
  autoRenew: true,
  isSuspended: false,
  themePreference: 'dark',
  defaultLanguage: 'English',
  defaultTone: 'Engaging & Authentic',
  createdAt: '2026-08-15T09:00:00Z',
  updatedAt: '2026-09-24T18:00:00Z',
};

// Permanent Platform Owner Account (Protected & Immutable - cannot be removed by anyone)
export const DEFAULT_OWNER_USER: UserProfile = {
  id: 'usr_owner_root',
  email: 'ali.siddiquibro74@gmail.com',
  fullName: 'Platform Owner (Ali Siddiqui)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  company: 'Aura Studio Digital (Headquarters)',
  country: 'United States',
  bio: 'Platform Owner with full superadministrator control across all domains and users.',
  creatorType: 'Platform Owner',
  industry: 'Executive / Platform Leadership',
  preferredPlatforms: ['Instagram', 'LinkedIn', 'YouTube', 'X'],
  contentGoals: ['Platform Governance', 'Authority Building'],
  onboardingCompleted: true,
  role: 'owner',
  creditsBalance: 999999,
  creditsTotalUsed: 42,
  planTier: 'agency',
  planStatus: 'active',
  trialDaysRemaining: 9999,
  autoRenew: true,
  isSuspended: false,
  themePreference: 'dark',
  defaultLanguage: 'English',
  defaultTone: 'Authoritative yet conversational',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-09-24T18:00:00Z',
};

// Seed Administrator Account (Managed & Assigned by Platform Owner)
export const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'usr_admin_01',
  email: 'admin@creatorstudio.ai',
  fullName: 'Elena Vance (Admin)',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  company: 'Creator Studio Operations',
  country: 'United States',
  bio: 'Platform Administrator managing creator client accounts and ticket resolutions.',
  creatorType: 'Platform Admin',
  industry: 'Customer Operations & AI Management',
  preferredPlatforms: ['LinkedIn', 'Instagram'],
  contentGoals: ['Support Resolution', 'Creator Growth'],
  onboardingCompleted: true,
  role: 'admin',
  adminPermissions: {
    canResolveClientTickets: true,
    canViewClientMedia: true,
    canAdjustClientCredits: true,
    canManagePayments: true,
    canAccessToolConfig: true,
  },
  creditsBalance: 50000,
  creditsTotalUsed: 120,
  planTier: 'agency',
  planStatus: 'active',
  trialDaysRemaining: 9999,
  autoRenew: true,
  isSuspended: false,
  themePreference: 'dark',
  defaultLanguage: 'English',
  defaultTone: 'Engaging & Authentic',
  createdAt: '2026-02-15T09:00:00Z',
  updatedAt: '2026-09-24T18:00:00Z',
};

// Seed Client / Customer Account
export const DEFAULT_CLIENT_USER: UserProfile = {
  id: 'usr_client_02',
  email: 'marcus.client@vertextech.com',
  fullName: 'Marcus Sterling (Client)',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  company: 'Vertex Tech Solutions',
  country: 'United Kingdom',
  bio: 'B2B Client scaling marketing collaterals and thought leadership.',
  creatorType: 'Corporate Client',
  industry: 'Enterprise Software',
  preferredPlatforms: ['LinkedIn', 'X'],
  contentGoals: ['Lead Generation', 'Client Success'],
  onboardingCompleted: true,
  role: 'creator',
  creditsBalance: 500,
  creditsTotalUsed: 80,
  planTier: 'pro',
  planStatus: 'active',
  autoRenew: true,
  isSuspended: false,
  themePreference: 'light',
  defaultLanguage: 'English',
  defaultTone: 'Professional & Direct',
  createdAt: '2026-08-20T10:00:00Z',
  updatedAt: '2026-09-24T18:00:00Z',
};

export const DEFAULT_ALL_USERS: UserProfile[] = [
  DEFAULT_OWNER_USER,
  DEFAULT_ADMIN_USER,
  DEFAULT_USER,
  DEFAULT_CLIENT_USER,
];

// Initial Seed Data
const SEED_BRAND_VOICES: BrandVoice[] = [
  {
    id: 'bv_01',
    userId: 'usr_creator_01',
    name: 'Aura Tech Visionary',
    description: 'Our primary high-authority founder brand voice.',
    targetAudience: 'Software founders, design engineers, and indie operators',
    personality: 'Clear, high-conviction, intellectually honest, and tactical',
    tone: 'Authoritative yet conversational',
    keywords: ['leverage', 'systems', 'compound growth', 'first principles', 'frictionless'],
    forbiddenWords: ['synergy', 'game-changer', 'revolutionize', 'guru', 'secret sauce'],
    exampleWriting: 'Great software is subtraction, not addition. If your user needs a manual, your architecture is already leaking momentum.',
    preferredLanguage: 'English',
    isDefault: true,
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'bv_02',
    userId: 'usr_creator_01',
    name: 'Lifestyle & Creator Mindset',
    description: 'Casual, relatable behind-the-scenes founder voice.',
    targetAudience: 'Aspiring creators and remote workers',
    personality: 'Warm, transparent, vulnerable, and inspiring',
    tone: 'Friendly and authentic',
    keywords: ['routine', 'sustainable', 'clarity', 'energy management'],
    forbiddenWords: ['hustle 24/7', 'sleep when you die'],
    exampleWriting: 'You do not need to burn out to build something meaningful. Consistency at 80% pace compounds faster than 100% sprints with crashes.',
    preferredLanguage: 'English',
    isDefault: false,
    createdAt: '2026-09-01T12:00:00Z',
  },
];

const SEED_PROJECTS: Project[] = [
  {
    id: 'proj_01',
    userId: 'usr_creator_01',
    brandVoiceId: 'bv_01',
    name: 'Q4 Product Launch Sprint',
    description: 'Campaign assets, short-form scripts, and LinkedIn thought pieces for the v2.0 release.',
    platform: 'Cross-Platform',
    clientName: 'Internal SaaS',
    colorCode: '#06b6d4',
    isArchived: false,
    itemsCount: 5,
    createdAt: '2026-09-10T14:00:00Z',
    updatedAt: '2026-09-23T11:00:00Z',
  },
  {
    id: 'proj_02',
    userId: 'usr_creator_01',
    brandVoiceId: 'bv_02',
    name: 'Weekly YouTube Video Series',
    description: 'Scripts, descriptions, and thumbnail hooks for the "Build in Public" channel.',
    platform: 'YouTube',
    clientName: 'Personal Channel',
    colorCode: '#8b5cf6',
    isArchived: false,
    itemsCount: 3,
    createdAt: '2026-09-12T16:00:00Z',
    updatedAt: '2026-09-24T15:00:00Z',
  },
];

const SEED_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'cnt_01',
    userId: 'usr_creator_01',
    projectId: 'proj_01',
    brandVoiceId: 'bv_01',
    title: 'The Silent Killer of B2B SaaS Growth',
    toolId: 'caption_generator',
    platform: 'LinkedIn',
    contentType: 'Post Caption',
    generatedOutput: `Most founders believe churn is a product problem.\n\nAfter auditing 40+ early-stage B2B SaaS tools, 85% of early customer departures happen for one boring reason:\n\nTime-to-first-value was longer than 4 minutes.\n\nIf a user creates an account and has to configure 6 settings before experiencing a single "aha!" moment, you didn't build software—you built homework.\n\n3 fixes you can implement this afternoon:\n1. Pre-populate dummy workspaces with gorgeous sample data.\n2. Delay account setup until the first milestone is completed.\n3. Remove 50% of the optional onboarding steps.\n\nFriction is the tax on unoptimized product thinking.\n\nWhat is your current time-to-first-value? Let's discuss in the comments.\n\n#SaaS #ProductLedGrowth #ProductDesign #IndieHacker`,
    promptParams: { topic: 'Why early SaaS customers churn within 7 days', platform: 'LinkedIn' },
    isFavorite: true,
    tags: ['SaaS', 'Onboarding', 'LinkedIn'],
    wordCount: 122,
    characterCount: 760,
    versionsCount: 2,
    createdAt: '2026-09-20T10:15:00Z',
    updatedAt: '2026-09-21T08:30:00Z',
  },
  {
    id: 'cnt_02',
    userId: 'usr_creator_01',
    projectId: 'proj_02',
    brandVoiceId: 'bv_02',
    title: '5 Habits That Replaced Coffee & Burnout',
    toolId: 'hook_generator',
    platform: 'Instagram',
    contentType: 'Viral Hooks',
    generatedOutput: `1. The Contrarian Hook: "I quit energy drinks and 14-hour days 6 months ago. My business revenue doubled the following quarter. Here is why."\n2. The Mystery Gap: "There is a silent energy leak in your morning routine that 90% of creators never notice until 2 PM..."\n3. The Proof Number: "I tracked 90 days of sleep vs creative output. Here are the 3 non-negotiables."`,
    promptParams: { topic: 'Sustainable productivity habits for creators' },
    isFavorite: true,
    tags: ['Mindset', 'Shorts', 'Hooks'],
    wordCount: 74,
    characterCount: 460,
    versionsCount: 1,
    createdAt: '2026-09-22T13:45:00Z',
    updatedAt: '2026-09-22T13:45:00Z',
  },
];

const SEED_CALENDAR: CalendarEntry[] = [
  {
    id: 'cal_01',
    userId: 'usr_creator_01',
    projectId: 'proj_01',
    contentId: 'cnt_01',
    title: 'Publish: The Silent Killer of B2B SaaS Growth',
    platform: 'LinkedIn',
    category: 'Thought Leadership',
    campaign: 'Product Launch Sprint',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    scheduledTime: '08:30',
    timezone: 'UTC',
    status: 'Ready',
    notes: 'Tag relevant product leaders in the comments.',
    inAppReminder: true,
    createdAt: '2026-09-22T10:00:00Z',
  },
  {
    id: 'cal_02',
    userId: 'usr_creator_01',
    projectId: 'proj_02',
    contentId: 'cnt_02',
    title: 'Film: 5 Habits That Replaced Burnout (Reel)',
    platform: 'Instagram',
    category: 'Short Video',
    campaign: 'Weekly YouTube Series',
    scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days
    scheduledTime: '11:00',
    timezone: 'UTC',
    status: 'Draft',
    notes: 'Use the low-contrast ring light setup.',
    inAppReminder: true,
    createdAt: '2026-09-23T14:20:00Z',
  },
];

const SEED_TEMPLATES: TemplateItem[] = [
  {
    id: 'tmpl_01',
    title: 'The "Unpopular Opinion" LinkedIn Framework',
    slug: 'unpopular-opinion-linkedin',
    description: 'Hook your audience by boldly challenging conventional industry norms, followed by empirical proof.',
    toolId: 'caption_generator',
    platform: 'LinkedIn',
    category: 'Thought Leadership' as any,
    sampleInput: {
      topic: 'Why remote meetings are a failure of asynchronous writing',
      platform: 'LinkedIn',
      tone: 'Authoritative & Expert',
    },
    sampleOutput: 'Unpopular opinion: 80% of business meetings should have been a 3-paragraph memo...',
    isGlobal: true,
    isFavorite: true,
    usageCount: 428,
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'tmpl_02',
    title: '3-Step "Stop Doing This" Viral Reel Script',
    slug: 'stop-doing-this-reel',
    description: 'High-retention short-form video template engineered to interrupt feed scrolling within 1.5 seconds.',
    toolId: 'reel_script',
    platform: 'Instagram',
    category: 'Trending Formats' as any,
    sampleInput: {
      topic: 'Stop saving 100 tutorials you never open',
      duration: '30 seconds',
    },
    sampleOutput: '[0:00] Stop saving tutorials you never open. Here is the single 15-minute action rule...',
    isGlobal: true,
    isFavorite: true,
    usageCount: 890,
    createdAt: '2026-08-10T00:00:00Z',
  },
  {
    id: 'tmpl_03',
    title: '7-Slide Educational Carousel Masterclass',
    slug: 'educational-carousel-masterclass',
    description: 'Slide-by-slide structure with cover hook, body points, visual cue notes, and save-for-later slide.',
    toolId: 'carousel_generator',
    platform: 'LinkedIn',
    category: 'Educational' as any,
    sampleInput: {
      topic: '7 High-Leverage Prompt Engineering Formulas',
      numberOfSlides: '7 Slides',
    },
    sampleOutput: 'Slide 1: Cover Hook\nSlide 2: The Baseline Error\nSlide 3: Formula 1...',
    isGlobal: true,
    isFavorite: false,
    usageCount: 654,
    createdAt: '2026-08-15T00:00:00Z',
  },
];

const SEED_WORKSPACES: Workspace[] = [
  {
    id: 'ws_default',
    name: 'Aura Studio Digital',
    slug: 'aura-studio',
    description: 'Primary agency workspace for collaborative client campaigns.',
    ownerId: 'usr_creator_01',
    role: 'owner',
    membersCount: 3,
    creditsPool: 500,
    createdAt: '2026-08-15T09:00:00Z',
  },
];

const SEED_MEMBERS: WorkspaceMember[] = [
  {
    id: 'wm_01',
    workspaceId: 'ws_default',
    userId: 'usr_creator_01',
    email: 'creator@example.com',
    fullName: 'Alex Vance',
    role: 'owner',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    joinedAt: '2026-08-15T09:00:00Z',
  },
  {
    id: 'wm_02',
    workspaceId: 'ws_default',
    userId: 'usr_editor_02',
    email: 'sarah.editor@aurastudio.io',
    fullName: 'Sarah Chen',
    role: 'editor',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    joinedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'wm_03',
    workspaceId: 'ws_default',
    userId: 'usr_viewer_03',
    email: 'marcus.client@vertextech.com',
    fullName: 'Marcus Sterling',
    role: 'viewer',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    joinedAt: '2026-09-10T14:30:00Z',
  },
];

const SEED_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_01',
    userId: 'usr_creator_01',
    userEmail: 'creator@example.com',
    userName: 'Alex Vance (Client)',
    userRole: 'creator',
    ticketType: 'client_issue',
    assignedToRole: 'admin_or_owner',
    subject: 'Question on Custom Brand Voice Keywords Weighting',
    category: 'AI Generation',
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: 'Elena Vance (Admin)',
    createdAt: '2026-09-23T11:00:00Z',
    updatedAt: '2026-09-24T14:30:00Z',
    messages: [
      {
        id: 'msg_01',
        ticketId: 'tkt_01',
        senderId: 'usr_creator_01',
        senderName: 'Alex Vance',
        message: 'Hello, when I add 5 forbidden words to my brand voice profile, how strictly does the AI neural model enforce them across long-form YouTube scripts?',
        isAdminReply: false,
        createdAt: '2026-09-23T11:00:00Z',
      },
      {
        id: 'msg_02',
        ticketId: 'tkt_01',
        senderId: 'admin_elena',
        senderName: 'Elena (AI Studio Support)',
        message: 'Hi Alex! The system builds a high-priority negative-constraint block directly in the AI model system instructions. It enforces zero occurrences with high reliability. Let us know if you ever see a leak!',
        isAdminReply: true,
        createdAt: '2026-09-24T14:30:00Z',
      },
    ],
  },
  {
    id: 'tkt_02',
    userId: 'usr_client_02',
    userEmail: 'marcus.client@vertextech.com',
    userName: 'Marcus Sterling (Client)',
    userRole: 'creator',
    ticketType: 'client_issue',
    assignedToRole: 'admin_or_owner',
    subject: 'Request for Annual Corporate VAT Invoice',
    category: 'Billing & Credits',
    priority: 'Low',
    status: 'Open',
    createdAt: '2026-09-24T15:00:00Z',
    updatedAt: '2026-09-24T15:00:00Z',
    messages: [
      {
        id: 'msg_03',
        ticketId: 'tkt_02',
        senderId: 'usr_client_02',
        senderName: 'Marcus Sterling',
        message: 'Could you please send over a formal VAT invoice for our accounting team for the recent Pro tier subscription?',
        isAdminReply: false,
        createdAt: '2026-09-24T15:00:00Z',
      },
    ],
  },
  {
    id: 'tkt_03',
    userId: 'usr_admin_01',
    userEmail: 'admin@creatorstudio.ai',
    userName: 'Elena Vance (Admin)',
    userRole: 'admin',
    ticketType: 'admin_issue',
    assignedToRole: 'owner_only',
    subject: 'Request for Fine-Tuning Privileges & Extended Tool Access',
    category: 'Role Elevation & Privileges',
    priority: 'High',
    status: 'Open',
    createdAt: '2026-09-24T16:00:00Z',
    updatedAt: '2026-09-24T16:00:00Z',
    messages: [
      {
        id: 'msg_04',
        ticketId: 'tkt_03',
        senderId: 'usr_admin_01',
        senderName: 'Elena Vance (Admin)',
        message: 'Dear Platform Owner, I request you to assign me permissions for fine-tuning prompt parameters and full audit logs access so I can assist client disputes faster.',
        isAdminReply: false,
        createdAt: '2026-09-24T16:00:00Z',
      },
    ],
  },
];

const SEED_PHOTO_ASSETS: MediaPhotoAsset[] = [
  {
    id: 'photo_client_01',
    userId: 'usr_creator_01',
    userEmail: 'creator@example.com',
    userName: 'Alex Vance (Client)',
    userRole: 'creator',
    title: 'SaaS Product Hero Graphic',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    category: 'product',
    dimensions: '1920x1080',
    fileSize: '1.4 MB',
    notes: 'Primary hero section graphic for client website',
    createdAt: '2026-09-22T10:00:00Z',
  },
  {
    id: 'photo_client_02',
    userId: 'usr_creator_01',
    userEmail: 'creator@example.com',
    userName: 'Alex Vance (Client)',
    userRole: 'creator',
    title: 'Instagram Carousel Slide 1 - Growth Playbook',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    category: 'social',
    dimensions: '1080x1080',
    fileSize: '850 KB',
    notes: 'Cover slide for carousel post on compound marketing growth',
    createdAt: '2026-09-23T14:20:00Z',
  },
  {
    id: 'photo_client_03',
    userId: 'usr_client_02',
    userEmail: 'marcus.client@vertextech.com',
    userName: 'Marcus Sterling (Client)',
    userRole: 'creator',
    title: 'Vertex Tech Brand Launch Visual',
    url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
    category: 'banner',
    dimensions: '1200x630',
    fileSize: '1.1 MB',
    notes: 'LinkedIn promotional launch banner asset',
    createdAt: '2026-09-24T09:10:00Z',
  },
  {
    id: 'photo_admin_01',
    userId: 'usr_admin_01',
    userEmail: 'admin@creatorstudio.ai',
    userName: 'Elena Vance (Admin)',
    userRole: 'admin',
    title: 'Admin Infrastructure & Neural Node Blueprint',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    category: 'profile',
    dimensions: '1920x1080',
    fileSize: '2.1 MB',
    notes: 'Internal system architecture diagram for admin ops',
    createdAt: '2026-09-24T12:00:00Z',
  },
  {
    id: 'photo_owner_01',
    userId: 'usr_owner_root',
    userEmail: 'ali.siddiquibro74@gmail.com',
    userName: 'Platform Owner (Ali Siddiqui)',
    userRole: 'owner',
    title: 'Platform Master Brand Concept & Strategic Roadmap',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    category: 'client_asset',
    dimensions: '2560x1440',
    fileSize: '3.4 MB',
    notes: 'Executive platform roadmap and brand identity system',
    createdAt: '2026-09-25T08:00:00Z',
  },
];

const SEED_EMAIL_LOGS: PlatformEmailLog[] = [
  {
    id: 'eml_01',
    toEmail: 'creator@example.com',
    toName: 'Alex Vance',
    toRole: 'creator',
    fromName: 'Platform Owner',
    fromEmail: 'owner@creatorstudio.ai',
    subject: 'Welcome to AI Creator Studio - Account Activated',
    preview: 'Your creator account is active. 500 AI generation credits have been allocated.',
    body: 'Hi Alex Vance,\n\nWelcome to AI Creator Studio! Your account has been provisioned with full access to all 16 AI content generation tools with 500 initial credits.\n\nEnjoy creating high-converting content.\n\nWarm regards,\nPlatform Owner & Engineering Team',
    category: 'welcome',
    status: 'delivered',
    sentAt: '2026-08-15T09:05:00Z',
  },
  {
    id: 'eml_02',
    toEmail: 'admin@creatorstudio.ai',
    toName: 'Elena Vance (Admin)',
    toRole: 'admin',
    fromName: 'Platform Owner',
    fromEmail: 'owner@creatorstudio.ai',
    subject: 'Administrative Privileges Granted by Platform Owner',
    preview: 'Specific administrative roles assigned: Client ticket resolution & client media viewing.',
    body: 'Hi Elena,\n\nThe Platform Owner has assigned you specific administrative roles on AI Creator Studio:\n- Client Ticket Resolution: Enabled\n- Client Media & Photos Inspection: Enabled\n- Payment Verification & Upgrades: Enabled\n- Tool System Toggles: Enabled\n\nNote: Admins cannot remove other Admins or the Owner. All admin audits and issues are routed directly to the Owner.\n\nPlatform Owner',
    category: 'role_assigned',
    status: 'delivered',
    sentAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'eml_03',
    toEmail: 'creator@example.com',
    toName: 'Alex Vance',
    toRole: 'creator',
    fromName: 'Support Desk (Admin Elena)',
    fromEmail: 'support@creatorstudio.ai',
    subject: 'Support Ticket #tkt_01 Response: Brand Voice Negative Constraints',
    preview: 'Elena from AI Studio Support responded to your inquiry on forbidden words.',
    body: 'Hi Alex,\n\nOur administrator Elena responded to your ticket regarding Brand Voice keywords. Negative constraints are compiled into system instructions server-side with zero leak tolerance.\n\nStatus: In Progress\n\nAI Studio Support',
    category: 'ticket_resolved',
    status: 'delivered',
    sentAt: '2026-09-24T14:31:00Z',
  },
  {
    id: 'eml_04',
    toEmail: 'marcus.client@vertextech.com',
    toName: 'Marcus Sterling',
    toRole: 'creator',
    fromName: 'Billing Desk',
    fromEmail: 'billing@creatorstudio.ai',
    subject: 'Payment Confirmed: Pro Tier Subscription Active',
    preview: 'Your bank transfer payment was verified. 2,000 bonus credits credited.',
    body: 'Hi Marcus,\n\nYour payment upgrade request for Pro Tier has been approved. Your credit balance has been increased with 2,000 monthly credits.\n\nTransaction ID: TRX-9482103847\n\nThank you for choosing AI Creator Studio!',
    category: 'payment_notice',
    status: 'delivered',
    sentAt: '2026-09-24T11:32:00Z',
  },
];

const SEED_AUDIT_LOGS: AdminAuditRecord[] = [
  {
    id: 'aud_01',
    timestamp: '2026-09-24T09:15:00Z',
    adminEmail: 'admin@creatorstudio.ai',
    action: 'MODEL_UPDATE',
    target: 'Neural Inference Engine',
    details: 'Configured active model to llama-3.3-70b-versatile for enhanced reasoning.',
    status: 'success',
  },
  {
    id: 'aud_02',
    timestamp: '2026-09-23T16:40:00Z',
    adminEmail: 'admin@creatorstudio.ai',
    action: 'PROMPT_TUNING',
    target: 'Hook Generator (v2.1)',
    details: 'Strengthened curiosity gap and retention framework in viral hook prompt.',
    status: 'success',
  },
];

const SEED_LOGIN_EVENTS: UserLoginEvent[] = [
  {
    id: 'login_seed_01',
    userId: 'usr_creator_01',
    userEmail: 'creator@example.com',
    userName: 'Alex Vance',
    userRole: 'creator',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    ip: '198.51.100.22',
    device: 'Windows 11 Desktop (Google Chrome)',
    browser: 'Google Chrome',
    location: 'United States',
    planTier: 'pro',
    creditsBalance: 500,
    status: 'success',
  },
  {
    id: 'login_seed_02',
    userId: 'usr_client_02',
    userEmail: 'marcus.client@vertextech.com',
    userName: 'Marcus Sterling',
    userRole: 'creator',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    ip: '203.0.113.88',
    device: 'macOS Desktop (Apple Safari)',
    browser: 'Apple Safari',
    location: 'United Kingdom',
    planTier: 'agency',
    creditsBalance: 4800,
    status: 'success',
  },
  {
    id: 'login_seed_03',
    userId: 'usr_admin_01',
    userEmail: 'admin@creatorstudio.ai',
    userName: 'Elena Vance',
    userRole: 'admin',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    ip: '198.51.100.44',
    device: 'Windows 11 Desktop (Firefox)',
    browser: 'Mozilla Firefox',
    location: 'United States',
    planTier: 'agency',
    creditsBalance: 50000,
    status: 'success',
  },
];

const SEED_PAYMENT_REQUESTS: PaymentUpgradeRequest[] = [
  {
    id: 'pay_req_01',
    userId: 'usr_creator_01',
    userEmail: 'creator@example.com',
    userName: 'Alex Vance',
    planId: 'pro',
    planName: 'Pro Studio',
    amount: 49,
    currency: '$',
    billingCycle: 'monthly',
    paymentMethod: 'bank_transfer',
    senderName: 'Alex Vance',
    senderAccountOrPhone: 'PK36MEZN0009182736451',
    transactionId: 'TRX-9482103847',
    screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    notes: 'Transferred via Bank Mobile App for monthly Pro upgrade. Screenshot attached.',
    status: 'pending',
    createdAt: '2026-09-25T14:20:00Z',
  },
  {
    id: 'pay_req_02',
    userId: 'usr_demo_02',
    userEmail: 'sarah.agency@growthvault.io',
    userName: 'Sarah Jenkins',
    planId: 'agency',
    planName: 'Agency & Teams',
    amount: 129,
    currency: '$',
    billingCycle: 'monthly',
    paymentMethod: 'crypto_usdt',
    senderName: 'Sarah Jenkins',
    senderAccountOrPhone: '0x71C...a829',
    transactionId: '0x8f2a1b9c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    screenshotUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    notes: 'USDT TRC20 sent. Hash attached.',
    status: 'approved',
    createdAt: '2026-09-24T10:00:00Z',
    reviewedAt: '2026-09-24T11:30:00Z',
    reviewedBy: 'admin@creatorstudio.ai',
  },
];

// -----------------------------------------------------------------------------
// Storage Manager
// -----------------------------------------------------------------------------
class StorageManager {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Error writing to localStorage for key ${key}`, err);
    }
  }

  private remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  // --- Auth & User Profile ---
  hasActiveSession(): boolean {
    return this.get<boolean>(STORAGE_KEYS.SESSION_ACTIVE, false);
  }

  setActiveSession(active: boolean): void {
    this.set(STORAGE_KEYS.SESSION_ACTIVE, active);
    if (active) {
      const existing = this.get<string>(STORAGE_KEYS.TOKEN, '');
      if (!existing) {
        const token = 'accs_sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        this.set(STORAGE_KEYS.TOKEN, token);
      }
    } else {
      this.remove(STORAGE_KEYS.TOKEN);
    }
  }

  getSessionToken(): string {
    return this.get<string>(STORAGE_KEYS.TOKEN, '');
  }

  getUser(): UserProfile {
    return this.get<UserProfile>(STORAGE_KEYS.USER, DEFAULT_USER);
  }

  setUser(user: UserProfile): void {
    this.set(STORAGE_KEYS.USER, user);
    this.saveUser(user);
  }

  // --- Secure Password & Credentials Store ---
  getUserPasswordHash(userIdOrEmail: string): string | null {
    if (!userIdOrEmail) return null;
    const creds = this.get<Record<string, { hash: string; updatedAt: string }>>(
      STORAGE_KEYS.USER_CREDENTIALS,
      {}
    );
    const key = userIdOrEmail.toLowerCase().trim();
    if (creds[key]) return creds[key].hash;
    for (const [k, val] of Object.entries(creds)) {
      if (k.toLowerCase() === key) return val.hash;
    }
    return null;
  }

  saveUserPasswordHash(userId: string, email: string, passwordHash: string): void {
    if (!passwordHash) return;
    const creds = this.get<Record<string, { hash: string; updatedAt: string }>>(
      STORAGE_KEYS.USER_CREDENTIALS,
      {}
    );
    const record = { hash: passwordHash, updatedAt: new Date().toISOString() };
    if (userId) creds[userId] = record;
    if (email) creds[email.toLowerCase().trim()] = record;
    this.set(STORAGE_KEYS.USER_CREDENTIALS, creds);
  }

  getAllUsers(): UserProfile[] {
    let list = this.get<UserProfile[]>(STORAGE_KEYS.ALL_USERS, DEFAULT_ALL_USERS);
    // Ensure owner root is always in the list
    const hasOwner = list.some((u) => isOwnerUser(u));
    if (!hasOwner) {
      list = [DEFAULT_OWNER_USER, ...list];
      this.set(STORAGE_KEYS.ALL_USERS, list);
    }
    return list;
  }

  saveUser(user: UserProfile, caller?: UserProfile | null): { success: boolean; message?: string } {
    const list = this.getAllUsers();
    const idx = list.findIndex(
      (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()
    );

    // STRICT SECURITY: Owner account is IMMUTABLE and can NEVER be demoted or changed by anyone
    const isTargetOwner =
      isOwnerUser(user) || (idx >= 0 && isOwnerUser(list[idx]));

    // STRICT SECURITY: Only Owner can assign or modify Admin roles!
    if (caller && !isOwnerUser(caller)) {
      if (idx >= 0) {
        const existing = list[idx];
        if (existing.role === 'admin' && user.role !== 'admin') {
          return { success: false, message: 'Security Policy: Admins cannot alter or demote other Admins. Only the Platform Owner can manage Admin roles.' };
        }
        if (existing.role !== 'admin' && (user.role === 'admin' || user.role === 'owner')) {
          return { success: false, message: 'Security Policy: Only the Platform Owner can assign Admin or Owner roles.' };
        }
      }
    }

    const securedUser: UserProfile = {
      ...user,
      role: isTargetOwner ? 'owner' : user.role,
      updatedAt: new Date().toISOString(),
    };

    if (idx >= 0) {
      list[idx] = { ...list[idx], ...securedUser };
    } else {
      list.push(securedUser);
    }
    this.set(STORAGE_KEYS.ALL_USERS, list);
    return { success: true };
  }

  deleteUser(userId: string, caller?: UserProfile | null): { success: boolean; message: string } {
    const list = this.getAllUsers();
    const target = list.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'User account not found.' };
    }

    // RULE 1: Owner CAN NEVER BE REMOVED/DELETED BY ANYONE! (Protected & Immutable)
    if (isOwnerUser(target)) {
      return {
        success: false,
        message: 'Security Policy: Platform Owner account is permanently protected and immutable. No one can remove the Owner.',
      };
    }

    // RULE 2: Admins CANNOT remove other Admins or Owner!
    if (caller && !isOwnerUser(caller) && (target.role === 'admin' || target.role === 'superadmin' || target.role === 'owner')) {
      return {
        success: false,
        message: 'Security Policy: Admins cannot remove other Admins. Only the Platform Owner has the authority to remove an Admin.',
      };
    }

    // RULE 3: Clients CANNOT remove any user!
    if (caller && !isAdminUser(caller)) {
      return {
        success: false,
        message: 'Security Policy: Clients do not have permission to delete any account.',
      };
    }

    // Remove user account from database (Owner can remove anyone: both Admins and Clients)
    const remaining = list.filter((u) => u.id !== userId);
    this.set(STORAGE_KEYS.ALL_USERS, remaining);

    // Purge creator assets and associated records
    try {
      const allProjects = this.getProjects().filter((p) => p.userId !== userId);
      this.set(STORAGE_KEYS.PROJECTS, allProjects);

      const allItems = this.getContentItems().filter((c) => c.userId !== userId);
      this.set(STORAGE_KEYS.CONTENT_ITEMS, allItems);

      const allPhotos = this.getPhotoAssets().filter((p) => p.userId !== userId);
      this.set(STORAGE_KEYS.PHOTO_ASSETS, allPhotos);

      const allVoices = this.getBrandVoices().filter((v) => v.userId !== userId);
      this.set(STORAGE_KEYS.BRAND_VOICES, allVoices);

      const allSubs = this.getStripeSubscriptions().filter((s) => s.userId !== userId);
      this.set(STORAGE_KEYS.STRIPE_SUBSCRIPTIONS, allSubs);
    } catch {
      // Best effort cleanup
    }

    // If the active session is the deleted user, reset active session
    const currentUser = this.getUser();
    if (currentUser && currentUser.id === userId) {
      this.setActiveSession(false);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }

    this.addAdminAudit(
      'USER_DELETE_PERMANENT',
      `User: ${target.email}`,
      `Account permanently wiped by ${caller && isOwnerUser(caller) ? 'Platform Owner' : 'Admin'}.`
    );

    return {
      success: true,
      message: `Account for ${target.email} has been permanently deleted.`,
    };
  }

  // --- Granular Admin Permissions (Assigned exclusively by Owner) ---
  updateAdminPermissions(
    targetUserId: string,
    permissions: AdminPermissions,
    caller: UserProfile
  ): { success: boolean; message: string } {
    if (!isOwnerUser(caller)) {
      return {
        success: false,
        message: 'Action Forbidden: Only the Platform Owner can assign specific roles and permissions to Admins.',
      };
    }

    const list = this.getAllUsers();
    const target = list.find((u) => u.id === targetUserId);
    if (!target) {
      return { success: false, message: 'Admin user not found.' };
    }

    target.adminPermissions = permissions;
    target.updatedAt = new Date().toISOString();
    this.set(STORAGE_KEYS.ALL_USERS, list);

    // Send email log to Admin
    this.logPlatformEmail({
      toEmail: target.email,
      toName: target.fullName,
      toRole: 'admin',
      fromName: 'Platform Owner',
      fromEmail: 'owner@creatorstudio.ai',
      subject: 'Updated Admin Permissions Assigned by Platform Owner',
      preview: 'Your administrative permissions have been updated.',
      body: `Hi ${target.fullName},\n\nThe Platform Owner has configured the following permissions for your account:\n- Resolve Client Tickets: ${permissions.canResolveClientTickets ? 'Granted' : 'Revoked'}\n- View Client Media: ${permissions.canViewClientMedia ? 'Granted' : 'Revoked'}\n- Adjust Client Credits: ${permissions.canAdjustClientCredits ? 'Granted' : 'Revoked'}\n- Manage Payments: ${permissions.canManagePayments ? 'Granted' : 'Revoked'}\n- Access Tool Config: ${permissions.canAccessToolConfig ? 'Granted' : 'Revoked'}\n\nPlatform Owner`,
      category: 'role_assigned',
    });

    this.addAdminAudit(
      'ADMIN_PERMISSIONS_UPDATE',
      `Admin: ${target.email}`,
      `Platform Owner updated granular admin permissions.`
    );

    return { success: true, message: `Admin permissions successfully updated for ${target.email}.` };
  }

  updateAdminDetailsByOwner(
    targetUserId: string,
    updates: {
      fullName?: string;
      email?: string;
      newPasscode?: string;
      permissions?: AdminPermissions;
      isSuspended?: boolean;
    },
    caller: UserProfile
  ): { success: boolean; message: string } {
    if (!isOwnerUser(caller)) {
      return {
        success: false,
        message: 'Action Forbidden: Only the Platform Owner has authority to modify Admin credentials and settings.',
      };
    }

    const list = this.getAllUsers();
    const target = list.find((u) => u.id === targetUserId);
    if (!target) {
      return { success: false, message: 'Admin user not found.' };
    }

    if (updates.fullName && updates.fullName.trim()) {
      target.fullName = updates.fullName.trim();
      target.displayName = updates.fullName.trim();
    }

    if (updates.email && updates.email.trim()) {
      target.email = updates.email.trim();
    }

    if (updates.isSuspended !== undefined) {
      target.isSuspended = updates.isSuspended;
    }

    if (updates.permissions) {
      target.adminPermissions = updates.permissions;
    }

    if (updates.newPasscode && updates.newPasscode.trim().length >= 4) {
      const passTrimmed = updates.newPasscode.trim();
      adminConfig.updateAdminPassword(passTrimmed);
      if (target.email) {
        adminConfig.updateAdminCredentials(target.email, passTrimmed);
      }
      this.logPlatformEmail({
        toEmail: target.email,
        toName: target.fullName,
        toRole: 'admin',
        fromName: 'Platform Owner',
        fromEmail: 'owner@creatorstudio.ai',
        subject: 'Your Administrator Passcode Has Been Updated by Platform Owner',
        preview: 'The Platform Owner has updated your administrator login credentials.',
        body: `Hi ${target.fullName},\n\nThe Platform Owner has updated your Administrator credentials and security passcode. You can now use your updated passcode to sign in at the platform gate.\n\nBest regards,\nPlatform Owner`,
        category: 'admin_alert',
      });
    }

    target.updatedAt = new Date().toISOString();
    this.set(STORAGE_KEYS.ALL_USERS, list);

    this.addAdminAudit(
      'ADMIN_MODIFIED_BY_OWNER',
      `Admin: ${target.email}`,
      `Platform Owner modified credentials and governance settings.`
    );

    return {
      success: true,
      message: `Admin details & credentials updated successfully for ${target.fullName}.`,
    };
  }

  // --- Photos & Media Vault (Strict Isolation: Client sees only their own; Admin sees Clients + their own; Owner sees all) ---
  getPhotoAssets(): MediaPhotoAsset[] {
    return this.get<MediaPhotoAsset[]>(STORAGE_KEYS.PHOTO_ASSETS, SEED_PHOTO_ASSETS);
  }

  getFilteredPhotoAssets(requester?: UserProfile | null): MediaPhotoAsset[] {
    const all = this.getPhotoAssets();
    if (!requester) return [];

    // 1. Platform Owner sees EVERYTHING across the platform
    if (isOwnerUser(requester)) {
      return all;
    }

    // 2. Admin sees Client photos + their OWN photos (not other Admins' or Owner private assets)
    if (isAdminUser(requester)) {
      return all.filter(
        (asset) =>
          asset.userId === requester.id ||
          asset.userRole === 'creator' ||
          !asset.userRole ||
          asset.userRole === 'agency_owner'
      );
    }

    // 3. Client ONLY sees their OWN photos!
    return all.filter((asset) => asset.userId === requester.id);
  }

  savePhotoAsset(asset: MediaPhotoAsset): MediaPhotoAsset[] {
    const all = this.getPhotoAssets();
    const idx = all.findIndex((a) => a.id === asset.id);
    let updated: MediaPhotoAsset[];
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = asset;
    } else {
      updated = [asset, ...all];
    }
    this.set(STORAGE_KEYS.PHOTO_ASSETS, updated);
    return updated;
  }

  deletePhotoAsset(id: string, requester: UserProfile): { success: boolean; message: string } {
    const all = this.getPhotoAssets();
    const asset = all.find((a) => a.id === id);
    if (!asset) return { success: false, message: 'Photo asset not found.' };

    if (isOwnerUser(requester)) {
      // Owner can remove any photo
    } else if (isAdminUser(requester)) {
      if (isOwnerUser({ role: asset.userRole, email: asset.userEmail })) {
        return { success: false, message: 'Security Policy: Admins cannot delete Owner assets.' };
      }
    } else {
      if (asset.userId !== requester.id) {
        return { success: false, message: 'Security Policy: Clients can only delete their own photos.' };
      }
    }

    const updated = all.filter((a) => a.id !== id);
    this.set(STORAGE_KEYS.PHOTO_ASSETS, updated);
    return { success: true, message: 'Photo asset deleted successfully.' };
  }

  // --- Platform Email & Notification Hub (Real-time Audit & Delivery Logs) ---
  getEmailLogs(): PlatformEmailLog[] {
    return this.get<PlatformEmailLog[]>(STORAGE_KEYS.EMAIL_LOGS, SEED_EMAIL_LOGS);
  }

  logPlatformEmail(email: Omit<PlatformEmailLog, 'id' | 'sentAt' | 'status'>): PlatformEmailLog {
    const all = this.getEmailLogs();
    const record: PlatformEmailLog = {
      ...email,
      id: `eml_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'delivered',
      sentAt: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.EMAIL_LOGS, [record, ...all]);
    return record;
  }

  deleteEmailLog(id: string): void {
    const all = this.getEmailLogs().filter((e) => e.id !== id);
    this.set(STORAGE_KEYS.EMAIL_LOGS, all);
  }

  // --- Support Tickets Resolution (Client Issues: Admin & Owner; Admin Issues: Owner ONLY) ---
  resolveSupportTicket(
    ticketId: string,
    resolverUser: UserProfile,
    replyText?: string,
    newStatus: 'Resolved' | 'In Progress' | 'Closed' = 'Resolved'
  ): { success: boolean; message: string } {
    const all = this.getSupportTickets();
    const ticket = all.find((t) => t.id === ticketId);
    if (!ticket) return { success: false, message: 'Ticket not found.' };

    const isResolverOwner = isOwnerUser(resolverUser);
    const isResolverAdmin = isAdminUser(resolverUser);

    // RULE 1: Admin issues can ONLY be resolved by the Platform Owner!
    if (ticket.ticketType === 'admin_issue' && !isResolverOwner) {
      return {
        success: false,
        message: 'Action Forbidden: Admin issues and role requests can only be resolved by the Platform Owner.',
      };
    }

    // RULE 2: Client issues can be resolved by both Admin and Owner!
    if (!isResolverOwner && !isResolverAdmin) {
      return {
        success: false,
        message: 'Action Forbidden: Only Admins and the Platform Owner can resolve tickets.',
      };
    }

    const updatedMessages = [...ticket.messages];
    if (replyText?.trim()) {
      updatedMessages.push({
        id: `msg_${Date.now()}`,
        ticketId,
        senderId: resolverUser.id,
        senderName: `${resolverUser.fullName} (${isResolverOwner ? 'Platform Owner' : 'Admin'})`,
        message: replyText.trim(),
        isAdminReply: true,
        createdAt: new Date().toISOString(),
      });
    }

    ticket.status = newStatus;
    ticket.resolvedBy = resolverUser.fullName;
    ticket.resolvedByRole = isResolverOwner ? 'owner' : 'admin';
    ticket.updatedAt = new Date().toISOString();
    ticket.messages = updatedMessages;

    this.set(STORAGE_KEYS.SUPPORT_TICKETS, all);

    // Automatically send / log notification email to ticket creator
    this.logPlatformEmail({
      toEmail: ticket.userEmail,
      toName: ticket.userName || ticket.userEmail,
      toRole: ticket.userRole || 'creator',
      fromName: isResolverOwner ? 'Platform Owner' : 'Admin Support Desk',
      fromEmail: isResolverOwner ? 'owner@creatorstudio.ai' : 'support@creatorstudio.ai',
      subject: `Ticket #${ticket.id.slice(-6)} ${newStatus}: ${ticket.subject}`,
      preview: replyText ? replyText.substring(0, 100) : `Your ticket status is now ${newStatus}.`,
      body: `Hello ${ticket.userName || 'Creator'},\n\nYour support ticket "${ticket.subject}" has been updated by ${resolverUser.fullName} (${isResolverOwner ? 'Platform Owner' : 'Admin'}).\n\nStatus: ${newStatus}\n\n${replyText ? `Response:\n${replyText}\n\n` : ''}Thank you for your patience.\n\nCreator Studio Support`,
      category: 'ticket_resolved',
    });

    this.addAdminAudit(
      'TICKET_RESOLVE',
      `Ticket: #${ticket.id.slice(-6)}`,
      `Resolved by ${isResolverOwner ? 'Platform Owner' : 'Admin'}. Status: ${newStatus}`
    );

    return { success: true, message: `Ticket #${ticket.id.slice(-6)} successfully marked ${newStatus}.` };
  }

  refreshDailyCreditsForAll(dailyAmount: number = 50): number {
    const today = new Date().toISOString().split('T')[0];
    const list = this.getAllUsers();
    let count = 0;
    const updatedList = list.map((u) => {
      count++;
      return {
        ...u,
        creditsBalance: Math.max(u.creditsBalance, dailyAmount),
        lastDailyCreditRefresh: today,
        updatedAt: new Date().toISOString(),
      };
    });
    this.set(STORAGE_KEYS.ALL_USERS, updatedList);
    // Also update current user if in list
    const current = this.getUser();
    const updatedCurrent = updatedList.find((u) => u.id === current.id);
    if (updatedCurrent) {
      this.set(STORAGE_KEYS.USER, updatedCurrent);
    }
    return count;
  }

  addCreditsToAllUsers(addAmount: number): number {
    const today = new Date().toISOString().split('T')[0];
    const list = this.getAllUsers();
    let count = 0;
    const updatedList = list.map((u) => {
      count++;
      return {
        ...u,
        creditsBalance: (u.creditsBalance || 0) + addAmount,
        lastDailyCreditRefresh: today,
        updatedAt: new Date().toISOString(),
      };
    });
    this.set(STORAGE_KEYS.ALL_USERS, updatedList);
    const current = this.getUser();
    const updatedCurrent = updatedList.find((u) => u.id === current.id);
    if (updatedCurrent) {
      this.set(STORAGE_KEYS.USER, updatedCurrent);
    }
    return count;
  }

  setCreditsForUser(userId: string, newBalance: number): boolean {
    const list = this.getAllUsers();
    const userIndex = list.findIndex((u) => u.id === userId);
    if (userIndex === -1) return false;
    list[userIndex] = {
      ...list[userIndex],
      creditsBalance: Math.max(0, newBalance),
      updatedAt: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.ALL_USERS, list);
    const current = this.getUser();
    if (current.id === userId) {
      this.setUser(list[userIndex]);
    }
    return true;
  }

  updateUser(updates: Partial<UserProfile>): UserProfile {
    const current = this.getUser();
    const sanitizedUpdates = { ...updates };

    // STRICT SECURITY: If current user is superadmin, role CAN NEVER BE CHANGED OR DEMOTED
    if (isSuperadminUser(current)) {
      sanitizedUpdates.role = 'superadmin';
    } else if (sanitizedUpdates.role === 'superadmin') {
      // Non-superadmin cannot self-elevate
      delete sanitizedUpdates.role;
    }

    const updated = { ...current, ...sanitizedUpdates, updatedAt: new Date().toISOString() };
    this.setUser(updated);
    return updated;
  }

  deductCredits(amount: number): { success: boolean; remaining: number } {
    const user = this.getUser();
    if (user.creditsBalance < amount) {
      return { success: false, remaining: user.creditsBalance };
    }
    const updated = this.updateUser({
      creditsBalance: user.creditsBalance - amount,
      creditsTotalUsed: (user.creditsTotalUsed || 0) + amount,
    });
    return { success: true, remaining: updated.creditsBalance };
  }

  addCredits(amount: number): number {
    const user = this.getUser();
    const updated = this.updateUser({
      creditsBalance: user.creditsBalance + amount,
    });
    return updated.creditsBalance;
  }

  // --- Brand Voices ---
  getBrandVoices(): BrandVoice[] {
    return this.get<BrandVoice[]>(STORAGE_KEYS.BRAND_VOICES, SEED_BRAND_VOICES);
  }

  saveBrandVoice(voice: BrandVoice): BrandVoice[] {
    const list = this.getBrandVoices();
    const existingIndex = list.findIndex((v) => v.id === voice.id);
    let updated: BrandVoice[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = voice;
    } else {
      updated = [voice, ...list];
    }
    if (voice.isDefault) {
      updated = updated.map((v) => (v.id === voice.id ? v : { ...v, isDefault: false }));
    }
    this.set(STORAGE_KEYS.BRAND_VOICES, updated);
    return updated;
  }

  deleteBrandVoice(id: string): BrandVoice[] {
    const list = this.getBrandVoices().filter((v) => v.id !== id);
    this.set(STORAGE_KEYS.BRAND_VOICES, list);
    return list;
  }

  // --- Projects ---
  getProjects(): Project[] {
    return this.get<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
  }

  saveProject(project: Project): Project[] {
    const list = this.getProjects();
    const index = list.findIndex((p) => p.id === project.id);
    let updated: Project[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...project, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...list];
    }
    this.set(STORAGE_KEYS.PROJECTS, updated);
    return updated;
  }

  deleteProject(id: string): Project[] {
    const list = this.getProjects().filter((p) => p.id !== id);
    this.set(STORAGE_KEYS.PROJECTS, list);
    return list;
  }

  // --- Content Items & Versions ---
  getContentItems(): ContentItem[] {
    return this.get<ContentItem[]>(STORAGE_KEYS.CONTENT_ITEMS, SEED_CONTENT_ITEMS);
  }

  saveContentItem(item: ContentItem): ContentItem[] {
    const list = this.getContentItems();
    const index = list.findIndex((c) => c.id === item.id);
    let updated: ContentItem[];
    if (index >= 0) {
      // Create version history snapshot
      const current = list[index];
      this.saveContentVersion(current.id, current.generatedOutput, 'Edited by user');
      updated = [...list];
      updated[index] = { ...item, versionsCount: (item.versionsCount || 1) + 1, updatedAt: new Date().toISOString() };
    } else {
      updated = [item, ...list];
    }
    this.set(STORAGE_KEYS.CONTENT_ITEMS, updated);
    return updated;
  }

  deleteContentItem(id: string): ContentItem[] {
    const list = this.getContentItems().filter((c) => c.id !== id);
    this.set(STORAGE_KEYS.CONTENT_ITEMS, list);
    return list;
  }

  toggleFavoriteContent(id: string): ContentItem[] {
    const list = this.getContentItems().map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
    this.set(STORAGE_KEYS.CONTENT_ITEMS, list);
    return list;
  }

  saveContentVersion(contentId: string, output: string, changeSummary: string): void {
    const versions = this.get<ContentVersion[]>(STORAGE_KEYS.CONTENT_VERSIONS, []);
    const user = this.getUser();
    const nextVer = versions.filter((v) => v.contentId === contentId).length + 1;
    const newVersion: ContentVersion = {
      id: `ver_${Date.now()}`,
      contentId,
      versionNumber: nextVer,
      output,
      editedBy: user.id,
      changeSummary,
      createdAt: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.CONTENT_VERSIONS, [newVersion, ...versions]);
  }

  getContentVersions(contentId: string): ContentVersion[] {
    const versions = this.get<ContentVersion[]>(STORAGE_KEYS.CONTENT_VERSIONS, []);
    return versions.filter((v) => v.contentId === contentId);
  }

  // --- Content Calendar ---
  getCalendarEntries(): CalendarEntry[] {
    return this.get<CalendarEntry[]>(STORAGE_KEYS.CALENDAR, SEED_CALENDAR);
  }

  saveCalendarEntry(entry: CalendarEntry): CalendarEntry[] {
    const list = this.getCalendarEntries();
    const index = list.findIndex((e) => e.id === entry.id);
    let updated: CalendarEntry[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = entry;
    } else {
      updated = [entry, ...list];
    }
    this.set(STORAGE_KEYS.CALENDAR, updated);
    return updated;
  }

  deleteCalendarEntry(id: string): CalendarEntry[] {
    const list = this.getCalendarEntries().filter((e) => e.id !== id);
    this.set(STORAGE_KEYS.CALENDAR, list);
    return list;
  }

  // --- Content Plans ---
  getContentPlans(): ContentPlan[] {
    return this.get<ContentPlan[]>(STORAGE_KEYS.PLANS, []);
  }

  saveContentPlan(plan: ContentPlan): ContentPlan[] {
    const list = this.getContentPlans();
    const index = list.findIndex((p) => p.id === plan.id);
    let updated: ContentPlan[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = plan;
    } else {
      updated = [plan, ...list];
    }
    this.set(STORAGE_KEYS.PLANS, updated);
    return updated;
  }

  // --- Templates ---
  getTemplates(): TemplateItem[] {
    return this.get<TemplateItem[]>(STORAGE_KEYS.TEMPLATES, SEED_TEMPLATES);
  }

  saveTemplate(tmpl: TemplateItem): TemplateItem[] {
    const list = this.getTemplates();
    const index = list.findIndex((t) => t.id === tmpl.id);
    let updated: TemplateItem[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = tmpl;
    } else {
      updated = [tmpl, ...list];
    }
    this.set(STORAGE_KEYS.TEMPLATES, updated);
    return updated;
  }

  deleteTemplate(id: string): TemplateItem[] {
    const list = this.getTemplates().filter((t) => t.id !== id);
    this.set(STORAGE_KEYS.TEMPLATES, list);
    return list;
  }

  toggleFavoriteTemplate(id: string): TemplateItem[] {
    const list = this.getTemplates().map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
    this.set(STORAGE_KEYS.TEMPLATES, list);
    return list;
  }

  // --- Workspaces & Team ---
  getWorkspaces(): Workspace[] {
    return this.get<Workspace[]>(STORAGE_KEYS.WORKSPACES, SEED_WORKSPACES);
  }

  saveWorkspace(ws: Workspace): Workspace[] {
    const list = this.getWorkspaces();
    const index = list.findIndex((w) => w.id === ws.id);
    let updated: Workspace[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = ws;
    } else {
      updated = [ws, ...list];
    }
    this.set(STORAGE_KEYS.WORKSPACES, updated);
    return updated;
  }

  getWorkspaceMembers(workspaceId: string): WorkspaceMember[] {
    const members = this.get<WorkspaceMember[]>(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
    return members.filter((m) => m.workspaceId === workspaceId);
  }

  addWorkspaceMember(member: WorkspaceMember): WorkspaceMember[] {
    const members = this.get<WorkspaceMember[]>(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
    const updated = [member, ...members];
    this.set(STORAGE_KEYS.MEMBERS, updated);
    return updated;
  }

  removeWorkspaceMember(memberId: string): void {
    const members = this.get<WorkspaceMember[]>(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
    const updated = members.filter((m) => m.id !== memberId);
    this.set(STORAGE_KEYS.MEMBERS, updated);
  }

  getWorkspaceInvites(workspaceId: string): WorkspaceInvite[] {
    const invites = this.get<WorkspaceInvite[]>(STORAGE_KEYS.INVITES, []);
    return invites.filter((i) => i.workspaceId === workspaceId);
  }

  createWorkspaceInvite(invite: WorkspaceInvite): WorkspaceInvite[] {
    const invites = this.get<WorkspaceInvite[]>(STORAGE_KEYS.INVITES, []);
    const updated = [invite, ...invites];
    this.set(STORAGE_KEYS.INVITES, updated);
    return updated;
  }

  // --- Support Tickets ---
  getSupportTickets(): SupportTicket[] {
    return this.get<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, SEED_SUPPORT_TICKETS);
  }

  saveSupportTicket(ticket: SupportTicket): SupportTicket[] {
    const list = this.getSupportTickets();
    const index = list.findIndex((t) => t.id === ticket.id);
    let updated: SupportTicket[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...ticket, updatedAt: new Date().toISOString() };
    } else {
      updated = [ticket, ...list];
    }
    this.set(STORAGE_KEYS.SUPPORT_TICKETS, updated);
    return updated;
  }

  // --- Generation Logs ---
  getAILogs(): AIGenerationLog[] {
    return this.get<AIGenerationLog[]>(STORAGE_KEYS.AI_LOGS, []);
  }

  logAIGeneration(log: AIGenerationLog): void {
    const logs = this.getAILogs();
    this.set(STORAGE_KEYS.AI_LOGS, [log, ...logs.slice(0, 99)]);
  }

  // --- Admin Audit ---
  getAdminAuditLogs(): AdminAuditRecord[] {
    return this.get<AdminAuditRecord[]>(STORAGE_KEYS.ADMIN_AUDIT, SEED_AUDIT_LOGS);
  }

  addAdminAudit(action: string, target: string, details: string, status: 'success' | 'warning' | 'error' = 'success'): void {
    const user = this.getUser();
    const logs = this.getAdminAuditLogs();
    const record: AdminAuditRecord = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminEmail: user.email,
      action,
      target,
      details,
      status,
    };
    this.set(STORAGE_KEYS.ADMIN_AUDIT, [record, ...logs.slice(0, 99)]);
  }

  // --- Live User Login Tracking & Audit Trail for Platform Owner ---
  getUserLoginEvents(): UserLoginEvent[] {
    return this.get<UserLoginEvent[]>(STORAGE_KEYS.LOGIN_EVENTS, SEED_LOGIN_EVENTS);
  }

  logUserLogin(event: Omit<UserLoginEvent, 'id' | 'timestamp'>): UserLoginEvent {
    const list = this.getUserLoginEvents();
    const record: UserLoginEvent = {
      ...event,
      id: `login_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    const updated = [record, ...list.slice(0, 199)];
    this.set(STORAGE_KEYS.LOGIN_EVENTS, updated);

    // Also record in general Admin Audit Logs so Owner sees it in all audit screens
    this.addAdminAudit(
      'USER_LOGIN',
      event.userEmail,
      `User ${event.userName} (${event.userRole.toUpperCase()}) logged in from ${event.device} (${event.ip}). Plan: ${event.planTier.toUpperCase()}, Credits: ${event.creditsBalance}.`,
      event.status === 'blocked' ? 'warning' : 'success'
    );

    // Auto-update user's lastLoginAt, lastLoginDevice, lastLoginIp, and loginCount in ALL_USERS
    const allUsers = this.getAllUsers();
    const uIdx = allUsers.findIndex(
      (u) => u.id === event.userId || u.email.toLowerCase() === event.userEmail.toLowerCase()
    );
    if (uIdx >= 0) {
      allUsers[uIdx] = {
        ...allUsers[uIdx],
        lastLoginAt: record.timestamp,
        lastLoginDevice: event.device,
        lastLoginIp: event.ip,
        loginCount: (allUsers[uIdx].loginCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      };
      this.set(STORAGE_KEYS.ALL_USERS, allUsers);
    }

    return record;
  }

  // --- Export All Account Data (Compliance / Portability) ---
  exportAllUserData(): string {
    const user = this.getUser();
    const data = {
      profile: user,
      brandVoices: this.getBrandVoices(),
      projects: this.getProjects(),
      contentItems: this.getContentItems(),
      calendarEntries: this.getCalendarEntries(),
      contentPlans: this.getContentPlans(),
      workspaces: this.getWorkspaces(),
      supportTickets: this.getSupportTickets().filter((t) => t.userId === user.id),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  // --- Payment Requests & Architecture ---
  getPaymentRequests(): PaymentUpgradeRequest[] {
    return this.get<PaymentUpgradeRequest[]>(STORAGE_KEYS.PAYMENT_REQUESTS, SEED_PAYMENT_REQUESTS);
  }

  getUserPaymentRequests(userId: string): PaymentUpgradeRequest[] {
    const all = this.getPaymentRequests();
    return all.filter((r) => r.userId === userId);
  }

  savePaymentRequest(req: PaymentUpgradeRequest): void {
    const list = this.getPaymentRequests();
    const idx = list.findIndex((r) => r.id === req.id);
    if (idx >= 0) {
      list[idx] = req;
    } else {
      list.unshift(req);
    }
    this.set(STORAGE_KEYS.PAYMENT_REQUESTS, list);
  }

  createPaymentRequest(
    data: Omit<PaymentUpgradeRequest, 'id' | 'createdAt' | 'status'>
  ): PaymentUpgradeRequest {
    const newReq: PaymentUpgradeRequest = {
      ...data,
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.savePaymentRequest(newReq);
    return newReq;
  }

  approvePaymentRequest(id: string, adminEmail: string): boolean {
    const list = this.getPaymentRequests();
    const req = list.find((r) => r.id === id);
    if (!req) return false;

    req.status = 'approved';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = adminEmail;
    this.set(STORAGE_KEYS.PAYMENT_REQUESTS, list);

    // Upgrade the target user
    const users = this.getAllUsers();
    const userIndex = users.findIndex(
      (u) => u.id === req.userId || u.email.toLowerCase() === req.userEmail.toLowerCase()
    );

    let bonusCredits = 500;
    if (req.planId === 'pro') bonusCredits = 2000;
    if (req.planId === 'agency') bonusCredits = 10000;

    if (userIndex >= 0) {
      users[userIndex].planTier = req.planId;
      users[userIndex].planStatus = 'active';
      users[userIndex].creditsBalance += bonusCredits;
      users[userIndex].updatedAt = new Date().toISOString();
      this.set(STORAGE_KEYS.ALL_USERS, users);
    }

    // If currently active session user is the target, update it directly
    const currentUser = this.getUser();
    if (
      currentUser.id === req.userId ||
      currentUser.email.toLowerCase() === req.userEmail.toLowerCase()
    ) {
      const updatedUser = {
        ...currentUser,
        planTier: req.planId,
        planStatus: 'active' as const,
        creditsBalance: currentUser.creditsBalance + bonusCredits,
        updatedAt: new Date().toISOString(),
      };
      this.setUser(updatedUser);
    }

    this.addAdminAudit(
      'PAYMENT_UPGRADE_APPROVED',
      `User: ${req.userEmail}`,
      `Approved ${req.planName} upgrade (TRX: ${req.transactionId}, Amount: ${req.currency}${req.amount}). Allocated ${bonusCredits} credits.`
    );

    return true;
  }

  rejectPaymentRequest(id: string, reason: string, adminEmail: string): boolean {
    const list = this.getPaymentRequests();
    const req = list.find((r) => r.id === id);
    if (!req) return false;

    req.status = 'rejected';
    req.rejectionReason = reason;
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = adminEmail;
    this.set(STORAGE_KEYS.PAYMENT_REQUESTS, list);

    this.addAdminAudit(
      'PAYMENT_UPGRADE_REJECTED',
      `User: ${req.userEmail}`,
      `Rejected ${req.planName} payment (TRX: ${req.transactionId}). Reason: ${reason}`,
      'warning'
    );

    return true;
  }

  deletePaymentRequest(id: string): void {
    const list = this.getPaymentRequests().filter((r) => r.id !== id);
    this.set(STORAGE_KEYS.PAYMENT_REQUESTS, list);
  }

  // --- Stripe Subscriptions ---
  getStripeSubscriptions(): StripeSubscriptionRecord[] {
    return this.get<StripeSubscriptionRecord[]>(STORAGE_KEYS.STRIPE_SUBSCRIPTIONS, []);
  }

  saveStripeSubscription(record: StripeSubscriptionRecord): void {
    const list = this.getStripeSubscriptions();
    const idx = list.findIndex((s) => s.id === record.id || s.userId === record.userId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...record };
    } else {
      list.unshift(record);
    }
    this.set(STORAGE_KEYS.STRIPE_SUBSCRIPTIONS, list);

    this.addAdminAudit(
      'STRIPE_SUBSCRIPTION_ACTIVE',
      `User: ${record.userEmail}`,
      `Subscribed to ${record.planName} via Stripe (${record.currency}${record.amount}/${record.billingCycle}) with auto-renewal enabled.`
    );
  }

  getUserStripeSubscription(userId: string): StripeSubscriptionRecord | undefined {
    return this.getStripeSubscriptions().find((s) => s.userId === userId && s.status !== 'cancelled');
  }

  cancelStripeSubscription(userId: string): boolean {
    const list = this.getStripeSubscriptions();
    const sub = list.find((s) => s.userId === userId);
    if (!sub) return false;
    sub.status = 'cancelled';
    this.set(STORAGE_KEYS.STRIPE_SUBSCRIPTIONS, list);

    const user = this.getUser();
    if (user.id === userId) {
      const updated = {
        ...user,
        planStatus: 'cancelled' as const,
        autoRenew: false,
      };
      this.setUser(updated);
    }

    this.addAdminAudit(
      'STRIPE_SUBSCRIPTION_CANCELLED',
      `User: ${sub.userEmail}`,
      `Cancelled Stripe subscription for ${sub.planName}.`
    );
    return true;
  }
}

export const storage = new StorageManager();
