import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { Lock, Shield, Eye, EyeOff, X, ArrowRight, KeyRound, Crown, User } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { isAdmin, isOwner, adminLogin, ownerLogin } = useAuth();
  const { success, error: toastError } = useToast();

  const [showPortalModal, setShowPortalModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'admin' | 'owner'>('admin');
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [ownerUsernameInput, setOwnerUsernameInput] = useState('');
  const [ownerPasswordInput, setOwnerPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePortalTrigger = (target: 'admin' | 'owner' = 'admin') => {
    if (target === 'owner' && isOwner) {
      onNavigate('admin');
      return;
    }
    if (target === 'admin' && (isAdmin || isOwner)) {
      onNavigate('admin');
      return;
    }

    setActiveTab(target);
    setAdminUsernameInput('');
    setAdminPasswordInput('');
    setOwnerUsernameInput('');
    setOwnerPasswordInput('');
    setAuthError('');
    setShowPortalModal(true);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!adminUsernameInput.trim()) {
      setAuthError('Please enter the administrator username.');
      return;
    }
    if (!adminPasswordInput.trim()) {
      setAuthError('Please enter the administrator passcode.');
      return;
    }

    setIsVerifying(true);
    const res = await adminLogin(adminUsernameInput.trim(), adminPasswordInput.trim());
    setIsVerifying(false);

    if (res.success) {
      setShowPortalModal(false);
      success('Admin Access Granted', 'Authenticated as Admin Operator.');
      onNavigate('admin');
    } else {
      setAuthError(res.error || 'Invalid Admin Username or Passcode.');
      toastError('Authentication Failed', res.error);
    }
  };

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!ownerUsernameInput.trim()) {
      setAuthError('Please enter the Platform Owner username.');
      return;
    }
    if (!ownerPasswordInput.trim()) {
      setAuthError('Please enter the Platform Owner passcode.');
      return;
    }

    setIsVerifying(true);
    const res = await ownerLogin(ownerUsernameInput.trim(), ownerPasswordInput.trim());
    setIsVerifying(false);

    if (res.success) {
      setShowPortalModal(false);
      success('Owner Authority Verified', 'Authenticated as Immutable Platform Owner.');
      onNavigate('admin');
    } else {
      setAuthError(res.error || 'Invalid Owner Username or Passcode.');
      toastError('Authentication Failed', res.error);
    }
  };

  return (
    <footer className="border-t border-[#26372D] bg-[#101612] text-[#BECABE] text-xs relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-xl font-bold font-display text-[#F4F2E9] tracking-tight block">
              Creator Studio
            </span>
            <p className="text-xs text-[#BECABE] max-w-sm leading-relaxed">
              The high-velocity editorial workspace for solo creators, digital entrepreneurs, and marketing agencies. Powered by official high-speed AI inference with 16 specialized generators.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#BECABE]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#D9F36B] animate-pulse" />
              <span className="font-medium text-[#F4F2E9]">Ultra-Fast Neural Engine</span>
              <span>·</span>
              <span>PostgreSQL & RLS Ready</span>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4F2E9] mb-4">AI Generators</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => onNavigate('tools')} className="hover:text-[#D9F36B] transition-colors">
                  AI Caption Generator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tools')} className="hover:text-[#D9F36B] transition-colors">
                  Viral Hook Engine
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tools')} className="hover:text-[#D9F36B] transition-colors">
                  Reels & TikTok Scripts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tools')} className="hover:text-[#D9F36B] transition-colors">
                  Carousel Generator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('repurposer')} className="hover:text-[#D9F36B] transition-colors">
                  Content Repurposer
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4F2E9] mb-4">Workspace</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => onNavigate('calendar')} className="hover:text-[#D9F36B] transition-colors">
                  Content Calendar
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('planner')} className="hover:text-[#D9F36B] transition-colors">
                  Content Planner
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('brand-voice')} className="hover:text-[#D9F36B] transition-colors">
                  Brand Voice Profiles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('templates')} className="hover:text-[#D9F36B] transition-colors">
                  Template Library
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('workspace')} className="hover:text-[#D9F36B] transition-colors">
                  Team Workspaces
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4F2E9] mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#D9F36B] transition-colors">
                  Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('help')} className="hover:text-[#D9F36B] transition-colors">
                  Knowledge Base
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('analytics')} className="hover:text-[#D9F36B] transition-colors">
                  Analytics & Quotas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('settings')} className="hover:text-[#D9F36B] transition-colors">
                  Workspace Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with hidden discreet admin option */}
        <div className="mt-12 pt-8 border-t border-[#26372D] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#BECABE]">
          <div className="flex items-center gap-3">
            <p>© {new Date().getFullYear()} AI Content Creator Studio. All rights reserved.</p>
            {/* Discreet hidden admin and owner entries */}
            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={() => handlePortalTrigger('admin')}
                title="Restricted Administrator Access"
                className="text-[#2b3a30] hover:text-[#8ea594] transition-colors flex items-center gap-1 group py-0.5 px-1.5 rounded cursor-pointer"
              >
                <Lock className="w-2.5 h-2.5 opacity-35 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] opacity-30 group-hover:opacity-85 transition-opacity select-none">Admin</span>
              </button>
              <span className="text-[#2b3a30] opacity-30">·</span>
              <button
                onClick={() => handlePortalTrigger('owner')}
                title="Platform Owner Master Access"
                className="text-[#2b3a30] hover:text-[#d9f36b] transition-colors flex items-center gap-1 group py-0.5 px-1.5 rounded cursor-pointer"
              >
                <Crown className="w-2.5 h-2.5 opacity-35 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] opacity-30 group-hover:opacity-85 transition-opacity select-none">Owner</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('help')} className="hover:text-[#F4F2E9] transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate('help')} className="hover:text-[#F4F2E9] transition-colors">Terms of Service</button>
            <button onClick={() => onNavigate('help')} className="hover:text-[#F4F2E9] transition-colors">API Docs</button>
          </div>
        </div>
      </div>

      {/* Secret Admin & Owner Verification Modal */}
      {showPortalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101612]/85 backdrop-blur-md animate-fade-in text-[#17231C]">
          <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative animate-modal-pop">
            <button
              onClick={() => setShowPortalModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#647168] hover:text-[#17231C] hover:bg-[#F7F8F2] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Role Tab Selector */}
            <div className="flex rounded-xl p-1 bg-[#F7F8F2] border border-[#E1E7D9] mb-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  setAuthError('');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-[#17231C] text-[#FFFFFF] shadow-xs'
                    : 'text-[#647168] hover:text-[#17231C]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-[#92B76B]" />
                <span>Admin Portal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('owner');
                  setAuthError('');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'owner'
                    ? 'bg-[#17231C] text-[#D9F36B] shadow-xs'
                    : 'text-[#647168] hover:text-[#17231C]'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-[#D9F36B]" />
                <span>Owner Portal</span>
              </button>
            </div>

            <div className="text-center space-y-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#17231C] text-[#D9F36B] flex items-center justify-center mx-auto shadow-md">
                {activeTab === 'owner' ? <Crown className="w-5 h-5 text-[#D9F36B]" /> : <Shield className="w-5 h-5 text-[#92B76B]" />}
              </div>
              <h3 className="text-base font-bold font-display text-[#17231C]">
                {activeTab === 'owner' ? 'Platform Owner Master Gate' : 'Administrator Portal Gate'}
              </h3>
              <p className="text-xs text-[#647168] leading-relaxed">
                {activeTab === 'owner'
                  ? 'Root authority access. Irreversible control, admin roles assignment, and master logs.'
                  : 'Restricted access. Client oversight, support ticket resolution, and media supervision.'}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {authError}
              </div>
            )}

            {activeTab === 'admin' ? (
              <form onSubmit={handleAdminSubmit} className="space-y-3.5">
                {/* Admin Username Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#17231C] uppercase tracking-wider">
                    Admin Username (ایڈمن یوزر نیم)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      required
                      value={adminUsernameInput}
                      onChange={(e) => setAdminUsernameInput(e.target.value)}
                      placeholder="Enter admin username..."
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#17231C] transition-colors"
                    />
                    <User className="w-4 h-4 text-[#647168] absolute left-3 top-3" />
                  </div>
                </div>

                {/* Admin Passcode Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#17231C] uppercase tracking-wider">
                    Admin Passcode (ایڈمن پاس کوڈ)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="Enter admin passcode..."
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

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-2.5 rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    {isVerifying ? (
                      <span>Verifying Admin Credentials...</span>
                    ) : (
                      <>
                        <Shield className="w-3.5 h-3.5 text-[#92B76B]" />
                        <span>Enter Admin Console</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPortalModal(false)}
                    className="w-full py-2 text-xs text-[#647168] hover:text-[#17231C] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOwnerSubmit} className="space-y-3.5">
                {/* Owner Username Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#17231C] uppercase tracking-wider">
                    Owner Username (اونر یوزر نیم)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      required
                      value={ownerUsernameInput}
                      onChange={(e) => setOwnerUsernameInput(e.target.value)}
                      placeholder="Enter owner username..."
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D9F36B]/60 bg-[#F7F8F2] text-xs text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#17231C] transition-colors"
                    />
                    <User className="w-4 h-4 text-[#719129] absolute left-3 top-3" />
                  </div>
                </div>

                {/* Owner Passcode Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#17231C] uppercase tracking-wider">
                    Owner Passcode (اونر پاس کوڈ)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={ownerPasswordInput}
                      onChange={(e) => setOwnerPasswordInput(e.target.value)}
                      placeholder="Enter owner passcode..."
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#D9F36B]/60 bg-[#F7F8F2] text-xs text-[#17231C] placeholder-[#647168]/60 focus:bg-white focus:outline-none focus:border-[#17231C] transition-colors"
                    />
                    <KeyRound className="w-4 h-4 text-[#719129] absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#647168] hover:text-[#17231C]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-2.5 rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    {isVerifying ? (
                      <span>Verifying Owner Credentials...</span>
                    ) : (
                      <>
                        <Crown className="w-3.5 h-3.5 text-[#D9F36B]" />
                        <span>Enter Owner Control Center</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPortalModal(false)}
                    className="w-full py-2 text-xs text-[#647168] hover:text-[#17231C] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
