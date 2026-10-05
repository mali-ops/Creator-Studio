import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Wand2,
  Repeat,
  Calendar,
  Compass,
  Volume2,
  FolderKanban,
  BookmarkCheck,
  BarChart3,
  Users,
  User,
  Settings,
  CreditCard,
  HelpCircle,
  Shield,
  Layers,
  Globe,
  X,
  Crown,
  Image,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isCollapsed?: boolean;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  isOpenOnMobile,
  onCloseMobile,
}) => {
  const { user, isAdmin, isOwner } = useAuth();

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile?.();
  };

  const primaryNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studio', label: 'AI Content Studio', icon: Wand2 },
    { id: 'tools', label: '16 AI Tools', icon: Sparkles, badge: '16' },
    { id: 'repurposer', label: 'Content Repurposer', icon: Repeat },
  ];

  const strategyNav = [
    { id: 'calendar', label: 'Content Calendar', icon: Calendar },
    { id: 'planner', label: 'Guided Planner', icon: Compass },
    { id: 'templates', label: 'Template Library', icon: Layers },
    { id: 'brand-voice', label: 'Brand Voices', icon: Volume2 },
  ];

  const manageNav = [
    { id: 'projects', label: 'Projects & Folders', icon: FolderKanban },
    { id: 'saved-content', label: 'Saved Library', icon: BookmarkCheck },
    { id: 'photos', label: 'Photos & Media', icon: Image },
    { id: 'analytics', label: 'Internal Analytics', icon: BarChart3 },
    { id: 'workspace', label: 'Team Workspace', icon: Users },
  ];

  const bottomNav = [
    { id: 'profile', label: 'Creator Profile', icon: User },
    { id: 'pricing', label: 'Plans & Credits', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Guides', icon: HelpCircle },
  ];

  const renderSidebarContent = () => (
    <>
      <div className="p-3.5 space-y-5">
        {/* Public Website Switcher */}
        <button
          onClick={() => handleItemClick('landing')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#17231C] dark:text-[#FFFFFF] bg-[#F7F8F2] dark:bg-[#1A251E] hover:bg-[#E1E7D9]/50 dark:hover:bg-[#233527] transition-colors border border-[#E1E7D9] dark:border-[#27382D]"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#92B76B]" />
            <span>Public Website</span>
          </div>
          <span className="text-[10px] text-[#647168] dark:text-[#8FA496]">Home ↗</span>
        </button>

        {/* Primary Creation Section */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#647168] dark:text-[#8FA496] font-semibold">
            Core Creation
          </div>
          <div className="space-y-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#17231C] dark:bg-[#24372A] text-[#F4F2E9] dark:text-[#FFFFFF] shadow-sm border border-transparent dark:border-[#38523F]'
                      : 'text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF] hover:bg-[#F7F8F2] dark:hover:bg-[#1C2820]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#D9F36B]' : 'text-[#647168] dark:text-[#8FA496]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        active
                          ? 'bg-[#D9F36B] text-[#101612]'
                          : 'bg-[#F7F8F2] dark:bg-[#1D2921] text-[#17231C] dark:text-[#CAD7CE] border border-[#E1E7D9] dark:border-[#27382D]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Strategy & Planning */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#647168] dark:text-[#8FA496] font-semibold">
            Strategy & Planning
          </div>
          <div className="space-y-1">
            {strategyNav.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#17231C] dark:bg-[#24372A] text-[#F4F2E9] dark:text-[#FFFFFF] shadow-sm border border-transparent dark:border-[#38523F]'
                      : 'text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF] hover:bg-[#F7F8F2] dark:hover:bg-[#1C2820]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#D9F36B]' : 'text-[#647168] dark:text-[#8FA496]'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace & Management */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#647168] dark:text-[#8FA496] font-semibold">
            Workspace & Storage
          </div>
          <div className="space-y-1">
            {manageNav.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#17231C] dark:bg-[#24372A] text-[#F4F2E9] dark:text-[#FFFFFF] shadow-sm border border-transparent dark:border-[#38523F]'
                      : 'text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF] hover:bg-[#F7F8F2] dark:hover:bg-[#1C2820]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#D9F36B]' : 'text-[#647168] dark:text-[#8FA496]'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Admin & Owner Console (Protected) */}
        {isAdmin && (
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#92B76B] font-bold">
              {isOwner ? 'Platform Owner & Admin' : 'Admin Controls'}
            </div>
            <button
              onClick={() => handleItemClick('admin')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'admin'
                  ? 'bg-[#17231C] dark:bg-[#24372A] text-[#D9F36B] shadow-sm border border-transparent dark:border-[#38523F]'
                  : 'text-[#17231C] dark:text-[#F4F2E9] bg-[#F7F8F2] dark:bg-[#1A251E] hover:bg-[#E1E7D9] dark:hover:bg-[#233527] border border-[#E1E7D9] dark:border-[#27382D]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isOwner ? <Crown className="w-4 h-4 text-[#D9F36B]" /> : <Shield className="w-4 h-4 text-[#92B76B]" />}
                <span>{isOwner ? 'Owner Console' : 'Admin Console'}</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#D9F36B] text-[#101612] font-bold">
                {isOwner ? 'OWNER' : 'ADMIN'}
              </span>
            </button>
          </div>
        )}

        {/* Active Plan Widget */}
        {!isAdmin && (
          <div className="pt-2">
            <div className="p-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#1A251E] border border-emerald-200 dark:border-emerald-800/60 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                <span>{(user?.planTier || 'creator').toUpperCase()} PLAN</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-[10px] text-[#647168] dark:text-[#8FA496] flex items-center justify-between">
                <span>Active Account</span>
                <button
                  onClick={() => handleItemClick('pricing')}
                  className="font-bold text-[#17231C] dark:text-[#D9F36B] hover:underline cursor-pointer"
                >
                  Plans
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav Items */}
      <div className="p-3 border-t border-[#E1E7D9] dark:border-[#27382D] space-y-1">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                active
                  ? 'text-[#17231C] dark:text-[#FFFFFF] bg-[#F7F8F2] dark:bg-[#24372A] font-bold border border-[#E1E7D9] dark:border-[#38523F]'
                  : 'text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF] hover:bg-[#F7F8F2] dark:hover:bg-[#1C2820]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#92B76B] dark:text-[#D9F36B]' : 'text-[#647168] dark:text-[#8FA496]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, visible from md up) */}
      <aside className="hidden md:flex w-64 shrink-0 bg-[#FFFFFF] dark:bg-[#131A15] border-r border-[#E1E7D9] dark:border-[#27382D] flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto text-[#17231C] dark:text-[#F4F2E9]">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenOnMobile && (
        <div
          className="fixed inset-0 z-40 bg-[#101612]/70 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={onCloseMobile}
          aria-label="Close navigation overlay"
        />
      )}

      {/* Mobile Slide-Over Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#FFFFFF] dark:bg-[#131A15] border-r border-[#E1E7D9] dark:border-[#27382D] flex flex-col justify-between select-none overflow-y-auto shadow-2xl transition-transform duration-300 md:hidden text-[#17231C] dark:text-[#F4F2E9] ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        <div className="p-4 border-b border-[#E1E7D9] dark:border-[#27382D] flex items-center justify-between bg-[#F7F8F2] dark:bg-[#141C16]">
          <span className="font-display font-bold text-base text-[#17231C] dark:text-[#FFFFFF]">
            Creator Studio
          </span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF] hover:bg-[#FFFFFF] dark:hover:bg-[#1A251E] transition-colors cursor-pointer"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderSidebarContent()}
      </aside>
    </>
  );
};
