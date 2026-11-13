import React, { useState } from 'react';
import { Cookie } from 'lucide-react';
import {
  CookieConsentChoice,
  getStoredCookieConsent,
  saveCookieConsent,
} from '../utils/cookieConsentUtils';
import { syncAnalyticsConsent } from '../firebase';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(
    () => getStoredCookieConsent() === null
  );

  if (!isVisible) return null;

  const handleChoice = (choice: CookieConsentChoice) => {
    saveCookieConsent(choice);
    syncAnalyticsConsent(choice);
    setIsVisible(false);
  };

  return (
    <aside
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-5 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none"
    >
      <div className="max-w-4xl mx-auto pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/40 p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60 mt-0.5 sm:mt-0">
            <Cookie className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">
              Analytics Cookies
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              We use analytics cookies solely to understand how visitors find and browse the catalog—without displaying public view counts or trending rows.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleChoice('declined')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleChoice('accepted')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            Accept
          </button>
        </div>
      </div>
    </aside>
  );
};
