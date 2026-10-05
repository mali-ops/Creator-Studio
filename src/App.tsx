import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wand2,
  Sparkles,
  Calendar,
  Menu,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { WorkspaceProvider } from './context/WorkspaceContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { PageTransitionBar } from './components/layout/PageTransitionBar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { ContentStudioPage } from './pages/ContentStudioPage.tsx';
import { AIToolsPage } from './pages/AIToolsPage.tsx';
import { RepurposingPage } from './pages/RepurposingPage.tsx';
import { CalendarPage } from './pages/CalendarPage.tsx';
import { PlannerPage } from './pages/PlannerPage.tsx';
import { TemplatesPage } from './pages/TemplatesPage.tsx';
import { BrandVoicePage } from './pages/BrandVoicePage.tsx';
import { ProjectsPage } from './pages/ProjectsPage.tsx';
import { SavedContentPage } from './pages/SavedContentPage.tsx';
import { PhotosPage } from './pages/PhotosPage.tsx';
import { WorkspacePage } from './pages/WorkspacePage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { OnboardingPage } from './pages/OnboardingPage.tsx';
import { PricingPage } from './pages/PricingPage.tsx';
import { HelpCenterPage } from './pages/HelpCenterPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { TemplateItem } from './types/index.ts';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Navigation state - start at public landing page for new visitors
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedToolId, setSelectedToolId] = useState<string | undefined>(undefined);
  const [studioPrefill, setStudioPrefill] = useState<{ topic?: string; platform?: string } | undefined>(undefined);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (_isNewUser: boolean, targetTab?: string) => {
    setShowAuthModal(false);
    setShowOnboarding(false);
    setIsNavigating(true);
    setTimeout(() => {
      setCurrentTab(targetTab || 'dashboard');
      setIsNavigating(false);
    }, 150);
  };

  const handleNavigate = (tab: string, toolId?: string) => {
    setMobileNavOpen(false);
    const publicTabs = ['landing', 'pricing', 'help', 'features'];

    // Require account creation / login for app workspace modules
    if (!isAuthenticated && !publicTabs.includes(tab)) {
      handleOpenAuth('register');
      return;
    }

    if (tab === currentTab && !toolId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Trigger smooth transition progress loader
    setIsNavigating(true);
    setTimeout(() => {
      setCurrentTab(tab);
      if (toolId) setSelectedToolId(toolId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsNavigating(false);
    }, 180);
  };

  const handleUseTemplate = (tmpl: TemplateItem) => {
    if (!isAuthenticated) {
      handleOpenAuth('register');
      return;
    }
    setStudioPrefill({
      topic: tmpl.sampleInput?.topic || tmpl.title,
      platform: tmpl.platform,
    });
    handleNavigate('studio');
  };

  // If user explicitly opened onboarding flow
  if (showOnboarding) {
    return (
      <OnboardingPage
        onComplete={() => {
          setShowOnboarding(false);
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  // If on public landing page or public routes
  if (currentTab === 'landing') {
    return (
      <div className="min-h-screen bg-[#F7F8F2] text-[#17231C] flex flex-col justify-between selection:bg-[#D9F36B] selection:text-[#17231C]">
        <PageTransitionBar isNavigating={isNavigating} />
        <Navbar
          currentTab="landing"
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
          isAuthenticated={isAuthenticated}
        />

        <main className="flex-1 animate-page-enter">
          <LandingPage
            onStartCreating={() => {
              if (isAuthenticated) {
                handleNavigate('studio');
              } else {
                handleOpenAuth('register');
              }
            }}
            onExploreTools={() => handleNavigate('tools')}
            onOpenAuth={handleOpenAuth}
            onNavigateTab={handleNavigate}
          />
        </main>

        <Footer onNavigate={handleNavigate} />

        {showAuthModal && (
          <AuthPage
            initialMode={authMode}
            onSuccess={handleAuthSuccess}
            onCancel={() => setShowAuthModal(false)}
          />
        )}
      </div>
    );
  }

  // Public Pricing View
  if (currentTab === 'pricing' && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F8F2] text-[#17231C] flex flex-col justify-between selection:bg-[#D9F36B] selection:text-[#17231C]">
        <PageTransitionBar isNavigating={isNavigating} />
        <Navbar
          currentTab="pricing"
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
          isAuthenticated={isAuthenticated}
        />
        <main className="flex-1 p-4 sm:p-8 animate-page-enter">
          <PricingPage onOpenAuth={handleOpenAuth} onNavigate={handleNavigate} />
        </main>
        <Footer onNavigate={handleNavigate} />
        {showAuthModal && (
          <AuthPage
            initialMode={authMode}
            onSuccess={handleAuthSuccess}
            onCancel={() => setShowAuthModal(false)}
          />
        )}
      </div>
    );
  }

  // Public Help View
  if (currentTab === 'help' && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F8F2] text-[#17231C] flex flex-col justify-between selection:bg-[#D9F36B] selection:text-[#17231C]">
        <PageTransitionBar isNavigating={isNavigating} />
        <Navbar
          currentTab="help"
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
          isAuthenticated={isAuthenticated}
        />
        <main className="flex-1 p-4 sm:p-8 animate-page-enter">
          <HelpCenterPage />
        </main>
        <Footer onNavigate={handleNavigate} />
        {showAuthModal && (
          <AuthPage
            initialMode={authMode}
            onSuccess={handleAuthSuccess}
            onCancel={() => setShowAuthModal(false)}
          />
        )}
      </div>
    );
  }

  // Authenticated App Workspace layout - Unified Creator Editorial Theme (#F7F8F2)
  return (
    <div className="min-h-screen bg-[#F7F8F2] text-[#17231C] flex flex-col selection:bg-[#D9F36B] selection:text-[#17231C]">
      {/* Top Page Transition Progress Bar */}
      <PageTransitionBar isNavigating={isNavigating} />

      <Header
        onNavigate={handleNavigate}
        onOpenPricing={() => handleNavigate('pricing')}
        onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar (Desktop + Mobile Slide-Over Drawer) */}
        <Sidebar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          isOpenOnMobile={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        {/* Primary Page Content with Smooth Transition Animation */}
        <main className="flex-1 overflow-y-auto bg-[#F7F8F2] pb-20 md:pb-6">
          <div key={currentTab} className="animate-page-enter">
            {currentTab === 'dashboard' && (
              <DashboardPage
                onNavigate={handleNavigate}
                onOpenPricing={() => handleNavigate('pricing')}
              />
            )}

            {currentTab === 'studio' && (
              <ContentStudioPage
                prefilledPrompt={studioPrefill}
                onScheduleToCalendar={() => handleNavigate('calendar')}
              />
            )}

            {currentTab === 'tools' && (
              <AIToolsPage
                initialToolId={selectedToolId}
                onScheduleToCalendar={() => handleNavigate('calendar')}
              />
            )}

            {currentTab === 'repurposer' && (
              <RepurposingPage onScheduleToCalendar={() => handleNavigate('calendar')} />
            )}

            {currentTab === 'calendar' && <CalendarPage />}

            {currentTab === 'planner' && <PlannerPage />}

            {currentTab === 'templates' && (
              <TemplatesPage onUseTemplate={handleUseTemplate} />
            )}

            {currentTab === 'brand-voice' && <BrandVoicePage />}

            {currentTab === 'projects' && (
              <ProjectsPage
                onNavigateToStudio={(topic) => {
                  setStudioPrefill({ topic });
                  handleNavigate('studio');
                }}
              />
            )}

            {currentTab === 'saved-content' && (
              <SavedContentPage onScheduleToCalendar={() => handleNavigate('calendar')} />
            )}

            {currentTab === 'photos' && <PhotosPage />}

            {currentTab === 'workspace' && <WorkspacePage />}

            {currentTab === 'analytics' && <AnalyticsPage />}

            {currentTab === 'profile' && <ProfilePage />}

            {currentTab === 'settings' && <SettingsPage />}

            {currentTab === 'pricing' && (
              <PricingPage onOpenAuth={handleOpenAuth} onNavigate={handleNavigate} />
            )}

            {currentTab === 'help' && <HelpCenterPage />}

            {currentTab === 'admin' && <AdminPage />}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< md) for Fast Thumb Navigation */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FFFFFF]/95 dark:bg-[#141C16]/95 backdrop-blur-md border-t border-[#E1E7D9] dark:border-[#27382D] px-2 py-1.5 flex items-center justify-around shadow-lg select-none"
      >
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'studio', label: 'Studio', icon: Wand2 },
          { id: 'tools', label: '16 Tools', icon: Sparkles },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'menu', label: 'Menu', icon: Menu, isAction: true },
        ].map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isAction) {
                  setMobileNavOpen((prev) => !prev);
                } else {
                  handleNavigate(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                active
                  ? 'text-[#17231C] dark:text-[#FFFFFF] font-bold'
                  : 'text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF]'
              }`}
            >
              <div className={`p-1 rounded-lg ${active ? 'bg-[#D9F36B] text-[#101612]' : ''}`}>
                <Icon className={`w-4 h-4 ${active ? 'text-[#101612] stroke-[2.5]' : ''}`} />
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {showAuthModal && (
        <AuthPage
          initialMode={authMode}
          onSuccess={handleAuthSuccess}
          onCancel={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
