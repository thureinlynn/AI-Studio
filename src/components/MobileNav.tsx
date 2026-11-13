import React from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Home, Plane, User, Settings } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, openAuthModal, closeTripDetail } = useTrips();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const handleTab = (tab: 'browse' | 'how_it_works' | 'safety' | 'my_trips' | 'settings') => {
    closeTripDetail();
    setActiveTab(tab);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg transition-colors">
      <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
        {/* Home */}
        <button
          onClick={() => handleTab('browse')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            activeTab === 'browse'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">{t('mobileHome')}</span>
        </button>

        {/* My Trips */}
        <button
          onClick={() => handleTab('my_trips')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            activeTab === 'my_trips'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Plane className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">{t('mobileMyTrips')}</span>
        </button>

        {/* Profile / Account */}
        <button
          onClick={openAuthModal}
          className="flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
            {isAuthenticated ? t('mobileAccount') : t('navLogin')}
          </span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => handleTab('settings')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            activeTab === 'settings'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">{t('mobileSettings')}</span>
        </button>
      </div>
    </div>
  );
};
