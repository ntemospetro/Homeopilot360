import React, { useState, useEffect } from 'react';
import { ActiveView, Therapist } from './types';
import { 
  getActiveTherapist, 
  isAdminLoggedIn, 
  setAdminLoggedIn, 
  getActiveTherapistId,
  setActiveTherapistId,
  getTherapists,
  saveTherapists,
  getPatientCases,
  safeLocalStorageSetItem,
  STORAGE_KEYS,
  getPackagePlans,
  savePackagePlans,
  getSiteConfig,
  getStoredActiveView,
  setStoredActiveView
} from './services/storage';
import { initCloudSync } from './services/cloudSyncService';
import { 
  initNavigation, 
  navigateTo, 
  dispatchNavigationEvents 
} from './services/navigation';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import { TerminologyProvider } from './i18n/TerminologyContext';
import { Header } from './components/Header';
import { RegistrationView } from './components/RegistrationView';
import { TherapistPanel } from './components/TherapistPanel';
import { TherapistLogin } from './components/TherapistLogin';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { AdminSecurityGate } from './components/AdminSecurityGate';
import { LandingPage } from './components/LandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';


function AppContent() {
  const [currentView, setCurrentView] = useState<ActiveView>(() => {
    const nav = initNavigation();
    return nav.view;
  });
  const [activeTherapist, setActiveTherapist] = useState<Therapist | null>(getActiveTherapist());
  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminLoggedIn());
  const [isAdminGateUnlocked, setIsAdminGateUnlocked] = useState<boolean>(false);
  const { t } = useTranslation();

  const syncState = () => {
    setActiveTherapist(getActiveTherapist());
    setIsAdmin(isAdminLoggedIn());
  };

  useEffect(() => {
    setStoredActiveView(currentView);
  }, [currentView]);

  // Synchronize browser history navigation changes
  useEffect(() => {
    const handleNavStateChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ view: ActiveView }>;
      if (customEvent.detail?.view && customEvent.detail.view !== currentView) {
        setCurrentView(customEvent.detail.view);
      }
    };
    window.addEventListener('homoeo_navigation_state_changed', handleNavStateChange);
    return () => window.removeEventListener('homoeo_navigation_state_changed', handleNavStateChange);
  }, [currentView]);

  useEffect(() => {
    syncState();
    window.addEventListener('homoeo_storage_updated', syncState);
    window.addEventListener('homoeo_active_therapist_changed', syncState);
    window.addEventListener('homoeo_admin_auth_changed', syncState);
    return () => {
      window.removeEventListener('homoeo_storage_updated', syncState);
      window.removeEventListener('homoeo_active_therapist_changed', syncState);
      window.removeEventListener('homoeo_admin_auth_changed', syncState);
    };
  }, []);

  // Initialize Firebase Cloud Sync (Firestore)
  useEffect(() => {
    initCloudSync(
      getTherapists,
      saveTherapists,
      () => getPatientCases(),
      (cases) => {
        safeLocalStorageSetItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
        window.dispatchEvent(new Event('homoeo_cases_updated'));
      },
      getPackagePlans,
      savePackagePlans
    );
  }, []);

  // Handle Favicon
  useEffect(() => {
    const updateFavicon = () => {
      const config = getSiteConfig();
      if (config.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = config.faviconUrl;
      } else {
        // SVG Base64 Favicon 'H' as fallback
        const svgH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0d9488"/><text x="16" y="24" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle">H</text></svg>`;
        const defaultIcon = `data:image/svg+xml;base64,${btoa(svgH)}`;
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = defaultIcon;
      }
    };
    
    updateFavicon();
    window.addEventListener('homoeo_site_config_changed', updateFavicon);
    return () => window.removeEventListener('homoeo_site_config_changed', updateFavicon);
  }, []);

  const handleViewChange = (newView: ActiveView) => {
    navigateTo(newView);
    setCurrentView(newView);
  };

  const handleRegistrationSuccess = (newTherapist: Therapist) => {
    setActiveTherapist(newTherapist);
    handleViewChange('therapist');
  };

  const handleSwitchToTherapistFromAdmin = (therapistId: string) => {
    setActiveTherapist(getActiveTherapist());
    handleViewChange('therapist');
  };

  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    setIsAdmin(false);
    setIsAdminGateUnlocked(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Primary App Header */}
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        activeTherapist={activeTherapist}
      />

      {/* 3. Main Content Views */}
      <main className="flex-1">
        {/* VIEW 0: LANDING PAGE */}
        {currentView === 'landing' && (
          <LandingPage 
            onGetStarted={() => handleViewChange('register')}
            onGoToLogin={() => handleViewChange('therapist')}
          />
        )}

        {/* VIEW 1: REGISTRIERUNG */}
        {currentView === 'register' && (
          <RegistrationView
            onSuccess={handleRegistrationSuccess}
            onGoToAdmin={() => handleViewChange('admin')}
          />
        )}

        {/* VIEW 2: THERAPEUTEN-PANEL / LOGIN */}
        {currentView === 'therapist' && (
          activeTherapist ? (
            <TherapistPanel
              therapist={activeTherapist}
              onGoToAdmin={() => handleViewChange('admin')}
              onGoToRegister={() => handleViewChange('register')}
              onLogout={() => {
                setActiveTherapistId('');
                setActiveTherapist(null);
                handleViewChange('landing');
              }}
            />
          ) : (
            <TherapistLogin
              onLoginSuccess={(loggedTherapist) => {
                setActiveTherapist(loggedTherapist);
                handleViewChange('therapist');
              }}
              onGoToRegister={() => handleViewChange('register')}
            />
          )
        )}



        {/* VIEW 3: ADMIN-PANEL (Streng geschützt durch Sicherheits-Gate & Login) */}
        {currentView === 'admin' && (
          <>
            {isAdmin ? (
              <AdminPanel
                onSwitchToTherapist={handleSwitchToTherapistFromAdmin}
                onLogout={handleAdminLogout}
              />
            ) : !isAdminGateUnlocked ? (
              <AdminSecurityGate
                onUnlock={() => setIsAdminGateUnlocked(true)}
                onCancel={() => handleViewChange('landing')}
              />
            ) : (
              <AdminLogin
                onLoginSuccess={() => {
                  setIsAdmin(true);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer (Only on Public / Landing / Register views) */}
      {(currentView === 'landing' || currentView === 'register') && (
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              {t('footerCopyright')}
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <span>{t('footerTrialBadge')}</span>
              <span>•</span>
              <span>{t('footerGdprBadge')}</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <TerminologyProvider>
          <AppContent />
        </TerminologyProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
