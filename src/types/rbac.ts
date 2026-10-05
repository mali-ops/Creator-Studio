// Enterprise Role-Based Access Control (RBAC) Type Definitions

export type SystemRole = 'owner' | 'admin' | 'creator';

export type PermissionModule =
  | 'dashboard'
  | 'users'
  | 'admins'
  | 'resources'
  | 'projects'
  | 'payments'
  | 'reports'
  | 'website'
  | 'settings'
  | 'security';

export type PermissionKey =
  // Dashboard
  | 'dashboard.view'
  // Users (Clients)
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.suspend'
  | 'users.reset_password'
  // Admins
  | 'admins.view'
  | 'admins.create'
  | 'admins.edit'
  | 'admins.delete'
  | 'admins.suspend'
  | 'admins.reset_password'
  | 'admins.assign_roles'
  | 'admins.manage_permissions'
  // Resources (Tools, Prompts, Media)
  | 'resources.view'
  | 'resources.create'
  | 'resources.edit'
  | 'resources.delete'
  // Projects & Orders
  | 'projects.view'
  | 'projects.create'
  | 'projects.edit'
  | 'projects.delete'
  | 'projects.assign'
  // Payments & Transactions
  | 'payments.view'
  | 'payments.approve'
  | 'payments.reject'
  | 'payments.refund'
  // Reports & Analytics
  | 'reports.view'
  | 'reports.export'
  // Website Management
  | 'website.manage_content'
  | 'website.manage_pages'
  | 'website.manage_media'
  | 'website.manage_seo'
  // Settings
  | 'settings.view'
  | 'settings.edit'
  // Security
  | 'security.view_logs'
  | 'security.manage_sessions'
  | 'security.manage_permissions'
  | 'security.manage_2fa';

export interface PermissionDefinition {
  key: PermissionKey;
  module: PermissionModule;
  label: string;
  description: string;
  isDangerous?: boolean;
}

export interface CustomRoleDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  assignedAdminsCount?: number;
  permissions: PermissionKey[];
  createdAt: string;
  updatedAt: string;
}

export interface ActiveSessionRecord {
  id: string;
  userId: string;
  userEmail: string;
  userRole: SystemRole;
  device: string;
  browser: string;
  ip: string;
  location: string;
  loginTime: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface PasswordResetTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: SystemRole;
  requestedBy: string;
  initiatedByRole: 'owner' | 'admin' | 'self';
  token: string;
  status: 'pending' | 'used' | 'expired' | 'revoked';
  expiresAt: string;
  createdAt: string;
}

export interface EnterpriseAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  actorRole: SystemRole;
  action: string;
  module: PermissionModule | 'auth' | 'system';
  targetId?: string;
  targetEmail?: string;
  targetRole?: SystemRole;
  details: string;
  ip: string;
  device: string;
  browser: string;
  status: 'success' | 'warning' | 'error' | 'blocked';
}

export interface RBACStats {
  totalAdmins: number;
  activeAdmins: number;
  suspendedAdmins: number;
  totalClients: number;
  activeClients: number;
  suspendedClients: number;
  totalProjects: number;
  pendingProjects: number;
  completedProjects: number;
  totalRevenue: number;
  pendingPaymentsCount: number;
  activeSessionsCount: number;
  totalAuditLogsCount: number;
}
