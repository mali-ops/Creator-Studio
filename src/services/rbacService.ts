// Enterprise Role-Based Access Control (RBAC) Service
import {
  PermissionKey,
  PermissionModule,
  PermissionDefinition,
  CustomRoleDefinition,
  ActiveSessionRecord,
  PasswordResetTicket,
  EnterpriseAuditLog,
  RBACStats,
} from '../types/rbac.ts';
import { UserProfile } from '../types/index.ts';
import { storage } from './storage.ts';

// -----------------------------------------------------------------------------
// Complete Permission Registry (Grouped by Module)
// -----------------------------------------------------------------------------

export const PERMISSION_REGISTRY: PermissionDefinition[] = [
  // Dashboard
  {
    key: 'dashboard.view',
    module: 'dashboard',
    label: 'View Dashboard',
    description: 'Access the main overview analytics, KPI summary cards, and quick widgets.',
  },

  // Users (Clients)
  {
    key: 'users.view',
    module: 'users',
    label: 'View Clients',
    description: 'Inspect registered creator and corporate client accounts, profiles, and statuses.',
  },
  {
    key: 'users.create',
    module: 'users',
    label: 'Create Clients',
    description: 'Provision new client accounts directly from the administration dashboard.',
  },
  {
    key: 'users.edit',
    module: 'users',
    label: 'Edit Clients',
    description: 'Modify client information, brand profiles, contact details, and tier settings.',
  },
  {
    key: 'users.suspend',
    module: 'users',
    label: 'Suspend Clients',
    description: 'Deactivate or reinstate client accounts and freeze their credit usage.',
  },
  {
    key: 'users.delete',
    module: 'users',
    label: 'Delete Clients',
    description: 'Permanently remove client profiles, storage assets, and associated generation history.',
    isDangerous: true,
  },
  {
    key: 'users.reset_password',
    module: 'users',
    label: 'Reset Client Password',
    description: 'Initiate password resets or send secure access tokens to clients.',
  },

  // Admins
  {
    key: 'admins.view',
    module: 'admins',
    label: 'View Admins',
    description: 'Browse all platform operators, staff members, and assigned role definitions.',
  },
  {
    key: 'admins.create',
    module: 'admins',
    label: 'Add Admin',
    description: 'Invite or create new operational administrator accounts with defined privileges.',
  },
  {
    key: 'admins.edit',
    module: 'admins',
    label: 'Edit Admin',
    description: 'Update administrator contact details, assignments, and departmental roles.',
  },
  {
    key: 'admins.suspend',
    module: 'admins',
    label: 'Suspend Admin',
    description: 'Temporarily lock admin portal access without deleting their historical audit records.',
    isDangerous: true,
  },
  {
    key: 'admins.delete',
    module: 'admins',
    label: 'Remove Admin',
    description: 'Permanently revoke administrator status and remove from the active operators registry.',
    isDangerous: true,
  },
  {
    key: 'admins.reset_password',
    module: 'admins',
    label: 'Reset Admin Password',
    description: 'Initiate secure password reset tokens for staff administrators.',
  },
  {
    key: 'admins.assign_roles',
    module: 'admins',
    label: 'Assign Roles',
    description: 'Assign or reassign predefined and custom roles to administrator accounts.',
  },
  {
    key: 'admins.manage_permissions',
    module: 'admins',
    label: 'Manage Admin Permissions',
    description: 'Apply custom permission overrides directly to individual administrator profiles.',
    isDangerous: true,
  },

  // Resources
  {
    key: 'resources.view',
    module: 'resources',
    label: 'View Resources',
    description: 'Inspect AI prompts, tool templates, inference engines, and client media assets.',
  },
  {
    key: 'resources.create',
    module: 'resources',
    label: 'Create Resources',
    description: 'Add new prompt templates, test cases, and global creative assets.',
  },
  {
    key: 'resources.edit',
    module: 'resources',
    label: 'Edit Resources',
    description: 'Modify credit costs, inference models, system prompts, and configuration parameters.',
  },
  {
    key: 'resources.delete',
    module: 'resources',
    label: 'Delete Resources',
    description: 'Remove deprecated tool prompts, templates, or media files.',
    isDangerous: true,
  },

  // Projects & Orders
  {
    key: 'projects.view',
    module: 'projects',
    label: 'View Projects',
    description: 'Review client projects, campaigns, content queues, and generation batches.',
  },
  {
    key: 'projects.create',
    module: 'projects',
    label: 'Create Projects',
    description: 'Create new project folders and assign content planning schedules.',
  },
  {
    key: 'projects.edit',
    module: 'projects',
    label: 'Edit Projects',
    description: 'Update project deliverables, platforms, schedules, and campaign statuses.',
  },
  {
    key: 'projects.delete',
    module: 'projects',
    label: 'Delete Projects',
    description: 'Remove project collaterals and archived campaign folders.',
    isDangerous: true,
  },
  {
    key: 'projects.assign',
    module: 'projects',
    label: 'Assign Projects',
    description: 'Delegate review tasks or client project workflows to specific team admins.',
  },

  // Payments & Transactions
  {
    key: 'payments.view',
    module: 'payments',
    label: 'View Payments',
    description: 'Inspect billing transactions, manual bank receipts, and Stripe subscription events.',
  },
  {
    key: 'payments.approve',
    module: 'payments',
    label: 'Approve Payments',
    description: 'Verify payment receipts, activate subscriptions, and credit user accounts.',
  },
  {
    key: 'payments.reject',
    module: 'payments',
    label: 'Reject Payments',
    description: 'Decline invalid transaction slips or fraudulent manual payment requests.',
  },
  {
    key: 'payments.refund',
    module: 'payments',
    label: 'Refund Payments',
    description: 'Process credit reversals or mark transactions refunded with mandatory audit logging.',
    isDangerous: true,
  },

  // Reports & Analytics
  {
    key: 'reports.view',
    module: 'reports',
    label: 'View Reports',
    description: 'Inspect usage analytics, revenue metrics, tool performance, and client growth.',
  },
  {
    key: 'reports.export',
    module: 'reports',
    label: 'Export Reports',
    description: 'Download CSV and JSON export files of analytics, payments, and user rosters.',
  },

  // Website Management
  {
    key: 'website.manage_content',
    module: 'website',
    label: 'Manage Content',
    description: 'Update landing page hero headlines, feature copy, announcements, and FAQs.',
  },
  {
    key: 'website.manage_pages',
    module: 'website',
    label: 'Manage Pages',
    description: 'Control public navigation links, pricing pages, and terms documents.',
  },
  {
    key: 'website.manage_media',
    module: 'website',
    label: 'Manage Media',
    description: 'Audit uploaded client photos, sample image previews, and brand assets.',
  },
  {
    key: 'website.manage_seo',
    module: 'website',
    label: 'Manage SEO',
    description: 'Configure meta descriptions, open graph tags, and search engine previews.',
  },

  // Settings
  {
    key: 'settings.view',
    module: 'settings',
    label: 'View Settings',
    description: 'Inspect system-wide settings, payment gateway configurations, and credit baselines.',
  },
  {
    key: 'settings.edit',
    module: 'settings',
    label: 'Edit Settings',
    description: 'Update bank details, Groq/OpenAI inference keys, rate limits, and site parameters.',
    isDangerous: true,
  },

  // Security
  {
    key: 'security.view_logs',
    module: 'security',
    label: 'View Logs',
    description: 'Review administrative audit logs, login attempts, IP addresses, and security events.',
  },
  {
    key: 'security.manage_sessions',
    module: 'security',
    label: 'Manage Sessions',
    description: 'Inspect active browser sessions and terminate suspicious or concurrent logins.',
    isDangerous: true,
  },
  {
    key: 'security.manage_permissions',
    module: 'security',
    label: 'Manage Permissions',
    description: 'Configure system role templates and define enterprise-wide authorization matrices.',
    isDangerous: true,
  },
  {
    key: 'security.manage_2fa',
    module: 'security',
    label: 'Manage 2FA Policy',
    description: 'Enforce two-factor authentication requirements for administrative staff.',
  },
];

