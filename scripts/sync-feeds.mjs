import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.resolve(__dirname, "../src/data/live-feed.json");

export const FEED_SOURCES = [
  {
    id: "brandeating",
    name: "Brand Eating",
    kind: "blogger-json",
    url: "https://www.brandeating.com/feeds/posts/default?alt=json&max-results=18",
    homepage: "https://www.brandeating.com",
    badgeColor: "#c2410c",
  },
  {
    id: "impulsivebuy",
    name: "The Impulsive Buy",
    kind: "rss",
    url: "https://www.theimpulsivebuy.com/wordpress/feed/",
    homepage: "https://www.theimpulsivebuy.com",
    badgeColor: "#7e22ce",
  },
  {
    id: "corporate-newsrooms",
    name: "Chain Newsrooms (BK / IHOP / Taco Bell / McD / Yum!)",
    kind: "rss",
    url: "https://news.google.com/rss/search?q=(%22IHOP%22+OR+%22Burger+King%22+OR+%22Taco+Bell%22+OR+%22Yum!+Brands%22+OR+%22KFC%22+OR+%22Pizza+Hut%22+OR+%22Wendy%27s%22+OR+%22McDonald%27s%22+OR+%22Popeyes%22+OR+%22Krispy+Kreme%22)+(menu+OR+pancakes+OR+limited-time+OR+flavor+OR+launch)&hl=en-US&gl=US&ceid=US:en",
    homepage: "https://www.ihop.com",
    badgeColor: "#1d4ed8",
  },
  {
    id: "nrn",
    name: "Nation's Restaurant News",
    kind: "rss",
    url: "https://www.nrn.com/rss.xml",
    homepage: "https://www.nrn.com",
    badgeColor: "#047857",
  },
  {
    id: "fooddive",
    name: "Food Dive (CPG & Snacks)",
    kind: "rss",
    url: "https://www.fooddive.com/feeds/news/",
    homepage: "https://www.fooddive.com",
    badgeColor: "#b45309",
  },
  {
    id: "diner-breakfast-news",
    name: "Breakfast & Casual Chains (IHOP / Denny's / Dunkin' / Waffle House)",
    kind: "rss",
    url: "https://news.google.com/rss/search?q=(%22IHOP%22+OR+%22Denny%27s%22+OR+%22Dunkin%27%22+OR+%22Waffle+House%22+OR+%22Cracker+Barrel%22)+(menu+OR+pancakes+OR+limited-time+OR+flavor+OR+launch)&hl=en-US&gl=US&ceid=US:en",
    homepage: "https://www.ihop.com",
    badgeColor: "#0369a1",
  },
];

