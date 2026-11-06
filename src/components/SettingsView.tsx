import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useTrips } from '../context/TripContext';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Globe,
  Scale,
  DollarSign,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Info,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { weightUnit, setWeightUnit, currency, setCurrency, resetFilters, openSafetyModal } = useTrips();

  const [clearMessage, setClearMessage] = useState<string | null>(null);

  const handleClearFilters = () => {
    resetFilters();
    setClearMessage(t('settingsClearSuccess'));
    setTimeout(() => {
      setClearMessage(null);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3.5 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs border border-blue-100 dark:border-blue-900/50">
          <Settings className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('settingsTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('settingsSubtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Appearance & Theme (Dark Mode) */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('settingsAppearance')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('settingsThemeDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {/* Light Mode */}
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-bold ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Sun className="w-5 h-5 mb-1 text-amber-500" />
              <span className="text-xs">{t('themeLight')}</span>
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-bold ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Moon className="w-5 h-5 mb-1 text-indigo-400" />
              <span className="text-xs">{t('themeDark')}</span>
            </button>

            {/* System Default */}
            <button
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                theme === 'system'
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-bold ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Monitor className="w-5 h-5 mb-1 text-slate-400" />
              <span className="text-xs">{t('themeSystem')}</span>
            </button>
          </div>
        </section>

        {/* Card 2: Language & Region Switcher */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('settingsLanguage')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('settingsLangDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* English */}
            <button
              onClick={() => setLanguage('en')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                language === 'en'
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div>
                <span className="font-bold text-sm block">English</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">United States</span>
              </div>
              {language === 'en' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </button>

            {/* Myanmar */}
            <button
              onClick={() => setLanguage('my')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                language === 'my'
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div>
                <span className="font-bold text-sm block">မြန်မာ</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Burmese</span>
              </div>
              {language === 'my' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </button>
          </div>
        </section>

        {/* Card 3: Units & Display Preferences */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('settingsUnits')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('settingsWeightDesc')}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {/* Weight unit toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {t('settingsWeightUnit')}
              </span>
              <div className="flex items-center bg-white dark:bg-slate-700 p-0.5 rounded-xl border border-slate-200 dark:border-slate-600 text-xs">
                <button
                  onClick={() => setWeightUnit('kg')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                    weightUnit === 'kg'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  kg
                </button>
                <button
                  onClick={() => setWeightUnit('lb')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                    weightUnit === 'lb'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  lbs
                </button>
              </div>
            </div>

            {/* Currency reference */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {t('settingsCurrency')}
              </span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="MMK">MMK (Ks)</option>
                <option value="THB">THB (฿)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Card 4: Data, Safety & Clear Cache */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('settingsDataPrivacy')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('settingsClearCacheDesc')}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <button
              onClick={handleClearFilters}
              className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>{t('settingsClearCache')}</span>
              </span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">Reset</span>
            </button>

            {clearMessage && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{clearMessage}</span>
              </div>
            )}

            <button
              onClick={openSafetyModal}
              className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('navSafety')}</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </section>
      </div>

      {/* About Box */}
      <div className="bg-slate-100/80 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {t('settingsAbout')}
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full">
              {t('settingsVersion')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            {t('settingsAboutDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Online Server Sync
          </span>
        </div>
      </div>
    </div>
  );
};
