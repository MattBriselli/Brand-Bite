# Brand Bites (`eatbrandbite.com`)

**Live fast-food & brand-crossover news wire, honest first-hand taste-test reviews, and community sightings** — engineered for speed, edge reliability, and zero-bloat publishing.

Live at **[https://eatbrandbite.com](https://eatbrandbite.com)** · Follow **[@eatbrandbite.com](https://bsky.app/profile/eatbrandbite.com)** on Bluesky and **[@eat.brand.bite](https://www.instagram.com/eat.brand.bite/)** on Instagram & Threads.

---

## Highlights & Engineering

- **Live Multi-Source News Wire (`/live`):** Aggregates and deduplicates limited-time offers (LTOs), menu drops, and brand collaborations across 28 curated food & beverage feeds, enriched with verified promo codes and direct brand redemption links.
- **Crossovers Hub & Brand Dispatches (`/crossovers`, `/brands/[slug]`):** Dedicated editorial tracking for multi-brand collaborations (e.g., fast-food × snack mashups) alongside brand-specific archives and specials.
- **Honest First-Hand Reviews (`/reviews`):** Original human taste-test dispatches with structured verdicts and rich OpenGraph metadata.
- **Edge Community API (`workers/` → `api.eatbrandbite.com`):** Cloudflare Worker + **Cloudflare D1** backend powering live reader sightings, upvotes, threaded comments, comment likes, and HMAC-signed 180-day sticky sessions — keeping the frontend 100% static and instant at the edge.
- **Multi-Channel Publishing Pipeline (`scripts/`):** Automated drafting and formatting for **The Weekly Bite** newsletter (Kit) and platform-native social distribution across Bluesky, Threads, and Instagram.
- **Machine-Readable Agent Feeds:** Build-time generation of structured `llms.txt` and JSON feeds (`scripts/build-agent-feeds.mjs`) alongside dynamic XML sitemaps for search engines and AI agents.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15 (App Router, static export), React 19, TypeScript, Tailwind CSS |
| Edge Hosting | Cloudflare Workers Static Assets (`wrangler.jsonc`) |
| Community Backend | Cloudflare Workers + Cloudflare D1 (`workers/`) |
| Newsletter & Socials | Kit API, Bluesky AT Protocol, Meta Graph / Buffer tooling |

---

## Repository Structure

```text
├── src/app/            # Next.js App Router pages (/, /live, /crossovers, /brands, /reviews, /specials, /newsletter)
├── workers/            # Cloudflare Worker + D1 API for sightings, comments, likes & sessions
├── scripts/            # Live feed sync, review authoring, agent feeds, newsletter & social pipelines
├── public/             # Static assets, live feed JSON, and generated agent feeds
└── wrangler.jsonc      # Cloudflare Workers Static Assets deployment config
```

---

## Local Development

```bash
npm install
npm run dev
```

### Common Scripts

```bash
npm run build              # Generate agent feeds + Next.js static export into ./out
npm run lint               # ESLint checks
npm run sync-feeds         # Sync live news wire feeds
npm run new-review         # Interactive CLI wizard to draft a first-hand review
npm run draft-newsletter   # Draft The Weekly Bite newsletter
npm run draft-socials      # Generate platform-formatted social drafts
```
