import React from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, UserCheck, LogIn, ShieldAlert, User, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const { openPostModal, openAuthModal, openSafetyModal, activeTab, setActiveTab, closeTripDetail } = useTrips();
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleNavClick = (tab: 'browse' | 'how_it_works' | 'safety' | 'my_trips') => {
    closeTripDetail();
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('browse')}
          className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl shrink-0 cursor-pointer"
        >
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
            <img
              src="/assets/aistudio/1793174899099_3f8af047.png"
              alt="LuuKyone Logo"
              className="w-full h-full object-contain drop-shadow-sm scale-110"
            />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight">
              {t('brandName')}
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 block uppercase">
              {t('brandSubtitle')}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNavClick('browse')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-slate-900 py-1 ${
              activeTab === 'browse' ? 'text-slate-950 font-semibold border-b-2 border-blue-600' : ''
            }`}
          >
            {t('navBrowse')}
          </button>
          <button
            onClick={() => handleNavClick('how_it_works')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-slate-900 py-1 ${
              activeTab === 'how_it_works' ? 'text-slate-950 font-semibold border-b-2 border-blue-600' : ''
            }`}
          >
            {t('navHowItWorks')}
          </button>
          <button
            onClick={openSafetyModal}
            className="flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer hover:text-slate-900 py-1"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            {t('navSafety')}
          </button>
          {isAuthenticated && (
            <button
              onClick={() => handleNavClick('my_trips')}
              className={`transition-colors whitespace-nowrap cursor-pointer hover:text-slate-900 py-1 ${
                activeTab === 'my_trips' ? 'text-slate-950 font-semibold border-b-2 border-blue-600' : ''
              }`}
            >
              {t('navMyPosts')}
            </button>
          )}
        </nav>

        {/* Zone 3: Actions - Language switcher + Prominent Post Button + Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold shadow-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-blue-700 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('my')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'my'
                  ? 'bg-white text-blue-700 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="မြန်မာ (Myanmar)"
            >
              မြန်မာ
            </button>
          </div>

          {/* Elevated Post Button */}
          <button
            onClick={openPostModal}
            className="flex items-center gap-1.5 px-3.5 sm:px-4.5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 active:scale-95 rounded-xl transition-all shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 border border-blue-400/30 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('navPost')}</span>
          </button>

          {isAuthenticated && user ? (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors text-xs font-medium cursor-pointer"
              title="Manage Profile & Trip History"
            >
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline font-semibold max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden xs:inline">{t('navLogin')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
