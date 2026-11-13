import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Suppress install prompt when already running in installed standalone mode
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          variant === 'card'
            ? 'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer'
            : 'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors cursor-pointer shrink-0'
        }
        title="Install LuuKyone App"
      >
        <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className={variant === 'header' ? 'hidden sm:inline' : ''}>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={
            variant === 'card'
              ? 'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer'
              : 'inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors cursor-pointer shrink-0'
          }
          title="Install LuuKyone on iPhone or iPad"
          aria-label="Install LuuKyone on iPhone or iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className={variant === 'header' ? 'hidden sm:inline' : ''}>Install App</span>
        </button>

        {showIOSGuide &&
          typeof document !== 'undefined' &&
          createPortal(
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="ios-install-title"
                className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 id="ios-install-title" className="text-base font-bold text-slate-900 dark:text-white">
                    Install LuuKyone on iPhone / iPad
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowIOSGuide(false)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Add LuuKyone to your home screen to launch full screen without Safari&apos;s address bar:
                </p>

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

                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </div>,
            document.body
          )}
      </>
    );
  }

  return null;
};
