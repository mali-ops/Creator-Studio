import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole, StripeSubscriptionRecord } from '../types/index.ts';
import { storage, DEFAULT_USER, isSuperadminUser, getClientDeviceInfo } from '../services/storage.ts';
import { adminConfig } from '../services/adminConfig.ts';
import { rbacService } from '../services/rbacService.ts';
import { hashPassword, verifyPassword } from '../services/securityUtils.ts';
import { requestAdminSessionToken } from '../services/api.ts';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isLoading: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  trialDaysLeft: number;
  login: (
    email: string,
    password?: string,
    role?: UserRole
  ) => Promise<{ success: boolean; error?: string; role?: UserRole; targetTab?: string }>;
  register: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (arg1: string, arg2?: string) => Promise<{ success: boolean; error?: string }>;
  ownerLogin: (arg1: string, arg2?: string) => Promise<{ success: boolean; error?: string }>;
  quickDemoLogin: (role?: 'creator' | 'admin' | 'owner' | 'superadmin') => Promise<{ success: boolean }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => UserProfile;
  deleteAccount: (userId?: string) => { success: boolean; message: string };
  completeOnboarding: (onboardingData: Partial<UserProfile>) => void;
  deductCredits: (amount: number) => boolean;
  addCredits: (amount: number) => void;
  toggleAdminRole: () => void;
  refreshDailyCreditsNow: () => { refreshed: boolean; amount: number };
  subscribeWithStripe: (
    planId: 'creator' | 'pro' | 'agency',
    billingCycle?: 'monthly' | 'annual',
    cardBrand?: string,
    cardLast4?: string
  ) => Promise<{ success: boolean; error?: string }>;
  cancelSubscription: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Client sessions do not auto-refresh credits - credits are only refreshed by admin
  const checkDailyCreditRefresh = useCallback((currentUser: UserProfile): UserProfile => {
    return currentUser;
  }, []);

  const calculateTrialStatus = useCallback((currentUser: UserProfile): UserProfile => {
    // Free trial system removed: all user accounts are fully active
    return { ...currentUser, planStatus: 'active', trialDaysRemaining: 9999 };
  }, []);

  useEffect(() => {
    // Check if there is an active session
    const hasSession = storage.hasActiveSession();
    if (hasSession) {
      const saved = storage.getUser();
      const withTrial = calculateTrialStatus(saved);
      const refreshed = checkDailyCreditRefresh(withTrial);
      setUser(refreshed);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [checkDailyCreditRefresh, calculateTrialStatus]);

  const notifyOwnerOfUserLogin = (loggedUser: UserProfile, isNewRegistration: boolean = false) => {
    try {
      const deviceInfo = getClientDeviceInfo();

      // 1. Record structured Login Event in storage for the Owner
      storage.logUserLogin({
        userId: loggedUser.id,
        userEmail: loggedUser.email,
        userName: loggedUser.fullName || loggedUser.displayName || loggedUser.email.split('@')[0],
        userRole: loggedUser.role,
        ip: '192.168.1.100 (Client Access)',
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        location: loggedUser.country || 'Global Access',
        planTier: loggedUser.planTier || 'pro',
        creditsBalance: loggedUser.creditsBalance || 2000,
        status: 'success',
      });

      // 2. Register Active Session in RBAC service
      rbacService.createSession(
        loggedUser,
        deviceInfo.device,
        deviceInfo.browser,
        '192.168.1.100',
        loggedUser.country || 'Global Client'
      );

      // 3. Deliver automated real-time Login Alert to the Platform Owner (Ali Siddiqui)
      storage.logPlatformEmail({
        toEmail: 'ali.siddiquibro74@gmail.com',
        toName: 'Platform Owner (Ali Siddiqui)',
        toRole: 'owner',
        fromName: 'Security & Access Sentinel',
        fromEmail: 'security@creatorstudio.ai',
        subject: `🔔 [User Login Alert] ${loggedUser.fullName} (${loggedUser.email}) ${isNewRegistration ? 'registered & logged in' : 'logged in'}`,
        preview: `${loggedUser.fullName} (${loggedUser.role.toUpperCase()}) authenticated from ${deviceInfo.device} at ${new Date().toLocaleTimeString()}. Plan: ${loggedUser.planTier.toUpperCase()}, Credits: ${loggedUser.creditsBalance}.`,
        body: `Dear Platform Owner (Ali Siddiqui),\n\nA user has successfully authenticated and entered the platform:\n\n• User Name: ${loggedUser.fullName}\n• User Email: ${loggedUser.email}\n• System Role: ${loggedUser.role.toUpperCase()}\n• Login Timestamp: ${new Date().toLocaleString()}\n• Access Device: ${deviceInfo.device}\n• Browser: ${deviceInfo.browser}\n• Subscription Tier: ${loggedUser.planTier.toUpperCase()} (${loggedUser.planStatus})\n• Available Credits: ${loggedUser.creditsBalance.toLocaleString()}\n• Account ID: ${loggedUser.id}\n• Event Type: ${isNewRegistration ? 'New Account Registration' : 'Existing User Login'}\n\nThis activity has been permanently logged in your Owner Control Center under "Live User Logins" and "Audit Trail".`,
        category: 'admin_alert',
      });

      // 4. Synchronize login event with server backend
      fetch('/api/audit/login-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: loggedUser.id,
          userEmail: loggedUser.email,
          userName: loggedUser.fullName,
          userRole: loggedUser.role,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          planTier: loggedUser.planTier,
          creditsBalance: loggedUser.creditsBalance,
          isNewRegistration,
        }),
      }).catch(() => {});
    } catch (e) {
      console.warn('Login telemetry tracking warning:', e);
    }
  };

  const login = async (
    emailOrUsername: string,
    password?: string,
    requestedRole?: UserRole
  ): Promise<{ success: boolean; error?: string; role?: UserRole; targetTab?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    const identifier = (emailOrUsername || '').trim();
    const pass = (password || '').trim();

    if (!identifier) {
      setIsLoading(false);
      return { success: false, error: 'Please enter your username or email address.' };
    }

    if (!pass) {
      setIsLoading(false);
      return { success: false, error: 'Please enter your password or passcode.' };
    }

    // 1. Direct Platform Owner credential verification (Username or Email + Owner Passcode)
    if (adminConfig.validateOwnerCredentials(identifier, pass)) {
      await requestAdminSessionToken(identifier, pass);
      const ownerRes = await ownerLogin(identifier, pass);
      setIsLoading(false);
      if (ownerRes.success) {
        return { success: true, role: 'owner', targetTab: 'admin' };
      }
    }

    // 2. Direct Administrator credential verification (Username or Email + Admin Passcode)
    if (adminConfig.validateAdminCredentials(identifier, pass)) {
      await requestAdminSessionToken(identifier, pass);
      const adminRes = await adminLogin(identifier, pass);
      setIsLoading(false);
      if (adminRes.success) {
        return { success: true, role: 'admin', targetTab: 'admin' };
      }
    }

    // 3. Check registered users in storage
    const allUsers = storage.getAllUsers();
    let existingUser = allUsers.find(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        (u.displayName && u.displayName.toLowerCase() === identifier.toLowerCase()) ||
        (u.fullName && u.fullName.toLowerCase() === identifier.toLowerCase())
    );

    // If an owner or admin user profile matched
    if (existingUser && (existingUser.role === 'owner' || existingUser.role === 'admin' || existingUser.role === 'superadmin')) {
      const isOwnerAcc = existingUser.role === 'owner' || existingUser.role === 'superadmin';
      // Strict verification - no arbitrary password length bypass
      const validOwner = adminConfig.validateOwnerPassword(pass);
      const validAdmin = adminConfig.validateAdminPassword(pass);

      if ((isOwnerAcc && validOwner) || (!isOwnerAcc && validAdmin)) {
        if (existingUser.isSuspended) {
          setIsLoading(false);
          return { success: false, error: 'Administrator account is suspended. Contact Platform Owner.' };
        }
        await requestAdminSessionToken(identifier, pass);
        storage.setActiveSession(true);
        storage.setUser(existingUser);
        setUser(existingUser);
        setIsLoading(false);
        return { success: true, role: existingUser.role, targetTab: 'admin' };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Access Denied: Invalid administrative passcode.' };
      }
    }

    // 4. Standard Client Login & Strict Password Verification
    if (!existingUser) {
      // Must be a valid email or recognizable username
      if (!identifier.includes('@') && !identifier.toLowerCase().startsWith('client')) {
        setIsLoading(false);
        return {
          success: false,
          error: 'Account not found. Please register or enter a valid email address.',
        };
      }

      // Self-provisioned client account
      const hashed = await hashPassword(pass);
      const newClientUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email: identifier.includes('@') ? identifier.toLowerCase() : `${identifier.toLowerCase()}@creatorstudio.ai`,
        fullName: identifier.split('@')[0],
        displayName: identifier.split('@')[0],
        role: 'creator', // Strictly creator role to prevent privilege escalation
        creditsBalance: 2000,
        creditsTotalUsed: 0,
        lastDailyCreditRefresh: new Date().toISOString().split('T')[0],
        planTier: 'pro',
        planStatus: 'active',
        autoRenew: true,
        isSuspended: false,
        onboardingCompleted: true,
        preferredPlatforms: ['Instagram', 'LinkedIn', 'YouTube', 'TikTok'],
        contentGoals: ['Audience Growth'],
        themePreference: 'light',
        defaultLanguage: 'English',
        defaultTone: 'Engaging & Authentic',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.saveUser(newClientUser);
      storage.saveUserPasswordHash(newClientUser.id, newClientUser.email, hashed);
      existingUser = newClientUser;
    } else {
      // Verify password against stored salted hash
      const storedHash =
        storage.getUserPasswordHash(existingUser.id) ||
        storage.getUserPasswordHash(existingUser.email);

      if (storedHash) {
        const isMatch = await verifyPassword(pass, storedHash);
        if (!isMatch) {
          setIsLoading(false);
          return { success: false, error: 'Incorrect password. Please verify your credentials and try again.' };
        }
      } else {
        // First login of demo/seed user: secure and record candidate password hash
        const hashed = await hashPassword(pass);
        storage.saveUserPasswordHash(existingUser.id, existingUser.email, hashed);
      }
    }

    if (existingUser.isSuspended) {
      setIsLoading(false);
      return { success: false, error: 'Account is temporarily suspended. Please contact support.' };
    }

    storage.setActiveSession(true);
    storage.setUser(existingUser);
    const withTrial = calculateTrialStatus(existingUser);
    const refreshed = checkDailyCreditRefresh(withTrial);
    setUser(refreshed);
    notifyOwnerOfUserLogin(refreshed);
    setIsLoading(false);

    const isTargetAdmin =
      existingUser.role === 'admin' ||
      existingUser.role === 'owner' ||
      existingUser.role === 'superadmin';

    return {
      success: true,
      role: existingUser.role,
      targetTab: isTargetAdmin ? 'admin' : 'dashboard',
    };
  };

  const register = async (email: string, password: string, fullName: string, _requestedRole: UserRole = 'creator') => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 350));

    if (!email || !email.includes('@')) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Defensive: prevent unauthorized role elevation. Self-registration is strictly client/creator.
    const assignedRole: UserRole = 'creator';
    const hashedPassword = await hashPassword(password);

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: email.trim().toLowerCase(),
      fullName: fullName.trim() || email.split('@')[0],
      displayName: fullName.trim() || email.split('@')[0],
      role: assignedRole,
      creditsBalance: 2000,
      creditsTotalUsed: 0,
      lastDailyCreditRefresh: new Date().toISOString().split('T')[0],
      planTier: 'pro',
      planStatus: 'active',
      autoRenew: true,
      isSuspended: false,
      onboardingCompleted: true, // Immediate direct access to tools!
      preferredPlatforms: ['Instagram', 'LinkedIn', 'YouTube', 'TikTok'],
      contentGoals: ['Audience Growth'],
      themePreference: 'light',
      defaultLanguage: 'English',
      defaultTone: 'Engaging & Authentic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveUser(newUser);
    storage.saveUserPasswordHash(newUser.id, newUser.email, hashedPassword);

    storage.setActiveSession(true);
    storage.setUser(newUser);
    setUser(newUser);
    notifyOwnerOfUserLogin(newUser, true);

    // Automatically record welcome email in platform email log
    storage.logPlatformEmail({
      toEmail: newUser.email,
      toName: newUser.fullName,
      toRole: newUser.role,
      fromName: 'Platform Owner',
      fromEmail: 'owner@creatorstudio.ai',
      subject: `Welcome to AI Creator Studio (${newUser.role.toUpperCase()} Account Activated)`,
      preview: `Your account is provisioned with ${newUser.creditsBalance} credits and immediate tool access.`,
      body: `Hi ${newUser.fullName},\n\nWelcome to AI Creator Studio! Your ${newUser.role.toUpperCase()} account has been created with ${newUser.creditsBalance} AI credits.\n\nAll 16 content creation tools, multi-slide carousels, and video script engines are unlocked.\n\nBest regards,\nPlatform Owner & Support`,
      category: 'welcome',
    });

    setIsLoading(false);
    return { success: true };
  };

  const adminLogin = async (arg1: string, arg2?: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    // Support both adminLogin(username, passcode) and adminLogin(passcode)
    const username = arg2 !== undefined ? arg1.trim() : (adminConfig.getSettings().adminUsername || 'admin');
    const passcode = arg2 !== undefined ? arg2.trim() : arg1.trim();

    if (!username || !passcode) {
      setIsLoading(false);
      return { success: false, error: 'Please enter both username and passcode.' };
    }

    const isOwnerValid = adminConfig.validateOwnerCredentials(username, passcode);
    const isAdminValid = adminConfig.validateAdminCredentials(username, passcode);

    if (!isAdminValid && !isOwnerValid) {
      setIsLoading(false);
      return { success: false, error: 'Access Denied: Invalid Administrator username or passcode.' };
    }

    if (isOwnerValid && !isAdminValid) {
      return ownerLogin(username, passcode);
    }

    await requestAdminSessionToken(username, passcode);

    const adminUser: UserProfile = {
      id: 'usr_admin_operator',
      email: username.includes('@') ? username : `${username}@creatorstudio.ai`,
      fullName: `Admin (${username})`,
      displayName: username,
      role: 'admin',
      creditsBalance: 50000,
      creditsTotalUsed: 0,
      lastDailyCreditRefresh: new Date().toISOString().split('T')[0],
      planTier: 'agency',
      planStatus: 'active',
      isSuspended: false,
      onboardingCompleted: true,
      preferredPlatforms: ['Instagram', 'LinkedIn', 'YouTube', 'X'],
      contentGoals: ['Audience Growth', 'Authority Building'],
      themePreference: 'dark',
      defaultLanguage: 'English',
      defaultTone: 'Engaging & Authentic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminPermissions: {
        canResolveClientTickets: true,
        canViewClientMedia: true,
        canAdjustClientCredits: true,
        canManagePayments: true,
        canAccessToolConfig: true,
      },
    };

    storage.setActiveSession(true);
    storage.setUser(adminUser);
    setUser(adminUser);
    notifyOwnerOfUserLogin(adminUser);
    setIsLoading(false);
    return { success: true };
  };

  const ownerLogin = async (arg1: string, arg2?: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    const username = arg2 !== undefined ? arg1.trim() : (adminConfig.getSettings().ownerUsername || 'owner');
    const passcode = arg2 !== undefined ? arg2.trim() : arg1.trim();

    if (!username || !passcode) {
      setIsLoading(false);
      return { success: false, error: 'Please enter both owner username and passcode.' };
    }

    const isValid = adminConfig.validateOwnerCredentials(username, passcode);
    if (!isValid) {
      setIsLoading(false);
      return { success: false, error: 'Access Denied: Invalid Platform Owner username or passcode.' };
    }

    await requestAdminSessionToken(username, passcode);

    const ownerEmail = username.includes('@') ? username : 'ali.siddiquibro74@gmail.com';
    const ownerUser: UserProfile = {
      id: 'usr_owner_root',
      email: ownerEmail,
      fullName: `Platform Owner (${username})`,
      displayName: username,
      role: 'owner',
      creditsBalance: 99999,
      creditsTotalUsed: 0,
      lastDailyCreditRefresh: new Date().toISOString().split('T')[0],
      planTier: 'agency',
      planStatus: 'active',
      isSuspended: false,
      onboardingCompleted: true,
      preferredPlatforms: ['Instagram', 'LinkedIn', 'YouTube', 'X'],
      contentGoals: ['Audience Growth', 'Authority Building'],
      themePreference: 'dark',
      defaultLanguage: 'English',
      defaultTone: 'Authoritative & Clear',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.setActiveSession(true);
    storage.setUser(ownerUser);
    setUser(ownerUser);
    notifyOwnerOfUserLogin(ownerUser);
    setIsLoading(false);
    return { success: true };
  };

  const quickDemoLogin = async (role: 'creator' | 'admin' | 'owner' | 'superadmin' = 'creator') => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 200));

    const isOwnerRole = role === 'owner' || role === 'superadmin';
    const isAdminRole = role === 'admin' || isOwnerRole;

    const demoUser: UserProfile = {
      ...DEFAULT_USER,
      id: isOwnerRole ? 'usr_owner_01' : isAdminRole ? 'usr_admin_01' : 'usr_creator_demo',
      email: isOwnerRole
        ? 'ali.siddiquibro74@gmail.com'
        : isAdminRole
        ? 'admin@creatorstudio.ai'
        : 'creator@example.com',
      fullName: isOwnerRole ? 'Platform Owner' : isAdminRole ? 'Admin Operator' : 'Alex Vance',
      displayName: isOwnerRole ? 'Owner' : isAdminRole ? 'Admin' : 'Alex Vance',
      role: (isOwnerRole ? 'owner' : isAdminRole ? 'admin' : 'creator') as UserRole,
      planTier: isAdminRole ? 'agency' : 'pro',
      planStatus: 'active',
      trialDaysRemaining: 9999,
      creditsBalance: isOwnerRole ? 99999 : isAdminRole ? 50000 : 2000,
      onboardingCompleted: true,
      lastDailyCreditRefresh: new Date().toISOString().split('T')[0],
    };

    storage.setActiveSession(true);
    storage.setUser(demoUser);
    setUser(demoUser);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    storage.setActiveSession(false);
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    const isSuperadmin = isSuperadminUser(user);
    const sanitizedUpdates = { ...updates };

    // STRICT SECURITY: Superadmin role cannot be changed or demoted by anyone
    if (isSuperadmin) {
      sanitizedUpdates.role = 'superadmin';
    } else if (sanitizedUpdates.role) {
      // Non-superadmin users cannot elevate themselves or change role
      delete sanitizedUpdates.role;
    }

    const updated = storage.updateUser(sanitizedUpdates);
    setUser(updated);
    return updated;
  };

  const deleteAccount = (userId?: string): { success: boolean; message: string } => {
    const targetId = userId || user?.id;
    if (!targetId) {
      return { success: false, message: 'No target user specified.' };
    }

    const allUsers = storage.getAllUsers();
    const target = allUsers.find((u) => u.id === targetId);
    if (!target) {
      return { success: false, message: 'User account not found.' };
    }

    // STRICT SECURITY: Superadmin root account can NEVER be deleted
    if (isSuperadminUser(target)) {
      return {
        success: false,
        message: 'Platform Security: Superadmin accounts cannot be deleted.',
      };
    }

    const result = storage.deleteUser(targetId);

    // If active user deleted themselves, sign out immediately
    if (user && user.id === targetId) {
      logout();
    }

    return result;
  };

  const completeOnboarding = (onboardingData: Partial<UserProfile>) => {
    const updated = storage.updateUser({
      ...onboardingData,
      onboardingCompleted: true,
    });
    setUser(updated);
  };

  const deductCredits = (amount: number): boolean => {
    const res = storage.deductCredits(amount);
    if (res.success) {
      setUser(storage.getUser());
      return true;
    }
    return false;
  };

  const addCredits = (amount: number) => {
    storage.addCredits(amount);
    setUser(storage.getUser());
  };

  const toggleAdminRole = () => {
    // STRICT SECURITY: Disabled - Superadmin role is immutable and guarded
    return;
  };

  const refreshDailyCreditsNow = () => {
    if (!user) return { refreshed: false, amount: 0 };
    const settings = adminConfig.getSettings();
    const dailyAllocation = settings.dailyFreeCredits || 50;
    const newBalance = user.creditsBalance + dailyAllocation;
    const updated = storage.updateUser({
      creditsBalance: newBalance,
      lastDailyCreditRefresh: new Date().toISOString().split('T')[0],
    });
    setUser(updated);
    return { refreshed: true, amount: dailyAllocation };
  };

  const isOwner: boolean = Boolean(
    user?.role === 'owner' ||
    user?.role === 'superadmin' ||
    user?.email?.toLowerCase() === 'ali.siddiquibro74@gmail.com' ||
    user?.email?.toLowerCase() === 'owner@creatorstudio.ai' ||
    Boolean(user?.email && user.email.toLowerCase().startsWith('owner@'))
  );

  const isAdmin: boolean = Boolean(
    isOwner ||
    user?.role === 'admin' ||
    user?.email?.toLowerCase() === 'admin@creatorstudio.ai' ||
    Boolean(user?.email && user.email.toLowerCase().startsWith('admin@'))
  );
  const isAuthenticated = !!user;

  // Free trial system removed: all users are permanently active without trial restrictions
  const isTrialActive: boolean = false;
  const isTrialExpired: boolean = false;
  const trialDaysLeft: number = 0;

  const subscribeWithStripe = async (
    planId: 'creator' | 'pro' | 'agency',
    billingCycle: 'monthly' | 'annual' = 'monthly',
    cardBrand: string = 'visa',
    cardLast4: string = '4242'
  ) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    if (!user) {
      setIsLoading(false);
      return { success: false, error: 'User must be authenticated.' };
    }

    const plans = adminConfig.getSettings().pricingPlans;
    const selectedPlan = plans.find((p) => p.id === planId) || plans[0];
    const amount = billingCycle === 'annual' ? selectedPlan.annualPrice * 12 : selectedPlan.monthlyPrice;

    const nextBillDate = new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();

    const subRecord: StripeSubscriptionRecord = {
      id: `sub_stripe_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      planId: planId,
      planName: selectedPlan.name,
      amount,
      currency: '$',
      billingCycle,
      status: 'active',
      trialStartDate: new Date().toISOString(),
      trialEndDate: nextBillDate,
      nextBillingDate: nextBillDate,
      cardBrand,
      cardLast4,
      createdAt: new Date().toISOString(),
    };

    storage.saveStripeSubscription(subRecord);

    const updated = storage.updateUser({
      planTier: planId,
      planStatus: 'active',
      stripeCustomerId: user.stripeCustomerId || `cus_stripe_${Date.now()}`,
      stripeSubscriptionId: subRecord.id,
      stripeCardBrand: cardBrand,
      stripeCardLast4: cardLast4,
      creditsBalance: user.creditsBalance + selectedPlan.creditsPerMonth,
      autoRenew: true,
    });

    setUser(updated);
    setIsLoading(false);
    return { success: true };
  };

  const cancelSubscription = (): boolean => {
    if (!user) return false;
    const ok = storage.cancelStripeSubscription(user.id);
    if (ok) {
      setUser(storage.getUser());
    }
    return ok;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isOwner,
        isLoading,
        isTrialActive,
        isTrialExpired,
        trialDaysLeft,
        login,
        register,
        adminLogin,
        ownerLogin,
        quickDemoLogin,
        logout,
        updateProfile,
        deleteAccount,
        completeOnboarding,
        deductCredits,
        addCredits,
        toggleAdminRole,
        refreshDailyCreditsNow,
        subscribeWithStripe,
        cancelSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