const BRAND_MATCHERS = [
  { name: "IHOP", slug: "ihop", patterns: [/\bihop\b/i, /\binternational house of pancakes\b/i, /\brooty tooty\b/i] },
  { name: "Taco Bell", slug: "taco-bell", patterns: [/\btaco bell\b/i, /\bchalupa\b/i, /\bcrunchwrap\b/i, /\bbaja blast\b/i] },
  { name: "Burger King", slug: "burger-king", patterns: [/\bburger king\b/i, /\bwhopper\b/i, /\bbk\b/i] },
  { name: "McDonald's", slug: "mcdonalds", patterns: [/\bmcdonald'?s\b/i, /\bmccrispy\b/i, /\bmcflurry\b/i, /\bbig mac\b/i, /\bquarter pounder\b/i] },
  { name: "Wendy's", slug: "wendys", patterns: [/\bwendy'?s\b/i, /\bfrosty\b/i, /\bbaconator\b/i] },
  { name: "Yum! Brands (KFC / Pizza Hut)", slug: "yum-brands", patterns: [/\byum!\s*brands\b/i, /\bkfc\b/i, /\bkentucky fried chicken\b/i, /\bpizza hut\b/i, /\bhabit burger\b/i] },
  { name: "Trader Joe's", slug: "trader-joes", patterns: [/\btrader joe'?s\b/i] },
  { name: "Oreo", slug: "oreo", patterns: [/\boreo\b/i, /\bnabisco\b/i, /\bmondelez\b/i] },
  { name: "Doritos", slug: "doritos", patterns: [/\bdoritos\b/i] },
  { name: "Lay's", slug: "lays", patterns: [/\blay'?s\b/i, /\bfrito-lay\b/i] },
  { name: "Popeyes", slug: "popeyes", patterns: [/\bpopeyes\b/i] },
  { name: "Culver's", slug: "culvers", patterns: [/\bculver'?s\b/i, /\bbutterburger\b/i] },
  { name: "Starbucks", slug: "starbucks", patterns: [/\bstarbucks\b/i, /\bfrappuccino\b/i] },
  { name: "Krispy Kreme", slug: "krispy-kreme", patterns: [/\bkrispy kreme\b/i] },
  { name: "Chick-fil-A", slug: "chick-fil-a", patterns: [/\bchick-fil-a\b/i] },
  { name: "Shake Shack", slug: "shake-shack", patterns: [/\bshake shack\b/i] },
  { name: "Arby's", slug: "arbys", patterns: [/\barby'?s\b/i] },
  { name: "Ben & Jerry's", slug: "ben-and-jerrys", patterns: [/\bben\s*&\s*jerry'?s\b/i] },
  { name: "Dunkin'", slug: "dunkin", patterns: [/\bdunkin'?\b/i] },
  { name: "Subway", slug: "subway", patterns: [/\bsubway\b/i] },
  { name: "Domino's", slug: "dominos", patterns: [/\bdomino'?s\b/i] },
  { name: "Chipotle", slug: "chipotle", patterns: [/\bchipotle\b/i] },
  { name: "Sonic Drive-In", slug: "sonic", patterns: [/\bsonic drive-in\b/i, /\bsonic'?s\b/i] },
  { name: "Dairy Queen", slug: "dairy-queen", patterns: [/\bdairy queen\b/i, /\bdq blizzard\b/i] },
  { name: "Jack in the Box", slug: "jack-in-the-box", patterns: [/\bjack in the box\b/i] },
];

function decodePass(str = "") {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&nbsp;/g, " ")
    .replace(/&#32;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function decodeHtmlEntities(str = "") {
  return decodePass(decodePass(str));
}

function makeItemId(sourceId, uniqueStr) {
  const hash = crypto.createHash("sha1").update(String(uniqueStr)).digest("hex").slice(0, 12);
  return `${sourceId}-${hash}`;
}

function stripHtml(html = "") {
  const decoded = decodeHtmlEntities(html);
  return decoded
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();
}

function buildSmartSummary(rawSummary, title, sourceName, brand, type) {
  const cleaned = rawSummary
    .replace(/submitted by\s+\/u\/\S+\s*\[link\]\s*\[comments\]/gi, "")
    .replace(/If you spotted something new,\s*send your photos to\s*\S+/gi, "")
    .trim();

  const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normSummary = cleaned.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Google News RSS descriptions often just echo the exact headline + publisher name
  if (!cleaned || (normTitle && normSummary && normSummary.length <= normTitle.length + 6 && normTitle.includes(normSummary.slice(0, 24)))) {
    const dashParts = title.split(" - ");
    const publisher = dashParts.length > 1 ? dashParts[dashParts.length - 1].trim() : sourceName;
    return `Reported by ${publisher} • Filed under ${brand} (${type}). Open the source article for full menu details, rollout dates, and pricing.`;
  }

  const MAX_LEN = 360;
  if (cleaned.length <= MAX_LEN) return cleaned;

  const window = cleaned.slice(0, MAX_LEN);
  const sentenceEnd = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("! "),
    window.lastIndexOf("? ")
  );
  if (sentenceEnd >= 160) {
    return window.slice(0, sentenceEnd + 1).trim();
  }

  const lastSpace = window.lastIndexOf(" ");
  return `${(lastSpace > 120 ? window.slice(0, lastSpace) : window).replace(/[,;:\-–—]+$/, "").trim()}…`;
}

function extractFirstImage(rawHtml = "") {
  const mediaMatch = rawHtml.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch?.[1] && !mediaMatch[1].includes("pixel")) return mediaMatch[1];

  const enclosureMatch = rawHtml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (enclosureMatch?.[1]) return enclosureMatch[1];

  const decoded = decodeHtmlEntities(rawHtml);
  const imgMatch = decoded.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1] && !imgMatch[1].includes("feeds.feedburner.com") && !imgMatch[1].includes("1x1")) {
    return imgMatch[1];
  }
  return null;
}

function classifyBrand(text) {
  for (const matcher of BRAND_MATCHERS) {
    if (matcher.patterns.some((re) => re.test(text))) {
      return { brand: matcher.name, brandSlug: matcher.slug };
    }
  }
  return { brand: "Industry & Snack Wire", brandSlug: "industry-wire" };
}

function classifyType(title, categoriesText = "") {
  const combined = `${title} ${categoriesText}`;
  if (/\breview\b|\btaste test\b|\bwe tried\b|\bspotted\b/i.test(combined)) {
    return "Review";
  }
  if (/\bdeal\b|\bbogo\b|\bfree\b|\$\d+|\bpromo\b|\bdiscount\b|\bvalue meal\b/i.test(combined)) {
    return "Deal";
  }
  if (/\blimited[\s-]time\b|\blto\b|\bseasonal\b|\bholiday\b|\breturns\b|\bdebuts\b|\blaunches\b|\bnew menu\b|\barrives\b/i.test(combined)) {
    return "Limited-Time Offer";
  }
  return "News";
}

function classifyCategory(text) {
  if (/\bihop\b|\bpancake|\bwaffle|\bfrench toast\b|\bomelette\b|\bcrepe|\bbreakfast\b|\bhash brown/i.test(text)) {
    return "Breakfast & Diners";
  }
  if (/\btaco\b|\bburrito\b|\bchalupa\b|\bquesadilla\b|\bnacho|\bcantina\b|\bmexican\b/i.test(text)) {
    return "Tacos & Burritos";
  }
  if (/\bchicken\b|\bwing|\bnugget|\btender|\bmccrispy\b|\bkfc\b|\bpopeyes\b|\bfil-a\b/i.test(text)) {
    return "Chicken & Wings";
  }
  if (/\bburger\b|\bwhopper\b|\bsandwich\b|\bslider|\bmelt\b|\bsub\b|\bwendy/i.test(text)) {
    return "Burgers & Sandwiches";
  }
  if (/\bchip|\bdoritos\b|\blay'?s\b|\bcrisp|\bpretzel|\bpopcorn|\bcheez-it|\bcracker|\bsnack mix\b/i.test(text)) {
    return "Chips & Crisps";
  }
  if (/\bcoffee\b|\blatte\b|\bespresso\b|\bcold brew\b|\bstarbucks\b|\bdrink\b|\bsoda\b|\btea\b|\brefresh|\bsmoothie|\blemonade\b/i.test(text)) {
    return "Coffee & Drinks";
  }
  if (/\bcookie\b|\boreo\b|\bdonut\b|\bdoughnut\b|\bcake\b|\bchocolate\b|\bcandy\b|\bice cream\b|\bfrosty\b|\bshake\b|\bsweet|\bbakery|\bpastry/i.test(text)) {
    return "Cookies & Sweets";
  }
  return "Frozen & Grocery";
}

function extractXmlTag(block, tag) {
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(regex);
  return match ? match[1].trim() : "";
}

function parseRssOrAtom(xml, source) {
  const items = [];
  const itemBlocks = xml.match(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)>/gi) || [];

  for (const block of itemBlocks.slice(0, 20)) {
    const rawTitle = extractXmlTag(block, "title");
    const title = stripHtml(rawTitle);
    if (!title) continue;

    let link = extractXmlTag(block, "link");
    if (!link) {
      const hrefMatch = block.match(/<link[^>]+href=["']([^"']+)["']/i);
      if (hrefMatch?.[1]) link = hrefMatch[1];
    }
    link = stripHtml(link);

    const pubDateRaw =
      extractXmlTag(block, "pubDate") ||
      extractXmlTag(block, "published") ||
      extractXmlTag(block, "updated") ||
      extractXmlTag(block, "dc:date");

    const parsedDate = pubDateRaw ? new Date(pubDateRaw) : new Date();
    const validDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    const descriptionRaw =
      extractXmlTag(block, "content:encoded") ||
      extractXmlTag(block, "content") ||
      extractXmlTag(block, "description") ||
      extractXmlTag(block, "summary");

    const categoryMatches = [...block.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi)].map((m) =>
      stripHtml(m[1])
    );

    const cleanSummary = stripHtml(descriptionRaw);
    const combinedText = `${title} ${cleanSummary.slice(0, 360)} ${categoryMatches.join(" ")}`;
    const { brand, brandSlug } = classifyBrand(combinedText);
    const category = classifyCategory(combinedText);
    const type = classifyType(title, categoryMatches.join(" "));
    const excerpt = buildSmartSummary(cleanSummary, title, source.name, brand, type);
    const extractedImg = extractFirstImage(block) || extractFirstImage(descriptionRaw);
    const cleanImg = extractedImg ? decodeHtmlEntities(extractedImg) : null;

    items.push({
      id: makeItemId(source.id, link || title),
      title,
      url: link || source.homepage,
      sourceId: source.id,
      sourceName: source.name,
      sourceBadgeColor: source.badgeColor,
      publishedAt: validDate.toISOString(),
      publishedFormatted: validDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      brand,
      brandSlug,
      type,
      category,
      excerpt,
      image: cleanImg || null,
      tags: categoryMatches.filter(Boolean).slice(0, 4),
    });
  }

  return items;
}

function parseBloggerJson(data, source) {
  const entries = data?.feed?.entry || [];
  return entries.slice(0, 16).map((entry) => {
    const title = stripHtml(entry?.title?.$t || "Untitled Dispatch");
    const altLink = (entry?.link || []).find((l) => l.rel === "alternate")?.href || source.homepage;
    const publishedRaw = entry?.published?.$t || entry?.updated?.$t;
    const validDate = publishedRaw ? new Date(publishedRaw) : new Date();
    const rawHtml = entry?.content?.$t || entry?.summary?.$t || "";
    const cleanText = stripHtml(rawHtml);
    const categories = (entry?.category || []).map((c) => c.term).filter(Boolean);

    const combinedText = `${title} ${cleanText.slice(0, 360)} ${categories.join(" ")}`;
    const { brand, brandSlug } = classifyBrand(combinedText);
    const category = classifyCategory(combinedText);
    const type = classifyType(title, categories.join(" "));
    const excerpt = buildSmartSummary(cleanText, title, source.name, brand, type);

    let thumb = entry?.media$thumbnail?.url || extractFirstImage(rawHtml);
    if (thumb && thumb.includes("/s72-c/")) {
      thumb = thumb.replace("/s72-c/", "/w800-h500-p-k-no-nu/");
    }

    return {
      id: makeItemId(source.id, altLink || title),
      title,
      url: altLink,
      sourceId: source.id,
      sourceName: source.name,
      sourceBadgeColor: source.badgeColor,
      publishedAt: validDate.toISOString(),
      publishedFormatted: validDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      brand,
      brandSlug,
      type,
      category,
      excerpt,
      image: thumb ? decodeHtmlEntities(thumb) : null,
      tags: categories.slice(0, 4),
    };
  });
}

export async function syncAllFeeds({ skipWriteIfUnchanged = false } = {}) {
  const allItems = [];

  let previousPayload = null;
  try {
    const rawPrev = await fs.readFile(OUTPUT_PATH, "utf8");
    previousPayload = JSON.parse(rawPrev);
  } catch {
    previousPayload = null;
  }

  const results = await Promise.all(
    FEED_SOURCES.map(async (source) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
      try {
        const res = await fetch(source.url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) BrandBiteFeedSynthesizer/1.0",
            Accept: "application/rss+xml, application/xml, application/json, text/xml, */*",
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const text = await res.text();
        let parsed = [];
        if (source.kind === "blogger-json") {
          parsed = parseBloggerJson(JSON.parse(text), source);
        } else {
          parsed = parseRssOrAtom(text, source);
        }
        return {
          items: parsed,
          status: {
            id: source.id,
            name: source.name,
            url: source.url,
            homepage: source.homepage,
            status: "ok",
            count: parsed.length,
          },
        };
      } catch (err) {
        const fallbackItems = (previousPayload?.items || []).filter(
          (item) => item.sourceId === source.id
        );
        return {
          items: fallbackItems,
          status: {
            id: source.id,
            name: source.name,
            url: source.url,
            homepage: source.homepage,
            status: fallbackItems.length > 0 ? "ok" : "error",
            error: err instanceof Error ? err.message : String(err),
            count: fallbackItems.length,
          },
        };
      } finally {
        clearTimeout(timeout);
      }
    })
  );

  const sourceStatuses = results.map((r) => r.status);
  for (const r of results) {
    allItems.push(...r.items);
  }

  // Deduplicate by normalized title
  const seenTitles = new Set();
  const deduped = [];
  for (const item of allItems) {
    const norm = item.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
    if (!norm || seenTitles.has(norm)) continue;
    seenTitles.add(norm);
    deduped.push(item);
  }

  deduped.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const finalItems = deduped.slice(0, 95);

  if (
    skipWriteIfUnchanged &&
    previousPayload &&
    JSON.stringify(previousPayload.items) === JSON.stringify(finalItems)
  ) {
    return { ...previousPayload, unchanged: true };
  }

  const payload = {
    lastSyncedAt: new Date().toISOString(),
    totalItems: deduped.length,
    sources: sourceStatuses,
    items: finalItems,
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const skipWriteIfUnchanged = process.argv.includes("--if-changed");
  syncAllFeeds({ skipWriteIfUnchanged })
    .then((payload) => {
      if (payload.unchanged) {
        console.log("Feed items unchanged; skipped writing live-feed.json.");
        return;
      }
      console.log(`Synced ${payload.totalItems} items across ${payload.sources.length} sources.`);
      for (const s of payload.sources) {
        console.log(` - ${s.name}: ${s.status} (${s.count} items)${s.error ? ` [${s.error}]` : ""}`);
      }
    })
    .catch((err) => {
      console.error("Failed to sync feeds:", err);
      process.exit(1);
    });
}
