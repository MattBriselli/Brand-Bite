import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FEED_PATH = path.join(ROOT, "src/data/live-feed.json");
const ARTICLES_PATH = path.join(ROOT, "src/data/articles.ts");
const SPECIALS_PATH = path.join(ROOT, "src/data/weekly-specials.ts");
const PUBLIC_DIR = path.join(ROOT, "public");
const SITE_URL = "https://eatbrandbite.com";

function escapeXml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseArticles(src) {
  const blockMatch = src.match(
    /export const ARTICLES:\s*Article\[\]\s*=\s*\[([\s\S]*?)\n\];/
  );
  if (!blockMatch) return [];
  const block = blockMatch[1];

  const articles = [];
  const slugRegex = /slug:\s*"([^"]+)"/g;
  let m;
  const starts = [];
  while ((m = slugRegex.exec(block)) !== null) {
    starts.push({ slug: m[1], index: m.index });
  }

  for (let i = 0; i < starts.length; i++) {
    const startIdx = Math.max(0, starts[i].index - 120);
    const endIdx = i + 1 < starts.length ? starts[i + 1].index - 120 : block.length;
    const chunk = block.slice(startIdx, endIdx);

    const slug = starts[i].slug;
    const title = chunk.match(/title:\s*"([^"]+)"/)?.[1] || "";
    const type = chunk.match(/type:\s*"([^"]+)"/)?.[1] || "News";
    const brand = chunk.match(/brand:\s*"([^"]+)"/)?.[1] || "BrandBite";
    const category = chunk.match(/category:\s*"([^"]+)"/)?.[1] || "Food";
    const publishedAt = chunk.match(/publishedAt:\s*"([^"]+)"/)?.[1] || "";
    const excerpt = chunk.match(/excerpt:\s*"([^"]+)"/)?.[1] || "";
    const image = chunk.match(/image:\s*"([^"]+)"/)?.[1] || null;
    const dealCode = chunk.match(/dealCode:\s*"([^"]+)"/)?.[1] || null;

    // Extract any inline `CODE` promo codes from body paragraphs
    const inlineCodes = Array.from(chunk.matchAll(/`([A-Z0-9]{4,16})`/g)).map(
      (x) => x[1]
    );
    const codes = Array.from(
      new Set([...(dealCode ? [dealCode] : []), ...inlineCodes])
    );

    if (title) {
      articles.push({
        slug,
        url: `${SITE_URL}/reviews/${slug}`,
        title,
        type,
        brand,
        category,
        publishedAt,
        excerpt,
        image: image ? `${SITE_URL}${image}` : `${SITE_URL}/brandbite-avatar.png`,
        codes,
      });
    }
  }
  return articles;
}

function parseBrands(src) {
  const brands = [];
  const re = /"name":\s*"([^"]+)",\s*\n\s*"slug":\s*"([^"]+)",[\s\S]*?"segment":\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    brands.push({ name: m[1], slug: m[2], segment: m[3] });
  }
  return brands;
}

function parseSpecials(src) {
  const specials = [];
  const blocks = src.split(/\n  \{\n    id:\s*"/).slice(1);
  for (const b of blocks) {
    const id = b.match(/^([^"]+)"/)?.[1] || "";
    const brand = b.match(/brand:\s*"([^"]+)"/)?.[1] || "";
    const headline = b.match(/headline:\s*"([^"]+)"/)?.[1] || "";
    const windowLabel = b.match(/windowLabel:\s*"([^"]+)"/)?.[1] || "";
    const promoCode = b.match(/promoCode:\s*"([^"]+)"/)?.[1] || null;
    const menuUrl = b.match(/menuUrl:\s*"([^"]+)"/)?.[1] || `${SITE_URL}/specials`;
    const expiresAt = b.match(/expiresAt:\s*"([^"]+)"/)?.[1] || null;
    const flavorsBlock = b.match(/flavors:\s*\[([\s\S]*?)\]/)?.[1] || "";
    const flavors = Array.from(flavorsBlock.matchAll(/"([^"]+)"/g)).map((m) => m[1]);

    if (expiresAt && Date.parse(expiresAt) < Date.now()) continue;
    if (brand && headline) {
      specials.push({ id, brand, headline, windowLabel, promoCode, menuUrl, flavors });
    }
  }
  return specials;
}

