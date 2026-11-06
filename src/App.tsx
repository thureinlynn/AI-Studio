/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { TripProvider, useTrips } from './context/TripContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { TripList } from './components/TripList';
import { TripDetail } from './components/TripDetail';
import { HowItWorksView } from './components/HowItWorksView';
import { MyTripsView } from './components/MyTripsView';
import { SettingsView } from './components/SettingsView';
import { PostTripModal } from './components/PostTripModal';
import { AuthModal } from './components/AuthModal';
import { SafetyModal } from './components/SafetyModal';
import { PublicProfileModal } from './components/PublicProfileModal';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { selectedTrip, activeTab } = useTrips();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900/40 selection:text-blue-900 dark:selection:text-blue-200 transition-colors duration-150">
      {/* Sticky Top Header */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1">
        {selectedTrip ? (
          <TripDetail trip={selectedTrip} />
        ) : activeTab === 'settings' ? (
          <SettingsView />
        ) : activeTab === 'how_it_works' ? (
          <HowItWorksView />
        ) : activeTab === 'my_trips' ? (
          <MyTripsView />
        ) : (
          <div>
            <SearchBar />
            <TripList />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Dialogs */}
      <PostTripModal />
      <AuthModal />
      <SafetyModal />
      <PublicProfileModal />

      {/* Mobile Touch Navigation Anchor */}
      <MobileNav />
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
