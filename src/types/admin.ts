export interface GroqConfig {
  activeModel: string;
  providerMode: 'live' | 'simulation';
  apiKeyConfigured: boolean;
  temperature: number;
  maxTokens: number;
  rateLimitPerMinute: number;
  emergencyKillSwitch: boolean;
}

export interface AdminPromptConfig {
  toolId: string;
  systemPrompt: string;
  creditCost: number;
  isEnabled: boolean;
  version: number;
  updatedAt: string;
}

export interface AdminAuditRecord {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  target: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}

export interface UserLoginEvent {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  timestamp: string;
  ip: string;
  device: string;
  browser: string;
  location?: string;
  planTier: string;
  creditsBalance: number;
  status: 'success' | 'failed' | 'blocked';
}

export interface SystemStats {
  totalUsers: number;
  activeUsers30d: number;
  totalGenerations: number;
  totalCreditsUsed: number;
  apiSuccessRate: number;
  avgLatencyMs: number;
  openSupportTickets: number;
}
