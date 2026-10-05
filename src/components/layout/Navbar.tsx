import React, { useState } from 'react';
import { Menu, X, ArrowRight, Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  isAuthenticated: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenAuth, isAuthenticated }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { label: 'Features', tab: 'features' },
    { label: 'AI Tools', tab: 'tools' },
    { label: 'Templates', tab: 'templates' },
    { label: 'Pricing', tab: 'pricing' },
    { label: 'About', tab: 'help' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E1E7D9] dark:border-[#27382D] bg-[#F7F8F2]/95 dark:bg-[#141C16]/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single text element in display font) */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-xl sm:text-2xl font-bold tracking-tight text-[#17231C] dark:text-[#FFFFFF] font-display whitespace-nowrap hover:opacity-90 transition-opacity"
        >
          Creator Studio
        </button>

        {/* Zone 2: 4-6 Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#647168] dark:text-[#CAD7CE]">
          {navLinks.map((link) => (
            <button
              key={link.tab}
              onClick={() => onNavigate(link.tab)}
              className={`transition-colors py-1 hover:text-[#17231C] dark:hover:text-[#FFFFFF] whitespace-nowrap ${
                currentTab === link.tab
                  ? 'text-[#17231C] dark:text-[#FFFFFF] font-semibold underline underline-offset-4 decoration-2 decoration-[#D9F36B]'
                  : ''
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 Primary actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[#E1E7D9] dark:border-[#27382D] bg-[#F7F8F2] dark:bg-[#1A251E] hover:bg-[#FFFFFF] dark:hover:bg-[#233527] text-[#17231C] dark:text-[#F4F2E9] transition-all hover:scale-105 shadow-2xs flex items-center justify-center cursor-pointer"
            title={isDark ? 'Switch to Creator Editorial (Light)' : 'Switch to Deep Forest (Dark)'}
            aria-label="Toggle visual theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#D9F36B]" />
            ) : (
              <Moon className="w-4 h-4 text-[#647168]" />
            )}
          </button>

          {isAuthenticated ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full bg-[#17231C] dark:bg-[#24372A] hover:bg-[#101612] dark:hover:bg-[#2E4535] text-[#F4F2E9] transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shadow-sm border border-transparent dark:border-[#38523F]"
            >
              <Zap className="w-3.5 h-3.5 text-[#D9F36B]" />
              Open Studio
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-xs font-semibold text-[#17231C] dark:text-[#E1ECE4] hover:text-[#647168] dark:hover:text-[#FFFFFF] transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full bg-[#D9F36B] hover:bg-[#c6e255] text-[#101612] transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shadow-sm border border-[#c5e452]"
              >
                Start Creating
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Controls (Theme Toggle + Hamburger) */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[#E1E7D9] dark:border-[#27382D] bg-[#F7F8F2] dark:bg-[#1A251E] hover:bg-[#FFFFFF] dark:hover:bg-[#233527] text-[#17231C] dark:text-[#F4F2E9] transition-all shadow-2xs flex items-center justify-center cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle visual theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#D9F36B]" />
            ) : (
              <Moon className="w-4 h-4 text-[#647168]" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-[#E1E7D9] dark:border-[#27382D] bg-[#F7F8F2] dark:bg-[#1A251E] text-[#17231C] dark:text-[#F4F2E9] hover:text-[#647168] dark:hover:text-[#FFFFFF] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E1E7D9] dark:border-[#27382D] bg-[#F7F8F2] dark:bg-[#141C16] px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.tab}
                onClick={() => {
                  onNavigate(link.tab);
                  setMobileMenuOpen(false);
                }}
                className={`text-left text-sm font-medium py-1.5 transition-colors ${
                  currentTab === link.tab
                    ? 'text-[#17231C] dark:text-[#FFFFFF] font-bold'
                    : 'text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="pt-3 border-t border-[#E1E7D9] dark:border-[#27382D] flex flex-col gap-2.5">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-full bg-[#17231C] dark:bg-[#24372A] text-[#F4F2E9] text-xs font-bold flex items-center justify-center gap-2 border border-transparent dark:border-[#38523F]"
              >
                Open Studio
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-full border border-[#E1E7D9] dark:border-[#27382D] bg-transparent dark:bg-[#1A251E] text-[#17231C] dark:text-[#F4F2E9] text-xs font-bold"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-full bg-[#D9F36B] text-[#101612] text-xs font-bold flex items-center justify-center gap-2"
                >
                  Start Creating
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
