import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  enableNetwork,
  disableNetwork,
  setLogLevel,
  Firestore,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { CookieConsentChoice, isAnalyticsConsented } from "./utils/cookieConsentUtils";
import { isBrowserOffline } from "./utils/firebaseUtils";

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

// Suppress internal @firebase/firestore SDK console.error noise during transient offline/network switches;
// application callbacks explicitly handle errors and fall back to local cache + server API.
setLogLevel("silent");

let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
    // Force long-polling to avoid WebChannel streaming connection drops behind proxies, iframes, and mobile carriers
    experimentalForceLongPolling: true,
  });
} catch {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;

if (typeof window !== "undefined") {
  if (isBrowserOffline(window.navigator)) {
    disableNetwork(db).catch(() => {});
  }
  window.addEventListener("offline", () => {
    disableNetwork(db).catch(() => {});
  });
  window.addEventListener("online", () => {
    enableNetwork(db).catch(() => {});
  });
}

// Safe, consent-gated & lazy-loaded Google Analytics initialization
type AnalyticsModule = typeof import("firebase/analytics");
type AnalyticsInstance = import("firebase/analytics").Analytics;

export let analytics: AnalyticsInstance | null = null;
let analyticsModule: AnalyticsModule | null = null;

const enableAnalyticsIfSupported = () => {
  if (typeof window === "undefined") return;
  if (analytics && analyticsModule) {
    try {
      analyticsModule.setAnalyticsCollectionEnabled(analytics, true);
    } catch {}
    return;
  }
  import("firebase/analytics")
    .then(async (mod) => {
      analyticsModule = mod;
      const supported = await mod.isSupported();
      if (supported && isAnalyticsConsented()) {
        try {
          analytics = mod.getAnalytics(app);
          mod.setAnalyticsCollectionEnabled(analytics, true);
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
  } else if (analytics && analyticsModule) {
    try {
      analyticsModule.setAnalyticsCollectionEnabled(analytics, false);
    } catch {}
  }
};

/**
 * Log custom analytics event (only when analytics cookies are accepted)
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window === "undefined" || !isAnalyticsConsented()) return;
  try {
    if (analytics && analyticsModule) {
      analyticsModule.logEvent(analytics, eventName, eventParams);
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
