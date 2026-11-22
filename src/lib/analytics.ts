"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBbLJYWNQOwNAF1enpDQA_c9q312tONR4w",
  authDomain: "brandbite-feed.firebaseapp.com",
  projectId: "brandbite-feed",
  storageBucket: "brandbite-feed.firebasestorage.app",
  messagingSenderId: "499185967239",
  appId: "1:499185967239:web:f7388cb2c5c43a7f489822",
  ...(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    ? { measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID }
    : {}),
};

let analyticsPromise: Promise<Analytics | null> | null = null;

function getFirebaseApp(): FirebaseApp {
  const existing = getApps();
  return existing.length > 0 ? existing[0] : initializeApp(firebaseConfig);
}

export function initBrandBiteAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => {
        if (!supported) return null;
        const app = getFirebaseApp();
        return getAnalytics(app);
      })
      .catch(() => null);
  }
  return analyticsPromise;
}

export function trackOutboundDispatch(params: {
  title: string;
  brand: string;
  sourceName: string;
  url: string;
}) {
  void initBrandBiteAnalytics().then((analytics) => {
    if (!analytics) return;
    try {
      logEvent(analytics, "outbound_dispatch_click", {
        brand: params.brand,
        source_name: params.sourceName,
        article_title: params.title.slice(0, 100),
        destination_url: params.url.slice(0, 100),
      });
    } catch {
      // Ignore analytics errors if GA4 property is not yet enabled in console
    }
  });
}

export function trackBrandFilter(brandSlug: string) {
  void initBrandBiteAnalytics().then((analytics) => {
    if (!analytics) return;
    try {
      logEvent(analytics, "brand_filter_select", {
        brand_slug: brandSlug,
      });
    } catch {
      // Ignore analytics errors
    }
  });
}
