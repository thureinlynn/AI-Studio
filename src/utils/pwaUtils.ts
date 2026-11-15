export const PWA_PROMPT_DISMISSED_KEY = 'luukyone_pwa_prompt_dismissed';

export interface NavigatorLike {
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
  standalone?: boolean;
}

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

/**
 * Returns true if the app is currently running inside an installed standalone PWA window.
 */
export function isStandalonePWA(
  matchMediaFn?: ((query: string) => { matches: boolean }) | null,
  nav?: NavigatorLike | null
): boolean {
  const mediaStandalone = Boolean(
    matchMediaFn &&
      (matchMediaFn('(display-mode: standalone)').matches ||
        matchMediaFn('(display-mode: fullscreen)').matches)
  );
  const iosStandalone = nav?.standalone === true;
  return mediaStandalone || iosStandalone;
}

/**
 * Detects iPhone, iPad (including iPadOS desktop UA), and iPod devices.
 */
export function isIOSDevice(nav?: NavigatorLike | null): boolean {
  if (!nav) return false;
  const ua = (nav.userAgent || '').toLowerCase();
  const isClassicIOS = /iphone|ipad|ipod/.test(ua);
  const isIPadOS =
    (nav.platform || '').toLowerCase() === 'macintel' && (nav.maxTouchPoints || 0) > 1;
  return isClassicIOS || isIPadOS;
}

/**
 * Detects mobile devices or mobile-sized viewports (< 768px) where the mobile install alert applies.
 */
export function isMobileDevice(
  nav?: NavigatorLike | null,
  viewportWidth?: number
): boolean {
  if (typeof viewportWidth === 'number' && viewportWidth > 0 && viewportWidth < 768) {
    return true;
  }
  if (!nav) return false;
  if (isIOSDevice(nav)) return true;
  const ua = (nav.userAgent || '').toLowerCase();
  return /android|webos|blackberry|iemobile|opera mini|mobile/.test(ua);
}

/**
 * Checks whether the user previously dismissed the mobile PWA install alert.
 */
export function hasDismissedPWAPrompt(storage?: Pick<StorageLike, 'getItem'> | null): boolean {
  if (!storage) return false;
  try {
    return Boolean(storage.getItem(PWA_PROMPT_DISMISSED_KEY));
  } catch {
    return false;
  }
}

/**
 * Persists dismissal of the mobile PWA install alert.
 */
export function markPWAPromptDismissed(
  storage?: Pick<StorageLike, 'setItem'> | null,
  timestamp: string = new Date().toISOString()
): void {
  if (!storage) return;
  try {
    storage.setItem(PWA_PROMPT_DISMISSED_KEY, timestamp);
  } catch {
    // Ignore storage quota or private-browsing errors
  }
}

/**
 * Determines whether the mobile PWA installation alert should be displayed.
 */
export function shouldShowMobileInstallAlert(params: {
  isMobile: boolean;
  isInstalled: boolean;
  isDismissed: boolean;
}): boolean {
  return params.isMobile && !params.isInstalled && !params.isDismissed;
}

