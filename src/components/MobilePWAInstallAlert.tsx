import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, MoreVertical, PlusSquare, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../context/LanguageContext';

export const MobilePWAInstallAlert: React.FC = () => {
  const {
    isInstallable,
    isIOS,
    shouldShowMobileAlert,
    install,
    dismissPrompt,
  } = usePWAInstall();
  const { t } = useLanguage();
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  if (!shouldShowMobileAlert) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowInstallGuide(true);
  };

  return (
    <>
      <div className="md:hidden max-w-7xl mx-auto px-4 py-3">
        <div
          role="alert"
          aria-live="polite"
          data-testid="mobile-pwa-install-alert"
          className="rounded-2xl bg-blue-50/90 dark:bg-slate-900 border border-blue-200/90 dark:border-slate-800 p-3.5 shadow-sm transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 flex items-center justify-center">
              <img
                src="/pwa-192x192.png"
                alt="LuuKyone"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {t('pwaAlertTitle')}
                </h2>
                <button
                  type="button"
                  onClick={dismissPrompt}
                  aria-label={t('pwaDismissAria')}
                  className="-mr-2 -mt-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-blue-100/70 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed -mt-1 pr-2">
                {t('pwaAlertDesc')}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              {isIOS ? (
                <Smartphone className="w-4 h-4 shrink-0" />
              ) : (
                <Download className="w-4 h-4 shrink-0" />
              )}
              <span>{t('pwaInstallBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {showInstallGuide &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-pwa-guide-title"
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3
                  id="mobile-pwa-guide-title"
                  className="text-base font-bold text-slate-900 dark:text-white"
                >
                  {isIOS ? t('pwaGuideTitleIOS') : t('pwaGuideTitleMobile')}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInstallGuide(false)}
                  className="min-w-[44px] min-h-[44px] -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('pwaGuideDesc')}
              </p>

              {isIOS ? (
                <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700">
                  <li className="flex items-center gap-2.5">
                    <Share className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>
                      1. Tap the <strong>Share</strong> button in Safari&apos;s toolbar.
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <PlusSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>
                      2. Scroll down and tap <strong>Add to Home Screen</strong>.
                    </span>
                  </li>
                </ol>
              ) : (
                <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700">
                  <li className="flex items-center gap-2.5">
                    <MoreVertical className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>
                      1. Tap your browser menu (<strong>⋮</strong> or <strong>⋯</strong>).
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>
                      2. Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                    </span>
                  </li>
                </ol>
              )}

              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                className="w-full min-h-[44px] rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {t('pwaGuideGotIt')}
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
