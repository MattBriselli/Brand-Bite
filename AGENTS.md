# BrandBite Publishing & Social Media Rules

## Platform-Native Social Formatting
- **Instagram — NEVER post raw URLs (`https://...`) in captions:** Instagram does not make caption links clickable, and raw URLs look amateurish. Always strip full URLs for Instagram and use a native CTA instead (e.g., *"Full cheat sheet via link in bio 👆"*, *"Live tracker at link in bio"*).
- **Threads & Bluesky — Clickable URLs allowed:** Keep clean `https://eatbrandbite.com/...` links on Threads and Bluesky (within Bluesky's 300-grapheme limit) so rich OpenGraph cards unfurl cleanly.
- **Format per channel:** Never send an identical URL-bearing caption verbatim to Instagram; automated scripts (`scripts/queue-buffer.mjs`, `scripts/detect-same-day-trends.mjs`, `scripts/draft-socials.mjs`) must format captions per platform.

## Brand Voice & Editorial Guardrails
- **Voice:** Dry, ironic, lovingly sardonic 2026 banter — punchy, never a novel, and leaves readers wanting more on the site or next post. Playfully tease brands without ever portraying them in a purely negative light (first-hand human taste-test reviews remain 100% honest).
- **No Competitor Mentions:** Never mention `"Snack Wire"` or other food-news competitors in social bios, captions, or site headlines.
- **Zero Fake Reviews & Zero Calorie Counting:** Never fabricate tasting scores or personal tasting notes, and never add calorie/nutrition counts.
- **Dual Publish Default:** When Matt asks to publish a new post, publish it to the site and immediately push platform-formatted social posts to Bluesky, Threads, and Instagram.

## Discounts, Promo Codes & Outbound Links
- **Always retain and display real promo codes:** Whenever covering discounts or sales, extract and prominently display any verified promo/discount codes found in source coverage (styled clearly with inline code badges on the site). Never fabricate or guess promo codes.
- **Social tease strategy (1 code + site CTA):** On social media deal posts, include **1 verified promo code** directly in the caption and clearly signal that **more codes and deal links are available on the site** (via clickable link on Threads/Bluesky, or *link in bio* on Instagram).
- **Link out generously on site articles:** Always link directly to the relevant brand's deal, rewards, or order page inside site articles so readers can actually redeem offers immediately.

## Live Editorial Framing
- **Always say "Live" — never expose bot/cron cadence:** Describe the feed as **"Live"** or **"Updated Live"** across the site, metadata, and socials. Never mention `"every 3 hours"`, `"every 6 hours"`, or `"GitHub Actions"` in public-facing copy.
