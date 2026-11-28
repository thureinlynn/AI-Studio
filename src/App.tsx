/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { TripProvider, useTrips } from './context/TripContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { TripList } from './components/TripList';
import { MobileNav } from './components/MobileNav';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobilePWAInstallAlert } from './components/MobilePWAInstallAlert';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import {
  SITE_TITLE,
  DEFAULT_DESCRIPTION,
  formatCanonicalUrl,
  generateBreadcrumbJsonLd,
} from './utils/seoUtils';

const TripDetail = lazy(() =>
  import('./components/TripDetail').then((m) => ({ default: m.TripDetail }))
);
const CargoPartnerDetail = lazy(() =>
  import('./components/CargoPartnerDetail').then((m) => ({ default: m.CargoPartnerDetail }))
);
const HowItWorksView = lazy(() =>
  import('./components/HowItWorksView').then((m) => ({ default: m.HowItWorksView }))
);
const MyTripsView = lazy(() =>
  import('./components/MyTripsView').then((m) => ({ default: m.MyTripsView }))
);
const SettingsView = lazy(() =>
  import('./components/SettingsView').then((m) => ({ default: m.SettingsView }))
);
const PostTripModal = lazy(() =>
  import('./components/PostTripModal').then((m) => ({ default: m.PostTripModal }))
);
const AuthModal = lazy(() =>
  import('./components/AuthModal').then((m) => ({ default: m.AuthModal }))
);
const SafetyModal = lazy(() =>
  import('./components/SafetyModal').then((m) => ({ default: m.SafetyModal }))
);
const PublicProfileModal = lazy(() =>
  import('./components/PublicProfileModal').then((m) => ({ default: m.PublicProfileModal }))
);
const ConfirmDialogModal = lazy(() =>
  import('./components/ConfirmDialogModal').then((m) => ({ default: m.ConfirmDialogModal }))
);
const VolumetricCalculatorModal = lazy(() =>
  import('./components/VolumetricCalculatorModal').then((m) => ({
    default: m.VolumetricCalculatorModal,
  }))
);

const ViewLoader: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-20 flex items-center justify-center">
    <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppContent: React.FC = () => {
  const {
    selectedTrip,
    selectedTripId,
    selectedPartner,
    selectedPartnerId,
    isLoadingTrips,
    isPostModalOpen,
    isAuthModalOpen,
    isSafetyModalOpen,
    isCalculatorModalOpen,
    publicProfileTraveler,
    confirmDialog,
    closeTripDetail,
    closePartnerDetail,
    closeCalculatorModal,
    activeTab,
  } = useTrips();

  // Active page dynamic SEO metadata
  const pageSeo = React.useMemo(() => {
    if (selectedTrip || selectedPartner) {
      // Handled by TripDetail / CargoPartnerDetail component
      return null;
    }

    if (activeTab === 'how_it_works') {
      return {
        title: 'How It Works - LuuKyone Traveler Luggage Classifieds',
        description:
          'Learn how LuuKyone connects travelers with extra baggage space to community senders safely, transparently, and cost-effectively.',
        canonicalUrl: formatCanonicalUrl(null, 'how_it_works'),
        jsonLd: generateBreadcrumbJsonLd([
          { name: 'Home', url: '/' },
          { name: 'How It Works', url: '/?tab=how_it_works' },
        ]),
      };
    }

    if (activeTab === 'safety') {
      return {
        title: 'Community Safety Guidelines & Prohibited Items | LuuKyone',
        description:
          'Read baggage safety rules, prohibited items checklist, package inspection policies, and security advice for peer travelers.',
        canonicalUrl: formatCanonicalUrl(null, 'safety'),
        jsonLd: generateBreadcrumbJsonLd([
          { name: 'Home', url: '/' },
          { name: 'Safety Guidelines', url: '/?tab=safety' },
        ]),
      };
    }

    if (activeTab === 'my_trips') {
      return {
        title: 'My Posted Trips | LuuKyone',
        description: 'Manage and review your published traveler baggage listings on LuuKyone.',
        canonicalUrl: formatCanonicalUrl(null, 'my_trips'),
        noIndex: true,
      };
    }

    if (activeTab === 'settings') {
      return {
        title: 'Settings & Preferences | LuuKyone',
        canonicalUrl: formatCanonicalUrl(null, 'settings'),
        noIndex: true,
      };
    }

    // Default Home / Browse
    return {
      title: SITE_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonicalUrl: formatCanonicalUrl(),
    };
  }, [selectedTrip, selectedPartner, activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900/40 selection:text-blue-900 dark:selection:text-blue-200 transition-colors duration-150">
      {pageSeo && <SEO {...pageSeo} />}
      {/* Sticky Top Header */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1">
        <MobilePWAInstallAlert />
        {selectedPartner ? (
          <Suspense fallback={<ViewLoader />}>
            <CargoPartnerDetail partner={selectedPartner} />
          </Suspense>
        ) : selectedPartnerId ? (
          <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cargo partner not found</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This cargo partner business page may have moved or is unavailable.
            </p>
            <button
              type="button"
              onClick={closePartnerDetail}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Back to all listings
            </button>
          </div>
        ) : selectedTrip ? (
          <Suspense fallback={<ViewLoader />}>
            <TripDetail trip={selectedTrip} />
          </Suspense>
        ) : selectedTripId ? (
          isLoadingTrips ? (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading trip details...</p>
            </div>
          ) : (
            <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trip listing not found</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This trip may have been removed or expired.
              </p>
              <button
                type="button"
                onClick={closeTripDetail}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Back to all trips
              </button>
            </div>
          )
        ) : activeTab === 'settings' ? (
          <Suspense fallback={<ViewLoader />}>
            <SettingsView />
          </Suspense>
        ) : activeTab === 'how_it_works' ? (
          <Suspense fallback={<ViewLoader />}>
            <HowItWorksView />
          </Suspense>
        ) : activeTab === 'my_trips' ? (
          <Suspense fallback={<ViewLoader />}>
            <MyTripsView />
          </Suspense>
        ) : (
          <div>
            <SearchBar />
            <TripList />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Dialogs (lazy-loaded & mounted only when open) */}
      <Suspense fallback={null}>
        {isPostModalOpen && <PostTripModal />}
        {isAuthModalOpen && <AuthModal />}
        {isSafetyModalOpen && <SafetyModal />}
        {Boolean(publicProfileTraveler) && <PublicProfileModal />}
        {Boolean(confirmDialog) && <ConfirmDialogModal />}
        {isCalculatorModalOpen && (
          <VolumetricCalculatorModal
            isOpen={isCalculatorModalOpen}
            onClose={closeCalculatorModal}
          />
        )}
      </Suspense>

      {/* Mobile Touch Navigation Anchor */}
      <MobileNav />

      {/* Analytics Cookie Consent Banner */}
      <CookieConsentBanner />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TripProvider>
            <AppContent />
          </TripProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
