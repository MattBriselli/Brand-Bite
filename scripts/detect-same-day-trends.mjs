import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FEED_PATH = path.resolve(__dirname, "../src/data/live-feed.json");
const HISTORY_PATH = path.resolve(__dirname, "../src/data/trend-alerts-history.json");

export const TREND_WINDOW_MS = 36 * 60 * 60 * 1000; // 36h rolling window for same-day trends
export const HOLIDAY_COOLDOWN_DAYS = 7;

export const NON_FOOD_RETAIL_REGEX =
  /\b(?:tvs?|television|hisense|samsung|laptop|macbook|iphone|ipad|airpods|mattress|tires?|vacuum|electronics|furniture|appliance|area rug|floral rug|angel reese|holiday hours|open on thanksgiving|bath collection|lawsuit|jensen huang|nvidia)\b/i;

export const BRAND_HANDLES = {
  "mcdonalds": "@mcdonalds",
  "burger-king": "@burgerking",
  "taco-bell": "@tacobell",
  "wendys": "@wendys",
  "starbucks": "@starbucks",
  "dunkin": "@dunkin",
  "chick-fil-a": "@chickfila",
  "popeyes": "@popeyes",
  "kfc": "@kfc",
  "arbys": "@arbys",
  "chipotle": "@chipotle",
  "dominos": "@dominos",
  "pizza-hut": "@pizzahut",
  "little-caesars": "@littlecaesars",
  "papa-johns": "@papajohns",
  "krispy-kreme": "@krispykreme",
  "crumbl": "@crumblcookies",
  "carls-jr": "@carlsjr",
  "hardees": "@hardees",
  "sonic": "@sonicdrivein",
  "dairy-queen": "@dairyqueen",
  "subway": "@subway",
  "wingstop": "@wingstop",
  "ihop": "@ihop",
  "dennys": "@dennysdiner",
  "trader-joes": "@traderjoes",
  "aldi": "@aldiusa",
  "oreo": "@oreo",
  "doritos": "@doritos",
};

export const FOOD_HOLIDAY_PATTERNS = [
  { key: "national-donut-day", label: "National Donut Day", re: /\bnational\s+dough?nut\s+day\b/i },
  { key: "national-hot-dog-day", label: "National Hot Dog Day", re: /\bnational\s+hot\s*dog\s+day\b/i },
  { key: "national-pizza-day", label: "National Pizza Day", re: /\bnational\s+pizza\s+day\b/i },
  { key: "national-burger-day", label: "National Burger Day", re: /\bnational\s+(?:cheese)?burger\s+day\b/i },
  { key: "national-taco-day", label: "National Taco Day", re: /\bnational\s+taco\s+day\b/i },
  { key: "national-coffee-day", label: "National Coffee Day", re: /\bnational\s+coffee\s+day\b/i },
  { key: "national-fry-day", label: "National French Fry Day", re: /\bnational\s+(?:french\s+)?fry\s+day\b/i },
  { key: "national-ice-cream-day", label: "National Ice Cream Day", re: /\bnational\s+ice\s+cream\s+day\b/i },
  { key: "national-wing-day", label: "National Chicken Wing Day", re: /\bnational\s+(?:chicken\s+)?wing\s+day\b/i },
  { key: "national-cookie-day", label: "National Cookie Day", re: /\bnational\s+(?:chocolate\s+chip\s+)?cookie\s+day\b/i },
  { key: "national-sandwich-day", label: "National Sandwich Day", re: /\bnational\s+(?:fried\s+chicken\s+)?sandwich\s+day\b/i },
  { key: "pi-day", label: "Pi Day ($3.14 Pizza Deals)", re: /\bpi\s+day\b/i },
  { key: "black-friday", label: "Black Friday Fast-Food Deals", re: /\bblack\s+friday\b/i },
  { key: "cyber-monday", label: "Cyber Monday Fast-Food Deals", re: /\bcyber\s+monday\b/i },
  { key: "free-cone-day", label: "Free Cone Day", re: /\bfree\s+cone\s+day\b/i },
  { key: "free-slurpee-day", label: "7-Eleven Day", re: /\b(?:7-eleven\s+day|free\s+slurpee\s+day)\b/i },
  { key: "cinco-de-mayo", label: "Cinco de Mayo Deals", re: /\bcinco\s+de\s+mayo\b/i },
  { key: "super-bowl", label: "Super Bowl Food Deals", re: /\bsuper\s+bowl\b/i },
  { key: "halloween", label: "Halloween Fast-Food Deals", re: /\bhalloween\b/i },
  { key: "valentines-day", label: "Valentine's Day Food Deals", re: /\bvalentine'?s\s+day\b/i },
];

export function todayEasternDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function currentEasternHour(now = new Date()) {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    hour12: false,
  }).format(now);
  const parsed = Number.parseInt(hourStr, 10);
  return Number.isFinite(parsed) ? parsed % 24 : now.getUTCHours();
}

function formatBrandMentions(items, max = 3) {
  const seen = new Set();
  const labels = [];
  for (const item of items) {
    if (!item.brandSlug || item.brandSlug === "industry-wire") continue;
    if (seen.has(item.brandSlug)) continue;
    seen.add(item.brandSlug);
    labels.push(BRAND_HANDLES[item.brandSlug] || item.brand);
    if (labels.length >= max) break;
  }
  return labels;
}