async function main() {
  const [articlesSrc, specialsSrc, feedRaw] = await Promise.all([
    fs.readFile(ARTICLES_PATH, "utf8"),
    fs.readFile(SPECIALS_PATH, "utf8").catch(() => ""),
    fs.readFile(FEED_PATH, "utf8"),
  ]);

  const articles = parseArticles(articlesSrc);
  const specials = parseSpecials(specialsSrc);
  const brands = parseBrands(articlesSrc);
  const nonFoodRe = /\b(?:tvs?|television|hisense|samsung|laptop|mattress|area rug|floral rug|angel reese|jensen huang|nvidia|lawsuit)\b/i;
  const feed = JSON.parse(feedRaw);
  const liveItems = (feed.items || [])
    .filter((i) => !nonFoodRe.test(i.title || ""))
    .slice(0, 20);

  // 1. Build public/llms.txt (AI Search / GEO / AEO primary markdown index)
  const activeCodes = [
    ...articles.flatMap((a) =>
      a.codes.map((c) => `- \`${c}\` — featured in [${a.title}](${a.url})`)
    ),
    ...specials
      .filter((s) => Boolean(s.promoCode))
      .map((s) => `- \`${s.promoCode}\` — **${s.brand}** (${s.headline}) — ${SITE_URL}/specials`),
  ];

  const llmsLines = [
    "# BrandBite (eatbrandbite.com)",
    "",
    `> Live fast-food menu news, weekly rotating Specials On Now (Crumbl, PopUp Bagels, Insomnia Cookies, Salt & Straw, Jeni's), verified promo codes, packaged snack drops, community sightings, fully pseudonymized reader discussions, and original first-hand taste tests across ${brands.length} U.S. chains and snack brands. Zero calorie counting; zero fabricated reviews.`,
    "",
    "## Key Links & Machine-Readable Feeds",
    `- **Homepage & Live Feed**: ${SITE_URL}/`,
    `- **Specials On Now (Weekly & Monthly Rotating Menus)**: ${SITE_URL}/specials`,
    `- **Original Roundups & Taste Tests**: ${SITE_URL}/reviews`,
    `- **Brands A–Z Directory (${brands.length} Brands)**: ${SITE_URL}/brands`,
    `- **Press & Brand Newsroom Inquiries**: ${SITE_URL}/press (hello@eatbrandbite.com)`,
    `- **JSON Feed (Originals + Specials + Live Drops)**: ${SITE_URL}/feed.json`,
    `- **RSS Feed (Originals)**: ${SITE_URL}/rss.xml`,
    `- **Sitemap**: ${SITE_URL}/sitemap.xml`,
    "",
    "## Official Social Channels",
    "- **Instagram**: https://www.instagram.com/eat.brand.bite/ (@eat.brand.bite)",
    "- **Threads**: https://www.threads.com/@eat.brand.bite (@eat.brand.bite)",
    "- **Bluesky**: https://bsky.app/profile/eatbrandbite.com (@eatbrandbite.com)",
    "- **Newsletter (Ad-Free)**: The Weekly Bite — https://eatbrandbite.com/#weekly-bite",
    "",
    ...(activeCodes.length > 0
      ? ["## Verified Active Promo Codes", ...activeCodes, ""]
      : []),
    ...(specials.length > 0
      ? [
          `## Specials On Now (${SITE_URL}/specials)`,
          ...specials.map(
            (s) =>
              `- **${s.brand}** (${s.windowLabel}): ${s.headline}${
                s.flavors.length > 0 ? ` — Flavors: ${s.flavors.join(", ")}` : ""
              } — ${s.menuUrl}`
          ),
          "",
        ]
      : []),
    "## BrandBite Originals (Roundups, Deal Guides & Reviews)",
    ...articles.map(
      (a) =>
        `- **${a.title}** (${a.publishedAt} • ${a.type}): ${a.excerpt} — ${a.url}`
    ),
    "",
    "## Latest Live Fast-Food & Snack Drops",
    ...liveItems.slice(0, 15).map((item) => {
      const hub =
        item.brandSlug && item.brandSlug !== "industry-wire"
          ? `${SITE_URL}/brands/${item.brandSlug}`
          : SITE_URL;
      return `- **${item.brand}** (${item.type}, ${item.publishedFormatted}): ${item.title} — ${hub}`;
    }),
    "",
    `## Tracked Brands (${brands.length})`,
    brands.map((b) => `[${b.name}](${SITE_URL}/brands/${b.slug})`).join(" · "),
    "",
  ];

  await fs.writeFile(
    path.join(PUBLIC_DIR, "llms.txt"),
    llmsLines.join("\n"),
    "utf8"
  );

  // 2. Build public/feed.json (JSON Feed 1.1)
  const jsonFeed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "BrandBite — Fast Food Menu Drops, Deals & Snack Feed",
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    description:
      "Original fast-food roundups, verified promo codes, taste tests, and live menu drops across hundreds of chains and snack makers.",
    icon: `${SITE_URL}/brandbite-avatar.png`,
    authors: [{ name: "BrandBite Desk", url: `${SITE_URL}/press` }],
    items: [
      ...articles.map((a) => ({
        id: a.url,
        url: a.url,
        title: a.title,
        summary: a.excerpt,
        image: a.image,
        date_published: `${a.publishedAt}T12:00:00Z`,
        tags: [a.type, a.category, ...a.codes],
      })),
      ...liveItems.slice(0, 15).map((i) => ({
        id: i.id,
        url:
          i.brandSlug && i.brandSlug !== "industry-wire"
            ? `${SITE_URL}/brands/${i.brandSlug}`
            : SITE_URL,
        external_url: i.url,
        title: `${i.brand}: ${i.title}`,
        summary: i.excerpt,
        ...(i.image ? { image: i.image } : {}),
        date_published: i.publishedAt,
        tags: [i.type, i.category, i.brand],
      })),
    ],
  };

  await fs.writeFile(
    path.join(PUBLIC_DIR, "feed.json"),
    JSON.stringify(jsonFeed, null, 2) + "\n",
    "utf8"
  );

  // 3. Build public/rss.xml (RSS 2.0 for Originals & Specials — low-noise original BrandBite content)
  const rssItemsXml = articles
    .map(
      (a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(a.url)}</link>
      <guid isPermaLink="true">${escapeXml(a.url)}</guid>
      <pubDate>${new Date(`${a.publishedAt}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(a.excerpt)}</description>
      <category>${escapeXml(a.category)}</category>
    </item>`
    )
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BrandBite Originals — Fast Food Deals, Menu Drops &amp; Reviews</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Original fast-food menu guides, verified promo codes, and first-hand taste tests across hundreds of chains and snack makers.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItemsXml}
  </channel>
</rss>
`;

  await fs.writeFile(path.join(PUBLIC_DIR, "rss.xml"), rssXml, "utf8");

  // 4. Build public/live.xml (RSS 2.0 for the full BrandBite Live Wire — headline, short excerpt, source attribution & direct link)
  const liveRssItemsXml = liveItems
    .slice(0, 100)
    .map((item) => {
      const pubDate = Number.isFinite(Date.parse(item.publishedAt))
        ? new Date(item.publishedAt).toUTCString()
        : new Date().toUTCString();
      const summaryText = item.excerpt
        ? `${item.excerpt} (Via ${item.sourceName})`
        : `Reported via ${item.sourceName}.`;
      const displayTitle =
        item.brand &&
        item.brandSlug !== "industry-wire" &&
        !item.title.toLowerCase().includes(item.brand.toLowerCase())
          ? `${item.brand}: ${item.title}`
          : item.title;

      return `    <item>
      <title>${escapeXml(displayTitle)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="false">${escapeXml(item.id)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(summaryText)}</description>
      <category>${escapeXml(item.type)}</category>
      <category>${escapeXml(item.category)}</category>
      <source url="${escapeXml(`${SITE_URL}/live`)}">${escapeXml(item.sourceName)}</source>
    </item>`;
    })
    .join("\n");

  const liveXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BrandBite Live Wire — Fast Food, Bakery &amp; Snack Drops</title>
    <link>${SITE_URL}/live</link>
    <atom:link href="${SITE_URL}/live.xml" rel="self" type="application/rss+xml" />
    <description>Live curated stream of fast-food menu launches, deals, rotating bakeries, and grocery snack drops across hundreds of brands.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${liveRssItemsXml}
  </channel>
</rss>
`;

  await fs.writeFile(path.join(PUBLIC_DIR, "live.xml"), liveXml, "utf8");
  console.log(
    `✅ Generated public/llms.txt, public/feed.json, public/rss.xml, and public/live.xml (${articles.length} originals, ${Math.min(100, liveItems.length)} live RSS items, ${brands.length} brands, ${activeCodes.length} active codes).`
  );
}

main().catch((err) => {
  console.error("❌ Failed to build agent feeds:", err.message);
  process.exit(1);
});
