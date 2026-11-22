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
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-5BRTRVG3EM",
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

function safeLogEvent(eventName: string, params?: Record<string, string>) {
  void initBrandBiteAnalytics().then((analytics) => {
    if (!analytics) return;
    try {
      logEvent(analytics, eventName, params);
    } catch {
      // Ignore analytics runtime errors
    }
  });
}

export function trackOutboundDispatch(params: {
  title: string;
  brand: string;
  sourceName: string;
  url: string;
}) {
  safeLogEvent("outbound_dispatch_click", {
    brand: params.brand,
    source_name: params.sourceName,
    article_title: params.title.slice(0, 100),
    destination_url: params.url.slice(0, 100),
  });
}

export function trackBrandFilter(brandSlug: string) {
  safeLogEvent("brand_filter_select", {
    brand_slug: brandSlug,
  });
}

// Newsletter Funnel & Churn Analytics (never logs email PII)
export function trackNewsletterFocus(placement: string) {
  safeLogEvent("newsletter_form_focus", { placement });
}

export function trackNewsletterSignupAttempt(placement: string) {
  safeLogEvent("newsletter_signup_attempt", { placement });
}

export function trackNewsletterConfirmed() {
  safeLogEvent("newsletter_signup_confirmed", {
    newsletter_name: "The Weekly Bite",
  });
}

export function trackNewsletterUnsubscribe(reason?: string) {
  safeLogEvent(
    reason ? "newsletter_unsubscribe_feedback" : "newsletter_unsubscribe",
    {
      newsletter_name: "The Weekly Bite",
      ...(reason ? { reason } : {}),
    }
  );
}

export function trackSocialClick(platform: string) {
  safeLogEvent("social_profile_click", { platform });
}
