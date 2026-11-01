import type { AnalyticsPage, AnalyticsTransport } from './analytics-core';
import { ANALYTICS_ORIGIN } from './analytics-core';

// Firebase browser configuration identifies the public web app; it is not an admin credential.
const firebaseConfig = {
  apiKey: 'AIzaSyDlk_ryGuGu1yi3pJcYaGecaczVFM6kdnc',
  authDomain: 'technightcity.firebaseapp.com', projectId: 'technightcity',
  storageBucket: 'technightcity.firebasestorage.app', messagingSenderId: '43170250415',
  appId: '1:43170250415:web:24a3fecad2ec89d9e69e5a', measurementId: 'G-FCGWB3XBCP',
};
export const measurementId = firebaseConfig.measurementId;
let instance: import('firebase/analytics').Analytics | undefined;

export async function loadFirebaseAnalytics(active: () => boolean, page: AnalyticsPage, referrer: string): Promise<AnalyticsTransport | undefined> {
  if (typeof window === 'undefined' || !active()) return;
  const [appSDK, sdk] = await Promise.all([import('firebase/app'), import('firebase/analytics')]);
  if (!active() || !await sdk.isSupported() || !active()) return;
  const browser = window as unknown as Record<string, unknown>;
  browser[`ga-disable-${measurementId}`] = false;
  sdk.setConsent({ analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  const config = {
    send_page_view: false, page_location: ANALYTICS_ORIGIN + page.path, page_referrer: referrer,
    page_title: page.title, allow_google_signals: false, allow_ad_personalization_signals: false,
    cookie_flags: 'SameSite=Lax;Secure', cookie_expires: 60 * 60 * 24 * 365,
    ...(import.meta.env.VITE_ANALYTICS_DEBUG === 'true' ? { debug_mode: true } : {}),
  };
  if (!instance) {
    const app = appSDK.getApps().find(item => item.name === 'night-city-analytics') || appSDK.initializeApp(firebaseConfig, 'night-city-analytics');
    instance = sdk.initializeAnalytics(app, { config });
  }
  const analytics = instance;
  sdk.setAnalyticsCollectionEnabled(analytics, true);
  return {
    context(current, previous) {
      // Updating config also sanitizes automatically collected engagement events.
      sdk.setDefaultEventParameters({ page_location: ANALYTICS_ORIGIN + current.path, page_referrer: previous, page_title: current.title });
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      gtag?.('config', measurementId, { ...config, page_location: ANALYTICS_ORIGIN + current.path, page_referrer: previous, page_title: current.title });
    },
    event(name, params) { if (active()) sdk.logEvent(analytics, name, params); },
    stop() {
      browser[`ga-disable-${measurementId}`] = true;
      sdk.setAnalyticsCollectionEnabled(analytics, false);
      sdk.setConsent({ analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    },
  };
}
