import React from 'react';
import { useTrips } from '../context/TripContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  const { openSafetyModal, setActiveTab, closeTripDetail } = useTrips();
  const { t } = useLanguage();

  const handleTab = (tab: 'browse' | 'how_it_works' | 'safety' | 'my_trips') => {
    closeTripDetail();
    setActiveTab(tab);
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 pb-20 md:pb-8 pt-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/1793174899099_3f8af047.png"
                alt="LuuKyone Logo"
                className="w-full h-full object-contain scale-105"
              />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block leading-tight">{t('brandName')}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{t('footerBrandSubtitle')}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
            <button
              onClick={() => handleTab('browse')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {t('navBrowse')}
            </button>
            <button
              onClick={() => handleTab('how_it_works')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {t('navHowItWorks')}
            </button>
            <button
              onClick={openSafetyModal}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('navSafety')}</span>
            </button>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <p>{t('footerCopyright')}</p>
          <p className="flex items-center gap-1">
            <span>{t('footerMessaging')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
