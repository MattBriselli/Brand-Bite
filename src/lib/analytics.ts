"use client";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-5BRTRVG3EM";

type GtagFn = (
  command: "config" | "event" | "js",
  targetOrEventName: string | Date,
  params?: Record<string, string>
) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

function safeLogEvent(eventName: string, params?: Record<string, string>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  try {
    window.gtag("event", eventName, params);
  } catch {
    // Ignore analytics runtime errors (e.g., ad blockers)
  }
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
