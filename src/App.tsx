/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { TripProvider, useTrips } from './context/TripContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { TripList } from './components/TripList';
import { TripDetail } from './components/TripDetail';
import { HowItWorksView } from './components/HowItWorksView';
import { MyTripsView } from './components/MyTripsView';
import { PostTripModal } from './components/PostTripModal';
import { AuthModal } from './components/AuthModal';
import { SafetyModal } from './components/SafetyModal';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { selectedTrip, activeTab } = useTrips();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Sticky Top Header */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1">
        {selectedTrip ? (
          <TripDetail trip={selectedTrip} />
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

      {/* Mobile Touch Navigation Anchor */}
      <MobileNav />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <TripProvider>
          <AppContent />
        </TripProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
