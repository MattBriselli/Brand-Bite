/**
 * Non-Disruptive Web Monetization Config (BrandBite)
 *
 * Rules:
 * - Never monetize "The Weekly Bite" newsletter.
 * - Never enable Google AdSense Auto Ads (no vignettes, sticky bars, or layout shifts).
 * - At most ONE clearly labeled "Sponsored" card inside the feed grid (after item #5).
 * - Renders nothing (`null`) until either AdSense credentials or a real Partner Offer is set.
 *
 * When AdSense approves eatbrandbite.com:
 * 1. Create `public/ads.txt` with:
 *    google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
 * 2. Create ONE "In-feed" ad unit in AdSense (Auto Ads OFF) and set ADSENSE_CLIENT_ID + ADSENSE_INFEED_SLOT_ID below.
 */

export interface PartnerCardOffer {
  id: string;
  sponsorName: string;
  headline: string;
  description: string;
  ctaLabel: string;
  url: string;
  categoryLabel: string;
  image?: string;
}

export const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-9445578878788319";

export const ADSENSE_INFEED_SLOT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_INFEED_SLOT_ID || ""; // e.g. "1234567890"

// Optional zero-script native affiliate/partner fallback (leave null when none active)
export const ACTIVE_PARTNER_OFFER: PartnerCardOffer | null = null;
