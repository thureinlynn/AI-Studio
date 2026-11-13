export interface NavigatorLike {
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
  standalone?: boolean;
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
