import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported, logEvent, Analytics } from "firebase/analytics";

const measurementId =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID) ||
  "G-LUUKYONE26";

const firebaseConfig = {
  apiKey: "AIzaSyDIviS3UdFaR851uCvvWq3d0nCmXYALzr0",
  authDomain: "luukyone-b17b7.firebaseapp.com",
  projectId: "luukyone-b17b7",
  storageBucket: "luukyone-b17b7.firebasestorage.app",
  messagingSenderId: "873286381157",
  appId: "1:873286381157:web:1d4d8b7bd0d5c17629a08c",
  measurementId: measurementId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Safe Google Analytics initialization
export let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        try {
          analytics = getAnalytics(app);
        } catch (err) {
          console.warn("[Firebase Analytics] Initialization warning:", err);
        }
      }
    })
    .catch(() => {
      // Analytics not supported in current environment
    });
}

/**
 * Log custom analytics event
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window === "undefined") return;
  try {
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  } catch (err) {
    console.debug("[Analytics] Event logging suppressed:", err);
  }
};

/**
 * Track page or tab navigation views
 */
export const trackPageView = (pageTitle: string, pagePath?: string) => {
  trackEvent("page_view", {
    page_title: pageTitle,
    page_location: typeof window !== "undefined" ? window.location.href : "",
    page_path: pagePath || (typeof window !== "undefined" ? window.location.pathname : ""),
  });
};

/**
 * Track key user conversion actions (e.g. trip posted, contact link clicked)
 */
export const trackConversion = (conversionName: string, details?: Record<string, any>) => {
  trackEvent(conversionName, {
    ...details,
    timestamp: new Date().toISOString(),
  });
};