export function isTrendOnCooldown(trendKey, firedAlerts = [], now = new Date()) {
  const todayEt = todayEasternDate(now);
  const cutoffMs = now.getTime() - HOLIDAY_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return firedAlerts.some((alert) => {
    if (!alert) return false;
    if (alert.trendKey !== trendKey) return false;
    if (alert.date === todayEt) return true;
    const firedMs = Date.parse(alert.firedAt || alert.date || "");
    return Number.isFinite(firedMs) && firedMs >= cutoffMs;
  });
}

export function detectSameDayTrends(items = [], now = new Date()) {
  const cutoffMs = now.getTime() - TREND_WINDOW_MS;
  const recentItems = items.filter((item) => {
    if (NON_FOOD_RETAIL_REGEX.test(item.title || "")) return false;
    const ts = Date.parse(item.publishedAt);
    return Number.isFinite(ts) && ts >= cutoffMs;
  });

  const todayEt = todayEasternDate(now);
  const candidates = [];

  // 1. Same-day National Food Holiday / Major Shopping Day (strictly > 2 fresh items)
  for (const holiday of FOOD_HOLIDAY_PATTERNS) {
    const matches = recentItems.filter((i) =>
      holiday.re.test(`${i.title || ""} ${i.excerpt || ""}`)
    );
    if (matches.length > 2) {
      const mentions = formatBrandMentions(matches, 3);
      const brandStr =
        mentions.length > 0 ? ` (${mentions.join(", ")} & more)` : "";
      candidates.push({
        trendKey: holiday.key,
        trendType: "holiday",
        category: "Special Day",
        label: holiday.label,
        brandSlugs: [...new Set(matches.map((i) => i.brandSlug).filter(Boolean))],
        caption: `🎉 ${holiday.label} is live right now${brandStr}! Here's a quick guide to today's best offers and app perks.\n\nLive deal tracker:\nhttps://eatbrandbite.com/?type=Deal#feed`,
      });
    }
  }

  // 2. Heavy Sales Wave (>= 5 distinct brands running Deals in last 36h)
  const recentDeals = recentItems.filter((i) => i.type === "Deal");
  const distinctDealBrands = new Set(
    recentDeals
      .map((i) => i.brandSlug)
      .filter((s) => s && s !== "industry-wire")
  );
  if (distinctDealBrands.size >= 5) {
    const mentions = formatBrandMentions(recentDeals, 4);
    candidates.push({
      trendKey: `sales-wave-${todayEt}`,
      trendType: "sales-wave",
      category: "Deals",
      label: `Heavy Fast-Food Deal Wave (${distinctDealBrands.size} chains)`,
      brandSlugs: [...distinctDealBrands],
      caption: `💸 ${distinctDealBrands.size} chains are running deals right now (${mentions.join(", ")} & more) — great day to grab a bite and save.\n\nEvery live deal:\nhttps://eatbrandbite.com/?type=Deal#feed`,
    });
  }

  // 3. Single-Category Industry Blitz (>= 3 distinct brands in the SAME category running deals/LTOs)
  const byCategory = new Map();
  for (const item of recentItems) {
    if (item.type !== "Deal" && item.type !== "Limited-Time Offer") continue;
    if (!item.brandSlug || item.brandSlug === "industry-wire") continue;
    if (!byCategory.has(item.category)) byCategory.set(item.category, []);
    byCategory.get(item.category).push(item);
  }
  for (const [category, list] of byCategory.entries()) {
    const uniqueBrands = new Set(list.map((i) => i.brandSlug));
    if (uniqueBrands.size >= 3) {
      const mentions = formatBrandMentions(list, 3);
      const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      candidates.push({
        trendKey: `category-blitz-${catSlug}-${todayEt}`,
        trendType: "category-blitz",
        category,
        label: `${category} Blitz (${uniqueBrands.size} brands)`,
        brandSlugs: [...uniqueBrands],
        caption: `✨ Big day for ${category}: ${mentions.join(", ")} all have fresh promos and limited-time items live today.\n\nTrack all of them live:\nhttps://eatbrandbite.com/?type=Deal#feed`,
      });
    }
  }

  return candidates;
}

export function pickEligibleTrend(items = [], firedAlerts = [], excludeTrendKeys = new Set(), now = new Date()) {
  const candidates = detectSameDayTrends(items, now);
  return (
    candidates.find(
      (c) =>
        !excludeTrendKeys.has(c.trendKey) &&
        !isTrendOnCooldown(c.trendKey, firedAlerts, now)
    ) || null
  );
}

// Allow standalone CLI inspection (`node scripts/detect-same-day-trends.mjs --dry-run`)
const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  (async () => {
    const feed = JSON.parse(await fs.readFile(FEED_PATH, "utf8"));
    const history = JSON.parse(
      await fs.readFile(HISTORY_PATH, "utf8").catch(() => '{"firedAlerts":[],"dailyPosts":[]}')
    );
    const firedAlerts = Array.isArray(history.firedAlerts) ? history.firedAlerts : [];
    const trend = pickEligibleTrend(feed.items || [], firedAlerts);
    if (!trend) {
      console.log("ℹ️  No eligible special day, >=5-brand deal wave, or 3-brand category blitz detected.");
      return;
    }
    console.log(`\n🚨 Eligible Special Day / Trend: ${trend.label} (${trend.trendKey})`);
    console.log(`---\n${trend.caption}\n---`);
    console.log("ℹ️  Note: Same-day trend posting is now merged into scripts/queue-buffer.mjs (social-queue.yml).");
  })().catch((err) => {
    console.error("❌ Same-day trend detector error:", err.message);
    process.exit(1);
  });
}
