export interface SocialProfile {
  id: "instagram" | "threads" | "bluesky";
  label: string;
  handle: string;
  url: string | null; // Set once handle is claimed
}

// Update `url` and `handle` here as soon as you claim each account!
export const SOCIAL_PROFILES: SocialProfile[] = [
  {
    id: "instagram",
    label: "Instagram",
    handle: "@eat.brand.bite",
    url:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
      "https://www.instagram.com/eat.brand.bite/",
  },
  {
    id: "threads",
    label: "Threads",
    handle: "@eat.brand.bite",
    url:
      process.env.NEXT_PUBLIC_THREADS_URL ||
      "https://www.threads.net/@eat.brand.bite",
  },
  {
    id: "bluesky",
    label: "Bluesky",
    handle: "@eatbrandbite.com",
    url:
      process.env.NEXT_PUBLIC_BLUESKY_URL ||
      "https://bsky.app/profile/eatbrandbite.com",
  },
];

// Kit (ConvertKit) form action URL (Form ID: 10249274)
export const NEWSLETTER_FORM_ACTION =
  process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ACTION ||
  "https://app.kit.com/forms/10249274/subscriptions";
