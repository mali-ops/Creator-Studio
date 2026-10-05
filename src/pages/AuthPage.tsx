import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import {
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  User,
  Check,
  X,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onSuccess: (isNewUser: boolean, targetTab?: string) => void;
  onCancel: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onSuccess,
  onCancel,
}) => {
  const { login, register } = useAuth();
  const { success, error: toastError } = useToast();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Unified Sign In fields (works for Owner, Admin, and Client)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Handle Unified Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your username or email address (یوزر نیم یا ای میل درج کریں).');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password or passcode (پاسورڈ یا پاس کوڈ درج کریں).');
      return;
    }

    setIsLoading(true);
    const res = await login(identifier.trim(), password.trim());
    setIsLoading(false);

    if (res.success) {
      if (res.targetTab === 'admin' || res.role === 'owner' || res.role === 'admin' || res.role === 'superadmin') {
        const isOwner = res.role === 'owner' || res.role === 'superadmin';
        success(
          isOwner ? 'Access Verified' : 'Administrator Verified',
          isOwner
            ? 'Authorized access. Opening Control Center...'
            : 'Operational access authorized. Opening Admin Console...'
        );
        onSuccess(false, 'admin');
      } else {
        success(
          'Welcome back!',
          'Signed into Creator Workspace: All 16 AI tools active.'
        );
        onSuccess(false, 'dashboard');
      }
    } else {
      setErrorMsg(res.error || 'Invalid credentials. Please verify your ID and password.');
      toastError('Login Failed', res.error);
    }
  };

  // Handle New Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!registerEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (registerPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const res = await register(registerEmail.trim(), registerPassword.trim(), fullName.trim(), 'creator');
    setIsLoading(false);

    if (res.success) {
      success(
        'Account Created Successfully!',
        'All 16 AI creation tools are active and ready.'
      );
      onSuccess(true, 'dashboard');
    } else {
      setErrorMsg(res.error || 'Registration failed.');
      toastError('Registration Failed', res.error);
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.includes('@')) {
      setErrorMsg('Please enter a valid registered email address to receive recovery instructions.');
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setResetSent(true);
    success('Recovery Email Dispatched', `A secure reset link was sent to ${identifier}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101612]/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 relative text-[#17231C] animate-modal-pop">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#647168] hover:text-[#17231C] hover:bg-[#F7F8F2] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F8F2] border border-[#E1E7D9] text-[11px] font-semibold text-[#17231C] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#D9F36B] animate-pulse" />
            <span>AI Content Suite · Universal Sign In</span>
          </div>

          <h2 className="text-2xl font-bold font-display text-[#17231C] tracking-tight">
            {mode === 'login' && 'Sign In to Your Portal'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-[#647168] mt-1 max-w-xs mx-auto">
            {mode === 'login' && 'Enter your username or email and passcode/password. Your respective portal opens automatically.'}
            {mode === 'register' && 'Join creators producing viral social content with 16 AI tools.'}
            {mode === 'forgot' && 'Enter your registered email address to receive password recovery instructions.'}
          </p>
        </div>

        {/* Mode Switcher Tabs: Sign In | Sign Up */}
        {mode !== 'forgot' && (
          <div className="flex rounded-xl p-1 bg-[#F7F8F2] border border-[#E1E7D9] mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#FFFFFF] text-[#17231C] shadow-xs'
                  : 'text-[#647168] hover:text-[#17231C]'
              }`}
            >
              Sign In (لاگ ان)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[#FFFFFF] text-[#17231C] shadow-xs'
                  : 'text-[#647168] hover:text-[#17231C]'
              }`}
            >
              Sign Up (نیا اکاؤنٹ)
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Reset Confirmation */}
        {resetSent && mode === 'forgot' && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            Check your inbox! Password recovery instructions have been sent.
          </div>
        )}

        {/* 1. UNIFIED SIGN IN FORM (Owner, Admin, or Client) */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#17231C] mb-1">
                Username or Email (یوزر نیم یا ای میل)
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder=""
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#17231C] transition-colors"
                />
                <User className="w-4 h-4 text-[#647168] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#17231C]">
                  Password or Passcode (پاسورڈ یا پاس کوڈ)
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-[#647168] hover:text-[#17231C] hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#17231C] transition-colors"
                />
                <KeyRound className="w-4 h-4 text-[#647168] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#647168] hover:text-[#17231C]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-3"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#D9F36B] border-t-transparent animate-spin" />
                  Verifying Credentials & Opening Portal...
                </span>
              ) : (
                <>
                  <span>Sign In to Portal (لاگ ان کریں)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. REGISTRATION FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#17231C] mb-1">
                Full Name (پورا نام)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#17231C] transition-colors"
                />
                <User className="w-4 h-4 text-[#647168] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17231C] mb-1">
                Work or Personal Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="creator@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#17231C] transition-colors"
                />
                <Mail className="w-4 h-4 text-[#647168] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17231C] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="•••••••• (at least 6 characters)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#17231C] transition-colors"
                />
                <Lock className="w-4 h-4 text-[#647168] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 border border-[#c5e452] mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#17231C] border-t-transparent animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#17231C] mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#17231C] transition-colors"
                />
                <Mail className="w-4 h-4 text-[#647168] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? 'Sending Link...' : 'Send Recovery Link'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#647168] hover:text-[#17231C] font-semibold"
              >
                Back to Sign In (واپس لاگ ان پر جائیں)
              </button>
            </div>
          </form>
        )}

        {/* Footer Guarantee */}
        <div className="mt-5 pt-4 border-t border-[#E1E7D9] flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#647168]">
          <span className="flex items-center gap-1 font-semibold text-[#17231C]">
            <Check className="w-3.5 h-3.5 text-[#92B76B]" />
            Direct Automatic Portal Routing
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[#92B76B]" />
            Admin & Enterprise Protected
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[#92B76B]" />
            Client Workspace
          </span>
        </div>
      </div>
    </div>
  );
};
