import { useCallback, useEffect, useState } from 'react';
import {
  isStandalonePWA,
  isIOSDevice,
  isMobileDevice,
  hasDismissedPWAPrompt,
  markPWAPromptDismissed,
  shouldShowMobileInstallAlert,
  NavigatorLike,
} from '../utils/pwaUtils';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let sharedDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<() => void>();

function notifyListeners() {
  promptListeners.forEach((listener) => listener());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    sharedDeferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    sharedDeferredPrompt = null;
    notifyListeners();
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => sharedDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const nav = window.navigator as unknown as NavigatorLike;
    const matchMediaFn = window.matchMedia ? window.matchMedia.bind(window) : null;
    return isStandalonePWA(matchMediaFn, nav);
  });
  const [isIOS, setIsIOS] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isIOSDevice(window.navigator as unknown as NavigatorLike);
  });
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isMobileDevice(
      window.navigator as unknown as NavigatorLike,
      window.innerWidth
    );
  });
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return hasDismissedPWAPrompt(window.localStorage);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nav = window.navigator as unknown as NavigatorLike;
    const matchMediaFn = window.matchMedia ? window.matchMedia.bind(window) : null;

    const syncState = () => {
      setDeferredPrompt(sharedDeferredPrompt);
      setIsInstalled(isStandalonePWA(matchMediaFn, nav));
      setIsIOS(isIOSDevice(nav));
      setIsMobile(isMobileDevice(nav, window.innerWidth));
      setIsDismissed(hasDismissedPWAPrompt(window.localStorage));
    };

    syncState();
    promptListeners.add(syncState);

    const handleAppInstalled = () => {
      sharedDeferredPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    const handleResize = () => {
      setIsMobile(isMobileDevice(nav, window.innerWidth));
    };

    const standaloneMql = window.matchMedia?.('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
      }
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('resize', handleResize);
    standaloneMql?.addEventListener?.('change', handleDisplayModeChange);

    return () => {
      promptListeners.delete(syncState);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('resize', handleResize);
      standaloneMql?.removeEventListener?.('change', handleDisplayModeChange);
    };
  }, []);

  const install = useCallback(async () => {
    const promptEvent = sharedDeferredPrompt || deferredPrompt;
    if (!promptEvent) return false;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      sharedDeferredPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      notifyListeners();
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    if (typeof window !== 'undefined') {
      markPWAPromptDismissed(window.localStorage);
    }
    setIsDismissed(true);
    notifyListeners();
  }, []);

  const shouldShowMobileAlert = shouldShowMobileInstallAlert({
    isMobile,
    isInstalled,
    isDismissed,
  });

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isMobile,
    isDismissed,
    shouldShowMobileAlert,
    install,
    dismissPrompt,
  };
}

