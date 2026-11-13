import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported, logEvent, Analytics, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { CookieConsentChoice, isAnalyticsConsented } from "./utils/cookieConsentUtils";

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

// Safe, consent-gated Google Analytics initialization
export let analytics: Analytics | null = null;

const enableAnalyticsIfSupported = () => {
  if (typeof window === "undefined") return;
  if (analytics) {
    try {
      setAnalyticsCollectionEnabled(analytics, true);
    } catch {}
    return;
  }
  isSupported()
    .then((supported) => {
      if (supported && isAnalyticsConsented()) {
        try {
          analytics = getAnalytics(app);
          setAnalyticsCollectionEnabled(analytics, true);
        } catch (err) {
          console.warn("[Firebase Analytics] Initialization warning:", err);
        }
      }
    })
    .catch(() => {
      // Analytics not supported in current environment
    });
};

if (typeof window !== "undefined" && isAnalyticsConsented()) {
  enableAnalyticsIfSupported();
}

export const syncAnalyticsConsent = (choice: CookieConsentChoice) => {
  if (typeof window === "undefined") return;
  if (choice === "accepted") {
    enableAnalyticsIfSupported();
  } else if (analytics) {
    try {
      setAnalyticsCollectionEnabled(analytics, false);
    } catch {}
  }
};

/**
 * Log custom analytics event (only when analytics cookies are accepted)
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window === "undefined" || !isAnalyticsConsented()) return;
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
