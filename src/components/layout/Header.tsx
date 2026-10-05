import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useWorkspace } from '../../context/WorkspaceContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import {
  Zap,
  Building2,
  ChevronDown,
  Shield,
  User,
  LogOut,
  Settings,
  Plus,
  RotateCw,
  Sparkles,
  Clock,
  AlertCircle,
  CreditCard,
  Sun,
  Moon,
  Menu,
  Crown,
} from 'lucide-react';

interface HeaderProps {
  onNavigate: (tab: string) => void;
  onOpenPricing: () => void;
  onToggleMobileNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onOpenPricing, onToggleMobileNav }) => {
  const { user, isAdmin, isOwner, toggleAdminRole, logout } = useAuth();
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace } = useWorkspace();
  const { success } = useToast();
  const { isDark, toggleTheme } = useTheme();

  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [newWsModal, setNewWsModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    createWorkspace(newWsName.trim());
    setNewWsName('');
    setNewWsModal(false);
    setShowWorkspaceMenu(false);
  };

  return (
    <header className="h-16 border-b border-[#E1E7D9] dark:border-[#27382D] bg-[#FFFFFF] dark:bg-[#141C16] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none text-[#17231C] dark:text-[#F4F2E9]">
      {/* Left: Brand / Workspace Selector */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
        {/* Mobile Navigation Drawer Toggle */}
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-2 rounded-xl border border-[#E1E7D9] dark:border-[#27382D] bg-[#F7F8F2] dark:bg-[#1A251E] hover:bg-[#FFFFFF] dark:hover:bg-[#233527] text-[#17231C] dark:text-[#F4F2E9] transition-all flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
          title="Open Navigation Menu"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          onClick={() => onNavigate('dashboard')}
          className="text-sm sm:text-lg font-bold font-display text-[#17231C] dark:text-[#FFFFFF] tracking-tight hover:opacity-85 transition-opacity whitespace-nowrap"
        >
          <span className="hidden xs:inline">Creator Studio</span>
          <span className="xs:hidden">Studio</span>
        </button>

        <span className="hidden sm:inline text-[#E1E7D9] dark:text-[#27382D]">|</span>

        <div className="relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-[#F7F8F2] dark:bg-[#1A251E] border border-[#E1E7D9] dark:border-[#27382D] hover:border-[#17231C] dark:hover:border-[#92B76B] text-xs font-medium text-[#17231C] dark:text-[#F4F2E9] transition-all"
          >
            <Building2 className="w-3.5 h-3.5 text-[#92B76B] shrink-0" />
            <span className="font-semibold max-w-[65px] xs:max-w-[100px] sm:max-w-[140px] truncate">{currentWorkspace?.name || 'Workspace'}</span>
            <ChevronDown className="w-3 h-3 text-[#647168] dark:text-[#92B76B] shrink-0" />
          </button>

          {showWorkspaceMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-60 rounded-2xl bg-[#FFFFFF] dark:bg-[#19241E] border border-[#E1E7D9] dark:border-[#27382D] shadow-xl py-1 z-50 animate-modal-pop">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-[#647168] dark:text-[#8FA496] uppercase tracking-wider">
                Workspaces ({workspaces.length})
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id);
                    setShowWorkspaceMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    currentWorkspace?.id === ws.id
                      ? 'bg-[#F7F8F2] dark:bg-[#233427] text-[#17231C] dark:text-[#FFFFFF] font-semibold'
                      : 'text-[#17231C] dark:text-[#D1DDD5] hover:bg-[#F7F8F2]/60 dark:hover:bg-[#202E24]'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  <span className="text-[10px] text-[#647168] dark:text-[#8FA496] uppercase">{ws.role}</span>
                </button>
              ))}
              <div className="border-t border-[#E1E7D9] dark:border-[#27382D] mt-1 pt-1">
                <button
                  onClick={() => {
                    setNewWsModal(true);
                    setShowWorkspaceMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#17231C] dark:text-[#D9F36B] hover:bg-[#F7F8F2] dark:hover:bg-[#233427] flex items-center gap-1.5 font-medium"
                >
                  <Plus className="w-3.5 h-3.5 text-[#92B76B]" />
                  Create New Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Plan Status Pill */}
        {isAdmin ? (
          <button
            onClick={() => onNavigate('admin')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#17231C] dark:bg-[#233527] text-[#D9F36B] text-[11px] font-mono font-bold tracking-wider hover:bg-[#101612] dark:hover:bg-[#2B4031] transition-colors border border-transparent dark:border-[#38523F]"
          >
            {isOwner ? <Crown className="w-3 h-3 text-[#D9F36B]" /> : <Shield className="w-3 h-3 text-[#D9F36B]" />}
            <span>{isOwner ? 'OWNER' : 'ADMIN'}</span>
          </button>
        ) : (
          <button
            onClick={onOpenPricing}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-bold tracking-wider hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            title="Account & Plan Status"
          >
            <CreditCard className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{(user?.planTier || 'pro').toUpperCase()} PLAN</span>
          </button>
        )}

        {/* Credits Balance Badge */}
        <button
          onClick={onOpenPricing}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#D9F36B] hover:bg-[#c6e255] border border-[#c5e452] text-xs font-bold text-[#101612] transition-all hover:scale-[1.02] shadow-2xs group shrink-0"
          title="Click to view plans & credit quotas"
        >
          <Zap className="w-3.5 h-3.5 fill-[#101612] text-[#101612] shrink-0" />
          <span className="hidden sm:inline text-[#101612]">Credits:</span>
          <span className="font-mono tabular-nums text-[#101612]">
            {user?.creditsBalance ?? 50}
          </span>
        </button>

        {/* Theme Mode Quick Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-[#E1E7D9] dark:border-[#27382D] bg-[#F7F8F2] dark:bg-[#1A251E] hover:bg-[#FFFFFF] dark:hover:bg-[#243528] text-[#17231C] dark:text-[#F4F2E9] transition-all hover:scale-105 shadow-2xs flex items-center justify-center cursor-pointer"
          title={isDark ? 'Switch to Creator Editorial (Cream/Light)' : 'Switch to Deep Forest (Dark Mode)'}
          aria-label="Toggle visual theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-[#D9F36B]" />
          ) : (
            <Moon className="w-4 h-4 text-[#647168]" />
          )}
        </button>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-[#F7F8F2] dark:bg-[#1A251E] border border-[#E1E7D9] dark:border-[#27382D] hover:border-[#17231C] dark:hover:border-[#92B76B] text-xs transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-[#17231C] dark:bg-[#273A2E] text-[#F4F2E9] font-bold text-xs flex items-center justify-center">
              {user?.fullName ? user.fullName[0].toUpperCase() : 'C'}
            </div>
            <span className="font-medium text-[#17231C] dark:text-[#F4F2E9] max-w-[100px] truncate hidden md:inline">
              {user?.fullName || 'Creator'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#647168] dark:text-[#92B76B]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl bg-[#FFFFFF] dark:bg-[#19241E] border border-[#E1E7D9] dark:border-[#27382D] shadow-xl py-1.5 z-50 text-xs animate-modal-pop">
              <div className="px-3 py-2 border-b border-[#E1E7D9] dark:border-[#27382D]">
                <div className="font-bold text-[#17231C] dark:text-[#FFFFFF] truncate">{user?.fullName || 'User'}</div>
                <div className="text-[11px] text-[#647168] dark:text-[#8FA496] truncate">{user?.email || 'user@example.com'}</div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF] hover:bg-[#F7F8F2] dark:hover:bg-[#243528] flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-[#92B76B]" />
                  Creator Profile
                </button>
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF] hover:bg-[#F7F8F2] dark:hover:bg-[#243528] flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-[#92B76B]" />
                  Settings & Preferences
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[#17231C] dark:text-[#D9F36B] hover:bg-[#F7F8F2] dark:hover:bg-[#243528] flex items-center gap-2 font-bold"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#92B76B]" />
                    Admin Control Panel
                  </button>
                )}
              </div>

              <div className="border-t border-[#E1E7D9] dark:border-[#27382D] pt-1 mt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    onNavigate('landing');
                  }}
                  className="w-full text-left px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Workspace Modal */}
      {newWsModal && (
        <div className="fixed inset-0 z-50 bg-[#101612]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={handleCreateWorkspace}
            className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-modal-pop"
          >
            <h3 className="text-sm font-bold text-[#17231C] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#92B76B]" />
              Create New Workspace
            </h3>
            <p className="text-xs text-[#647168]">
              Workspaces isolate client projects, brand voices, and team members.
            </p>
            <input
              type="text"
              autoFocus
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="e.g., Apex Marketing Group"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] focus:outline-none focus:border-[#17231C]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewWsModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-[#E1E7D9] text-xs text-[#647168]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#D9F36B] text-[#17231C] text-xs font-bold"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};
