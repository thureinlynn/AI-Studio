import React from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getDicebearAvatar, normalizeAvatarUrl, UNCLE_AVATAR_URL, isAdminAccount } from '../utils/userUtils';
import { Plus, ShieldAlert, User, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  const { openPostModal, openAuthModal, openSafetyModal, activeTab, setActiveTab, closeTripDetail } = useTrips();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const isCurrentUserAdmin = user ? isAdminAccount(user) : false;
  const headerAvatar = user
    ? (isCurrentUserAdmin ? UNCLE_AVATAR_URL : normalizeAvatarUrl(user.avatarUrl, user.id, user))
    : '';

  const handleNavClick = (tab: 'browse' | 'how_it_works' | 'safety' | 'my_trips' | 'settings') => {
    closeTripDetail();
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('browse')}
          className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl shrink-0 cursor-pointer"
        >
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
            <img
              src="/assets/aistudio/1793174899099_3f8af047.png"
              alt="LuuKyone Logo"
              className="w-full h-full object-contain drop-shadow-sm scale-110"
            />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight">
              {t('brandName')}
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 block uppercase">
              {t('brandSubtitle')}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => handleNavClick('browse')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white py-1 ${
              activeTab === 'browse' ? 'text-slate-950 dark:text-white font-semibold border-b-2 border-blue-600' : ''
            }`}
          >
            {t('navBrowse')}
          </button>
          <button
            onClick={() => handleNavClick('how_it_works')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white py-1 ${
              activeTab === 'how_it_works' ? 'text-slate-950 dark:text-white font-semibold border-b-2 border-blue-600' : ''
            }`}
          >
            {t('navHowItWorks')}
          </button>
          <button
            onClick={openSafetyModal}
            className="flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white py-1"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            {t('navSafety')}
          </button>
          {isAuthenticated && (
            <button
              onClick={() => handleNavClick('my_trips')}
              className={`transition-colors whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white py-1 ${
                activeTab === 'my_trips' ? 'text-slate-950 dark:text-white font-semibold border-b-2 border-blue-600' : ''
              }`}
            >
              {t('navMyPosts')}
            </button>
          )}
          <button
            onClick={openAuthModal}
            className="flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer hover:text-slate-900 dark:hover:text-white py-1"
          >
            {isAuthenticated && user ? (
              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-blue-300 dark:ring-blue-600 flex items-center justify-center shrink-0">
                <img
                  src={headerAvatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            )}
            <span>{isAuthenticated && user ? user.name.split(' ')[0] : t('navLogin')}</span>
          </button>
        </nav>

        {/* Zone 3: Actions - Settings Icon Button + Prominent Post Button + Responsive Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Settings Icon Button */}
          <button
            onClick={() => handleNavClick('settings')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
              activeTab === 'settings'
                ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800 shadow-xs ring-2 ring-blue-500/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700'
            }`}
            title={t('navSettings')}
            aria-label={t('navSettings')}
          >
            <Settings className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* Elevated Post Button */}
          <button
            onClick={openPostModal}
            className="flex items-center gap-1.5 px-3.5 sm:px-4.5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 active:scale-95 rounded-xl transition-all shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 border border-blue-400/30 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('navPost')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