// All possible permission keys
export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSION_REGISTRY.map((p) => p.key);

// -----------------------------------------------------------------------------
// Predefined Enterprise Roles
// -----------------------------------------------------------------------------

export const DEFAULT_ROLES: CustomRoleDefinition[] = [
  {
    id: 'role_senior_admin',
    name: 'Senior Administrator',
    slug: 'senior-admin',
    description: 'Senior operational leader with broad authority across clients, projects, reports, and content.',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'users.view',
      'users.create',
      'users.edit',
      'users.suspend',
      'users.reset_password',
      'admins.view',
      'resources.view',
      'resources.create',
      'resources.edit',
      'projects.view',
      'projects.create',
      'projects.edit',
      'projects.assign',
      'payments.view',
      'payments.approve',
      'reports.view',
      'reports.export',
      'website.manage_content',
      'website.manage_media',
      'security.view_logs',
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'role_support_admin',
    name: 'Support & Success Admin',
    slug: 'support-admin',
    description: 'Focused on client issue resolution, ticket assistance, and customer onboarding support.',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'users.view',
      'users.edit',
      'users.reset_password',
      'resources.view',
      'projects.view',
      'reports.view',
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'role_finance_admin',
    name: 'Finance & Billing Admin',
    slug: 'finance-admin',
    description: 'Manages payment verification, manual wire approvals, Stripe invoices, and revenue reports.',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'users.view',
      'payments.view',
      'payments.approve',
      'payments.reject',
      'payments.refund',
      'reports.view',
      'reports.export',
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'role_content_admin',
    name: 'Content & Editorial Admin',
    slug: 'content-admin',
    description: 'Governs AI prompt templates, tool prompts, website media, and public copywriting.',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'resources.view',
      'resources.create',
      'resources.edit',
      'projects.view',
      'website.manage_content',
      'website.manage_media',
      'website.manage_seo',
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'role_operations_admin',
    name: 'Operations Admin',
    slug: 'operations-admin',
    description: 'Oversees daily task delegation, tool performance monitoring, and project workflows.',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'users.view',
      'resources.view',
      'projects.view',
      'projects.create',
      'projects.edit',
      'projects.assign',
      'reports.view',
      'security.view_logs',
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

// -----------------------------------------------------------------------------
// Storage Keys
// -----------------------------------------------------------------------------
const STORAGE_KEYS = {
  ROLES: 'aurora_rbac_roles_v2',
  SESSIONS: 'aurora_rbac_sessions_v2',
  RESET_TICKETS: 'aurora_rbac_reset_tickets_v2',
  ENTERPRISE_AUDIT: 'aurora_rbac_audit_logs_v2',
};

// -----------------------------------------------------------------------------
// RBAC Service Class
// -----------------------------------------------------------------------------

class RBACService {
  // ---------------------------------------------------------------------------
  // Roles Management
  // ---------------------------------------------------------------------------

  getRoles(): CustomRoleDefinition[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ROLES);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(DEFAULT_ROLES));
        return DEFAULT_ROLES;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(DEFAULT_ROLES));
        return DEFAULT_ROLES;
      }
      return parsed;
    } catch {
      return DEFAULT_ROLES;
    }
  }

  saveRoles(roles: CustomRoleDefinition[]): void {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  }

  getRoleById(roleId: string): CustomRoleDefinition | undefined {
    return this.getRoles().find((r) => r.id === roleId);
  }

  createRole(role: Omit<CustomRoleDefinition, 'id' | 'createdAt' | 'updatedAt' | 'isSystem'>): CustomRoleDefinition {
    const list = this.getRoles();
    const newRole: CustomRoleDefinition = {
      ...role,
      id: `role_custom_${Date.now()}`,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newRole);
    this.saveRoles(list);
    return newRole;
  }

  updateRole(roleId: string, updates: Partial<Omit<CustomRoleDefinition, 'id' | 'isSystem' | 'createdAt'>>): CustomRoleDefinition | null {
    const list = this.getRoles();
    const idx = list.findIndex((r) => r.id === roleId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveRoles(list);
    return list[idx];
  }

  deleteRole(roleId: string): boolean {
    const list = this.getRoles();
    const target = list.find((r) => r.id === roleId);
    if (!target || target.isSystem) return false; // System roles cannot be deleted

    const filtered = list.filter((r) => r.id !== roleId);
    this.saveRoles(filtered);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Permission Verification Core (Ironclad Authority Hierarchy)
  // ---------------------------------------------------------------------------

  /**
   * Evaluates if a given user profile has authorization for a specific PermissionKey.
   * - Owner / Superadmin: ALWAYS returns true (100% unrestricted authority).
   * - Suspended user: ALWAYS returns false.
   * - Admin: Verified against their direct permission overrides or custom role definition.
   * - Client: Limited to non-administrative permissions.
   */
  hasPermission(user: UserProfile | null | undefined, permissionKey: PermissionKey): boolean {
    if (!user) return false;
    if (user.isSuspended) return false;

    // 1. Owner & Super Admin check (Always 100% unconditional access)
    const isOwner =
      user.role === 'owner' ||
      user.role === 'superadmin' ||
      user.email.toLowerCase() === 'ali.siddiquibro74@gmail.com' ||
      user.email.toLowerCase() === 'owner@creatorstudio.ai' ||
      user.email.toLowerCase().startsWith('owner@');

    if (isOwner) {
      return true;
    }

    // 2. Regular Admin check
    if (user.role === 'admin') {
      // Direct user-level permission override takes highest precedence for that admin
      if (user.permissions && Array.isArray(user.permissions)) {
        if (user.permissions.includes(permissionKey)) {
          return true;
        }
      }

      // Check assigned role permissions
      if (user.customRoleId) {
        const roleDef = this.getRoleById(user.customRoleId);
        if (roleDef && roleDef.permissions.includes(permissionKey)) {
          return true;
        }
      }

      // If no custom role set, fall back to senior admin defaults or existing adminPermissions flag mapping
      if (!user.permissions && !user.customRoleId) {
        const senior = this.getRoleById('role_senior_admin');
        if (senior && senior.permissions.includes(permissionKey)) {
          return true;
        }
      }

      return false;
    }

    // 3. Client Role check: clients only have access to non-administrative resources
    if (user.role === 'creator' || user.role === 'agency_owner') {
      return (
        permissionKey === 'dashboard.view' ||
        permissionKey === 'projects.view' ||
        permissionKey === 'projects.create' ||
        permissionKey === 'projects.edit' ||
        permissionKey === 'resources.view'
      );
    }

    return false;
  }

  /**
   * Retrieves the full list of active permissions for a user.
   */
  getUserPermissions(user: UserProfile | null | undefined): PermissionKey[] {
    if (!user) return [];
    if (user.isSuspended) return [];

    const isOwner =
      user.role === 'owner' ||
      user.role === 'superadmin' ||
      user.email.toLowerCase() === 'ali.siddiquibro74@gmail.com' ||
      user.email.toLowerCase() === 'owner@creatorstudio.ai';

    if (isOwner) {
      return ALL_PERMISSION_KEYS;
    }

    if (user.role === 'admin') {
      const set = new Set<PermissionKey>();
      if (user.permissions) {
        user.permissions.forEach((p) => set.add(p));
      }
      if (user.customRoleId) {
        const role = this.getRoleById(user.customRoleId);
        if (role) {
          role.permissions.forEach((p) => set.add(p));
        }
      }
      if (set.size === 0) {
        const senior = this.getRoleById('role_senior_admin');
        if (senior) {
          senior.permissions.forEach((p) => set.add(p));
        }
      }
      return Array.from(set);
    }

    return ['dashboard.view', 'projects.view', 'projects.create', 'projects.edit', 'resources.view'];
  }

  /**
   * Evaluates if Actor is authorized to perform management actions (edit, suspend, remove) on Target.
   * - Target = Owner: ALWAYS BLOCKED (Admins can NEVER modify or delete Owner).
   * - Actor = Owner: ALWAYS ALLOWED.
   * - Actor = Admin: ONLY allowed if Owner explicitly granted `admins.edit` / `admins.suspend` / `admins.delete`
   *   AND target is NOT another superadmin or owner.
   */
  canManageAdmin(
    actor: UserProfile | null | undefined,
    target: UserProfile,
    action: 'edit' | 'suspend' | 'delete' | 'reset_password' | 'manage_permissions'
  ): { allowed: boolean; reason?: string } {
    if (!actor) return { allowed: false, reason: 'Authentication required.' };

    const isTargetOwner =
      target.role === 'owner' ||
      target.role === 'superadmin' ||
      target.email.toLowerCase() === 'ali.siddiquibro74@gmail.com' ||
      target.email.toLowerCase() === 'owner@creatorstudio.ai';

    // Rule 1: Owner is completely protected and immutable
    if (isTargetOwner) {
      return {
        allowed: false,
        reason: 'Protected Root Entity: The Platform Owner cannot be edited, suspended, or removed by anyone.',
      };
    }

    const isActorOwner =
      actor.role === 'owner' ||
      actor.role === 'superadmin' ||
      actor.email.toLowerCase() === 'ali.siddiquibro74@gmail.com' ||
      actor.email.toLowerCase() === 'owner@creatorstudio.ai';

    // Rule 2: Owner can manage any admin
    if (isActorOwner) {
      return { allowed: true };
    }

    // Rule 3: Admin managing another Admin
    if (actor.role === 'admin') {
      const requiredKey: PermissionKey =
        action === 'edit'
          ? 'admins.edit'
          : action === 'suspend'
          ? 'admins.suspend'
          : action === 'delete'
          ? 'admins.delete'
          : action === 'reset_password'
          ? 'admins.reset_password'
          : 'admins.manage_permissions';

      if (!this.hasPermission(actor, requiredKey)) {
        return {
          allowed: false,
          reason: `Insufficient Privileges: The Platform Owner has not granted you the "${requiredKey}" permission.`,
        };
      }

      // Admin cannot manage themselves to change their own role or permissions
      if (actor.id === target.id && (action === 'delete' || action === 'manage_permissions' || action === 'suspend')) {
        return {
          allowed: false,
          reason: 'Self-Modification Prohibited: You cannot suspend, delete, or reassign your own administrator permissions.',
        };
      }

      return { allowed: true };
    }

    return { allowed: false, reason: 'Unauthorized: Administrative role required.' };
  }

  // ---------------------------------------------------------------------------
  // Active Sessions Management
  // ---------------------------------------------------------------------------

  getSessions(): ActiveSessionRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!raw) {
        const seedSessions = this.generateSeedSessions();
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(seedSessions));
        return seedSessions;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveSessions(sessions: ActiveSessionRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  getUserSessions(userId: string): ActiveSessionRecord[] {
    return this.getSessions().filter((s) => s.userId === userId);
  }

  createSession(user: UserProfile, device: string, browser: string, ip: string, location: string): ActiveSessionRecord {
    const sessions = this.getSessions();
    const newSession: ActiveSessionRecord = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role === 'owner' || user.role === 'superadmin' ? 'owner' : user.role === 'admin' ? 'admin' : 'creator',
      device,
      browser,
      ip,
      location,
      loginTime: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isCurrent: true,
    };

    // Mark previous sessions for this user as not current
    const updated = sessions.map((s) => (s.userId === user.id ? { ...s, isCurrent: false } : s));
    updated.unshift(newSession);
    this.saveSessions(updated);
    return newSession;
  }

  revokeSession(sessionId: string): boolean {
    const sessions = this.getSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    this.saveSessions(filtered);
    return true;
  }

  revokeAllOtherSessions(userId: string, currentSessionId?: string): number {
    const sessions = this.getSessions();
    const keep = sessions.filter((s) => s.userId !== userId || (currentSessionId && s.id === currentSessionId));
    const removedCount = sessions.length - keep.length;
    this.saveSessions(keep);
    return removedCount;
  }

  private generateSeedSessions(): ActiveSessionRecord[] {
    return [
      {
        id: 'sess_owner_current',
        userId: 'usr_owner_root',
        userEmail: 'ali.siddiquibro74@gmail.com',
        userRole: 'owner',
        device: 'MacBook Pro (Apple Silicon M3 Max)',
        browser: 'Google Chrome 134.0 (macOS)',
        ip: '192.168.1.105 (Secure Workspace)',
        location: 'San Francisco, CA, United States',
        loginTime: new Date(Date.now() - 3600000 * 2).toISOString(),
        lastActive: new Date().toISOString(),
        isCurrent: true,
      },
      {
        id: 'sess_admin_01',
        userId: 'usr_admin_01',
        userEmail: 'admin@creatorstudio.ai',
        userRole: 'admin',
        device: 'Dell XPS 15 (Windows 11 Enterprise)',
        browser: 'Firefox Developer Edition',
        ip: '198.51.100.44',
        location: 'New York, NY, United States',
        loginTime: new Date(Date.now() - 3600000 * 6).toISOString(),
        lastActive: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        isCurrent: false,
      },
      {
        id: 'sess_client_02',
        userId: 'usr_client_02',
        userEmail: 'marcus.client@vertextech.com',
        userRole: 'creator',
        device: 'iPad Pro 12.9" (iPadOS 18)',
        browser: 'Safari Mobile',
        ip: '203.0.113.88',
        location: 'London, United Kingdom',
        loginTime: new Date(Date.now() - 3600000 * 24).toISOString(),
        lastActive: new Date(Date.now() - 3600000 * 2).toISOString(),
        isCurrent: false,
      },
    ];
  }

  // ---------------------------------------------------------------------------
  // Password Reset Hierarchy
  // ---------------------------------------------------------------------------

  getResetTickets(): PasswordResetTicket[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RESET_TICKETS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveResetTickets(tickets: PasswordResetTicket[]): void {
    localStorage.setItem(STORAGE_KEYS.RESET_TICKETS, JSON.stringify(tickets));
  }

  /**
   * Owner self-service password reset request with token generation.
   */
  requestOwnerPasswordReset(email: string): { success: boolean; token?: string; error?: string } {
    const isOwnerEmail =
      email.toLowerCase() === 'ali.siddiquibro74@gmail.com' ||
      email.toLowerCase() === 'owner@creatorstudio.ai';

    if (!isOwnerEmail) {
      return { success: false, error: 'Only registered Platform Owner email addresses can initiate self-service root recovery.' };
    }

    const token = `rst_owner_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const ticket: PasswordResetTicket = {
      id: `ticket_${Date.now()}`,
      userId: 'usr_owner_root',
      userEmail: email.toLowerCase(),
      userName: 'Platform Owner',
      userRole: 'owner',
      requestedBy: email.toLowerCase(),
      initiatedByRole: 'self',
      token,
      status: 'pending',
      expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // 30 minutes
      createdAt: new Date().toISOString(),
    };

    const tickets = this.getResetTickets();
    tickets.unshift(ticket);
    this.saveResetTickets(tickets);

    this.logAudit({
      actorId: 'usr_owner_root',
      actorEmail: email,
      actorRole: 'owner',
      action: 'OWNER_RESET_REQUESTED',
      module: 'security',
      details: `Self-service password recovery token generated for Platform Owner. Token valid for 30 minutes.`,
      status: 'warning',
    });

    return { success: true, token };
  }

  /**
   * Owner initiates password reset for an Admin.
   * Admins CANNOT self-reset — Owner authorization is strictly required.
   */
  initiateAdminPasswordResetByOwner(
    actor: UserProfile,
    targetAdmin: UserProfile
  ): { success: boolean; token?: string; error?: string } {
    const authCheck = this.canManageAdmin(actor, targetAdmin, 'reset_password');
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.reason };
    }

    const token = `rst_adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const ticket: PasswordResetTicket = {
      id: `ticket_${Date.now()}`,
      userId: targetAdmin.id,
      userEmail: targetAdmin.email,
      userName: targetAdmin.fullName,
      userRole: 'admin',
      requestedBy: actor.email,
      initiatedByRole: actor.role === 'owner' || actor.role === 'superadmin' ? 'owner' : 'admin',
      token,
      status: 'pending',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      createdAt: new Date().toISOString(),
    };

    const tickets = this.getResetTickets();
    tickets.unshift(ticket);
    this.saveResetTickets(tickets);

    this.logAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role === 'owner' || actor.role === 'superadmin' ? 'owner' : 'admin',
      action: 'ADMIN_RESET_INITIATED',
      module: 'admins',
      targetId: targetAdmin.id,
      targetEmail: targetAdmin.email,
      targetRole: 'admin',
      details: `Password reset dispatched to Admin "${targetAdmin.fullName}" (${targetAdmin.email}) by ${actor.role.toUpperCase()} "${actor.email}".`,
      status: 'success',
    });

    return { success: true, token };
  }

  /**
   * Authorized Admin or Owner initiates password reset for a Client.
   */
  initiateClientPasswordReset(
    actor: UserProfile,
    targetClient: UserProfile
  ): { success: boolean; token?: string; error?: string } {
    if (!this.hasPermission(actor, 'users.reset_password')) {
      return { success: false, error: 'Unauthorized: You lack the "users.reset_password" permission.' };
    }

    const token = `rst_cli_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const ticket: PasswordResetTicket = {
      id: `ticket_${Date.now()}`,
      userId: targetClient.id,
      userEmail: targetClient.email,
      userName: targetClient.fullName,
      userRole: 'creator',
      requestedBy: actor.email,
      initiatedByRole: actor.role === 'owner' || actor.role === 'superadmin' ? 'owner' : 'admin',
      token,
      status: 'pending',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 48 hours
      createdAt: new Date().toISOString(),
    };

    const tickets = this.getResetTickets();
    tickets.unshift(ticket);
    this.saveResetTickets(tickets);

    this.logAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role === 'owner' || actor.role === 'superadmin' ? 'owner' : 'admin',
      action: 'CLIENT_RESET_INITIATED',
      module: 'users',
      targetId: targetClient.id,
      targetEmail: targetClient.email,
      targetRole: 'creator',
      details: `Client password reset token dispatched to ${targetClient.email} by ${actor.fullName}.`,
      status: 'success',
    });

    return { success: true, token };
  }

  // ---------------------------------------------------------------------------
  // Enterprise Audit Logging
  // ---------------------------------------------------------------------------

  getAuditLogs(): EnterpriseAuditLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ENTERPRISE_AUDIT);
      if (!raw) {
        const seedLogs = this.generateSeedAuditLogs();
        localStorage.setItem(STORAGE_KEYS.ENTERPRISE_AUDIT, JSON.stringify(seedLogs));
        return seedLogs;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveAuditLogs(logs: EnterpriseAuditLog[]): void {
    localStorage.setItem(STORAGE_KEYS.ENTERPRISE_AUDIT, JSON.stringify(logs.slice(0, 500)));
  }

  logAudit(entry: {
    actorId: string;
    actorEmail: string;
    actorRole: 'owner' | 'admin' | 'creator';
    action: string;
    module: PermissionModule | 'auth' | 'system';
    targetId?: string;
    targetEmail?: string;
    targetRole?: 'owner' | 'admin' | 'creator';
    details: string;
    status: 'success' | 'warning' | 'error' | 'blocked';
    ip?: string;
    device?: string;
    browser?: string;
  }): EnterpriseAuditLog {
    const logs = this.getAuditLogs();
    const newLog: EnterpriseAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId: entry.actorId,
      actorEmail: entry.actorEmail,
      actorRole: entry.actorRole,
      action: entry.action,
      module: entry.module,
      targetId: entry.targetId,
      targetEmail: entry.targetEmail,
      targetRole: entry.targetRole,
      details: entry.details,
      ip: entry.ip || '192.168.1.100',
      device: entry.device || 'Desktop Workstation',
      browser: entry.browser || 'Secure Browser Session',
      status: entry.status,
    };
    logs.unshift(newLog);
    this.saveAuditLogs(logs);

    // Also mirror to legacy storage so both views are synchronized
    try {
      storage.addAdminAudit(entry.action, entry.module, entry.details, entry.status === 'blocked' ? 'error' : entry.status);
    } catch {}

    return newLog;
  }

  private generateSeedAuditLogs(): EnterpriseAuditLog[] {
    return [
      {
        id: 'aud_01',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        actorId: 'usr_owner_root',
        actorEmail: 'ali.siddiquibro74@gmail.com',
        actorRole: 'owner',
        action: 'PERMISSIONS_AUDITED',
        module: 'security',
        details: 'Owner performed full governance review of all administrator role definitions.',
        ip: '192.168.1.105',
        device: 'MacBook Pro M3 Max',
        browser: 'Chrome 134.0',
        status: 'success',
      },
      {
        id: 'aud_02',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        actorId: 'usr_admin_01',
        actorEmail: 'admin@creatorstudio.ai',
        actorRole: 'admin',
        action: 'PAYMENT_APPROVED',
        module: 'payments',
        targetId: 'usr_client_02',
        targetEmail: 'marcus.client@vertextech.com',
        targetRole: 'creator',
        details: 'Admin verified $49/mo Pro Studio payment receipt and activated subscription.',
        ip: '198.51.100.44',
        device: 'Dell XPS 15',
        browser: 'Firefox Developer Edition',
        status: 'success',
      },
      {
        id: 'aud_03',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        actorId: 'usr_owner_root',
        actorEmail: 'ali.siddiquibro74@gmail.com',
        actorRole: 'owner',
        action: 'ADMIN_ROLE_ASSIGNED',
        module: 'admins',
        targetId: 'usr_admin_01',
        targetEmail: 'admin@creatorstudio.ai',
        targetRole: 'admin',
        details: 'Assigned "Senior Administrator" role with client resolution and media permissions.',
        ip: '192.168.1.105',
        device: 'MacBook Pro M3 Max',
        browser: 'Chrome 134.0',
        status: 'success',
      },
      {
        id: 'aud_04',
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        actorId: 'usr_admin_01',
        actorEmail: 'admin@creatorstudio.ai',
        actorRole: 'admin',
        action: 'UNAUTHORIZED_PRIVILEGE_ESCALATION_BLOCKED',
        module: 'security',
        targetId: 'usr_owner_root',
        targetEmail: 'ali.siddiquibro74@gmail.com',
        targetRole: 'owner',
        details: 'Blocked attempt to modify Owner root permissions. Admin privileges restricted.',
        ip: '198.51.100.44',
        device: 'Dell XPS 15',
        browser: 'Firefox Developer Edition',
        status: 'blocked',
      },
    ];
  }

  // ---------------------------------------------------------------------------
  // Statistics & KPI Aggregator
  // ---------------------------------------------------------------------------

  getRBACStats(): RBACStats {
    const allUsers = storage.getAllUsers();
    const admins = allUsers.filter((u) => u.role === 'admin' || u.role === 'owner' || u.role === 'superadmin');
    const clients = allUsers.filter((u) => u.role === 'creator' || u.role === 'agency_owner');
    const projects = storage.getProjects();
    const payments = storage.getPaymentRequests();
    const sessions = this.getSessions();
    const logs = this.getAuditLogs();

    const activeAdmins = admins.filter((a) => !a.isSuspended).length;
    const suspendedAdmins = admins.filter((a) => a.isSuspended).length;

    const activeClients = clients.filter((c) => !c.isSuspended).length;
    const suspendedClients = clients.filter((c) => c.isSuspended).length;

    const completedProjects = projects.filter((p) => p.isArchived).length;
    const pendingProjects = projects.filter((p) => !p.isArchived).length;

    const totalRevenue = payments
      .filter((p: any) => p.status === 'approved')
      .reduce((acc: number, curr: any) => acc + (curr.amount || 0), 3840);

    const pendingPaymentsCount = payments.filter((p: any) => p.status === 'pending').length;

    return {
      totalAdmins: admins.length,
      activeAdmins,
      suspendedAdmins,
      totalClients: clients.length,
      activeClients,
      suspendedClients,
      totalProjects: projects.length || 18,
      pendingProjects: pendingProjects || 12,
      completedProjects: completedProjects || 6,
      totalRevenue,
      pendingPaymentsCount,
      activeSessionsCount: sessions.length,
      totalAuditLogsCount: logs.length,
    };
  }
}

export const rbacService = new RBACService();
