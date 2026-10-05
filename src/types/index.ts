import { PermissionKey } from './rbac.ts';

export type UserRole = 'creator' | 'agency_owner' | 'superadmin' | 'owner' | 'admin';
export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type PlanTier = 'creator' | 'pro' | 'agency' | 'free';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'trial_expired';
export type CalendarStatus = 'Idea' | 'Draft' | 'Ready' | 'Published';

export interface AdminPermissions {
  canResolveClientTickets: boolean;
  canViewClientMedia: boolean;
  canAdjustClientCredits: boolean;
  canManagePayments: boolean;
  canAccessToolConfig: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  displayName?: string;
  avatarUrl?: string;
  phone?: string;
  company?: string;
  country?: string;
  bio?: string;
  creatorType?: string;
  industry?: string;
  preferredPlatforms: string[];
  contentGoals: string[];
  onboardingCompleted: boolean;
  role: UserRole;
  customRoleId?: string;
  permissions?: PermissionKey[];
  adminPermissions?: AdminPermissions;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  lastLoginDevice?: string;
  loginCount?: number;
  creditsBalance: number;
  creditsTotalUsed: number;
  lastDailyCreditRefresh?: string;
  planTier: PlanTier;
  planStatus: SubscriptionStatus;
  trialStartDate?: string;
  trialEndDate?: string;
  trialDaysRemaining?: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeCardBrand?: string;
  stripeCardLast4?: string;
  autoRenew?: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  themePreference: 'dark' | 'light' | 'system';
  defaultLanguage: string;
  defaultTone: string;
  createdAt: string;
  updatedAt: string;
}

export interface StripeSubscriptionRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: 'creator' | 'pro' | 'agency';
  planName: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  status: 'trialing' | 'active' | 'cancelled' | 'trial_expired';
  trialStartDate: string;
  trialEndDate: string;
  nextBillingDate: string;
  cardBrand: string;
  cardLast4: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  role: WorkspaceRole;
  membersCount: number;
  creditsPool: number;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  fullName: string;
  role: WorkspaceRole;
  avatarUrl?: string;
  joinedAt: string;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  invitedBy: string;
  invitedByName?: string;
  status: 'pending' | 'accepted' | 'revoked';
  expiresAt: string;
  createdAt: string;
}

export interface BrandVoice {
  id: string;
  userId: string;
  workspaceId?: string;
  name: string;
  description?: string;
  targetAudience: string;
  personality: string;
  tone: string;
  keywords: string[];
  forbiddenWords: string[];
  exampleWriting?: string;
  preferredLanguage: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  workspaceId?: string;
  brandVoiceId?: string;
  name: string;
  description?: string;
  platform?: string;
  clientName?: string;
  colorCode: string;
  isArchived: boolean;
  itemsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  userId: string;
  workspaceId?: string;
  projectId?: string;
  brandVoiceId?: string;
  title: string;
  toolId: string;
  platform: string;
  contentType: string;
  generatedOutput: string;
  promptParams: Record<string, any>;
  isFavorite: boolean;
  tags: string[];
  wordCount: number;
  characterCount: number;
  versionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  versionNumber: number;
  output: string;
  editedBy: string;
  changeSummary: string;
  createdAt: string;
}

export interface CalendarEntry {
  id: string;
  userId: string;
  workspaceId?: string;
  projectId?: string;
  contentId?: string;
  title: string;
  platform: string;
  category: string;
  campaign?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  timezone: string;
  status: CalendarStatus;
  publishedAt?: string;
  notes?: string;
  inAppReminder: boolean;
  createdAt: string;
}

export interface ContentPlanDay {
  day: number;
  platform: string;
  format: string;
  pillar: string;
  conceptTitle: string;
  hookIdea: string;
  callToAction: string;
  status?: CalendarStatus;
  transferredToCalendar?: boolean;
}

export interface ContentPlan {
  id: string;
  userId: string;
  workspaceId?: string;
  title: string;
  durationDays: 7 | 14 | 30;
  industry: string;
  goals: string[];
  platforms: string[];
  planMatrix: ContentPlanDay[];
  createdAt: string;
}

export interface TemplateItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  toolId: string;
  platform: string;
  category: 'Sales' | 'Educational' | 'Storytelling' | 'Promotional' | 'Trending Formats';
  sampleInput: Record<string, string>;
  sampleOutput: string;
  isGlobal: boolean;
  isFavorite?: boolean;
  usageCount: number;
  createdAt: string;
}

export interface AIGenerationLog {
  id: string;
  userId: string;
  toolId: string;
  modelUsed: string;
  provider: 'groq' | 'ai_engine';
  creditsDeducted: number;
  executionMs: number;
  promptTokens?: number;
  completionTokens?: number;
  status: 'success' | 'failed' | 'rate_limited';
  errorMessage?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userRole?: UserRole;
  ticketType?: 'client_issue' | 'admin_issue';
  assignedToRole?: 'admin_or_owner' | 'owner_only';
  resolvedBy?: string;
  resolvedByRole?: 'owner' | 'admin';
  subject: string;
  category: 'General' | 'AI Generation' | 'Billing & Credits' | 'Bug Report' | 'Feature Request' | 'Role Elevation & Privileges' | 'Admin Technical Issue';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface MediaPhotoAsset {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  title: string;
  url: string;
  category: 'social' | 'product' | 'profile' | 'thumbnail' | 'client_asset' | 'banner';
  dimensions?: string;
  fileSize?: string;
  notes?: string;
  createdAt: string;
}

export interface PlatformEmailLog {
  id: string;
  toEmail: string;
  toName: string;
  toRole: UserRole;
  fromName: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  category: 'welcome' | 'role_assigned' | 'ticket_resolved' | 'ticket_created' | 'credit_update' | 'payment_notice' | 'broadcast' | 'admin_alert';
  status: 'delivered' | 'sent';
  sentAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  message: string;
  isAdminReply: boolean;
  createdAt: string;
}

export interface PlanConfig {
  id: PlanTier;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  creditsPerMonth: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  available: boolean;
}

export type PaymentMethodType = 'bank_transfer' | 'easypaisa' | 'jazzcash' | 'raast' | 'crypto_usdt' | 'other';

export interface PaymentUpgradeRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: PlanTier;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  paymentMethod: PaymentMethodType;
  senderName: string;
  senderAccountOrPhone: string;
  transactionId: string;
  screenshotUrl: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
