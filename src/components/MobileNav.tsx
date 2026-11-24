import React from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Home, Plane, User, Settings } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, openAuthModal, closeTripDetail, closePartnerDetail } = useTrips();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const handleTab = (tab: 'browse' | 'how_it_works' | 'safety' | 'my_trips' | 'settings') => {
    closeTripDetail();
    closePartnerDetail();
    setActiveTab(tab);
  };

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 pb-[env(safe-area-inset-bottom)] flex justify-center pointer-events-none">
      <nav aria-label="Mobile Navigation" className="pointer-events-auto w-full max-w-md bg-white/70 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/70 dark:border-white/15 shadow-2xl shadow-blue-900/20 rounded-full px-4 py-1.5 transition-all relative overflow-hidden">
        {/* Subtle top liquid glass reflection gloss */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/25 to-transparent pointer-events-none" />
        <div className="grid grid-cols-4 items-center h-14">
          {/* Home */}
          <button
            onClick={() => handleTab('browse')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-all ${
              activeTab === 'browse'
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">{t('mobileHome')}</span>
          </button>

          {/* My Trips */}
          <button
            onClick={() => handleTab('my_trips')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-all ${
              activeTab === 'my_trips'
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plane className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">{t('mobileMyTrips')}</span>
          </button>

          {/* Profile / Account */}
          <button
            onClick={openAuthModal}
            className="flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
              {isAuthenticated ? t('mobileAccount') : t('navLogin')}
            </span>
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => handleTab('settings')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-all ${
              activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">{t('mobileSettings')}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
