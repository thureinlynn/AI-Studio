import React from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Home, Plane, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, openAuthModal, closeTripDetail } = useTrips();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const handleTab = (tab: 'browse' | 'how_it_works' | 'safety' | 'my_trips') => {
    closeTripDetail();
    setActiveTab(tab);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="grid grid-cols-3 items-center h-16 max-w-md mx-auto px-4">
        {/* Home */}
        <button
          onClick={() => handleTab('browse')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            activeTab === 'browse' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] mt-1 tracking-tight">{t('mobileHome')}</span>
        </button>

        {/* My Trips */}
        <button
          onClick={() => handleTab('my_trips')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            activeTab === 'my_trips' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Plane className="w-5 h-5" />
          <span className="text-[11px] mt-1 tracking-tight">{t('mobileMyTrips')}</span>
        </button>

        {/* Profile / Account */}
        <button
          onClick={openAuthModal}
          className="flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer text-slate-500 hover:text-slate-900 transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] mt-1 tracking-tight">{isAuthenticated ? t('mobileAccount') : t('navLogin')}</span>
        </button>
      </div>
    </div>
  );
};
