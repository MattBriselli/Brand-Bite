import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FEED_PATH = path.resolve(__dirname, "../src/data/live-feed.json");
const HISTORY_PATH = path.resolve(__dirname, "../src/data/trend-alerts-history.json");
const QUEUE_SCRIPT = path.resolve(__dirname, "./queue-buffer.mjs");

const WINDOW_MS = 36 * 60 * 60 * 1000; // 36h rolling window for same-day trends
const NON_FOOD_RETAIL_REGEX =
  /\b(?:tvs?|television|hisense|samsung|laptop|macbook|iphone|ipad|airpods|mattress|tires?|vacuum|electronics|furniture|appliance|area rug|floral rug|angel reese|lawsuit|jensen huang|nvidia)\b/i;

const BRAND_HANDLES = {
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

const FOOD_HOLIDAY_PATTERNS = [
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

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
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

function detectTrend(recentItems) {
  // 1. Same-day National Food Holiday / Major Shopping Day (strictly > 2 fresh items)
  for (const holiday of FOOD_HOLIDAY_PATTERNS) {
    const matches = recentItems.filter((i) =>
      holiday.re.test(`${i.title} ${i.excerpt}`)
    );
    if (matches.length > 2) {
      const mentions = formatBrandMentions(matches, 3);
      const brandStr =
        mentions.length > 0 ? ` (${mentions.join(", ")} & more)` : "";
      return {
        trendKey: holiday.key,
        label: holiday.label,
        caption: `🚨 ${holiday.label} is live right now${brandStr}. Yes, we're adults reorganizing our entire afternoon around free food and app promos.\n\nLive deal tracker:\nhttps://eatbrandbite.com/?type=Deal#feed`,
      };
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
    return {
      trendKey: `sales-wave-${todayIsoDate()}`,
      label: `Heavy Fast-Food Deal Wave (${distinctDealBrands.size} chains)`,
      caption: `💸 ${distinctDealBrands.size} chains just dropped deals at once (${mentions.join(", ")} & more). Economy's weird, at least the drive-thru is negotiating.\n\nEvery live deal:\nhttps://eatbrandbite.com/?type=Deal#feed`,
    };
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
      return {
        trendKey: `category-blitz-${catSlug}-${todayIsoDate()}`,
        label: `${category} Blitz (${uniqueBrands.size} brands)`,
        caption: `🔥 ${category} turf war today: ${mentions.join(", ")} all dropped new promos at the same time. Pick your fighter.\n\nTrack all of them live:\nhttps://eatbrandbite.com/?type=Deal#feed`,
      };
    }
  }

  return null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const feed = JSON.parse(await fs.readFile(FEED_PATH, "utf8"));
  const history = JSON.parse(await fs.readFile(HISTORY_PATH, "utf8").catch(() => '{"firedAlerts":[]}'));
  const firedAlerts = Array.isArray(history.firedAlerts) ? history.firedAlerts : [];

  const today = todayIsoDate();
  const alreadyFiredToday = firedAlerts.some((a) => a.date === today);

  const cutoffMs = Date.now() - WINDOW_MS;
  const recentItems = (feed.items || []).filter((item) => {
    if (NON_FOOD_RETAIL_REGEX.test(item.title || "")) return false;
    const ts = Date.parse(item.publishedAt);
    return Number.isFinite(ts) && ts >= cutoffMs;
  });

  const trend = detectTrend(recentItems);
  if (!trend) {
    console.log("ℹ️  No same-day food holiday, >=5-brand deal wave, or 3-brand category blitz detected.");
    return;
  }

  console.log(`\n🚨 Detected Same-Day Trend: ${trend.label} (${trend.trendKey})`);
  console.log(`---\n${trend.caption}\n---`);

  if (alreadyFiredToday) {
    console.log(`⏭️  Already fired a same-day trend alert today (${today}). Skipping to avoid spam.`);
    return;
  }

  if (dryRun) {
    console.log("✅ Dry run complete — no Buffer post sent.");
    return;
  }

  // Publish immediately across all 3 connected Buffer channels
  // NOTE: Future hook — once desired, this exact trigger can also fire a "Flash Deal Alert" Kit newsletter broadcast!
  const { stdout, stderr } = await execFileAsync(process.execPath, [
    QUEUE_SCRIPT,
    "--now",
    "--text",
    trend.caption,
  ]);
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);

  firedAlerts.unshift({
    date: today,
    trendKey: trend.trendKey,
    label: trend.label,
    firedAt: new Date().toISOString(),
  });

  await fs.writeFile(
    HISTORY_PATH,
    JSON.stringify({ firedAlerts: firedAlerts.slice(0, 100) }, null, 2) + "\n",
    "utf8"
  );
  console.log("📒 Recorded trend alert in src/data/trend-alerts-history.json.");
}

main().catch((err) => {
  console.error("❌ Same-day trend detector error:", err.message);
  process.exit(1);
});
