import React, { useEffect, useId, useRef } from 'react';
import {
  ADSTERRA_BANNER_HEIGHT,
  ADSTERRA_BANNER_KEY,
  ADSTERRA_BANNER_WIDTH,
  ADSTERRA_NATIVE_CONTAINER_ID,
  ADSTERRA_NATIVE_SCRIPT_SRC,
  buildAdsterraBannerSrcDoc,
} from '../utils/adUtils';

export interface AdsterraAdCardProps {
  /** 'feed' renders the 320x50 iframe banner; 'detail' renders the Native Banner */
  variant?: 'feed' | 'detail';
  /** Optional unique identifier for multi-slot feeds */
  slotKey?: string;
  className?: string;
}

const IFRAME_DATA_ATTR = 'data-adsterra-banner-slot';
const NATIVE_CONTAINER_DATA_ATTR = 'data-adsterra-native-container';
const NATIVE_SCRIPT_DATA_ATTR = 'data-adsterra-native-script';

export const AdsterraAdCard: React.FC<AdsterraAdCardProps> = ({
  variant = 'feed',
  slotKey,
  className = '',
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const instanceId = useId();
  const resolvedSlotKey = slotKey || instanceId;

  useEffect(() => {
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
  }, [variant, resolvedSlotKey]);

  const cardSurfaceClasses =
    variant === 'detail'
      ? 'bg-white dark:bg-slate-900 rounded-3xl shadow-xs p-5 border border-slate-200 dark:border-slate-800'
      : 'bg-white dark:bg-slate-900/90 rounded-2xl shadow-xs p-3.5 sm:p-5 border border-sky-200/80 dark:border-slate-800 h-full';

  const hostWrapperClasses =
    variant === 'detail'
      ? 'w-full flex items-center justify-center rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2 min-h-[132px] overflow-hidden'
      : 'w-full flex-1 flex items-center justify-center rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 py-2.5 px-1.5 min-h-[70px] overflow-hidden';

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
      <div ref={hostRef} className={hostWrapperClasses} />
    </aside>
  );
};
