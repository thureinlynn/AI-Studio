import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
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
