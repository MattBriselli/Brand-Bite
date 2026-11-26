export interface SocialProfile {
  id: "instagram" | "x" | "bluesky";
  label: string;
  handle: string;
  url: string | null; // Set once handle is claimed
}

// Update `url` and `handle` here as soon as you claim each account!
export const SOCIAL_PROFILES: SocialProfile[] = [
  {
    id: "instagram",
    label: "Instagram",
    handle: "@eatbrandbite (Launching Soon)",
    url: process.env.NEXT_PUBLIC_INSTAGRAM_URL || null,
  },
  {
    id: "x",
    label: "X (Twitter)",
    handle: "@eatbrandbite (Launching Soon)",
    url: process.env.NEXT_PUBLIC_TWITTER_URL || null,
  },
  {
    id: "bluesky",
    label: "Bluesky",
    handle: "@eatbrandbite.com (Launching Soon)",
    url: process.env.NEXT_PUBLIC_BLUESKY_URL || null,
  },
];

// Paste your Kit (ConvertKit) form action URL (e.g. "https://app.kit.com/forms/XXXXXXX/subscriptions")
// or Beehiiv magic subscribe URL once created.
export const NEWSLETTER_FORM_ACTION =
  process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ACTION || "";
