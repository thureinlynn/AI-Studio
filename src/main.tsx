import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const hadExistingController = Boolean(navigator.serviceWorker.controller);
  let hasReloadedForUpdate = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadExistingController || hasReloadedForUpdate) return;
    hasReloadedForUpdate = true;
    window.location.reload();
  });

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      void updateSW(true);
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      void registration.update().catch(() => {});
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          void registration.update().catch(() => {});
        }
      });
    },
    onRegisterError(error) {
      console.debug('[PWA] Service worker registration skipped:', error);
    },
  });
}

if (typeof document !== 'undefined') {
  const preventPinchZoom = (e: Event) => {
    e.preventDefault();
  };
  document.addEventListener('gesturestart', preventPinchZoom, { passive: false });
  document.addEventListener('gesturechange', preventPinchZoom, { passive: false });
  document.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
}

createRoot(document.getElementById('root')!).render(<App />);
