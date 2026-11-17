import React, { useEffect, useId, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  ADSTERRA_BANNER_HEIGHT,
  ADSTERRA_BANNER_KEY,
  ADSTERRA_BANNER_WIDTH,
  ADSTERRA_NATIVE_CONTAINER_ID,
  ADSTERRA_NATIVE_SCRIPT_SRC,
  CustomFeedAd,
  buildAdsterraBannerSrcDoc,
} from '../utils/adUtils';

export interface AdsterraAdCardProps {
  /** 'feed' renders the 320x50 iframe banner (or custom ad); 'detail' renders the Native Banner */
  variant?: 'feed' | 'detail';
  /** Optional unique identifier for multi-slot feeds */
  slotKey?: string;
  /** Optional custom sponsored card replacing Auto Adsterra ad */
  customAd?: CustomFeedAd | null;
  className?: string;
}

const IFRAME_DATA_ATTR = 'data-adsterra-banner-slot';
const NATIVE_CONTAINER_DATA_ATTR = 'data-adsterra-native-container';
const NATIVE_SCRIPT_DATA_ATTR = 'data-adsterra-native-script';

export const AdsterraAdCard: React.FC<AdsterraAdCardProps> = ({
  variant = 'feed',
  slotKey,
  customAd = null,
  className = '',
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const instanceId = useId();
  const resolvedSlotKey = slotKey || instanceId;
  const [logoStage, setLogoStage] = useState<'primary' | 'fallback' | 'initials'>('primary');

  useEffect(() => {
    setLogoStage('primary');
  }, [customAd?.logoUrl, customAd?.fallbackLogoUrl]);

  useEffect(() => {
    if (customAd) return;
    const hostEl = hostRef.current;
    if (!hostEl) return;

    if (variant === 'detail') {
      // Trip Detail: Native Banner (<script async data-cfasync="false" src="...21/a0dcee..."> + <div id="container-a0dcee...">)
      if (hostEl.querySelector(`[${NATIVE_CONTAINER_DATA_ATTR}]`)) {
        return;
      }

      const existingPrimary = document.getElementById(ADSTERRA_NATIVE_CONTAINER_ID);
      const containerEl = document.createElement('div');
      containerEl.setAttribute(NATIVE_CONTAINER_DATA_ATTR, resolvedSlotKey);
      containerEl.className = 'w-full min-h-[120px] flex items-center justify-center';
      containerEl.id = !existingPrimary
        ? ADSTERRA_NATIVE_CONTAINER_ID
        : `${ADSTERRA_NATIVE_CONTAINER_ID}-${resolvedSlotKey.replace(/[^a-zA-Z0-9_-]/g, '')}`;

      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[${NATIVE_SCRIPT_DATA_ATTR}="${ADSTERRA_NATIVE_CONTAINER_ID}"]`
      );

      let appendedScript: HTMLScriptElement | null = null;
      if (!existingScript) {
        const scriptEl = document.createElement('script');
        scriptEl.async = true;
        scriptEl.setAttribute('async', 'async');
        scriptEl.setAttribute('data-cfasync', 'false');
        scriptEl.setAttribute(NATIVE_SCRIPT_DATA_ATTR, ADSTERRA_NATIVE_CONTAINER_ID);
        scriptEl.src = ADSTERRA_NATIVE_SCRIPT_SRC;
        scriptEl.onerror = () => {};
        hostEl.appendChild(scriptEl);
        appendedScript = scriptEl;
      }

      hostEl.appendChild(containerEl);

      return () => {
        if (appendedScript && appendedScript.parentNode) {
          appendedScript.parentNode.removeChild(appendedScript);
        }
        if (containerEl.parentNode) {
          containerEl.parentNode.removeChild(containerEl);
        }
      };
    }

    // Main Feed: 320x50 iframe banner
    if (hostEl.querySelector(`iframe[${IFRAME_DATA_ATTR}]`)) {
      return;
    }

    const iframeEl = document.createElement('iframe');
    iframeEl.setAttribute(IFRAME_DATA_ATTR, resolvedSlotKey);
    iframeEl.setAttribute('data-adsterra-key', ADSTERRA_BANNER_KEY);
    iframeEl.title = 'Sponsored advertisement';
    iframeEl.width = String(ADSTERRA_BANNER_WIDTH);
    iframeEl.height = String(ADSTERRA_BANNER_HEIGHT);
    iframeEl.scrolling = 'no';
    iframeEl.style.border = '0';
    iframeEl.style.width = `${ADSTERRA_BANNER_WIDTH}px`;
    iframeEl.style.height = `${ADSTERRA_BANNER_HEIGHT}px`;
    iframeEl.style.maxWidth = '100%';
    iframeEl.style.overflow = 'hidden';
    iframeEl.style.display = 'block';
    iframeEl.srcdoc = buildAdsterraBannerSrcDoc();

    hostEl.appendChild(iframeEl);

    return () => {
      if (iframeEl.parentNode) {
        iframeEl.parentNode.removeChild(iframeEl);
      }
    };
  }, [variant, resolvedSlotKey, customAd]);

  const cardSurfaceClasses =
    variant === 'detail'
      ? 'bg-white dark:bg-slate-900 rounded-3xl shadow-xs p-5 border border-slate-200 dark:border-slate-800'
      : 'bg-white dark:bg-slate-900/90 rounded-2xl shadow-xs p-5 border border-sky-200/80 dark:border-slate-800 h-full min-h-[212px]';

  const hostWrapperClasses =
    variant === 'detail'
      ? 'w-full flex items-center justify-center rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2 min-h-[132px] overflow-hidden'
      : 'w-full flex-1 flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 py-2.5 px-2 min-h-[70px] overflow-hidden';

  if (customAd && variant === 'feed') {
    let hostname = '';
    try {
      hostname = new URL(customAd.href).hostname.replace(/^www\./, '');
    } catch {
      hostname = customAd.href;
    }
    const initials = customAd.title
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');

    return (
      <aside
        aria-label={`Sponsored: ${customAd.title}`}
        data-testid="adsterra-ad-card"
        data-ad-variant="custom"
        className={`${cardSurfaceClasses} relative flex flex-col justify-between gap-3 transition-all hover:border-sky-400/90 dark:hover:border-sky-500/50 hover:shadow-md ${className}`.trim()}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Partner Recommendation
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80">
            Sponsored
          </span>
        </div>

        <a
          href={customAd.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex-1 flex flex-col justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
        >
          <div className="flex-1 flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-colors">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 shrink-0 overflow-hidden flex items-center justify-center p-1">
              {logoStage !== 'initials' ? (
                <img
                  src={
                    logoStage === 'fallback' && customAd.fallbackLogoUrl
                      ? customAd.fallbackLogoUrl
                      : customAd.logoUrl
                  }
                  alt={customAd.title}
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (logoStage === 'primary' && customAd.fallbackLogoUrl) {
                      setLogoStage('fallback');
                    } else {
                      setLogoStage('initials');
                    }
                  }}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {initials}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {customAd.title}
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {customAd.text}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 dark:text-slate-500 truncate">
              {hostname}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 shrink-0">
              <span>Visit</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>
        </a>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Sponsored advertisement"
      data-testid="adsterra-ad-card"
      data-ad-variant={variant}
      className={`${cardSurfaceClasses} relative flex flex-col justify-between gap-3 transition-colors ${className}`.trim()}
    >
      {/* Subtle Top Sponsored Label */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          Partner Recommendation
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80">
          Sponsored
        </span>
      </div>

      {/* Dynamic Adsterra Container / Iframe Host */}
      <div className={hostWrapperClasses}>
        {variant === 'feed' && (
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide text-center">
            Advertise here
          </p>
        )}
        <div
          ref={hostRef}
          className="w-full flex items-center justify-center overflow-hidden"
        />
      </div>
    </aside>
  );
};
