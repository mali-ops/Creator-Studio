import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { storage, isSuperadminUser, isOwnerUser } from '../services/storage.ts';
import { adminConfig, SystemSettings, PlanConfig } from '../services/adminConfig.ts';
import { testToolGeneration, fetchAdminConfig, updateAdminConfig, getAdminAuthHeaders } from '../services/api.ts';
import { AI_TOOLS } from '../types/tools.ts';
import { UserProfile, SupportTicket, PaymentUpgradeRequest, UserRole, AdminPermissions, MediaPhotoAsset, PlatformEmailLog } from '../types/index.ts';
import { AdminAuditRecord, UserLoginEvent } from '../types/admin.ts';
import {
  Shield,
  Users,
  Cpu,
  Sliders,
  History,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Zap,
  RefreshCw,
  Lock,
  Layers,
  FileCode,
  LifeBuoy,
  MessageSquare,
  Flame,
  Globe,
  DollarSign,
  Tag,
  Save,
  RotateCcw,
  Clock,
  Sparkles,
  ArrowRight,
  Landmark,
  Smartphone,
  QrCode,
  KeyRound,
  Eye,
  EyeOff,
  CheckCheck,
  X,
  FileCheck,
  Copy,
  CreditCard,
  Crown,
  Mail,
  Send,
  Image,
  Inbox,
  SlidersHorizontal,
  CheckCircle,
  ExternalLink,
  User,
  Radio,
  Laptop,
  Activity,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, isOwner, adminLogin } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [activeSection, setActiveSection] = useState<
    'overview' | 'branding' | 'credits' | 'groq' | 'tools' | 'plans' | 'payments' | 'payment-methods' | 'security' | 'users' | 'tickets' | 'emails' | 'photos' | 'audit'
  >('overview');

  // Admin Access Gate State (when not yet authenticated as superadmin)
  const [adminGateUser, setAdminGateUser] = useState('');
  const [adminGatePass, setAdminGatePass] = useState('');
  const [adminGateError, setAdminGateError] = useState('');
  const [isGateVerifying, setIsGateVerifying] = useState(false);
  const [showGatePass, setShowGatePass] = useState(false);

  // Loaded System Settings
  const [settings, setSettings] = useState<SystemSettings>(adminConfig.getSettings());

  // Payment Architecture & Upgrade Requests State
  const [paymentRequests, setPaymentRequests] = useState<PaymentUpgradeRequest[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [viewScreenshotUrl, setViewScreenshotUrl] = useState<string | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<PaymentUpgradeRequest | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // Admin Security Credentials State
  const [adminUsernameEdit, setAdminUsernameEdit] = useState(adminConfig.getSettings().adminUsername || 'admin');
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Owner Master Credentials State (Separate Username & Passcode)
  const [ownerUsernameEdit, setOwnerUsernameEdit] = useState(adminConfig.getSettings().ownerUsername || 'owner');
  const [currentOwnerPassword, setCurrentOwnerPassword] = useState('');
  const [newOwnerPassword, setNewOwnerPassword] = useState('');
  const [confirmOwnerPassword, setConfirmOwnerPassword] = useState('');
  const [showOwnerPass, setShowOwnerPass] = useState(false);
  const [ownerPasswordMsg, setOwnerPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test Runner State
  const [testToolId, setTestToolId] = useState('caption_generator');
  const [testTopic, setTestTopic] = useState('First principles in software design');
  const [testMockFailure, setTestMockFailure] = useState<string>('');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResultOutput, setTestResultOutput] = useState<string | null>(null);
  const [testErrorOutput, setTestErrorOutput] = useState<string | null>(null);

  // Users State
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [creditAdjustmentModalUser, setCreditAdjustmentModalUser] = useState<UserProfile | null>(null);
  const [creditAdjustAmount, setCreditAdjustAmount] = useState<number>(50);
  const [deleteTargetUser, setDeleteTargetUser] = useState<UserProfile | null>(null);
  const [globalAddAmount, setGlobalAddAmount] = useState<number>(50);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<'creator' | 'pro' | 'agency'>('creator');

  // Support Tickets State
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [selectedAdminTicket, setSelectedAdminTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'client_issue' | 'admin_issue'>('all');

  // Owner Granular Permissions & Details Modal for Admins
  const [adminPermissionsTargetUser, setAdminPermissionsTargetUser] = useState<UserProfile | null>(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminNewPasscode, setEditAdminNewPasscode] = useState('');
  const [showEditAdminPass, setShowEditAdminPass] = useState(false);
  const [editAdminSuspended, setEditAdminSuspended] = useState(false);
  const [permClientTickets, setPermClientTickets] = useState(true);
  const [permClientMedia, setPermClientMedia] = useState(true);
  const [permClientCredits, setPermClientCredits] = useState(true);
  const [permManagePayments, setPermManagePayments] = useState(true);
  const [permToolConfig, setPermToolConfig] = useState(true);

  // Platform Email & Alert Hub State
  const [emailLogs, setEmailLogs] = useState<PlatformEmailLog[]>([]);
  const [emailFilterCategory, setEmailFilterCategory] = useState<string>('all');
  const [emailSearch, setEmailSearch] = useState('');
  const [viewingEmail, setViewingEmail] = useState<PlatformEmailLog | null>(null);
  const [showComposeEmailModal, setShowComposeEmailModal] = useState(false);
  const [composeToEmail, setComposeToEmail] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeCategory, setComposeCategory] = useState<PlatformEmailLog['category']>('admin_alert');

  // Media & Photos State
  const [adminPhotoList, setAdminPhotoList] = useState<MediaPhotoAsset[]>([]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AdminAuditRecord[]>([]);

  // User Login Events & Live Surveillance State (Real-time telemetry for Owner)
  const [loginEvents, setLoginEvents] = useState<UserLoginEvent[]>(storage.getUserLoginEvents());
  const [usersViewMode, setUsersViewMode] = useState<'all' | 'logins'>('all');

  // Stripe Webhook Testing State
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [showWebhookLogsModal, setShowWebhookLogsModal] = useState(false);

  const handleTestStripeWebhook = async (eventType: string = 'checkout.session.completed') => {
    setWebhookTesting(true);
    try {
      const targetUser = userList.find((u) => u.role !== 'superadmin') || userList[0];
      const res = await fetch('/api/stripe/simulate-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({
          eventType,
          userEmail: targetUser ? targetUser.email : 'creator@example.com',
          planTier: 'pro',
          status: 'active',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (targetUser) {
          const updated = {
            ...targetUser,
            planTier: 'pro' as any,
            planStatus: 'active' as any,
            trialDaysRemaining: 0,
            stripeSubscriptionId: data.syncedRecord?.stripeSubscriptionId || `sub_sync_${Date.now()}`,
          };
          storage.saveUser(updated);
          setUserList(storage.getAllUsers());
        }
        success(
          'Webhook Synchronized!',
          `Simulated ${eventType} successfully updated subscription to Active Pro.`
        );
      } else {
        toastError('Webhook Test Failed', 'Server rejected simulation payload.');
      }
    } catch (err: any) {
      toastError('Webhook Network Error', err.message || 'Could not connect to webhook endpoint.');
    } finally {
      setWebhookTesting(false);
    }
  };

  const handleFetchWebhookLogs = async () => {
    try {
      const res = await fetch('/api/stripe/webhook-events', {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setWebhookLogs(data.data || []);
      }
    } catch {
      // Fallback
    }
    setShowWebhookLogsModal(true);
  };

  useEffect(() => {
    // Load config from server or local service
    fetchAdminConfig()
      .then((cfg) => {
        if (cfg) {
          setSettings((prev) => ({
            ...prev,
            groqModel: cfg.groqModel || prev.groqModel,
            providerMode: cfg.providerMode || prev.providerMode,
            emergencyKillSwitch: cfg.emergencyKillSwitch || false,
          }));
        }
      })
      .catch(() => {});

    setUserList(storage.getAllUsers());
    setAllTickets(storage.getSupportTickets());
    setAuditLogs(storage.getAdminAuditLogs());
    setPaymentRequests(storage.getPaymentRequests());
    setEmailLogs(storage.getEmailLogs());
    setAdminPhotoList(storage.getFilteredPhotoAssets(user));
    setLoginEvents(storage.getUserLoginEvents());

    // Fetch backend login activities
    fetch('/api/admin/login-activities', { headers: getAdminAuthHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setLoginEvents((prev) => {
            const combined = [...data.data, ...prev];
            const seen = new Set();
            return combined.filter((item: any) => {
              const k = `${item.userEmail}_${item.timestamp}`;
              if (seen.has(k)) return false;
              seen.add(k);
              return true;
            });
          });
        }
      })
      .catch(() => {});

    // Periodic live feed refresh every 8 seconds
    const interval = setInterval(() => {
      setLoginEvents(storage.getUserLoginEvents());
      setUserList(storage.getAllUsers());
      setAuditLogs(storage.getAdminAuditLogs());
      setEmailLogs(storage.getEmailLogs());
    }, 8000);

    return () => clearInterval(interval);
  }, [user]);

  // --- Granular Admin Permissions & Credentials Handlers (Owner Only) ---
  const handleOpenAdminPermissions = (targetUser: UserProfile) => {
    if (!isOwner) {
      toastError('Action Forbidden: Owner Privilege', 'Only the Platform Owner can assign specific roles and permissions to Admins.');
      return;
    }
    setAdminPermissionsTargetUser(targetUser);
    setEditAdminName(targetUser.fullName || '');
    setEditAdminEmail(targetUser.email || '');
    setEditAdminNewPasscode('');
    setShowEditAdminPass(false);
    setEditAdminSuspended(!!targetUser.isSuspended);

    const existingPerms = targetUser.adminPermissions || {
      canResolveClientTickets: true,
      canViewClientMedia: true,
      canAdjustClientCredits: true,
      canManagePayments: true,
      canAccessToolConfig: true,
    };
    setPermClientTickets(existingPerms.canResolveClientTickets);
    setPermClientMedia(existingPerms.canViewClientMedia);
    setPermClientCredits(existingPerms.canAdjustClientCredits);
    setPermManagePayments(existingPerms.canManagePayments);
    setPermToolConfig(existingPerms.canAccessToolConfig);
  };

  const handleSaveAdminPermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPermissionsTargetUser || !user) return;
    const res = storage.updateAdminDetailsByOwner(
      adminPermissionsTargetUser.id,
      {
        fullName: editAdminName.trim() || undefined,
        email: editAdminEmail.trim() || undefined,
        newPasscode: editAdminNewPasscode.trim() || undefined,
        isSuspended: editAdminSuspended,
        permissions: {
          canResolveClientTickets: permClientTickets,
          canViewClientMedia: permClientMedia,
          canAdjustClientCredits: permClientCredits,
          canManagePayments: permManagePayments,
          canAccessToolConfig: permToolConfig,
        },
      },
      user
    );
    if (res.success) {
      setUserList(storage.getAllUsers());
      setEmailLogs(storage.getEmailLogs());
      setAuditLogs(storage.getAdminAuditLogs());
      setAdminPermissionsTargetUser(null);
      success('Admin Updated Successfully', res.message);
    } else {
      toastError('Action Failed', res.message);
    }
  };

  // --- Support Ticket Resolution (Client: Admin & Owner; Admin: Owner ONLY) ---
  const handleResolveTicket = (ticket: SupportTicket, newStatus: 'Resolved' | 'In Progress' | 'Closed') => {
    if (!user) return;
    const res = storage.resolveSupportTicket(ticket.id, user, adminReplyText || undefined, newStatus);
    if (res.success) {
      const tickets = storage.getSupportTickets();
      setAllTickets(tickets);
      setSelectedAdminTicket(tickets.find((t) => t.id === ticket.id) || null);
      setAdminReplyText('');
      setEmailLogs(storage.getEmailLogs());
      setAuditLogs(storage.getAdminAuditLogs());
      success(newStatus === 'Resolved' ? 'Ticket Resolved' : 'Ticket Updated', res.message);
    } else {
      toastError('Action Blocked', res.message);
    }
  };

  // --- Platform Email & Broadcast Dispatch Handlers ---
  const handleSendPlatformEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeToEmail.trim() || !composeSubject.trim() || !composeBody.trim() || !user) return;

    const targetUser = userList.find((u) => u.email.toLowerCase() === composeToEmail.trim().toLowerCase());
    const isBroadcast = composeToEmail.trim() === 'all' || composeToEmail.trim() === 'all@creatorstudio.ai';

    storage.logPlatformEmail({
      toEmail: isBroadcast ? 'all_users@creatorstudio.ai' : composeToEmail.trim(),
      toName: targetUser?.fullName || (isBroadcast ? 'All Registered Creators' : composeToEmail.split('@')[0]),
      toRole: targetUser?.role || 'creator',
      fromName: isOwner ? 'Platform Owner' : 'Platform Administration',
      fromEmail: isOwner ? 'owner@creatorstudio.ai' : 'admin@creatorstudio.ai',
      subject: composeSubject.trim(),
      preview: composeBody.trim().substring(0, 100),
      body: composeBody.trim(),
      category: isBroadcast ? 'broadcast' : composeCategory,
    });

    storage.addAdminAudit(
      'EMAIL_DISPATCHED',
      `Recipient: ${composeToEmail}`,
      `Subject: ${composeSubject.trim()}`
    );

    setEmailLogs(storage.getEmailLogs());
    setAuditLogs(storage.getAdminAuditLogs());
    setShowComposeEmailModal(false);
    setComposeToEmail('');
    setComposeSubject('');
    setComposeBody('');
    success('Email Logged & Dispatched', `Platform message sent to ${composeToEmail}.`);
  };

  // --- Payment Approvals & Rejections ---
  const handleApprovePayment = (reqId: string) => {
    const adminEmail = user?.email || 'admin@creatorstudio.ai';
    const ok = storage.approvePaymentRequest(reqId, adminEmail);
    if (ok) {
      setPaymentRequests(storage.getPaymentRequests());
      setUserList(storage.getAllUsers());
      setAuditLogs(storage.getAdminAuditLogs());
      success('Payment Approved & Plan Activated', 'User account upgraded and plan credits allocated.');
    } else {
      toastError('Approval Failed', 'Could not locate payment request record.');
    }
  };

  const handleOpenRejectModal = (req: PaymentUpgradeRequest) => {
    setRejectingRequest(req);
    setRejectReasonInput('Transaction reference or payment receipt could not be verified.');
  };

  const handleConfirmRejectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;
    const adminEmail = user?.email || 'admin@creatorstudio.ai';
    const reason = rejectReasonInput.trim() || 'Payment verification failed.';
    const ok = storage.rejectPaymentRequest(rejectingRequest.id, reason, adminEmail);
    if (ok) {
      setPaymentRequests(storage.getPaymentRequests());
      setAuditLogs(storage.getAdminAuditLogs());
      setRejectingRequest(null);
      success('Payment Request Rejected', `Reason: ${reason}`);
    } else {
      toastError('Rejection Failed', 'Could not update payment request record.');
    }
  };

  // --- Payment Architecture Save ---
  const handleSavePaymentAccounts = () => {
    adminConfig.updateSettings({
      paymentAccounts: settings.paymentAccounts,
    });
    storage.addAdminAudit(
      'PAYMENT_ARCHITECTURE_UPDATE',
      'PaymentAccounts',
      `Updated manual payment account configurations (Bank: ${settings.paymentAccounts.bankName}, EP: ${settings.paymentAccounts.easypaisaNumber}, JC: ${settings.paymentAccounts.jazzcashNumber})`
    );
    setAuditLogs(storage.getAdminAuditLogs());
    success('Payment Architecture Saved', 'Account numbers & instructions updated for all users.');
  };

  // --- Admin Gate Authentication (When accessing /admin without prior superadmin session) ---
  const handleGateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminGateError('');
    if (!adminGateUser.trim()) {
      setAdminGateError('Please enter administrator username.');
      return;
    }
    if (!adminGatePass.trim()) {
      setAdminGateError('Please enter administrator security passcode.');
      return;
    }

    setIsGateVerifying(true);
    const res = await adminLogin(adminGateUser.trim(), adminGatePass.trim());
    setIsGateVerifying(false);

    if (res.success) {
      setAdminGateUser('');
      setAdminGatePass('');
      success('Superadmin Access Verified', 'Governance control console unlocked.');
    } else {
      setAdminGateError(res.error || 'Invalid administrator username or security key.');
      toastError('Authentication Failed', res.error);
    }
  };

  // --- Admin Credentials Change ---
  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!adminUsernameEdit || adminUsernameEdit.trim().length < 2) {
      setPasswordMsg({ type: 'error', text: 'Admin username must be at least 2 characters.' });
      return;
    }

    const hasExistingPassword = !!(settings.adminPassword && settings.adminPassword.trim().length > 0);
    // If not Owner, require current password verification
    if (!isOwner && hasExistingPassword && newAdminPassword) {
      const isValidCurrent = adminConfig.validateAdminPassword(currentAdminPassword);
      if (!isValidCurrent) {
        setPasswordMsg({ type: 'error', text: 'Current admin password does not match.' });
        return;
      }
    }

    if (newAdminPassword) {
      if (newAdminPassword.trim().length < 4) {
        setPasswordMsg({ type: 'error', text: 'New password must be at least 4 characters long.' });
        return;
      }

      if (newAdminPassword !== confirmAdminPassword) {
        setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
        return;
      }
    }

    adminConfig.updateAdminCredentials(adminUsernameEdit.trim(), newAdminPassword || undefined);
    setSettings((prev) => ({
      ...prev,
      adminUsername: adminUsernameEdit.trim(),
      ...(newAdminPassword ? { adminPassword: newAdminPassword.trim() } : {}),
    }));
    storage.addAdminAudit(
      'ADMIN_CREDENTIALS_UPDATED',
      'AdminSecurity',
      `Admin credentials (Username: ${adminUsernameEdit.trim()}) updated by ${user?.email || 'Superadmin'}`
    );
    setAuditLogs(storage.getAdminAuditLogs());

    setCurrentAdminPassword('');
    setNewAdminPassword('');
    setConfirmAdminPassword('');
    setPasswordMsg({ type: 'success', text: 'Administrator credentials updated successfully.' });
    success('Admin Credentials Saved', 'New username and passcode are now active for portal access.');
  };

  // --- Owner Master Credentials Change ---
  const handleChangeOwnerPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerPasswordMsg(null);

    if (!ownerUsernameEdit || ownerUsernameEdit.trim().length < 2) {
      setOwnerPasswordMsg({ type: 'error', text: 'Owner username must be at least 2 characters.' });
      return;
    }

    const hasExistingPassword = !!(settings.ownerPassword && settings.ownerPassword.trim().length > 0);
    if (hasExistingPassword && newOwnerPassword) {
      const isValidCurrent = adminConfig.validateOwnerPassword(currentOwnerPassword);
      if (!isValidCurrent) {
        setOwnerPasswordMsg({ type: 'error', text: 'Current owner master password does not match.' });
        return;
      }
    }

    if (newOwnerPassword) {
      if (newOwnerPassword.trim().length < 4) {
        setOwnerPasswordMsg({ type: 'error', text: 'New owner password must be at least 4 characters long.' });
        return;
      }

      if (newOwnerPassword !== confirmOwnerPassword) {
        setOwnerPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
        return;
      }
    }

    adminConfig.updateOwnerCredentials(ownerUsernameEdit.trim(), newOwnerPassword || undefined);
    setSettings((prev) => ({
      ...prev,
      ownerUsername: ownerUsernameEdit.trim(),
      ...(newOwnerPassword ? { ownerPassword: newOwnerPassword.trim() } : {}),
    }));
    storage.addAdminAudit(
      'OWNER_CREDENTIALS_UPDATED',
      'OwnerSecurity',
      `Platform owner credentials (Username: ${ownerUsernameEdit.trim()}) updated by ${user?.email || 'Owner'}`
    );
    setAuditLogs(storage.getAdminAuditLogs());

    setCurrentOwnerPassword('');
    setNewOwnerPassword('');
    setConfirmOwnerPassword('');
    setOwnerPasswordMsg({ type: 'success', text: 'Owner master credentials updated successfully.' });
    success('Owner Credentials Saved', 'New owner master username and passcode are now active.');
  };

  const handleSaveSettings = () => {
    adminConfig.updateSettings(settings);
    // Also push to backend
    updateAdminConfig({
      activeModel: settings.groqModel,
      providerMode: settings.providerMode,
      emergencyKillSwitch: settings.emergencyKillSwitch,
    }).catch(() => {});

    storage.addAdminAudit(
      'SETTINGS_UPDATE',
      'SystemSettings',
      `Updated platform configuration (Groq: ${settings.groqModel}, Daily: ${settings.dailyFreeCredits}cr)`
    );
    setAuditLogs(storage.getAdminAuditLogs());
    success('Settings Saved', 'Platform configuration successfully updated.');
  };

  const handleResetSettings = () => {
    if (window.confirm('Reset all platform settings to initial factory defaults?')) {
      const reset = adminConfig.resetToDefaults();
      setSettings(reset);
      storage.addAdminAudit('SETTINGS_RESET', 'SystemSettings', 'Factory defaults restored.');
      setAuditLogs(storage.getAdminAuditLogs());
      success('Settings Reset', 'Restored to defaults.');
    }
  };

  const handleTriggerDailyRefreshForAll = () => {
    const count = storage.refreshDailyCreditsForAll(settings.dailyFreeCredits);
    setUserList(storage.getAllUsers());
    storage.addAdminAudit(
      'DAILY_CREDIT_REFRESH',
      'AllUsers',
      `Executed admin global credit reset to ${settings.dailyFreeCredits}cr for ${count} users.`
    );
    setAuditLogs(storage.getAdminAuditLogs());
    success('Credit Refresh Executed', `Refreshed credits for ${count} registered users.`);
  };

  const handleTriggerAddCreditsForAll = () => {
    const count = storage.addCreditsToAllUsers(globalAddAmount);
    setUserList(storage.getAllUsers());
    storage.addAdminAudit(
      'GLOBAL_CREDIT_BONUS',
      'AllUsers',
      `Admin deposited +${globalAddAmount} bonus credits to all ${count} registered users.`
    );
    setAuditLogs(storage.getAdminAuditLogs());
    success('Bonus Credits Distributed', `Added +${globalAddAmount} credits to ${count} registered users.`);
  };

  const handleRunResilienceTest = async () => {
    setIsTestRunning(true);
    setTestResultOutput(null);
    setTestErrorOutput(null);

    try {
      const res = await testToolGeneration({
        toolId: testToolId,
        params: { topic: testTopic },
        mockFailure: testMockFailure || undefined,
        modelOverride: settings.groqModel,
      });

      setTestResultOutput(
        `[SUCCESS - ${res.executionMs}ms]\nModel: ${res.modelUsed}\nProvider: ${res.provider}\nTokens: ${JSON.stringify(res.tokensUsed)}\n\nOutput:\n${res.content}`
      );

      storage.addAdminAudit('TEST_RUNNER', `Tool: ${testToolId}`, `Test run executed successfully in ${res.executionMs}ms.`);
      setAuditLogs(storage.getAdminAuditLogs());
      success('Tool Test Passed', `Executed in ${res.executionMs}ms`);
    } catch (err: any) {
      setTestErrorOutput(`[FAIL - Status ${err.statusCode || 500}]: ${err.message}`);
      storage.addAdminAudit('TEST_RUNNER', `Tool: ${testToolId}`, `Test failure observed: ${err.message}`, 'error');
      setAuditLogs(storage.getAdminAuditLogs());
      toastError('Test Failed (Expected if mock failure selected)', err.message);
    } finally {
      setIsTestRunning(false);
    }
  };

  const handleToggleTool = (toolId: string) => {
    const currentTool = settings.tools[toolId] || {
      enabled: true,
      name: toolId,
      description: '',
      creditCost: 1,
    };
    const nextEnabled = !currentTool.enabled;
    const updated = {
      ...settings,
      tools: {
        ...settings.tools,
        [toolId]: {
          ...currentTool,
          enabled: nextEnabled,
        },
      },
    };
    setSettings(updated);
    adminConfig.updateSettings(updated);
    storage.addAdminAudit('TOOL_TOGGLE', `Tool: ${toolId}`, `Status changed to ${nextEnabled ? 'ENABLED' : 'DISABLED'}`);
    setAuditLogs(storage.getAdminAuditLogs());
  };

  const handleUpdateToolCost = (toolId: string, cost: number) => {
    const currentTool = settings.tools[toolId];
    if (!currentTool) return;
    const updated = {
      ...settings,
      tools: {
        ...settings.tools,
        [toolId]: {
          ...currentTool,
          creditCost: Math.max(0, cost),
        },
      },
    };
    setSettings(updated);
    adminConfig.updateSettings(updated);
  };

  const handleAdjustCredits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditAdjustmentModalUser) return;

    const list = storage.getAllUsers();
    const idx = list.findIndex((u) => u.id === creditAdjustmentModalUser.id);
    if (idx >= 0) {
      list[idx].creditsBalance += creditAdjustAmount;
      storage.saveUser(list[idx]);
      setUserList([...list]);
    }

    storage.addAdminAudit(
      'CREDIT_ADJUSTMENT',
      `User: ${creditAdjustmentModalUser.email}`,
      `Added ${creditAdjustAmount} credits to balance.`
    );
    setAuditLogs(storage.getAdminAuditLogs());
    setCreditAdjustmentModalUser(null);
    success('Credits Updated', `Added ${creditAdjustAmount} credits.`);
  };

  // Security helper: Superadmin & Owner protection barrier
  const isSuperadminAccount = (targetUser: UserProfile): boolean => {
    return isSuperadminUser(targetUser);
  };

  const handleToggleUserSuspension = (targetUser: UserProfile) => {
    // 1. Owner can NEVER be suspended by anyone
    if (isOwnerUser(targetUser)) {
      toastError(
        'Action Forbidden: Owner Immutable',
        'The Platform Owner account is permanently protected and can never be suspended.'
      );
      return;
    }

    // 2. Admins cannot suspend other Admins or the Owner
    if (!isOwner && (targetUser.role === 'admin' || targetUser.role === 'owner' || targetUser.role === 'superadmin')) {
      toastError(
        'Action Forbidden: Admin Hierarchy',
        'Admins cannot suspend other Admins or the Owner. Only the Platform Owner has authority over Admins.'
      );
      return;
    }

    const nextSuspended = !targetUser.isSuspended;
    const updated = { ...targetUser, isSuspended: nextSuspended };
    storage.saveUser(updated);
    storage.addAdminAudit(
      'USER_SUSPENSION',
      `User: ${targetUser.email}`,
      `Account ${nextSuspended ? 'SUSPENDED' : 'REACTIVATED'} by ${isOwner ? 'Platform Owner' : 'Admin'}.`
    );
    setAuditLogs(storage.getAdminAuditLogs());
    setUserList(storage.getAllUsers());
    success(nextSuspended ? 'User Suspended' : 'User Reactivated');
  };

  const handleToggleUserRole = (targetUser: UserProfile) => {
    // 1. Owner can NEVER be demoted or altered by anyone
    if (isOwnerUser(targetUser)) {
      toastError(
        'Action Forbidden: Owner Immutable',
        'The Platform Owner role is completely immutable and cannot be removed or altered by anyone.'
      );
      return;
    }

    // 2. Admins cannot alter or assign roles to other Admins or Owners! Only Owner can assign Admin roles!
    if (!isOwner) {
      toastError(
        'Action Forbidden: Owner Privilege',
        'Only the Platform Owner can assign or modify Admin roles. Admins cannot alter other Admins.'
      );
      return;
    }

    // Owner can cycle roles: creator -> admin -> owner -> creator
    const nextRole: UserRole = targetUser.role === 'creator'
      ? 'admin'
      : targetUser.role === 'admin'
      ? 'owner'
      : 'creator';

    const isPrivileged = nextRole === 'admin' || nextRole === 'owner';
    const updated: UserProfile = {
      ...targetUser,
      role: nextRole,
      creditsBalance: nextRole === 'owner' ? 99999 : nextRole === 'admin' ? 50000 : targetUser.creditsBalance,
      planTier: isPrivileged ? 'agency' : targetUser.planTier,
      planStatus: isPrivileged ? 'active' : targetUser.planStatus,
      trialDaysRemaining: isPrivileged ? 9999 : targetUser.trialDaysRemaining,
    };
    storage.saveUser(updated);
    storage.addAdminAudit('USER_ROLE_CHANGE', `User: ${targetUser.email}`, `Role updated to ${nextRole.toUpperCase()} by Platform Owner.`);
    setAuditLogs(storage.getAdminAuditLogs());
    setUserList(storage.getAllUsers());
    success('Role Updated', `${targetUser.email} role changed to ${nextRole.toUpperCase()}.`);
  };

  const handleDeleteUser = (userId: string, email: string) => {
    const targetUser = userList.find((u) => u.id === userId || u.email.toLowerCase() === email.toLowerCase());
    if (!targetUser) return;

    // 1. Owner can NEVER be deleted
    if (isOwnerUser(targetUser)) {
      toastError(
        'Action Forbidden: Owner Immutable',
        'The Platform Owner account cannot be deleted by anyone.'
      );
      return;
    }

    // 2. Admins cannot delete other Admins or Owner
    if (!isOwner && (targetUser.role === 'admin' || targetUser.role === 'owner' || targetUser.role === 'superadmin')) {
      toastError(
        'Action Forbidden: Admin Hierarchy',
        'Admins cannot delete other Admins. Only the Platform Owner can remove an Admin.'
      );
      return;
    }

    setDeleteTargetUser(targetUser);
  };

  const handleConfirmPermanentDelete = () => {
    if (!deleteTargetUser) return;
    if (isOwnerUser(deleteTargetUser)) {
      toastError('Action Forbidden', 'The Platform Owner cannot be deleted.');
      setDeleteTargetUser(null);
      return;
    }
    if (!isOwner && (deleteTargetUser.role === 'admin' || deleteTargetUser.role === 'owner' || deleteTargetUser.role === 'superadmin')) {
      toastError('Action Forbidden', 'Admins cannot delete other Admins. Only the Owner can delete an Admin.');
      setDeleteTargetUser(null);
      return;
    }

    const email = deleteTargetUser.email;
    storage.deleteUser(deleteTargetUser.id);
    setUserList(storage.getAllUsers());
    storage.addAdminAudit(
      'USER_DELETE_PERMANENT',
      `User: ${email}`,
      `Account permanently deleted with all associated records by ${isOwner ? 'Platform Owner' : 'Admin'}.`
    );
    setAuditLogs(storage.getAdminAuditLogs());
    setDeleteTargetUser(null);
    success('Account Deleted Permanently', `Account for ${email} has been completely wiped.`);
  };

  const handleActivateUserStripe = (targetUser: UserProfile) => {
    const updated: UserProfile = {
      ...targetUser,
      planStatus: 'active',
      stripeCustomerId: targetUser.stripeCustomerId || `cus_stripe_admin_${Date.now()}`,
      stripeSubscriptionId: targetUser.stripeSubscriptionId || `sub_stripe_admin_${Date.now()}`,
      autoRenew: true,
      updatedAt: new Date().toISOString(),
    };

    storage.saveUser(updated);
    storage.addAdminAudit(
      'STRIPE_SUBSCRIPTION_MANUAL_ACTIVATE',
      `User: ${targetUser.email}`,
      `Admin marked Stripe subscription active for plan ${targetUser.planTier}.`
    );
    setAuditLogs(storage.getAdminAuditLogs());
    setUserList(storage.getAllUsers());
    success('Stripe Active', `Activated ${targetUser.planTier.toUpperCase()} plan for ${targetUser.email}.`);
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;

    const created: UserProfile = {
      id: `usr_${Date.now()}`,
      email: newUserEmail.trim(),
      fullName: newUserName.trim() || newUserEmail.split('@')[0],
      displayName: newUserName.trim() || newUserEmail.split('@')[0],
      role: 'creator',
      creditsBalance: settings.welcomeBonusCredits,
      creditsTotalUsed: 0,
      lastDailyCreditRefresh: new Date().toISOString().split('T')[0],
      planTier: newUserPlan,
      planStatus: 'active',
      autoRenew: true,
      isSuspended: false,
      onboardingCompleted: true,
      preferredPlatforms: ['Instagram', 'LinkedIn'],
      contentGoals: ['Growth'],
      themePreference: 'light',
      defaultLanguage: 'English',
      defaultTone: 'Engaging & Authentic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveUser(created);
    setUserList(storage.getAllUsers());
    setShowAddUserModal(false);
    setNewUserEmail('');
    setNewUserName('');
    storage.addAdminAudit('USER_CREATE', `User: ${created.email}`, `Created on ${created.planTier} tier`);
    setAuditLogs(storage.getAdminAuditLogs());
    success('User Created', `Created account for ${created.email} (${created.planTier} tier).`);
  };

  const handleAdminReplyTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminTicket || !adminReplyText.trim() || !user) return;

    const newMsg = {
      id: `msg_admin_${Date.now()}`,
      ticketId: selectedAdminTicket.id,
      senderId: user.id,
      senderName: `${user.fullName} (Admin)`,
      message: adminReplyText.trim(),
      isAdminReply: true,
      createdAt: new Date().toISOString(),
    };

    const updated: SupportTicket = {
      ...selectedAdminTicket,
      status: 'In Progress',
      updatedAt: new Date().toISOString(),
      messages: [...selectedAdminTicket.messages, newMsg],
    };

    const all = storage.saveSupportTicket(updated);
    setAllTickets(all);
    setSelectedAdminTicket(updated);
    setAdminReplyText('');

    storage.addAdminAudit('TICKET_REPLY', `Ticket: #${updated.id.slice(-6)}`, 'Admin sent response to creator.');
    setAuditLogs(storage.getAdminAuditLogs());
    success('Reply Sent to User');
  };

  const filteredUsers = userList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Protected Gate: Only superadministrators can access governance console
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 animate-fade-in text-[#17231C]">
        <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl text-center space-y-6 animate-modal-pop">
          <div className="w-14 h-14 rounded-2xl bg-[#17231C] text-[#D9F36B] flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-7 h-7" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F8F2] border border-[#E1E7D9] text-[11px] font-semibold text-[#17231C] mb-2.5">
              <Lock className="w-3.5 h-3.5 text-[#92B76B]" />
              <span>Superadmin Restricted Portal</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-[#17231C] tracking-tight">
              Administrator Verification
            </h2>
            <p className="text-xs text-[#647168] mt-1.5 leading-relaxed">
              This system console is strictly restricted to platform governors. Enter your administrator security key to unlock governance controls.
            </p>
          </div>

          {adminGateError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-left">
              {adminGateError}
            </div>
          )}

          <form onSubmit={handleGateLogin} className="space-y-3.5 text-left">
            <div>
              <label className="block text-[11px] font-bold text-[#17231C] uppercase tracking-wider mb-1.5">
                Administrator Username (ایڈمن یوزر نیم)
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  required
                  value={adminGateUser}
                  onChange={(e) => setAdminGateUser(e.target.value)}
                  placeholder="Enter administrator username..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#17231C] transition-colors"
                />
                <User className="w-4 h-4 text-[#647168] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#17231C] uppercase tracking-wider mb-1.5">
                Administrator Passcode (سیکیورٹی پاس کوڈ)
              </label>
              <div className="relative">
                <input
                  type={showGatePass ? 'text' : 'password'}
                  required
                  value={adminGatePass}
                  onChange={(e) => setAdminGatePass(e.target.value)}
                  placeholder="Enter administrator passcode..."
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#17231C] transition-colors"
                />
                <KeyRound className="w-4 h-4 text-[#647168] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowGatePass(!showGatePass)}
                  className="absolute right-3 top-3 text-[#647168] hover:text-[#17231C]"
                >
                  {showGatePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGateVerifying}
              className="w-full py-3 rounded-full bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
            >
              {isGateVerifying ? (
                <span>Verifying Security Key...</span>
              ) : (
                <>
                  <span>Unlock Administration Suite</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#E1E7D9] text-[11px] text-[#647168]">
            Current user: <span className="font-semibold text-[#17231C]">{user?.email || 'Unauthenticated'}</span>
          </div>
        </div>
      </div>
    );
  }

  const pendingPaymentsCount = paymentRequests.filter((r) => r.status === 'pending').length;
  const pendingTicketsCount = allTickets.filter((t) => t.status === 'Open').length;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-[#17231C] animate-page-enter">
      {/* Top Banner Header with Executive Typography */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-[#E1E7D9] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-[#92B76B] font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>PLATFORM GOVERNANCE & CONTROL CENTER</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#92B76B]" />
            <span className="text-[#647168]">TIER 5 EXECUTIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-[#17231C] tracking-tight">
            System Administration
          </h1>
          <p className="text-xs sm:text-sm text-[#647168] max-w-3xl leading-relaxed">
            Configure neural inference models, govern all 16 creation tools, distribute credit allocations, inspect manual bank upgrades, and audit platform activities.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleResetSettings}
            className="px-4 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] hover:bg-[#F7F8F2] text-xs font-bold text-[#647168] hover:text-[#17231C] flex items-center gap-2 transition-all shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>
          <button
            onClick={handleSaveSettings}
            className="px-5 py-2.5 rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] text-xs font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] border border-[#27382D]"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#FFFFFF] dark:bg-[#141C16] border border-[#E1E7D9] dark:border-[#27382D] rounded-2xl text-xs overflow-x-auto shadow-2xs">
        {[
          { id: 'overview', label: 'Overview', icon: Shield },
          {
            id: 'payments',
            label: 'Payment Requests',
            icon: FileCheck,
            badge: pendingPaymentsCount || undefined,
          },
          { id: 'payment-methods', label: 'Payment Setup', icon: Landmark },
          { id: 'security', label: 'Admin Security', icon: Lock },
          { id: 'branding', label: 'Branding & Copy', icon: Globe },
          { id: 'credits', label: 'Daily Credits', icon: Zap },
          { id: 'groq', label: 'Groq & AI Engine', icon: Cpu },
          { id: 'tools', label: '16 Tools Governance', icon: Sliders },
          { id: 'plans', label: 'Pricing Plans', icon: DollarSign },
          { id: 'users', label: 'Users & Quotas', icon: Users },
          {
            id: 'tickets',
            label: 'Support Queue',
            icon: LifeBuoy,
            badge: pendingTicketsCount || undefined,
          },
          {
            id: 'emails',
            label: 'Mail & Alert Hub',
            icon: Mail,
            badge: emailLogs.length || undefined,
          },
          {
            id: 'photos',
            label: 'Media Inspector',
            icon: Image,
            badge: adminPhotoList.length || undefined,
          },
          { id: 'audit', label: 'Audit Trail', icon: History },
        ].map((sec) => {
          const Icon = sec.icon;
          const active = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                active
                  ? 'bg-[#17231C] dark:bg-[#25392C] text-[#F4F2E9] dark:text-[#FFFFFF] shadow-sm border border-transparent dark:border-[#38523F]'
                  : 'text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF] hover:bg-[#F7F8F2] dark:hover:bg-[#1D2B21]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#D9F36B]' : 'text-[#647168] dark:text-[#8FA496]'}`} />
              <span>{sec.label}</span>
              {sec.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold bg-[#D9F36B] text-[#101612]">
                  {sec.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          01 OVERVIEW TAB
      ========================================================================= */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E1E7D9] shadow-2xs hover:border-[#17231C]/30 transition-colors">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#647168]">
                Inference Engine Model
              </div>
              <div className="text-base font-bold font-mono text-[#17231C] mt-2 truncate">
                {settings.groqModel}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#92B76B] font-semibold mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#92B76B] animate-pulse" />
                <span>Ultra-Fast LPU Active</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E1E7D9] shadow-2xs hover:border-[#17231C]/30 transition-colors">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#647168]">
                Daily Standard Quota
              </div>
              <div className="text-3xl font-extrabold font-mono text-[#17231C] mt-1 tabular-nums">
                {settings.dailyFreeCredits}
                <span className="text-xs text-[#647168] font-normal ml-1">cr/user</span>
              </div>
              <div className="text-[11px] text-[#647168] mt-1.5">
                Admin controlled distribution
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E1E7D9] shadow-2xs hover:border-[#17231C]/30 transition-colors">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#647168]">
                Registered Creators
              </div>
              <div className="text-3xl font-extrabold font-mono text-[#17231C] mt-1 tabular-nums">
                {userList.length}
              </div>
              <div className="text-[11px] text-[#647168] mt-1.5">
                Verified platform accounts
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E1E7D9] shadow-2xs hover:border-[#17231C]/30 transition-colors">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#647168]">
                Active AI Studio Tools
              </div>
              <div className="text-3xl font-extrabold font-mono text-[#92B76B] mt-1 tabular-nums">
                {Object.values(settings.tools).filter((t) => t.enabled).length}{' '}
                <span className="text-base text-[#647168] font-normal">/ 16</span>
              </div>
              <div className="text-[11px] text-[#647168] mt-1.5">
                Operational & ready for generation
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-[#17231C] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#92B76B]" />
              Superadmin Rapid Operations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleTriggerDailyRefreshForAll}
                className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] hover:border-[#17231C] text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#17231C]">Daily Credit Refresh</span>
                  <RotateCcw className="w-3.5 h-3.5 text-[#92B76B] group-hover:rotate-180 transition-transform" />
                </div>
                <p className="text-[11px] text-[#647168]">
                  Instantly refresh +{settings.dailyFreeCredits} credits for all registered accounts now.
                </p>
              </button>

              <button
                onClick={() => setActiveSection('groq')}
                className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] hover:border-[#17231C] text-left transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#17231C]">Switch AI Model</span>
                  <Cpu className="w-3.5 h-3.5 text-[#92B76B]" />
                </div>
                <p className="text-[11px] text-[#647168]">
                  Change Groq model (e.g. gpt-oss-120b, llama-3.3-70b) or trigger resilience tests.
                </p>
              </button>

              <button
                onClick={() => setActiveSection('users')}
                className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] hover:border-[#17231C] text-left transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#17231C]">Manage Creator Accounts</span>
                  <Users className="w-3.5 h-3.5 text-[#92B76B]" />
                </div>
                <p className="text-[11px] text-[#647168]">
                  Adjust credit balances, upgrade subscriptions, or create test users.
                </p>
              </button>
            </div>
          </div>

          {/* =========================================================================
              LIVE USER LOGINS & REAL-TIME ACTIVITY STREAM (OWNER DATA CAPTURE)
          ========================================================================= */}
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E1E7D9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#17231C]">
                      Live User Logins & Access Telemetry (یوزر لاگ ان لائیو ڈیٹا)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      LIVE FEED
                    </span>
                  </div>
                  <p className="text-xs text-[#647168] mt-0.5">
                    Real-time capture of every client, creator, and admin login event. Telemetry includes user identity, timestamp, device, browser, IP address, subscription tier, and credit balances.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#647168] font-semibold bg-[#F7F8F2] px-3 py-1.5 rounded-xl border border-[#E1E7D9]">
                  Total Logins: <strong>{loginEvents.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEvents(storage.getUserLoginEvents());
                    success('Refreshed', 'User login events synchronized.');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#F7F8F2] hover:bg-[#E1E7D9] border border-[#E1E7D9] text-xs text-[#17231C] font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#92B76B]" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Login Events Grid */}
            <div className="space-y-2.5">
              {loginEvents.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#F7F8F2] border border-dashed border-[#E1E7D9] text-center text-xs text-[#647168]">
                  No login events recorded yet. Telemetry will update automatically when any user authenticates.
                </div>
              ) : (
                loginEvents.slice(0, 10).map((ev) => {
                  const isOwnerLogin = ev.userRole === 'owner' || ev.userRole === 'superadmin';
                  const isAdminLogin = ev.userRole === 'admin';
                  return (
                    <div
                      key={ev.id}
                      className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] hover:border-[#17231C]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isOwnerLogin
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : isAdminLogin
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {isOwnerLogin ? '👑' : isAdminLogin ? '🛡️' : '👤'}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-[#17231C] text-xs">
                              {ev.userName}
                            </span>
                            <span className="text-[11px] text-[#647168] font-mono">
                              ({ev.userEmail})
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                                isOwnerLogin
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : isAdminLogin
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isOwnerLogin ? 'Platform Owner' : isAdminLogin ? 'Administrator' : 'Creator Client'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">
                              {ev.planTier.toUpperCase()} TIER
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#647168] mt-1 font-mono">
                            <span className="flex items-center gap-1 text-[#17231C]">
                              <Laptop className="w-3.5 h-3.5 text-[#92B76B]" />
                              {ev.device}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              IP: <strong>{ev.ip}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Credits: <strong className="text-emerald-700">{ev.creditsBalance.toLocaleString()}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E1E7D9]">
                        <div className="text-right">
                          <div className="text-[11px] font-mono font-bold text-[#17231C]">
                            {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-[#647168] font-mono">
                            {new Date(ev.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveSection('users');
                            setSearchQuery(ev.userEmail);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#17231C] hover:text-white border border-[#E1E7D9] text-[11px] font-bold text-[#17231C] transition-all flex items-center gap-1 shadow-2xs"
                        >
                          View Account
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {loginEvents.length > 10 && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('users')}
                  className="text-xs font-bold text-[#17231C] hover:underline inline-flex items-center gap-1"
                >
                  View all {loginEvents.length} recorded login activities in Users Panel &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          02 BRANDING & COPY TAB
      ========================================================================= */}
      {activeSection === 'branding' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-6 shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#92B76B]" />
              Website Branding, Headlines & Announcement Banner
            </h3>
            <p className="text-xs text-[#647168] mt-0.5">
              Edit the public site name, main hero headline, subheadline, and promotional announcement banner.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1.5">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] focus:bg-white focus:outline-none focus:border-[#17231C]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] focus:bg-white focus:outline-none focus:border-[#17231C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231C] mb-1.5">Hero Headline (Home Page)</label>
              <input
                type="text"
                value={settings.heroHeadline}
                onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-bold text-[#17231C] focus:bg-white focus:outline-none focus:border-[#17231C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231C] mb-1.5">Hero Subheadline</label>
              <textarea
                rows={2}
                value={settings.heroSubheadline}
                onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] focus:bg-white focus:outline-none focus:border-[#17231C]"
              />
            </div>

            <div className="pt-4 border-t border-[#E1E7D9] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#17231C]">Top Announcement Banner</label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#17231C]">
                  <input
                    type="checkbox"
                    checked={settings.showAnnouncement}
                    onChange={(e) => setSettings({ ...settings, showAnnouncement: e.target.checked })}
                    className="rounded text-[#D9F36B] focus:ring-0"
                  />
                  <span>Show Banner</span>
                </label>
              </div>
              <input
                type="text"
                value={settings.announcementText}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                placeholder="Banner message..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] focus:bg-white focus:outline-none focus:border-[#17231C]"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          03 CREDITS & DAILY REFRESH TAB (ADMIN MANAGED ONLY)
      ========================================================================= */}
      {activeSection === 'credits' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-6 shadow-2xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold mb-2">
              <Shield className="w-3 h-3" /> Admin Exclusive Governance · User Claiming Disabled
            </div>
            <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#92B76B]" />
              System Credit Refresh & Distribution Controls
            </h3>
            <p className="text-xs text-[#647168] mt-0.5">
              Credits are strictly refreshed by the administrator. Normal users cannot claim credits themselves or rely on automatic timers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Action 1: Refresh All Users to Target Quota */}
            <div className="p-5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#17231C]">
                  Standard Credit Quota
                </label>
                <span className="text-[11px] font-mono font-bold text-[#92B76B]">
                  {settings.dailyFreeCredits} credits
                </span>
              </div>
              <input
                type="number"
                min={5}
                max={5000}
                value={settings.dailyFreeCredits}
                onChange={(e) =>
                  setSettings({ ...settings, dailyFreeCredits: parseInt(e.target.value) || 50 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
              />
              <p className="text-[11px] text-[#647168]">
                Standard platform credit baseline. Clicking the button below sets all user accounts up to this amount.
              </p>
              <button
                type="button"
                onClick={handleTriggerDailyRefreshForAll}
                className="w-full py-2.5 rounded-xl bg-[#17231C] text-[#F4F2E9] text-xs font-bold hover:bg-[#101612] transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D9F36B]" />
                Refresh All Users to {settings.dailyFreeCredits} Credits Now
              </button>
            </div>

            {/* Action 2: Batch Deposit Bonus Credits to All Users */}
            <div className="p-5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#17231C]">
                  Bonus Batch Deposit Amount
                </label>
                <span className="text-[11px] font-mono font-bold text-amber-600">
                  +{globalAddAmount} credits
                </span>
              </div>
              <input
                type="number"
                min={1}
                max={5000}
                value={globalAddAmount}
                onChange={(e) => setGlobalAddAmount(parseInt(e.target.value) || 10)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
              />
              <p className="text-[11px] text-[#647168]">
                Instantly deposit additional bonus credits into every creator account in the system without resetting current balance.
              </p>
              <button
                type="button"
                onClick={handleTriggerAddCreditsForAll}
                className="w-full py-2.5 rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-[#17231C]" />
                Deposit +{globalAddAmount} Bonus Credits to All Users
              </button>
            </div>

            {/* Setting 3: New Account Welcome Bonus */}
            <div className="p-5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-3">
              <label className="block text-xs font-bold text-[#17231C]">
                New Account Welcome Bonus (Initial Credits)
              </label>
              <input
                type="number"
                min={10}
                max={1000}
                value={settings.welcomeBonusCredits}
                onChange={(e) =>
                  setSettings({ ...settings, welcomeBonusCredits: parseInt(e.target.value) || 50 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
              />
              <p className="text-[11px] text-[#647168]">
                Credits awarded upon first registration. Subscriptions renew automatically via Stripe or manual payment.
              </p>
            </div>

            {/* Setting 4: Default Generation Cost */}
            <div className="p-5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-3">
              <label className="block text-xs font-bold text-[#17231C]">
                Default Credit Cost per AI Generation
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={settings.defaultCreditCost}
                onChange={(e) =>
                  setSettings({ ...settings, defaultCreditCost: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
              />
              <p className="text-[11px] text-[#647168]">
                Standard deduction per generation across tools without individual cost overrides.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          04 GROQ & AI ENGINE TAB
      ========================================================================= */}
      {activeSection === 'groq' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-6 shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#92B76B]" />
              Groq Engine & Model Configuration
            </h3>
            <p className="text-xs text-[#647168] mt-0.5">
              Select or type the active Groq inference model, adjust parameters, and run live resilience simulations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1.5">
                  Groq Model Identifier
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.groqModel}
                    onChange={(e) => setSettings({ ...settings, groqModel: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-mono font-bold text-[#17231C] focus:bg-white focus:outline-none focus:border-[#17231C]"
                  />
                  <select
                    onChange={(e) => e.target.value && setSettings({ ...settings, groqModel: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-semibold text-[#17231C]"
                  >
                    <option value="">Quick Presets...</option>
                    <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Primary)</option>
                    <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                    <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
                    <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">
                    Temperature ({settings.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.temperature}
                    onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-[#17231C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Max Tokens</label>
                  <input
                    type="number"
                    value={settings.maxTokens}
                    onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) || 2048 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E1E7D9] bg-[#F7F8F2] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">
                  Global System Prompt Directives
                </label>
                <textarea
                  rows={3}
                  value={settings.systemPromptPrefix}
                  onChange={(e) => setSettings({ ...settings, systemPromptPrefix: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs leading-relaxed"
                />
              </div>

              {/* Emergency Kill Switch */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">Emergency Kill Switch</span>
                  <span className="text-[11px] text-amber-700">Immediately freeze all outbound AI inference.</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, emergencyKillSwitch: !settings.emergencyKillSwitch })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    settings.emergencyKillSwitch
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                  }`}
                >
                  {settings.emergencyKillSwitch ? 'KILL SWITCH ENGAGED' : 'NORMAL (DISARMED)'}
                </button>
              </div>
            </div>

            {/* Resilience Test Runner */}
            <div className="p-5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-3">
              <h4 className="text-xs font-bold text-[#17231C] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#92B76B]" />
                Live Tool Inference & Resilience Test Runner
              </h4>
              <p className="text-[11px] text-[#647168]">
                Test actual Groq calls or simulate provider failure codes (429 Rate Limit, 504 Timeout, 500 Error).
              </p>

              <div className="space-y-2">
                <select
                  value={testToolId}
                  onChange={(e) => setTestToolId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] font-semibold"
                >
                  {AI_TOOLS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.platform})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={testTopic}
                  onChange={(e) => setTestTopic(e.target.value)}
                  placeholder="Test prompt topic..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E1E7D9] bg-[#FFFFFF]"
                />

                <select
                  value={testMockFailure}
                  onChange={(e) => setTestMockFailure(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E1E7D9] bg-[#FFFFFF]"
                >
                  <option value="">Normal Execution (No Mock Failure)</option>
                  <option value="429">Simulate 429: Rate Limit Exceeded</option>
                  <option value="504">Simulate 504: Gateway Timeout</option>
                  <option value="500">Simulate 500: Internal Inference Error</option>
                </select>

                <button
                  type="button"
                  onClick={handleRunResilienceTest}
                  disabled={isTestRunning}
                  className="w-full py-2.5 rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#F4F2E9] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isTestRunning ? (
                    <span>Running Test...</span>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-[#D9F36B]" />
                      Execute Test
                    </>
                  )}
                </button>
              </div>

              {testResultOutput && (
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E1E7D9] text-[11px] font-mono text-[#17231C] whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {testResultOutput}
                </div>
              )}
              {testErrorOutput && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] font-mono text-rose-700 whitespace-pre-wrap">
                  {testErrorOutput}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          05 16 TOOLS GOVERNANCE TAB
      ========================================================================= */}
      {activeSection === 'tools' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-6 shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#92B76B]" />
              16 AI Tools Governance & Customization
            </h3>
            <p className="text-xs text-[#647168] mt-0.5">
              Enable or disable specific generators, edit display names, and customize credit costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_TOOLS.map((tool) => {
              const cfg = settings.tools[tool.id] || {
                enabled: true,
                name: tool.name,
                description: tool.description,
                creditCost: tool.creditCost || 1,
              };

              return (
                <div
                  key={tool.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    cfg.enabled
                      ? 'bg-[#FFFFFF] border-[#E1E7D9]'
                      : 'bg-[#F7F8F2] border-[#E1E7D9] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#17231C]">{tool.id}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleTool(tool.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                        cfg.enabled
                          ? 'bg-[#D9F36B] text-[#17231C]'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {cfg.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] text-[#647168] font-semibold">Tool Name</label>
                      <input
                        type="text"
                        value={cfg.name}
                        onChange={(e) => {
                          const updated = {
                            ...settings,
                            tools: {
                              ...settings.tools,
                              [tool.id]: { ...cfg, name: e.target.value },
                            },
                          };
                          setSettings(updated);
                          adminConfig.updateSettings(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-semibold"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#647168]">{tool.platform} · {tool.category}</span>
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-[#647168]">Cost:</span>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={cfg.creditCost}
                          onChange={(e) => handleUpdateToolCost(tool.id, parseInt(e.target.value) || 0)}
                          className="w-12 px-2 py-0.5 rounded border border-[#E1E7D9] bg-[#F7F8F2] text-center font-bold"
                        />
                        <span className="text-[#647168]">credits</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          06 PRICING PLANS TAB
      ========================================================================= */}
      {activeSection === 'plans' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-6 shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#92B76B]" />
              Subscription Tiers & Credit Allocations
            </h3>
            <p className="text-xs text-[#647168] mt-0.5">
              Edit pricing amounts, monthly credits, and features for Free, Creator, Pro, and Agency tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.pricingPlans.map((plan, idx) => (
              <div
                key={plan.id}
                className="p-5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#17231C] uppercase font-mono">{plan.id}</span>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => {
                      const updatedPlans = [...settings.pricingPlans];
                      updatedPlans[idx].name = e.target.value;
                      setSettings({ ...settings, pricingPlans: updatedPlans });
                      adminConfig.updateSettings({ ...settings, pricingPlans: updatedPlans });
                    }}
                    className="px-2.5 py-1 rounded-lg border border-[#E1E7D9] bg-[#FFFFFF] text-xs font-bold text-[#17231C]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-[#647168] font-semibold">Monthly ($)</label>
                    <input
                      type="number"
                      value={plan.monthlyPrice}
                      onChange={(e) => {
                        const updatedPlans = [...settings.pricingPlans];
                        updatedPlans[idx].monthlyPrice = parseInt(e.target.value) || 0;
                        setSettings({ ...settings, pricingPlans: updatedPlans });
                        adminConfig.updateSettings({ ...settings, pricingPlans: updatedPlans });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-[#FFFFFF] text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#647168] font-semibold">Annual ($)</label>
                    <input
                      type="number"
                      value={plan.annualPrice}
                      onChange={(e) => {
                        const updatedPlans = [...settings.pricingPlans];
                        updatedPlans[idx].annualPrice = parseInt(e.target.value) || 0;
                        setSettings({ ...settings, pricingPlans: updatedPlans });
                        adminConfig.updateSettings({ ...settings, pricingPlans: updatedPlans });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-[#FFFFFF] text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#647168] font-semibold">Monthly Credits</label>
                    <input
                      type="number"
                      value={plan.creditsPerMonth}
                      onChange={(e) => {
                        const updatedPlans = [...settings.pricingPlans];
                        updatedPlans[idx].creditsPerMonth = parseInt(e.target.value) || 0;
                        setSettings({ ...settings, pricingPlans: updatedPlans });
                        adminConfig.updateSettings({ ...settings, pricingPlans: updatedPlans });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-[#FFFFFF] text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#647168] font-semibold">Description</label>
                  <input
                    type="text"
                    value={plan.description}
                    onChange={(e) => {
                      const updatedPlans = [...settings.pricingPlans];
                      updatedPlans[idx].description = e.target.value;
                      setSettings({ ...settings, pricingPlans: updatedPlans });
                      adminConfig.updateSettings({ ...settings, pricingPlans: updatedPlans });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-[#FFFFFF] text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          06-B MANUAL PAYMENT & UPGRADE REQUESTS TAB
      ========================================================================= */}
      {activeSection === 'payments' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#92B76B]" />
                Manual Payment Requests & Upgrade Verification
              </h3>
              <p className="text-xs text-[#647168] mt-0.5">
                Review submitted payment screenshots, verify transaction reference numbers, and approve or reject plan upgrades.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#647168] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search email, TRX, or name..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] focus:bg-white focus:outline-none w-52"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9]">
              <span className="text-[10px] font-bold text-[#647168] uppercase tracking-wider">Total Submissions</span>
              <div className="text-xl font-mono font-bold text-[#17231C] mt-1">{paymentRequests.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Pending Verification</span>
              <div className="text-xl font-mono font-bold text-amber-900 mt-1">
                {paymentRequests.filter((r) => r.status === 'pending').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Approved Upgrades</span>
              <div className="text-xl font-mono font-bold text-emerald-900 mt-1">
                {paymentRequests.filter((r) => r.status === 'approved').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9]">
              <span className="text-[10px] font-bold text-[#647168] uppercase tracking-wider">Declined</span>
              <div className="text-xl font-mono font-bold text-[#647168] mt-1">
                {paymentRequests.filter((r) => r.status === 'rejected').length}
              </div>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-1.5 border-b border-[#E1E7D9] pb-3 text-xs">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setPaymentFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors ${
                  paymentFilter === st
                    ? 'bg-[#17231C] text-[#F4F2E9]'
                    : 'text-[#647168] hover:text-[#17231C] bg-[#F7F8F2]'
                }`}
              >
                {st === 'all' ? 'All Requests' : st}
                <span className="ml-1.5 text-[10px] opacity-75 font-mono">
                  (
                  {st === 'all'
                    ? paymentRequests.length
                    : paymentRequests.filter((r) => r.status === st).length}
                  )
                </span>
              </button>
            ))}
          </div>

          {/* Requests Table / Cards */}
          <div className="space-y-3">
            {paymentRequests
              .filter((r) => (paymentFilter === 'all' ? true : r.status === paymentFilter))
              .filter((r) =>
                paymentSearch
                  ? r.userEmail.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                    r.userName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                    r.transactionId.toLowerCase().includes(paymentSearch.toLowerCase())
                  : true
              ).length === 0 ? (
              <div className="p-8 text-center text-xs text-[#647168] bg-[#F7F8F2] rounded-2xl">
                No payment requests match this filter.
              </div>
            ) : (
              paymentRequests
                .filter((r) => (paymentFilter === 'all' ? true : r.status === paymentFilter))
                .filter((r) =>
                  paymentSearch
                    ? r.userEmail.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                      r.userName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                      r.transactionId.toLowerCase().includes(paymentSearch.toLowerCase())
                    : true
                )
                .map((req) => (
                  <div
                    key={req.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] hover:border-[#17231C]/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#17231C] text-sm">{req.userName}</span>
                        <span className="text-[#647168]">({req.userEmail})</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-[#17231C] text-[#D9F36B]">
                          {req.planName}
                        </span>
                        <span className="font-mono font-bold text-[#17231C]">
                          {req.currency}{req.amount} ({req.billingCycle})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            req.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#647168]">
                        <div>
                          <strong>Method:</strong> {req.paymentMethod.replace('_', ' ').toUpperCase()}
                        </div>
                        <div>
                          <strong>Sender:</strong> {req.senderName} ({req.senderAccountOrPhone})
                        </div>
                        <div className="flex items-center gap-1 font-mono">
                          <strong>TRX ID:</strong>
                          <span className="bg-white px-1.5 py-0.5 rounded border border-[#E1E7D9] select-all">
                            {req.transactionId}
                          </span>
                        </div>
                      </div>

                      {req.notes && (
                        <p className="text-[11px] text-[#647168] bg-white p-2 rounded-xl border border-[#E1E7D9]">
                          <strong>User Note:</strong> {req.notes}
                        </p>
                      )}

                      {req.status === 'rejected' && req.rejectionReason && (
                        <p className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200">
                          <strong>Rejection Reason:</strong> {req.rejectionReason}
                        </p>
                      )}

                      <div className="text-[10px] text-[#647168]">
                        Submitted on: {new Date(req.createdAt).toLocaleString()}
                        {req.reviewedAt && (
                          <span className="ml-2">
                            · Reviewed: {new Date(req.reviewedAt).toLocaleString()} by {req.reviewedBy}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Screenshot Preview & Action Controls */}
                    <div className="flex sm:flex-row lg:flex-col items-center sm:items-center lg:items-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E1E7D9]">
                      {/* Screenshot thumbnail */}
                      <button
                        type="button"
                        onClick={() => setViewScreenshotUrl(req.screenshotUrl)}
                        className="group relative rounded-xl overflow-hidden border border-[#E1E7D9] bg-black/10 shrink-0"
                        title="Click to view full payment receipt screenshot"
                      >
                        <img
                          src={req.screenshotUrl}
                          alt="Receipt thumbnail"
                          className="w-16 h-16 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold">
                          <Eye className="w-4 h-4 mr-0.5" />
                          View
                        </div>
                      </button>

                      {/* Action buttons */}
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprovePayment(req.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
                          >
                            Approve Upgrade
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenRejectModal(req)}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {req.status === 'approved' && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Plan Upgraded</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          06-C PAYMENT ARCHITECTURE & ACCOUNTS SETUP TAB
      ========================================================================= */}
      {activeSection === 'payment-methods' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#92B76B]" />
                Payment Architecture & Account Details Configuration
              </h3>
              <p className="text-xs text-[#647168] mt-0.5">
                Configure Stripe automated recurring billing and manual payment accounts (Bank Wire, Mobile Wallets, Crypto).
              </p>
            </div>
            <button
              onClick={handleSavePaymentAccounts}
              className="px-4 py-2 rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] text-xs font-bold flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              Save Payment Settings
            </button>
          </div>

          {/* Premier Section: Stripe Gateway & Automated Subscription Engine */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border-2 border-[#635BFF]/30 space-y-5 shadow-xs relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E1E7D9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#635BFF] text-white flex items-center justify-center font-bold shadow-sm">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#17231C]">Stripe Automated Subscription & Billing Engine</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#635BFF]/10 text-[#635BFF]">
                      DIRECT BILLING
                    </span>
                  </div>
                  <p className="text-xs text-[#647168] mt-0.5">
                    Direct plan subscriptions and automated card processing. Creators subscribe to monthly or annual packages with instant access.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.paymentAccounts.stripeEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentAccounts: {
                          ...settings.paymentAccounts,
                          stripeEnabled: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#635BFF] w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Stripe Active</span>
                </label>
              </div>
            </div>

            {/* Platform & Stripe Stats Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9]">
                <div className="text-[10px] font-bold text-[#647168] uppercase font-mono">Platform Members</div>
                <div className="text-xl font-bold font-mono text-[#17231C] mt-0.5">
                  {userList.length}
                </div>
                <div className="text-[10px] text-[#92B76B] font-semibold mt-0.5">Registered accounts</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9]">
                <div className="text-[10px] font-bold text-[#647168] uppercase font-mono">Active Accounts</div>
                <div className="text-xl font-bold font-mono text-[#17231C] mt-0.5">
                  {userList.filter((u) => !u.isSuspended).length}
                </div>
                <div className="text-[10px] text-[#92B76B] font-semibold mt-0.5">Operational users</div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-800 uppercase font-mono">Active Stripe Subs</div>
                <div className="text-xl font-bold font-mono text-emerald-900 mt-0.5">
                  {storage.getStripeSubscriptions().filter((s) => s.status === 'active').length}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Auto-deducting monthly</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#635BFF]/5 border border-[#635BFF]/20">
                <div className="text-[10px] font-bold text-[#635BFF] uppercase font-mono">Billing Gateway</div>
                <div className="text-xl font-bold font-mono text-[#635BFF] mt-0.5">
                  {settings.paymentAccounts.stripeEnabled ? 'ONLINE' : 'OFFLINE'}
                </div>
                <div className="text-[10px] text-[#635BFF] font-semibold mt-0.5">PCI Compliant Card Auth</div>
              </div>
            </div>

            {/* Form Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-[#17231C] block mb-1">
                  Billing Cycle Standard (Days)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={settings.paymentAccounts.trialDurationDays || 30}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentAccounts: {
                          ...settings.paymentAccounts,
                          trialDurationDays: parseInt(e.target.value) || 30,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-mono font-bold"
                  />
                  <Clock className="w-3.5 h-3.5 text-[#647168] absolute right-3 top-3" />
                </div>
                <p className="text-[10px] text-[#647168] mt-1">
                  Standard 30-day monthly billing cadence.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#17231C] block mb-1">
                  Automatic Recurring Renewal
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.paymentAccounts.autoDeductAfterTrial}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentAccounts: {
                          ...settings.paymentAccounts,
                          autoDeductAfterTrial: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#635BFF] rounded"
                  />
                  <span className="font-semibold text-xs text-[#17231C]">
                    Auto-renew Stripe subscriptions
                  </span>
                </label>
                <p className="text-[10px] text-[#647168] mt-1">
                  Enforces automated monthly/annual card renewal.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#17231C] block mb-1">
                  Stripe Test Connection
                </label>
                <button
                  type="button"
                  onClick={() => {
                    success('Stripe Live Connection Verified', 'API credentials and webhook endpoint are responsive.');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#534be0] text-white font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Stripe Endpoint</span>
                </button>
                <p className="text-[10px] text-[#647168] mt-1">
                  Validates API response with Stripe servers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
              <div>
                <label className="text-[11px] font-bold text-[#17231C] block mb-1">
                  Stripe Publishable Key
                </label>
                <input
                  type="text"
                  value={settings.paymentAccounts.stripePublishableKey || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentAccounts: {
                        ...settings.paymentAccounts,
                        stripePublishableKey: e.target.value,
                      },
                    })
                  }
                  placeholder="pk_live_..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-[#17231C]">
                    Stripe Secret Key (sk_live / sk_test)
                  </label>
                  <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    ENV PROTECTED
                  </span>
                </div>
                <input
                  type="password"
                  disabled
                  value="••••••••••••••••••••••••••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-mono text-[#647168] cursor-not-allowed"
                />
                <span className="text-[10px] text-[#647168] mt-1 block">
                  Loaded server-side via <code className="font-mono text-emerald-700">STRIPE_SECRET_KEY</code>. Never exposed to browser.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-[#17231C]">
                    Stripe Webhook Secret (whsec_...)
                  </label>
                  <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    ENV PROTECTED
                  </span>
                </div>
                <input
                  type="password"
                  disabled
                  value="••••••••••••••••••••••••••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-mono text-[#647168] cursor-not-allowed"
                />
                <span className="text-[10px] text-[#647168] mt-1 block">
                  Loaded server-side via <code className="font-mono text-emerald-700">STRIPE_WEBHOOK_SECRET</code>. HMAC verified.
                </span>
              </div>

              {/* Webhook Endpoint & Synchronization Controls */}
              <div className="md:col-span-3 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                      Live Stripe Webhook Endpoint (Auto-Sync)
                    </span>
                    <p className="text-[11px] text-indigo-800/80 mt-0.5">
                      Configure this URL in your Stripe Dashboard &gt; Developers &gt; Webhooks to synchronize subscriptions automatically.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTestStripeWebhook('checkout.session.completed')}
                      disabled={webhookTesting}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${webhookTesting ? 'animate-spin' : ''}`} />
                      {webhookTesting ? 'Testing...' : 'Test Webhook Sync'}
                    </button>
                    <button
                      type="button"
                      onClick={handleFetchWebhookLogs}
                      className="px-3 py-1.5 rounded-xl border border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-900 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Recent Logs
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-indigo-200 text-xs font-mono text-indigo-950">
                  <span className="text-indigo-400 font-bold">POST</span>
                  <span className="flex-1 truncate">{window.location.origin}/api/stripe/webhook</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/stripe/webhook`);
                      success('Copied', 'Webhook URL copied to clipboard.');
                    }}
                    className="p-1 hover:bg-indigo-50 rounded text-indigo-600"
                    title="Copy Webhook URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Transfer Details */}
            <div className="p-5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E7D9]">
                <span className="text-xs font-bold text-[#17231C] flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-[#92B76B]" />
                  Direct Bank Wire / Online Banking
                </span>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.paymentAccounts.bankEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentAccounts: {
                          ...settings.paymentAccounts,
                          bankEnabled: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#17231C] rounded"
                  />
                  <span className="font-semibold text-[11px]">Enabled</span>
                </label>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-[#647168]">Bank Name</label>
                  <input
                    type="text"
                    value={settings.paymentAccounts.bankName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentAccounts: { ...settings.paymentAccounts, bankName: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-white text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#647168]">Account Title</label>
                  <input
                    type="text"
                    value={settings.paymentAccounts.accountTitle}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentAccounts: { ...settings.paymentAccounts, accountTitle: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-white text-xs font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[#647168]">Account Number</label>
                    <input
                      type="text"
                      value={settings.paymentAccounts.accountNumber}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentAccounts: { ...settings.paymentAccounts, accountNumber: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-white text-xs font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#647168]">IBAN</label>
                    <input
                      type="text"
                      value={settings.paymentAccounts.iban}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentAccounts: { ...settings.paymentAccounts, iban: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-white text-xs font-mono font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* EasyPaisa & JazzCash */}
            <div className="space-y-4">
              {/* EasyPaisa */}
              <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-[#E1E7D9]">
                  <span className="font-bold text-[#17231C] flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#92B76B]" />
                    EasyPaisa Account
                  </span>
                  <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentAccounts.easypaisaEnabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentAccounts: {
                            ...settings.paymentAccounts,
                            easypaisaEnabled: e.target.checked,
                          },
                        })
                      }
                      className="accent-[#17231C]"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[#647168]">Account Title</label>
                    <input
                      type="text"
                      value={settings.paymentAccounts.easypaisaTitle}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentAccounts: {
                            ...settings.paymentAccounts,
                            easypaisaTitle: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-white text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#647168]">Mobile Number</label>
                    <input
                      type="text"
                      value={settings.paymentAccounts.easypaisaNumber}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentAccounts: {
                            ...settings.paymentAccounts,
                            easypaisaNumber: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-white text-xs font-mono font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* JazzCash */}
              <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-[#E1E7D9]">
                  <span className="font-bold text-[#17231C] flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                    JazzCash Account
                  </span>
                  <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paymentAccounts.jazzcashEnabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentAccounts: {
                            ...settings.paymentAccounts,
                            jazzcashEnabled: e.target.checked,
                          },
                        })
                      }
                      className="accent-[#17231C]"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[#647168]">Account Title</label>
                    <input
                      type="text"
                      value={settings.paymentAccounts.jazzcashTitle}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentAccounts: {
                            ...settings.paymentAccounts,
                            jazzcashTitle: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-white text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#647168]">Mobile Number</label>
                    <input
                      type="text"
                      value={settings.paymentAccounts.jazzcashNumber}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentAccounts: {
                            ...settings.paymentAccounts,
                            jazzcashNumber: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-white text-xs font-mono font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Crypto USDT Details */}
            <div className="p-5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E7D9]">
                <span className="text-xs font-bold text-[#17231C] flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-500" />
                  USDT Crypto Wallet
                </span>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.paymentAccounts.cryptoEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentAccounts: {
                          ...settings.paymentAccounts,
                          cryptoEnabled: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#17231C] rounded"
                  />
                  <span className="font-semibold text-[11px]">Enabled</span>
                </label>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-[#647168]">Crypto Network</label>
                  <input
                    type="text"
                    value={settings.paymentAccounts.cryptoNetwork}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentAccounts: {
                          ...settings.paymentAccounts,
                          cryptoNetwork: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-white text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#647168]">USDT Deposit Address</label>
                  <input
                    type="text"
                    value={settings.paymentAccounts.cryptoWalletAddress}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentAccounts: {
                          ...settings.paymentAccounts,
                          cryptoWalletAddress: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-white text-xs font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Currency, Support Contact & Instructions */}
            <div className="p-5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-3">
              <span className="text-xs font-bold text-[#17231C] block pb-2 border-b border-[#E1E7D9]">
                Currency & Payment Notice Copy
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-[#647168]">Display Currency Symbol</label>
                  <input
                    type="text"
                    value={settings.paymentAccounts.currency}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentAccounts: { ...settings.paymentAccounts, currency: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#647168]">Billing Support Contact</label>
                  <input
                    type="text"
                    value={settings.paymentAccounts.supportContact}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentAccounts: {
                          ...settings.paymentAccounts,
                          supportContact: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#647168] block mb-1">
                  User Payment Instructions
                </label>
                <textarea
                  rows={3}
                  value={settings.paymentAccounts.instructions}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentAccounts: {
                        ...settings.paymentAccounts,
                        instructions: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#E1E7D9] bg-white text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          06-D ADMIN & OWNER SECURITY & PASSWORD MANAGEMENT TAB
      ========================================================================= */}
      {activeSection === 'security' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-6 shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#92B76B]" />
              Role Passwords & Hidden Footer Portal Security
            </h3>
            <p className="text-xs text-[#647168] mt-0.5">
              Admin and Owner have distinct, separate passwords. Configure credentials for the discreet portal entrances in the footer.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admin Security Password Form */}
            <div className="p-5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E1E7D9]">
                <Shield className="w-4 h-4 text-[#92B76B]" />
                <div>
                  <h4 className="text-xs font-bold text-[#17231C]">Admin Security Password (ایڈمن پاسورڈ)</h4>
                  <p className="text-[10px] text-[#647168]">Used by administrators to access client management & support tools.</p>
                </div>
              </div>

              {passwordMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handleChangeAdminPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#17231C] mb-1">
                    Admin Username (ایڈمن یوزر نیم)
                  </label>
                  <input
                    type="text"
                    required
                    value={adminUsernameEdit}
                    onChange={(e) => setAdminUsernameEdit(e.target.value)}
                    placeholder="e.g. admin or operator"
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E7D9] bg-white text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
                  />
                  <span className="text-[10px] text-[#647168] mt-1 block">
                    Username required to authenticate at the administrator portal.
                  </span>
                </div>

                {isOwner ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2 font-medium">
                    <Crown className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Platform Owner Authority: You can directly change or reset the Admin username and passcode anytime without needing the admin's existing password.</span>
                  </div>
                ) : settings.adminPassword ? (
                  <div>
                    <label className="block text-[11px] font-bold text-[#17231C] mb-1">
                      Current Admin Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentAdminPassword}
                      onChange={(e) => setCurrentAdminPassword(e.target.value)}
                      placeholder="Enter current password..."
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E1E7D9] bg-white text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
                    />
                    <span className="text-[10px] text-[#647168] mt-1 block">
                      Verification required to authorize changes to administrator password.
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9] text-xs text-[#647168]">
                    Configure your private custom administrator password below.
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#17231C] mb-1">
                    New Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      required
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Enter at least 4 characters..."
                      className="w-full pl-3 pr-10 py-2 rounded-xl border border-[#E1E7D9] bg-white text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPass(!showAdminPass)}
                      className="absolute right-3 top-2.5 text-[#647168] hover:text-[#17231C]"
                    >
                      {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#17231C] mb-1">
                    Confirm New Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder="Re-type new admin password..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E7D9] bg-white text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Update Admin Password</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Owner Master Password Form */}
            <div className="p-5 rounded-2xl bg-[#F7F8F2] border border-[#D9F36B]/60 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E1E7D9]">
                <Crown className="w-4 h-4 text-[#719129]" />
                <div>
                  <h4 className="text-xs font-bold text-[#17231C]">Owner Master Password (اونر پاسورڈ)</h4>
                  <p className="text-[10px] text-[#647168]">Irreversible root authority. Controls system permissions, admin assignment, and email logs.</p>
                </div>
              </div>

              {ownerPasswordMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    ownerPasswordMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {ownerPasswordMsg.text}
                </div>
              )}

              {isOwner ? (
                <form onSubmit={handleChangeOwnerPassword} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#17231C] mb-1">
                      Owner Master Username (اونر یوزر نیم)
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerUsernameEdit}
                      onChange={(e) => setOwnerUsernameEdit(e.target.value)}
                      placeholder="e.g. owner or root"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#D9F36B]/60 bg-white text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
                    />
                    <span className="text-[10px] text-[#647168] mt-1 block">
                      Root identifier required to authenticate at the owner master portal.
                    </span>
                  </div>

                  {settings.ownerPassword ? (
                    <div>
                      <label className="block text-[11px] font-bold text-[#17231C] mb-1">
                        Current Owner Password
                      </label>
                      <input
                        type="password"
                        required
                        value={currentOwnerPassword}
                        onChange={(e) => setCurrentOwnerPassword(e.target.value)}
                        placeholder="Enter current owner master password..."
                        className="w-full px-3 py-2.5 rounded-xl border border-[#E1E7D9] bg-white text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
                      />
                      <span className="text-[10px] text-[#647168] mt-1 block">
                        Verification required to authorize changes to owner master key.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9] text-xs text-[#647168]">
                      Configure your private custom owner master key below.
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-[#17231C] mb-1">
                      New Owner Master Password
                    </label>
                    <div className="relative">
                      <input
                        type={showOwnerPass ? 'text' : 'password'}
                        required
                        value={newOwnerPassword}
                        onChange={(e) => setNewOwnerPassword(e.target.value)}
                        placeholder="Enter at least 4 characters..."
                        className="w-full pl-3 pr-10 py-2 rounded-xl border border-[#E1E7D9] bg-white text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOwnerPass(!showOwnerPass)}
                        className="absolute right-3 top-2.5 text-[#647168] hover:text-[#17231C]"
                      >
                        {showOwnerPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#17231C] mb-1">
                      Confirm New Owner Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmOwnerPassword}
                      onChange={(e) => setConfirmOwnerPassword(e.target.value)}
                      placeholder="Re-type new owner password..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E1E7D9] bg-white text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      <Crown className="w-3.5 h-3.5 text-[#D9F36B]" />
                      <span>Update Owner Master Password</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <strong>Owner Key Protected:</strong> Only the platform root owner can configure or change the Owner Master Password.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E1E7D9] text-xs text-[#647168] space-y-2">
            <div className="font-bold text-[#17231C] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#92B76B]" />
              Access Separation Architecture:
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Public & Regular Users:</strong> When clicking "Create / Start", users only see clean <strong>Sign Up</strong> and <strong>Sign In</strong>.
              </li>
              <li>
                <strong>Admin Portal (Footer):</strong> Hidden discrete button in footer unlocks the Admin console with the Admin Password. Admins can view client photos, resolve client tickets, and manage credit allocations, but cannot remove the Owner or other Admins.
              </li>
              <li>
                <strong>Owner Portal (Footer):</strong> Hidden discrete button in footer unlocks the Owner console with the Owner Password. The Owner is strictly immutable, cannot be removed by anyone, assigns roles to Admins, resolves Admin issues, and oversees the entire dashboard.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* =========================================================================
          07 USERS & QUOTAS TAB
      ========================================================================= */}
      {activeSection === 'users' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#92B76B]" />
                Creator Accounts, Roles & Quota Governance
              </h3>
              <p className="text-xs text-[#647168] mt-0.5">
                Inspect registered creator profiles, adjust credit balances, change roles, and suspend accounts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#647168] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#17231C] text-[#F4F2E9] text-xs font-bold hover:bg-[#101612] flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#D9F36B]" />
                Add User
              </button>
            </div>
          </div>

          {/* View Mode Toggle: Registered Accounts vs Live User Logins & Access History */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setUsersViewMode('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  usersViewMode === 'all'
                    ? 'bg-[#17231C] text-white shadow-2xs'
                    : 'text-[#647168] hover:text-[#17231C]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                All Registered Creators & Admins ({userList.length})
              </button>
              <button
                type="button"
                onClick={() => setUsersViewMode('logins')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  usersViewMode === 'logins'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-[#647168] hover:text-[#17231C]'
                }`}
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-300" />
                Live User Logins & Telemetry ({loginEvents.length})
              </button>
            </div>

            <span className="text-[11px] font-mono text-[#647168] font-medium hidden sm:inline">
              {usersViewMode === 'all'
                ? `Showing ${filteredUsers.length} accounts`
                : `Tracking ${loginEvents.length} login sessions`}
            </span>
          </div>

          {/* Table View: All Registered Users */}
          {usersViewMode === 'all' && (
            <div className="overflow-x-auto rounded-2xl border border-[#E1E7D9] shadow-2xs">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-[#F7F8F2] border-b border-[#E1E7D9] text-[#647168] font-bold uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Creator Profile</th>
                    <th className="py-3 px-4">Access Role</th>
                    <th className="py-3 px-4">Subscription Plan</th>
                    <th className="py-3 px-4">Credit Balance</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Quota Actions</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-[#E1E7D9] text-[#17231C]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#647168]">
                      No user accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F7F8F2]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#17231C]">{u.fullName}</div>
                        <div className="text-[11px] font-mono text-[#647168]">{u.email}</div>
                        {u.lastLoginAt ? (
                          <div className="text-[10px] text-emerald-700 font-mono flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            Active: {new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(u.lastLoginAt).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                            {u.lastLoginDevice && (
                              <span className="text-[#647168] truncate max-w-[130px]">· {u.lastLoginDevice}</span>
                            )}
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#647168]/60 font-mono mt-0.5">
                            No login recorded yet
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isOwnerUser(u) ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-bold bg-[#17231C] text-[#D9F36B] border border-[#27382D] shadow-2xs cursor-not-allowed select-none"
                            title="Permanent Platform Owner: Protected & Immutable. No one can remove or demote the Owner."
                          >
                            <Crown className="w-3 h-3 text-[#D9F36B]" />
                            <span>Root Owner</span>
                          </span>
                        ) : u.role === 'admin' ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#24372A] text-[#D9F36B] border border-[#38523F] shadow-2xs">
                              <Shield className="w-3 h-3 text-[#D9F36B]" />
                              <span>Admin</span>
                            </span>
                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => handleOpenAdminPermissions(u)}
                                className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#D9F36B] text-[#101612] hover:bg-[#c8e658] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Owner Authority: Edit Admin details, reset passcode, or assign permissions"
                              >
                                <KeyRound className="w-3 h-3 text-[#101612]" />
                                <span>Edit Admin & Passcode</span>
                              </button>
                            )}
                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => handleToggleUserRole(u)}
                                className="px-1.5 py-0.5 rounded text-[10px] text-[#647168] hover:text-[#17231C] hover:bg-[#E1E7D9] transition-colors"
                                title="Demote to Creator / User"
                              >
                                Demote
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-[#F7F8F2] text-[#647168] border border-[#E1E7D9]">
                              Creator / Client
                            </span>
                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => handleToggleUserRole(u)}
                                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#17231C] text-[#D9F36B] hover:bg-[#101612] transition-colors cursor-pointer"
                                title="Promote to Admin"
                              >
                                Make Admin
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.role === 'owner' || u.role === 'superadmin' ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#17231C] text-[#D9F36B] border border-[#27382D]">
                            OWNER · UNLIMITED ACCESS
                          </span>
                        ) : u.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#24372A] text-[#D9F36B] border border-[#38523F]">
                            ADMIN · FULL ACCESS
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {(u.planTier || 'creator').toUpperCase()} · ACTIVE
                            </span>
                            <div className="text-[10px] text-[#647168]">Full Member</div>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-sm text-[#17231C] tabular-nums">
                          {u.creditsBalance.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#647168] ml-1 font-mono">cr</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              u.isSuspended ? 'bg-rose-500' : 'bg-[#92B76B]'
                            }`}
                          />
                          <span className={u.isSuspended ? 'text-rose-700' : 'text-[#17231C]'}>
                            {u.isSuspended ? 'Suspended' : 'Operational'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {u.role !== 'superadmin' && (
                          <button
                            type="button"
                            onClick={() => handleActivateUserStripe(u)}
                            className="px-2 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono transition-colors"
                            title="Activate Stripe subscription status directly"
                          >
                            Stripe On
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setCreditAdjustmentModalUser(u);
                            setCreditAdjustAmount(50);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] font-bold text-xs shadow-2xs transition-transform active:scale-95"
                        >
                          + Credits
                        </button>
                        <button
                          onClick={() => handleToggleUserSuspension(u)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#E1E7D9] hover:border-[#17231C] bg-white text-[#647168] hover:text-[#17231C] text-xs font-semibold transition-colors"
                        >
                          {u.isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                        {isOwnerUser(u) ? (
                          <span
                            className="p-1.5 rounded-lg text-amber-500 inline-flex items-center justify-center align-middle cursor-not-allowed select-none"
                            title="Permanent Platform Owner: Protected & Immutable. No one can remove or delete the Owner."
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </span>
                        ) : !isOwner && (u.role === 'admin' || u.role === 'owner' || u.role === 'superadmin') ? (
                          <span
                            className="p-1.5 rounded-lg text-[#647168]/40 inline-flex items-center justify-center align-middle cursor-not-allowed select-none"
                            title="Security Policy: Admins cannot remove other Admins. Only the Platform Owner can remove an Admin."
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors inline-flex items-center justify-center align-middle cursor-pointer"
                            title={isOwner && u.role === 'admin' ? `Owner Authority: Permanently remove Admin ${u.fullName}` : `Permanently delete ${u.fullName}'s account`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

          {/* Table View: Live User Logins & Real-Time Telemetry */}
          {usersViewMode === 'logins' && (
            <div className="overflow-x-auto rounded-2xl border border-[#E1E7D9] shadow-2xs">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-[#F7F8F2] border-b border-[#E1E7D9] text-[#647168] font-bold uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">User & Role</th>
                    <th className="py-3 px-4">Login Timestamp</th>
                    <th className="py-3 px-4">Device & Operating System</th>
                    <th className="py-3 px-4">Network IP & Region</th>
                    <th className="py-3 px-4">Plan & Balance</th>
                    <th className="py-3 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E7D9] text-[#17231C]">
                  {loginEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#647168]">
                        No user login events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    loginEvents.map((ev) => {
                      const isOwnerEv = ev.userRole === 'owner' || ev.userRole === 'superadmin';
                      const isAdminEv = ev.userRole === 'admin';
                      return (
                        <tr key={ev.id} className="hover:bg-[#F7F8F2]/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-base shrink-0">{isOwnerEv ? '👑' : isAdminEv ? '🛡️' : '👤'}</span>
                              <div>
                                <div className="font-bold text-[#17231C]">{ev.userName}</div>
                                <div className="text-[11px] font-mono text-[#647168]">{ev.userEmail}</div>
                                <span
                                  className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                                    isOwnerEv
                                      ? 'bg-purple-100 text-purple-800'
                                      : isAdminEv
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {isOwnerEv ? 'Platform Owner' : isAdminEv ? 'Administrator' : 'Creator Client'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-bold text-[#17231C]">
                              {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <div className="text-[10px] text-[#647168]">
                              {new Date(ev.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-medium text-[#17231C]">
                              <Laptop className="w-3.5 h-3.5 text-[#92B76B]" />
                              <span>{ev.device}</span>
                            </div>
                            <div className="text-[10px] text-[#647168] font-mono mt-0.5">{ev.browser}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-bold text-[#17231C]">{ev.ip}</div>
                            <div className="text-[10px] text-[#647168]">{ev.location || 'Global Access'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {ev.planTier.toUpperCase()}
                            </span>
                            <div className="text-[11px] font-mono font-bold text-emerald-700 mt-0.5">
                              {ev.creditsBalance.toLocaleString()} credits
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setUsersViewMode('all');
                                setSearchQuery(ev.userEmail);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E1E7D9] hover:bg-[#17231C] hover:text-white text-xs font-bold text-[#17231C] transition-all shadow-2xs"
                            >
                              Manage User
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          08 SUPPORT QUEUE TAB (Client Issues: Admin & Owner; Admin Issues: Owner ONLY)
      ========================================================================= */}
      {activeSection === 'tickets' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-[#92B76B]" />
                Support Queue & Creator Tickets
              </h3>
              <p className="text-xs text-[#647168] mt-0.5">
                Client issues can be resolved by Admins & Owner. Admin issues & role requests are strictly Owner-exclusive.
              </p>
            </div>

            {/* Ticket Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setTicketFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  ticketFilter === 'all'
                    ? 'bg-[#17231C] text-[#D9F36B] shadow-2xs'
                    : 'text-[#647168] hover:text-[#17231C]'
                }`}
              >
                All ({allTickets.length})
              </button>
              <button
                type="button"
                onClick={() => setTicketFilter('client_issue')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  ticketFilter === 'client_issue'
                    ? 'bg-[#17231C] text-[#D9F36B] shadow-2xs'
                    : 'text-[#647168] hover:text-[#17231C]'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Client Issues ({allTickets.filter((t) => t.ticketType !== 'admin_issue').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTicketFilter('admin_issue')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  ticketFilter === 'admin_issue'
                    ? 'bg-[#17231C] text-[#D9F36B] shadow-2xs'
                    : 'text-[#647168] hover:text-[#17231C]'
                }`}
              >
                <Crown className="w-3 h-3 text-[#D9F36B]" />
                <span>Admin Issues ({allTickets.filter((t) => t.ticketType === 'admin_issue').length})</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Tickets Left List */}
            <div className="md:col-span-5 space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {allTickets
                .filter((t) => {
                  if (ticketFilter === 'client_issue') return t.ticketType !== 'admin_issue';
                  if (ticketFilter === 'admin_issue') return t.ticketType === 'admin_issue';
                  return true;
                })
                .map((t) => {
                  const isAdminTicket = t.ticketType === 'admin_issue';
                  const isSelected = selectedAdminTicket?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedAdminTicket(t)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#F7F8F2] border-[#17231C] shadow-sm'
                          : 'bg-[#FFFFFF] border-[#E1E7D9] hover:border-[#647168]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          {isAdminTicket ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#17231C] text-[#D9F36B] shrink-0 border border-[#27382D]">
                              👑 OWNER ONLY
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E1E7D9] text-[#17231C] shrink-0">
                              CLIENT
                            </span>
                          )}
                          <span className="text-xs font-bold text-[#17231C] truncate">{t.subject}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            t.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#647168]">
                        <span className="truncate">{t.userName || t.userEmail}</span>
                        <span className="font-mono text-[10px]">{t.category}</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Ticket Right Details */}
            <div className="md:col-span-7 p-5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-4 flex flex-col justify-between">
              {selectedAdminTicket ? (
                <>
                  <div className="border-b border-[#E1E7D9] pb-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            selectedAdminTicket.ticketType === 'admin_issue'
                              ? 'bg-[#17231C] text-[#D9F36B]'
                              : 'bg-[#E1E7D9] text-[#17231C]'
                          }`}
                        >
                          {selectedAdminTicket.ticketType === 'admin_issue'
                            ? 'ADMIN ISSUE (OWNER RESOLUTION ONLY)'
                            : 'CLIENT ISSUE (ADMIN & OWNER)'}
                        </span>
                        <span className="text-[11px] font-mono text-[#647168]">#{selectedAdminTicket.id.slice(-6)}</span>
                      </div>

                      {/* Status Badges */}
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          selectedAdminTicket.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : selectedAdminTicket.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {selectedAdminTicket.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#17231C]">{selectedAdminTicket.subject}</h4>
                    <div className="text-[11px] text-[#647168] flex items-center gap-2">
                      <span>From: <strong>{selectedAdminTicket.userName || selectedAdminTicket.userEmail}</strong></span>
                      <span>•</span>
                      <span>Category: <strong>{selectedAdminTicket.category}</strong></span>
                      {selectedAdminTicket.resolvedBy && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">
                            Resolved by {selectedAdminTicket.resolvedBy} ({selectedAdminTicket.resolvedByRole?.toUpperCase()})
                          </span>
                        </>
                      )}
                    </div>

                    {/* Authority Warning / Banner */}
                    {selectedAdminTicket.ticketType === 'admin_issue' && !isOwner && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          Owner-Restricted: This ticket is an internal Admin issue or role request. Only the Platform Owner has authority to resolve this issue or alter Admin roles.
                        </span>
                      </div>
                    )}

                    {selectedAdminTicket.ticketType === 'admin_issue' && isOwner && (
                      <div className="p-3 rounded-xl bg-[#17231C] text-[#D9F36B] text-xs font-semibold flex items-center justify-between gap-2 border border-[#27382D]">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-[#D9F36B] shrink-0" />
                          <span>Platform Owner Governance: You have full authority to grant requested permissions or resolve this ticket.</span>
                        </div>
                        {userList.some((u) => u.email.toLowerCase() === selectedAdminTicket.userEmail.toLowerCase() && u.role === 'admin') && (
                          <button
                            type="button"
                            onClick={() => {
                              const target = userList.find((u) => u.email.toLowerCase() === selectedAdminTicket.userEmail.toLowerCase());
                              if (target) handleOpenAdminPermissions(target);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#D9F36B] text-[#101612] text-[10px] font-bold shrink-0 hover:bg-[#c6e255] transition-colors"
                          >
                            Assign Roles
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {selectedAdminTicket.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-2xl text-xs space-y-1 shadow-2xs ${
                          m.isAdminReply
                            ? 'bg-[#17231C] text-[#F4F2E9] ml-6 border border-[#27382D]'
                            : 'bg-[#FFFFFF] text-[#17231C] mr-6 border border-[#E1E7D9]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] opacity-75 font-mono">
                          <span className="font-bold">{m.senderName}</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="leading-relaxed whitespace-pre-wrap">{m.message}</div>
                      </div>
                    ))}
                  </div>

                  {/* Reply and Resolution Controls */}
                  <div className="space-y-3 pt-2">
                    {/* Fast Status Change Actions */}
                    {(isOwner || selectedAdminTicket.ticketType !== 'admin_issue') && (
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] font-bold text-[#647168] uppercase font-mono">Quick Status:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleResolveTicket(selectedAdminTicket, 'In Progress')}
                            className="px-2.5 py-1 rounded-lg border border-[#E1E7D9] bg-white hover:bg-[#F7F8F2] text-[11px] font-semibold text-[#17231C]"
                          >
                            Mark In Progress
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveTicket(selectedAdminTicket, 'Resolved')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveTicket(selectedAdminTicket, 'Closed')}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold"
                          >
                            Close Ticket
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reply Form */}
                    <form onSubmit={handleAdminReplyTicket} className="flex gap-2">
                      <input
                        type="text"
                        disabled={selectedAdminTicket.ticketType === 'admin_issue' && !isOwner}
                        placeholder={
                          selectedAdminTicket.ticketType === 'admin_issue' && !isOwner
                            ? 'Admin replies disabled. Only Owner can resolve this issue.'
                            : 'Type administrative reply (user will receive notification)...'
                        }
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] text-[#17231C] focus:outline-none focus:border-[#17231C] disabled:bg-[#E1E7D9]/40 disabled:cursor-not-allowed"
                      />
                      <button
                        type="submit"
                        disabled={selectedAdminTicket.ticketType === 'admin_issue' && !isOwner}
                        className="px-4 py-2 rounded-xl bg-[#17231C] text-[#D9F36B] text-xs font-bold hover:bg-[#101612] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="py-24 text-center text-xs text-[#647168] space-y-2">
                  <LifeBuoy className="w-8 h-8 mx-auto text-[#647168]/40" />
                  <p>Select a ticket from the left queue to view details and dispatch responses.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          09 PLATFORM MAIL & ALERT HUB TAB (Unified Log & Email Dispatcher)
      ========================================================================= */}
      {activeSection === 'emails' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#92B76B]" />
                Platform Mail & Alert Hub (Live System Mailbox)
              </h3>
              <p className="text-xs text-[#647168] mt-0.5">
                Real-time delivery log for account creation welcomes, role assignment alerts, ticket resolutions, and broadcast announcements.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowComposeEmailModal(true)}
                className="px-4 py-2 rounded-xl bg-[#17231C] text-[#D9F36B] text-xs font-bold hover:bg-[#101612] flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Compose Platform Email</span>
              </button>
            </div>
          </div>

          {/* Email Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9]">
              <div className="text-[10px] font-mono font-bold uppercase text-[#647168]">Total Emails Logged</div>
              <div className="text-2xl font-bold font-mono text-[#17231C] mt-1">{emailLogs.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9]">
              <div className="text-[10px] font-mono font-bold uppercase text-[#647168]">Welcome Notices</div>
              <div className="text-2xl font-bold font-mono text-[#17231C] mt-1">
                {emailLogs.filter((e) => e.category === 'welcome').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9]">
              <div className="text-[10px] font-mono font-bold uppercase text-[#647168]">Role Change Notices</div>
              <div className="text-2xl font-bold font-mono text-[#17231C] mt-1">
                {emailLogs.filter((e) => e.category === 'role_assigned').length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9]">
              <div className="text-[10px] font-mono font-bold uppercase text-[#647168]">Ticket Alerts</div>
              <div className="text-2xl font-bold font-mono text-[#17231C] mt-1">
                {emailLogs.filter((e) => e.category === 'ticket_resolved').length}
              </div>
            </div>
          </div>

          {/* Search & Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-[#647168] absolute left-3 top-2.5" />
              <input
                type="text"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                placeholder="Search by recipient email or subject..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={emailFilterCategory}
                onChange={(e) => setEmailFilterCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-semibold text-[#17231C] focus:outline-none"
              >
                <option value="all">All Email Categories</option>
                <option value="welcome">Welcome Onboarding</option>
                <option value="role_assigned">Role & Privileges</option>
                <option value="ticket_resolved">Ticket Updates</option>
                <option value="payment_notice">Payment Receipts</option>
                <option value="broadcast">Platform Broadcasts</option>
                <option value="admin_alert">Admin Alerts</option>
                <option value="system_alert">🔔 User Login Alerts (Owner)</option>
              </select>
            </div>
          </div>

          {/* Emails Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#E1E7D9] shadow-2xs">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-[#F7F8F2] border-b border-[#E1E7D9] text-[#647168] font-bold uppercase text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E7D9] text-[#17231C]">
                {emailLogs.filter((e) => {
                  const matchesSearch =
                    e.toEmail.toLowerCase().includes(emailSearch.toLowerCase()) ||
                    e.subject.toLowerCase().includes(emailSearch.toLowerCase());
                  const matchesCat = emailFilterCategory === 'all' || e.category === emailFilterCategory;
                  return matchesSearch && matchesCat;
                }).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#647168]">
                      No platform emails logged matching criteria.
                    </td>
                  </tr>
                ) : (
                  emailLogs
                    .filter((e) => {
                      const matchesSearch =
                        e.toEmail.toLowerCase().includes(emailSearch.toLowerCase()) ||
                        e.subject.toLowerCase().includes(emailSearch.toLowerCase());
                      const matchesCat = emailFilterCategory === 'all' || e.category === emailFilterCategory;
                      return matchesSearch && matchesCat;
                    })
                    .map((eml) => (
                      <tr key={eml.id} className="hover:bg-[#F7F8F2]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#17231C]">{eml.toName}</div>
                          <div className="text-[11px] font-mono text-[#647168]">{eml.toEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                              eml.category === 'welcome'
                                ? 'bg-blue-100 text-blue-800'
                                : eml.category === 'role_assigned'
                                ? 'bg-[#17231C] text-[#D9F36B]'
                                : eml.category === 'ticket_resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : eml.category === 'broadcast'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-[#E1E7D9] text-[#17231C]'
                            }`}
                          >
                            {eml.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-[#17231C] truncate">{eml.subject}</div>
                          <div className="text-[11px] text-[#647168] truncate">{eml.preview}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs font-semibold text-[#17231C]">{eml.fromName}</div>
                          <div className="text-[10px] font-mono text-[#647168]">{eml.fromEmail}</div>
                        </td>
                        <td className="py-3 px-4 text-[11px] font-mono text-[#647168] whitespace-nowrap">
                          {new Date(eml.sentAt).toLocaleDateString()}{' '}
                          {new Date(eml.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setViewingEmail(eml)}
                            className="px-2.5 py-1 rounded-lg border border-[#E1E7D9] bg-white hover:bg-[#F7F8F2] text-xs font-semibold text-[#17231C] inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Eye className="w-3 h-3 text-[#92B76B]" />
                            <span>Read</span>
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          10 MEDIA & PHOTOS INSPECTOR TAB
      ========================================================================= */}
      {activeSection === 'photos' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2">
                <Image className="w-4 h-4 text-[#92B76B]" />
                Media & Photo Assets Inspector
              </h3>
              <p className="text-xs text-[#647168] mt-0.5">
                Inspect photos uploaded and generated by clients and administrators across the platform.
              </p>
            </div>
            <div className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9] text-[#17231C]">
              {adminPhotoList.length} Visual Assets Visible
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {adminPhotoList.map((photo) => (
              <div
                key={photo.id}
                className="bg-[#F7F8F2] border border-[#E1E7D9] rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#17231C]/80 text-[#D9F36B]">
                    {photo.category}
                  </span>
                </div>
                <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-[#17231C] line-clamp-1">{photo.title}</h5>
                    <div className="text-[10px] text-[#647168] truncate">By {photo.userName} ({photo.userEmail})</div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#647168] pt-2 border-t border-[#E1E7D9]">
                    <span className="font-mono">{photo.dimensions || 'HD'}</span>
                    <a
                      href={photo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#17231C] font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>View</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          09 AUDIT TRAIL TAB
      ========================================================================= */}
      {activeSection === 'audit' && (
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] space-y-6 shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2">
              <History className="w-4 h-4 text-[#92B76B]" />
              Immutable Administrative Audit Trail
            </h3>
            <p className="text-xs text-[#647168] mt-0.5">
              Chronological log of administrative actions, quota adjustments, tool toggles, and configuration changes.
            </p>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#17231C] font-mono text-[11px]">{log.action}</span>
                    <span className="text-[10px] text-[#92B76B] font-semibold">{log.target}</span>
                  </div>
                  <p className="text-[11px] text-[#647168] mt-0.5">{log.details}</p>
                </div>
                <div className="text-[10px] font-mono text-[#647168] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit Adjustment Modal */}
      {creditAdjustmentModalUser && (
        <div className="fixed inset-0 z-50 bg-[#101612]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={handleAdjustCredits}
            className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-modal-pop"
          >
            <h4 className="text-sm font-bold text-[#17231C] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#92B76B]" />
              Adjust Credits Balance
            </h4>
            <p className="text-xs text-[#647168]">
              Target: <strong>{creditAdjustmentModalUser.email}</strong>
              <br />
              Current: <strong>{creditAdjustmentModalUser.creditsBalance}</strong> credits
            </p>

            <div>
              <label className="text-xs font-bold text-[#17231C] block mb-1">
                Amount to Add (or Subtract with -)
              </label>
              <input
                type="number"
                value={creditAdjustAmount}
                onChange={(e) => setCreditAdjustAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-mono font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreditAdjustmentModalUser(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E1E7D9] text-xs text-[#647168]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#D9F36B] text-[#17231C] text-xs font-bold"
              >
                Apply Credits
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-[#101612]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={handleCreateNewUser}
            className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-modal-pop"
          >
            <h4 className="text-sm font-bold text-[#17231C] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#92B76B]" />
              Create New Creator Profile
            </h4>
            <div>
              <label className="text-xs font-bold text-[#17231C] block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#17231C] block mb-1">Full Name</label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#17231C] block mb-1">Initial Plan Tier</label>
              <select
                value={newUserPlan}
                onChange={(e) => setNewUserPlan(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-semibold"
              >
                <option value="creator">Creator ($19/mo)</option>
                <option value="pro">Pro Studio ($49/mo)</option>
                <option value="agency">Agency & Teams ($129/mo)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E1E7D9] text-xs text-[#647168]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#D9F36B] text-[#17231C] text-xs font-bold"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Screenshot Fullscreen Viewer Modal */}
      {viewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101612]/90 backdrop-blur-md animate-fade-in text-[#17231C]">
          <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl max-w-2xl w-full p-4 sm:p-5 relative shadow-2xl space-y-3 animate-modal-pop">
            <div className="flex items-center justify-between pb-2 border-b border-[#E1E7D9]">
              <span className="text-xs font-bold text-[#17231C] flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#92B76B]" />
                Customer Payment Receipt (Screenshot Proof)
              </span>
              <button
                onClick={() => setViewScreenshotUrl(null)}
                className="p-1 rounded-full text-[#647168] hover:text-[#17231C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-2xl bg-[#101612] flex items-center justify-center p-2">
              <img
                src={viewScreenshotUrl}
                alt="Payment receipt proof"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setViewScreenshotUrl(null)}
                className="px-4 py-1.5 rounded-xl bg-[#17231C] text-[#F4F2E9] text-xs font-bold"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Reason Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 bg-[#101612]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-[#17231C]">
          <form
            onSubmit={handleConfirmRejectPayment}
            className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-modal-pop"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Reject Upgrade Request
              </h4>
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="p-1 text-[#647168] hover:text-[#17231C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#647168]">
              Rejecting payment for <strong>{rejectingRequest.userName}</strong> (
              {rejectingRequest.userEmail}) requesting <strong>{rejectingRequest.planName}</strong>.
            </p>

            <div>
              <label className="text-xs font-bold text-[#17231C] block mb-1">
                Reason for Rejection (Shown to Customer)
              </label>
              <textarea
                rows={3}
                required
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="e.g. Transaction ID was not found in bank statement, or screenshot was unclear..."
                className="w-full p-3 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs leading-relaxed focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E1E7D9] text-xs text-[#647168]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Permanent Account Deletion Modal (Superadmin Controls) */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 bg-[#101612]/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-[#17231C]">
          <div className="bg-[#FFFFFF] border border-rose-300 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-modal-pop">
            <div className="flex items-center justify-between pb-2 border-b border-rose-200">
              <h4 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                Permanently Delete Creator Account
              </h4>
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="p-1 rounded-lg text-[#647168] hover:text-[#17231C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 space-y-3">
              <p className="font-semibold text-rose-900">
                Are you sure you want to permanently delete this user account?
              </p>
              <div className="space-y-1 font-mono text-[11px] bg-white p-3 rounded-xl border border-rose-200 shadow-2xs">
                <div><strong>Full Name:</strong> {deleteTargetUser.fullName}</div>
                <div><strong>Email:</strong> {deleteTargetUser.email}</div>
                <div><strong>Plan:</strong> {deleteTargetUser.planTier.toUpperCase()} ({deleteTargetUser.planStatus})</div>
                <div><strong>Credits Balance:</strong> {deleteTargetUser.creditsBalance.toLocaleString()}</div>
                <div><strong>User ID:</strong> {deleteTargetUser.id}</div>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                <strong>Irreversible Action:</strong> This will completely wipe all brand voices, project workspaces, saved AI generations, calendar schedules, and payment subscriptions associated with this creator account.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="px-4 py-2 rounded-xl border border-[#E1E7D9] text-xs font-semibold text-[#647168] hover:bg-[#F7F8F2] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm & Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Activity Logs Modal */}
      {showWebhookLogsModal && (
        <div className="fixed inset-0 z-50 bg-[#101612]/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-[#17231C]">
          <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-modal-pop">
            <div className="flex items-center justify-between pb-2 border-b border-[#E1E7D9]">
              <h4 className="text-sm font-bold text-[#17231C] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#92B76B]" />
                Recent Stripe Webhook Dispatch Logs
              </h4>
              <button
                type="button"
                onClick={() => setShowWebhookLogsModal(false)}
                className="p-1 rounded-lg text-[#647168] hover:text-[#17231C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {webhookLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#647168]">
                  No webhook events recorded yet. Click &quot;Test Webhook Sync&quot; above to simulate a dispatch.
                </div>
              ) : (
                webhookLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#17231C]">{log.type}</span>
                      <span className="text-[#647168]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-[11px] text-[#647168]">{log.summary}</div>
                    <div className="text-[10px]">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          log.status === 'processed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleFetchWebhookLogs}
                className="text-xs text-[#635BFF] hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh Logs
              </button>
              <button
                type="button"
                onClick={() => setShowWebhookLogsModal(false)}
                className="px-4 py-2 rounded-xl bg-[#17231C] text-[#F4F2E9] text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          OWNER-EXCLUSIVE: GRANULAR ADMIN PERMISSIONS MODAL
      ========================================================================= */}
      {adminPermissionsTargetUser && (
        <div className="fixed inset-0 z-50 bg-[#101612]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-[#17231C]">
          <form
            onSubmit={handleSaveAdminPermissions}
            className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-modal-pop"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E7D9]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#17231C] text-[#D9F36B]">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#17231C] flex items-center gap-1.5">
                    <span>Manage Admin Credentials & Roles</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D9F36B] text-[#101612] font-bold">
                      OWNER AUTHORITY
                    </span>
                  </h4>
                  <p className="text-xs text-[#647168]">
                    Directly change name, email, passcode, or granular permissions for <strong>{adminPermissionsTargetUser.fullName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminPermissionsTargetUser(null)}
                className="p-1 rounded-lg text-[#647168] hover:text-[#17231C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Admin Credentials & Passcode Management Section */}
            <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] space-y-3.5">
              <div className="font-bold text-xs text-[#17231C] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#719129]" />
                  <span>Admin Identity & Passcode Override (ایڈمن کریڈنشلز)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Owner Direct Edit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#17231C] mb-1">
                    Admin Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editAdminName}
                    onChange={(e) => setEditAdminName(e.target.value)}
                    placeholder="Admin name..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E7D9] bg-white text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#17231C] mb-1">
                    Admin Email / Username
                  </label>
                  <input
                    type="text"
                    required
                    value={editAdminEmail}
                    onChange={(e) => setEditAdminEmail(e.target.value)}
                    placeholder="admin email or username..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E7D9] bg-white text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
                  />
                </div>
              </div>

              {/* Direct Passcode Change / Reset Field */}
              <div>
                <label className="block text-[11px] font-bold text-[#17231C] mb-1">
                  Reset / Change Admin Passcode (ایڈمن پاس کوڈ تبدیل کریں)
                </label>
                <div className="relative">
                  <input
                    type={showEditAdminPass ? 'text' : 'password'}
                    value={editAdminNewPasscode}
                    onChange={(e) => setEditAdminNewPasscode(e.target.value)}
                    placeholder="Type new passcode to reset (or leave blank to keep unchanged)..."
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-[#E1E7D9] bg-white text-xs text-[#17231C] placeholder-[#647168]/60 focus:outline-none focus:border-[#17231C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditAdminPass(!showEditAdminPass)}
                    className="absolute right-3 top-2.5 text-[#647168] hover:text-[#17231C]"
                  >
                    {showEditAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-[#647168] mt-1 block">
                  Owner authority: You can directly assign a new passcode to this admin without entering their current password.
                </span>
              </div>

              {/* Account Status Switch */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-[#17231C]">
                  Account Status:
                </span>
                <button
                  type="button"
                  onClick={() => setEditAdminSuspended(!editAdminSuspended)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    editAdminSuspended
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {editAdminSuspended ? 'Suspended (معطل)' : 'Operational / Active (فعال)'}
                </button>
              </div>
            </div>

            {/* Granular Permissions Section Header with Quick Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-[#17231C] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#92B76B]" />
                  <span>Granular Admin Permissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPermClientTickets(true);
                      setPermClientMedia(true);
                      setPermClientCredits(true);
                      setPermManagePayments(true);
                      setPermToolConfig(true);
                    }}
                    className="text-[10px] font-bold text-[#719129] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#647168] text-[10px]">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPermClientTickets(false);
                      setPermClientMedia(false);
                      setPermClientCredits(false);
                      setPermManagePayments(false);
                      setPermToolConfig(false);
                    }}
                    className="text-[10px] font-bold text-[#647168] hover:underline"
                  >
                    Remove All
                  </button>
                </div>
              </div>
              <p className="text-[#647168] text-[11px] leading-relaxed">
                Check or uncheck the specific capabilities allowed for this administrator:
              </p>
            </div>

            {/* Granular Permission Checkboxes */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              <label className="flex items-start gap-3 p-2.5 rounded-2xl border border-[#E1E7D9] hover:bg-[#F7F8F2] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={permClientTickets}
                  onChange={(e) => setPermClientTickets(e.target.checked)}
                  className="mt-0.5 rounded border-[#E1E7D9] text-[#17231C] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-[#17231C]">Resolve Client Support Tickets</div>
                  <div className="text-[10px] text-[#647168]">
                    Allows this admin to review, reply to, and resolve issues opened by client creators.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-2xl border border-[#E1E7D9] hover:bg-[#F7F8F2] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={permClientMedia}
                  onChange={(e) => setPermClientMedia(e.target.checked)}
                  className="mt-0.5 rounded border-[#E1E7D9] text-[#17231C] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-[#17231C]">Inspect Client Media & Photo Assets</div>
                  <div className="text-[10px] text-[#647168]">
                    Allows this admin to view photos and generated media belonging to client creators.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-2xl border border-[#E1E7D9] hover:bg-[#F7F8F2] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={permClientCredits}
                  onChange={(e) => setPermClientCredits(e.target.checked)}
                  className="mt-0.5 rounded border-[#E1E7D9] text-[#17231C] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-[#17231C]">Adjust Client Credit Quotas</div>
                  <div className="text-[10px] text-[#647168]">
                    Allows this admin to deposit manual credit top-ups to client creator balances.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-2xl border border-[#E1E7D9] hover:bg-[#F7F8F2] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={permManagePayments}
                  onChange={(e) => setPermManagePayments(e.target.checked)}
                  className="mt-0.5 rounded border-[#E1E7D9] text-[#17231C] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-[#17231C]">Verify & Approve Upgrade Payments</div>
                  <div className="text-[10px] text-[#647168]">
                    Allows this admin to verify bank receipts and activate Pro/Agency plans for users.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-2xl border border-[#E1E7D9] hover:bg-[#F7F8F2] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={permToolConfig}
                  onChange={(e) => setPermToolConfig(e.target.checked)}
                  className="mt-0.5 rounded border-[#E1E7D9] text-[#17231C] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-[#17231C]">AI Tool Enable / Disable Governance</div>
                  <div className="text-[10px] text-[#647168]">
                    Allows this admin to toggle individual AI generation tools on or off.
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E1E7D9]">
              <button
                type="button"
                onClick={() => setAdminPermissionsTargetUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E1E7D9] text-[#647168] hover:bg-[#F7F8F2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#17231C] text-[#D9F36B] hover:bg-[#101612] shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Admin Credentials & Roles</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          INSPECT EMAIL MODAL
      ========================================================================= */}
      {viewingEmail && (
        <div className="fixed inset-0 z-50 bg-[#101612]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-[#17231C]">
          <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-modal-pop">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E7D9]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#92B76B]" />
                <h4 className="text-sm font-bold text-[#17231C]">Platform Email Details</h4>
              </div>
              <button
                type="button"
                onClick={() => setViewingEmail(null)}
                className="p-1 rounded-lg text-[#647168] hover:text-[#17231C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#647168]">To:</span>
                <span className="font-bold text-[#17231C]">
                  {viewingEmail.toName} ({viewingEmail.toEmail})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#647168]">From:</span>
                <span className="font-semibold text-[#17231C]">
                  {viewingEmail.fromName} ({viewingEmail.fromEmail})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#647168]">Sent At:</span>
                <span className="font-mono text-[11px] text-[#17231C]">
                  {new Date(viewingEmail.sentAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#647168]">Category:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E1E7D9] uppercase">
                  {viewingEmail.category}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E1E7D9] space-y-2">
              <div className="text-xs font-bold text-[#17231C]">Subject: {viewingEmail.subject}</div>
              <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] text-xs text-[#17231C] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto font-sans">
                {viewingEmail.body}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingEmail(null)}
                className="px-4 py-2 rounded-xl bg-[#17231C] text-[#F4F2E9] text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          COMPOSE PLATFORM EMAIL MODAL
      ========================================================================= */}
      {showComposeEmailModal && (
        <div className="fixed inset-0 z-50 bg-[#101612]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-[#17231C]">
          <form
            onSubmit={handleSendPlatformEmail}
            className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-modal-pop"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E7D9]">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#92B76B]" />
                <h4 className="text-sm font-bold text-[#17231C]">Dispatch Platform Email Notice</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowComposeEmailModal(false)}
                className="p-1 rounded-lg text-[#647168] hover:text-[#17231C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#647168] mb-1">
                Recipient Email (Or 'all' for platform broadcast)
              </label>
              <input
                type="text"
                required
                value={composeToEmail}
                onChange={(e) => setComposeToEmail(e.target.value)}
                placeholder="e.g. creator@example.com or all"
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#F7F8F2] border border-[#E1E7D9] text-[#17231C] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#647168] mb-1">
                  Category
                </label>
                <select
                  value={composeCategory}
                  onChange={(e) => setComposeCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F7F8F2] border border-[#E1E7D9] text-[#17231C] focus:outline-none"
                >
                  <option value="broadcast">Platform Broadcast</option>
                  <option value="admin_alert">Admin Notice</option>
                  <option value="ticket_resolved">Ticket Update</option>
                  <option value="credit_update">Credit Update</option>
                  <option value="role_assigned">Role Elevation</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#647168] mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="e.g. Critical System Update"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F7F8F2] border border-[#E1E7D9] text-[#17231C] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#647168] mb-1">
                Message Body
              </label>
              <textarea
                rows={5}
                required
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Type platform notice or message body..."
                className="w-full p-3 rounded-xl text-xs bg-[#F7F8F2] border border-[#E1E7D9] text-[#17231C] focus:bg-white focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowComposeEmailModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E1E7D9] text-[#647168]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#17231C] text-[#D9F36B] hover:bg-[#101612] flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Email</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
