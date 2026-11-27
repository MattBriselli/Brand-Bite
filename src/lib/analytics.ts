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

export function trackSightingModalOpen(placement: string) {
  safeLogEvent("sighting_modal_open", { placement });
}

export function trackSightingSubmitted(params: {
  brandSlug: string;
  sightingType: string;
  category: string;
}) {
  safeLogEvent("sighting_submitted", {
    brand_slug: params.brandSlug,
    sighting_type: params.sightingType,
    category: params.category,
  });
}

export function trackFeedSearch(params: {
  query: string;
  surface: "home_feed" | "brands_directory";
  resultsCount: number;
}) {
  const cleaned = params.query.trim().toLowerCase().slice(0, 80);
  if (cleaned.length < 2) return;
  safeLogEvent("feed_search", {
    search_term: cleaned,
    surface: params.surface,
    results_count: String(params.resultsCount),
  });
}

export function trackFeedFilterSelect(params: {
  filterKind: "type" | "category" | "source" | "mode" | "segment" | "letter" | "sort";
  filterValue: string;
}) {
  safeLogEvent("feed_filter_select", {
    filter_kind: params.filterKind,
    filter_value: params.filterValue.slice(0, 60),
  });
}

export function trackThemeToggle(params: {
  targetTheme: "light" | "dark";
  matchesSystem: boolean;
}) {
  safeLogEvent("theme_toggle", {
    target_theme: params.targetTheme,
    matches_system: params.matchesSystem ? "true" : "false",
  });
}

export function trackSponsoredSlotView(params: {
  slotId: string;
  provider: "adsense" | "partner";
  label: string;
}) {
  safeLogEvent("sponsored_slot_view", {
    slot_id: params.slotId,
    provider: params.provider,
    sponsor_label: params.label.slice(0, 80),
  });
}

export function trackSponsoredSlotClick(params: {
  slotId: string;
  provider: "adsense" | "partner";
  label: string;
  destinationUrl: string;
}) {
  safeLogEvent("sponsored_slot_click", {
    slot_id: params.slotId,
    provider: params.provider,
    sponsor_label: params.label.slice(0, 80),
    destination_url: params.destinationUrl.slice(0, 100),
  });
}

export function trackReviewRead(params: {
  slug: string;
  brandSlug: string;
  rating?: number;
  verdict?: string;
}) {
  safeLogEvent("review_read", {
    review_slug: params.slug.slice(0, 80),
    brand_slug: params.brandSlug,
    ...(params.rating !== undefined ? { rating: String(params.rating) } : {}),
    ...(params.verdict ? { verdict: params.verdict } : {}),
  });
}
