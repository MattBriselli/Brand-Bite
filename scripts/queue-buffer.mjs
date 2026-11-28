import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  NON_FOOD_RETAIL_REGEX,
  currentEasternHour,
  pickEligibleTrend,
  todayEasternDate,
} from "./detect-same-day-trends.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FEED_PATH = path.resolve(__dirname, "../src/data/live-feed.json");
const HISTORY_PATH = path.resolve(__dirname, "../src/data/trend-alerts-history.json");
const DOTENV_PATH = path.resolve(__dirname, "../.env");

const BUFFER_ENDPOINT = "https://api.buffer.com";
const DEFAULT_IMAGE_URL = "https://eatbrandbite.com/brandbite-avatar.png";
const MAX_QUEUED_PER_CHANNEL = 8; // Safely under Buffer Free's 10-post-per-channel limit
const MAX_POSTS_PER_DAY = 2; // Daily morning post + at most 1 conditional afternoon post
const AFTERNOON_FRESH_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h window for same-day momentum check

// Official brand handles for organic discovery & mentions on Instagram/Threads
const BRAND_SOCIAL_HANDLES = {
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
  "shake-shack": "@shakeshack",
  "culvers": "@culvers",
  "raising-canes": "@raisingcanes",
  "jack-in-the-box": "@jackinthebox",
  "carls-jr": "@carlsjr",
  "hardees": "@hardees",
  "sonic": "@sonicdrivein",
  "dairy-queen": "@dairyqueen",
  "panda-express": "@officialpandaexpress",
  "subway": "@subway",
  "jersey-mikes": "@jerseymikes",
  "wingstop": "@wingstop",
  "ihop": "@ihop",
  "dennys": "@dennysdiner",
  "cracker-barrel": "@crackerbarrel",
  "trader-joes": "@traderjoes",
  "costco": "@costco",
  "aldi": "@aldiusa",
  "bucees": "@bucees",
  "wawa": "@wawa",
  "sheetz": "@sheetz",
  "oreo": "@oreo",
  "doritos": "@doritos",
  "lays": "@lays",
  "cheetos": "@cheetos",
  "pringles": "@pringles",
  "reeses": "@reeses",
  "hersheys": "@hersheys",
  "mms": "@mmschocolate",
  "chips-ahoy": "@chipsahoy",
  "mountain-dew": "@mountaindew",
  "takis": "@takisusa",
  "paris-baguette": "@parisbaguette_usa",
  "dutch-bros": "@dutchbroscoffee",
  "7-brew": "@7brewcoffee",
  "in-n-out": "@innout",
  "whataburger": "@whataburger",
  "dirty-dough": "@dirtydoughcookies",
  "duck-donuts": "@duckdonuts",
  "gideons-bakehouse": "@gideonsbakehouse",
  "insomnia-cookies": "@insomniacookies",
  "jenis-ice-cream": "@jenisicecreams",
  "levain-bakery": "@levainbakery",
  "nothing-bundt-cakes": "@nothingbundtcakes",
  "popup-bagels": "@popupbagels",
  "salt-and-straw": "@saltandstraw",
  "magnolia-bakery": "@magnoliabakery",
  "sprinkles-cupcakes": "@sprinklescupcakes",
  "baked-by-melissa": "@bakedbymelissa",
  "tiffs-treats": "@tiffstreats",
  "milk-bar": "@milkbarstore",
  "van-leeuwen": "@vanleeuwenicecream",
  "ben-and-jerrys": "@benandjerrys",
  "andys-frozen-custard": "@andysfrozencustard",
  "voodoo-doughnut": "@voodoodoughnut",
  "sidecar-doughnuts": "@sidecardoughnuts",
  "shipley-donuts": "@shipleydonuts",
  "swig": "@swigdrinks",
  "pop-tarts": "@poptartsus",
  "eggo": "@eggo_us",
  "la-colombe": "@lacolombecoffee",
  "cheez-it": "@cheezit",
  "goldfish": "@goldfishsmiles",
  "ritz": "@ritzcrackers",
  "little-debbie": "@littledebbie",
  "hostess": "@hostess_snacks",
  "pillsbury": "@pillsbury",
  "kit-kat": "@kitkat",
  "sour-patch-kids": "@sourpatchkids",
  "coca-cola": "@cocacola",
  "pepsi": "@pepsi",
  "dr-pepper": "@drpepper",
  "7-eleven": "@7eleven",
  "five-guys": "@fiveguys",
  "sweetgreen": "@sweetgreen",
  "cook-out": "@cookout",
  "steak-n-shake": "@steaknshake",
  "olive-garden": "@olivegarden",
  "red-lobster": "@redlobster",
  "texas-roadhouse": "@texasroadhouse",
  "red-robin": "@redrobinburgers",
  "cheesecake-factory": "@cheesecakefactory",
  "caseys": "@caseys",
  "quiktrip": "@quiktrip",
  "scooters-coffee": "@scooterscoffee",
  "peets-coffee": "@peetscoffee",
  "blue-bottle": "@bluebottle",
  "jamba": "@jambajuice",
  "haagen-dazs": "@haagendazs_us",
  "talenti": "@talenti",
  "red-bull": "@redbull",
  "nerds": "@nerdscandy",
  "snickers": "@snickers",
  "twix": "@twix",
  "skittles": "@skittles",
  "haribo": "@haribousa",
  "milano": "@pepperidgefarm",
  "ruffles": "@ruffles",
  "fritos": "@fritos",
  "tostitos": "@tostitos",
  "cinnamon-toast-crunch": "@cinnamontoastcrunch",
  "chobani": "@chobani",
  "target": "@target",
  "sams-club": "@samsclub",
};

const COMPETITOR_NAMES_REGEX =
  /\b(?:snack\s*wire|brand\s*eating|the\s*impulsive\s*buy|impulsive\s*buy|sporked|guilty\s*eats|chew\s*boom|snackolator|tasting\s*table|mashed|qsr\s*magazine|food\s*dive|nation'?s\s*restaurant\s*news|nosh)\b/gi;

async function loadBufferApiKey() {
  if (process.env.BUFFER_API_KEY) {
    return process.env.BUFFER_API_KEY.trim();
  }
  try {
    const raw = await fs.readFile(DOTENV_PATH, "utf8");
    const match = raw.match(/^BUFFER_API_KEY=(.+)$/m);
    if (match?.[1]) {
      return match[1].trim().replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // Ignore missing .env
  }
  throw new Error(
    "Missing BUFFER_API_KEY. Set it in .env (local, gitignored) or GitHub Actions Secrets."
  );
}

async function bufferGraphQL(apiKey, query, variables = {}) {
  const res = await fetch(BUFFER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json || (json.errors && json.errors.length > 0)) {
    const msg =
      json?.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status}`;
    throw new Error(`Buffer GraphQL error: ${msg}`);
  }
  return json.data;
}

function scrubCompetitors(text = "") {
  return text
    .replace(/\s+[-–—]\s+[A-Za-z0-9 .,'&|]+$/, "")
    .replace(/^Reported by [^•]+•\s*/i, "")
    .replace(COMPETITOR_NAMES_REGEX, "BrandBite")
    .replace(/\s+/g, " ")
    .trim();
}

const FRIENDLY_HOOKS = {
  crossover: [
    "Fun brand crossover just landed on our live radar:",
    "Two big favorites teaming up for a limited-time collab:",
    "New mashup worth keeping an eye out for:",
  ],
  deal: [
    "Great deal live right now if you're grabbing a bite today:",
    "Heads up on a nice drive-thru offer worth knowing about:",
    "Fresh deal spotted on the menu today:",
    "Here's an easy way to save on your next snack run:",
  ],
  sweets: [
    "Sweet new drop just landed on the radar:",
    "Something fun for your next grocery or bakery run:",
    "New limited-time treat hitting shelves right now:",
    "Worth keeping an eye out for in the snack aisle:",
  ],
  drinks: [
    "New seasonal drink just hit menus:",
    "Fun new beverage drop worth trying on your next coffee run:",
    "Fresh limited-time drink now available:",
  ],
  default: [
    "Fresh menu drop just hit our live radar:",
    "Something new on the menu worth checking out:",
    "New limited-time release now rolling out:",
    "Spotted a fun new launch today:",
    "Here's what just landed on the BrandBite live feed:",
  ],
};

function pickHook(item, seedText) {
  const bucket = item.isCrossover
    ? FRIENDLY_HOOKS.crossover
    : item.type === "Deal"
    ? FRIENDLY_HOOKS.deal
    : item.category === "Cookies & Sweets" || item.category === "Snacks & Chips"
    ? FRIENDLY_HOOKS.sweets
    : item.category === "Coffee & Drinks"
    ? FRIENDLY_HOOKS.drinks
    : FRIENDLY_HOOKS.default;
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    hash = (hash * 31 + seedText.charCodeAt(i)) >>> 0;
  }
  return bucket[hash % bucket.length];
}

function formatTextForChannel(text, service) {
  if (service !== "instagram") return text;

  const hadUrl = /https?:\/\/\S+/i.test(text);
  let cleaned = text
    .replace(/https?:\/\/\S+/gi, "")
    // Clean dangling colon or dash right before where the URL used to be
    .replace(/[:–—-]\s*$/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (hadUrl && !/link in bio/i.test(cleaned)) {
    cleaned = `${cleaned}\n\n👆 Full details via link in bio.`;
  }
  return cleaned;
}

function clampCaption(body, link) {
  const suffix = `\n\n${link}`;
  const budget = 290 - suffix.length;
  const trimmed =
    body.length <= budget ? body : body.slice(0, budget - 1).trimEnd() + "…";
  return `${trimmed}${suffix}`;
}

function parseCliArgs(argv) {
  const opts = {
    dryRun: argv.includes("--dry-run"),
    now: argv.includes("--now"),
    slot: "auto",
    text: null,
    image: null,
  };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--text" && argv[i + 1]) {
      opts.text = argv[i + 1];
      i++;
    } else if (argv[i] === "--image" && argv[i + 1]) {
      opts.image = argv[i + 1];
      i++;
    } else if (argv[i] === "--slot" && argv[i + 1]) {
      const val = argv[i + 1].toLowerCase();
      if (val === "morning" || val === "afternoon" || val === "auto") {
        opts.slot = val;
      }
      i++;
    }
  }
  return opts;
}

function resolveSlot(requestedSlot, now = new Date()) {
  if (requestedSlot === "morning" || requestedSlot === "afternoon") {
    return requestedSlot;
  }
  // Morning window: before 1:00 PM Eastern; Afternoon window: 1:00 PM Eastern or later
  return currentEasternHour(now) < 13 ? "morning" : "afternoon";
}

function isRecognizedBrand(item) {
  return Boolean(item?.brandSlug && item.brandSlug !== "industry-wire");
}

function isInterestingItem(item) {
  if (!item) return false;
  if (NON_FOOD_RETAIL_REGEX.test(item.title || "")) return false;
  if (!isRecognizedBrand(item)) return false;
  return Boolean(
    item.isCrossover ||
      item.type === "Deal" ||
      item.type === "Limited-Time Offer"
  );
}

function getItemBrandSlugs(item) {
  const slugs = new Set();
  if (isRecognizedBrand(item)) slugs.add(item.brandSlug);
  if (Array.isArray(item?.crossoverBrandSlugs)) {
    for (const s of item.crossoverBrandSlugs) {
      if (s && s !== "industry-wire") slugs.add(s);
    }
  }
  return slugs;
}

function scoreItem(item, { morningPost = null, nowMs = Date.now() } = {}) {
  let score = 0;
  const ts = Date.parse(item.publishedAt || "");
  const ageHours = Number.isFinite(ts)
    ? Math.max(0, (nowMs - ts) / (60 * 60 * 1000))
    : 999;

  // Freshness boost
  if (ageHours <= 12) score += 35;
  else if (ageHours <= 24) score += 25;
  else if (ageHours <= 48) score += 12;

  // Content value boost
  if (item.isCrossover) score += 30;
  if (item.type === "Deal") score += 22;
  else if (item.type === "Limited-Time Offer") score += 20;
  if (isRecognizedBrand(item)) score += 15;
  if (item.image) score += 4;

  // Diversity boost relative to morning post (so afternoon feels genuinely different)
  if (morningPost) {
    if (morningPost.category && item.category && item.category !== morningPost.category) {
      score += 18;
    }
    if (morningPost.type && item.type && item.type !== morningPost.type) {
      score += 12;
    }
  }

  return score;
}

function buildItemPayload(item) {
  const cleanBrand =
    item.brand && !/wire|desk/i.test(item.brand)
      ? scrubCompetitors(item.brand)
      : "New Drop";
  const cleanTitle = scrubCompetitors(item.title);
  const link = item.isCrossover
    ? "https://eatbrandbite.com/crossovers"
    : isRecognizedBrand(item)
    ? `https://eatbrandbite.com/brands/${item.brandSlug}`
    : "https://eatbrandbite.com";

  const emoji = item.isCrossover
    ? "🤝"
    : item.type === "Deal"
    ? "💸"
    : item.category === "Cookies & Sweets"
    ? "🍪"
    : item.category === "Coffee & Drinks"
    ? "☕"
    : item.category === "Pizza & Italian"
    ? "🍕"
    : item.category === "Tacos & Burritos"
    ? "🌮"
    : "🍔";

  const handles = [];
  if (Array.isArray(item.crossoverBrandSlugs) && item.crossoverBrandSlugs.length > 0) {
    for (const slug of item.crossoverBrandSlugs) {
      if (BRAND_SOCIAL_HANDLES[slug] && !handles.includes(BRAND_SOCIAL_HANDLES[slug])) {
        handles.push(BRAND_SOCIAL_HANDLES[slug]);
      }
    }
  } else if (item.brandSlug && BRAND_SOCIAL_HANDLES[item.brandSlug]) {
    handles.push(BRAND_SOCIAL_HANDLES[item.brandSlug]);
  }

  const brandTag =
    cleanBrand !== "New Drop"
      ? `#${cleanBrand.replace(/[^a-zA-Z0-9]/g, "")}`
      : null;
  const tagLine = [...handles.slice(0, 2), brandTag].filter(Boolean).join(" ");
  const hook = pickHook(item, cleanTitle);

  const captionBody = tagLine
    ? `${emoji} ${cleanBrand}: ${cleanTitle}\n\n${hook}\n${tagLine}`
    : `${emoji} ${cleanBrand}: ${cleanTitle}\n\n${hook}`;

  return {
    kind: "item",
    itemId: item.id || null,
    brandSlug: item.brandSlug || null,
    crossoverBrandSlugs: Array.isArray(item.crossoverBrandSlugs)
      ? item.crossoverBrandSlugs
      : [],
    category: item.category || null,
    type: item.type || null,
    trendKey: null,
    text: clampCaption(captionBody, link),
    imageUrl: DEFAULT_IMAGE_URL,
    metaLabel: `${cleanBrand} — ${cleanTitle}`,
  };
}

function pickBestItem({
  items,
  existingTexts,
  recentDailyPosts = [],
  morningPost = null,
  requireFreshInteresting = false,
  now = new Date(),
}) {
  const nowMs = now.getTime();
  const freshCutoffMs = nowMs - AFTERNOON_FRESH_WINDOW_MS;

  const normalizedExisting = existingTexts.map((t) =>
    t.toLowerCase().replace(/[^a-z0-9]/g, "")
  );
  const postedItemIds = new Set(
    recentDailyPosts.map((p) => p.itemId).filter(Boolean)
  );
  const morningBrands = new Set();
  if (morningPost?.brandSlug) morningBrands.add(morningPost.brandSlug);
  if (Array.isArray(morningPost?.crossoverBrandSlugs)) {
    for (const s of morningPost.crossoverBrandSlugs) morningBrands.add(s);
  }

  const isAlreadyPostedOrQueued = (item, headline, link) => {
    if (item.id && postedItemIds.has(item.id)) return true;
    const normHead = headline.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 32);
    const normLink = link.toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalizedExisting.some(
      (ex) =>
        (normHead && ex.includes(normHead)) ||
        (!item.isCrossover && normLink && normLink !== "httpseatbrandbitecom" && ex.includes(normLink))
    );
  };

  const eligible = [];
  for (const item of items) {
    const cleanTitle = scrubCompetitors(item.title || "");
    if (!cleanTitle || cleanTitle.length < 12) continue;
    if (NON_FOOD_RETAIL_REGEX.test(cleanTitle)) continue;

    if (requireFreshInteresting) {
      const ts = Date.parse(item.publishedAt || "");
      if (!Number.isFinite(ts) || ts < freshCutoffMs) continue;
      if (!isInterestingItem(item)) continue;
    }

    // Afternoon must differ from morning's brand(s)
    if (morningBrands.size > 0) {
      const itemBrands = getItemBrandSlugs(item);
      let overlapsMorningBrand = false;
      for (const b of itemBrands) {
        if (morningBrands.has(b)) {
          overlapsMorningBrand = true;
          break;
        }
      }
      if (overlapsMorningBrand) continue;
    }

    const link = item.isCrossover
      ? "https://eatbrandbite.com/crossovers"
      : isRecognizedBrand(item)
      ? `https://eatbrandbite.com/brands/${item.brandSlug}`
      : "https://eatbrandbite.com";

    if (isAlreadyPostedOrQueued(item, cleanTitle, link)) continue;

    eligible.push({
      item,
      score: scoreItem(item, { morningPost, nowMs }),
    });
  }

  eligible.sort((a, b) => b.score - a.score);
  if (eligible.length === 0) return null;
  return buildItemPayload(eligible[0].item);
}

function evaluateAfternoonInterest(items, now = new Date()) {
  const cutoffMs = now.getTime() - AFTERNOON_FRESH_WINDOW_MS;
  const freshFoodItems = items.filter((item) => {
    if (NON_FOOD_RETAIL_REGEX.test(item.title || "")) return false;
    const ts = Date.parse(item.publishedAt || "");
    return Number.isFinite(ts) && ts >= cutoffMs;
  });

  const freshNotable = freshFoodItems.filter((item) => isInterestingItem(item));
  const distinctNotableBrands = new Set(
    freshNotable.map((i) => i.brandSlug).filter(Boolean)
  );
  const freshCrossovers = freshNotable.filter((i) => i.isCrossover);

  // High-signal afternoon bar:
  // Either >= 3 fresh food items today with >= 2 distinct notable brand drops (LTO/Deal/Crossover),
  // OR >= 2 fresh food items today including a fresh Brand Crossover.
  const qualified =
    (freshFoodItems.length >= 3 && distinctNotableBrands.size >= 2) ||
    (freshFoodItems.length >= 2 && freshCrossovers.length >= 1);

  return {
    qualified,
    freshFoodCount: freshFoodItems.length,
    notableBrandCount: distinctNotableBrands.size,
    freshCrossoverCount: freshCrossovers.length,
  };
}

async function readHistory() {
  try {
    const raw = JSON.parse(await fs.readFile(HISTORY_PATH, "utf8"));
    return {
      firedAlerts: Array.isArray(raw.firedAlerts) ? raw.firedAlerts : [],
      dailyPosts: Array.isArray(raw.dailyPosts) ? raw.dailyPosts : [],
    };
  } catch {
    return { firedAlerts: [], dailyPosts: [] };
  }
}

async function writeHistory(history) {
  const payload = {
    firedAlerts: (history.firedAlerts || []).slice(0, 100),
    dailyPosts: (history.dailyPosts || []).slice(0, 120),
  };
  await fs.writeFile(
    HISTORY_PATH,
    JSON.stringify(payload, null, 2) + "\n",
    "utf8"
  );
}

async function main() {
  const opts = parseCliArgs(process.argv.slice(2));
  const now = new Date();
  const todayEt = todayEasternDate(now);
  const slot = resolveSlot(opts.slot, now);

  const feed = JSON.parse(await fs.readFile(FEED_PATH, "utf8"));
  const feedItems = feed.items || [];
  const history = await readHistory();
  const todaysPosts = history.dailyPosts.filter((p) => p.date === todayEt);
  const morningPost = todaysPosts.find((p) => p.slot === "morning") || todaysPosts[0] || null;

  console.log(
    `🗓️  BrandBite Social Scheduler — Date (ET): ${todayEt} | Slot: ${slot} | Posted today: ${todaysPosts.length}/${MAX_POSTS_PER_DAY}`
  );

  // Automated slot & daily cap guard (skipped only for explicit --text / --now manual overrides)
  if (!opts.text && !opts.now && !opts.dryRun) {
    if (todaysPosts.some((p) => p.slot === slot)) {
      console.log(
        `⏭️  ${slot} post already published today (${todayEt}). Skipping redundant trigger.`
      );
      return;
    }
    if (todaysPosts.length >= MAX_POSTS_PER_DAY) {
      console.log(
        `⏭️  Daily cap of ${MAX_POSTS_PER_DAY} posts already reached for ${todayEt}. Skipping.`
      );
      return;
    }
  }

  const apiKey = await loadBufferApiKey();

  // 1. Discover organization & connected channels dynamically
  const orgData = await bufferGraphQL(
    apiKey,
    `query { account { organizations { id name } } }`
  );
  const orgId = orgData?.account?.organizations?.[0]?.id;
  if (!orgId) {
    throw new Error("No Buffer organization found for this API key.");
  }

  const chanData = await bufferGraphQL(
    apiKey,
    `query ($orgId: OrganizationId!) {
      channels(input: { organizationId: $orgId }) {
        id
        name
        service
        displayName
      }
    }`,
    { orgId }
  );

  const channels = (chanData?.channels || []).filter((c) =>
    ["instagram", "threads", "bluesky"].includes(c.service)
  );
  if (channels.length === 0) {
    throw new Error(
      "No connected Instagram, Threads, or Bluesky channels found in Buffer."
    );
  }

  // 2. Check existing scheduled & recently sent posts in Buffer for dedupe + redundancy safety
  let existingPosts = [];
  let recentPosts = [];
  try {
    const postsData = await bufferGraphQL(
      apiKey,
      `query ($orgId: OrganizationId!) {
        scheduled: posts(first: 30, input: { organizationId: $orgId, filter: { status: [scheduled] } }) {
          edges {
            node {
              id
              channelId
              text
              createdAt
            }
          }
        }
        sent: posts(first: 15, input: { organizationId: $orgId, filter: { status: [sent] } }) {
          edges {
            node {
              id
              channelId
              text
              createdAt
            }
          }
        }
      }`,
      { orgId }
    );
    existingPosts = (postsData?.scheduled?.edges || []).map((e) => e.node);
    recentPosts = [
      ...existingPosts,
      ...(postsData?.sent?.edges || []).map((e) => e.node),
    ];
  } catch (err) {
    console.warn("Note: Could not fetch existing queue for dedupe:", err.message);
  }

  // Short-window Buffer idempotency guard (3 hours) so dual Cloudflare + GitHub triggers
  // firing within minutes of each other never double-queue the same slot, while still allowing
  // a 10:15 AM morning post + 3:15 PM afternoon post (5 hours apart).
  if (!opts.text && !opts.now && !opts.dryRun) {
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
    const recentHit = recentPosts.find((p) => {
      const ts = Date.parse(p.createdAt || "");
      return Number.isFinite(ts) && ts >= threeHoursAgo;
    });
    if (recentHit) {
      console.log(
        `⏭️  A BrandBite post was already queued/sent within the last 3 hours (${recentHit.createdAt}). Skipping redundant cron trigger.`
      );
      return;
    }
  }

  const queueCountByChannel = new Map();
  for (const p of existingPosts) {
    queueCountByChannel.set(
      p.channelId,
      (queueCountByChannel.get(p.channelId) || 0) + 1
    );
  }

  const dedupeTexts = recentPosts.map((p) => p.text || "").filter(Boolean);
  const excludeTrendKeys = new Set(
    todaysPosts.map((p) => p.trendKey).filter(Boolean)
  );

  // 3. Determine post content (custom override OR merged special-day/trend + daily/afternoon curation)
  let postPayload = null;
  let detectedTrend = null;

  if (opts.text) {
    postPayload = {
      kind: "custom",
      itemId: null,
      brandSlug: null,
      crossoverBrandSlugs: [],
      category: null,
      type: null,
      trendKey: null,
      text: scrubCompetitors(opts.text),
      imageUrl: opts.image || DEFAULT_IMAGE_URL,
      metaLabel: "Custom CLI Post",
    };
  } else {
    // Check for an eligible special day / food holiday / heavy deal wave / category blitz
    detectedTrend = pickEligibleTrend(
      feedItems,
      history.firedAlerts,
      excludeTrendKeys,
      now
    );

    if (slot === "morning") {
      if (detectedTrend) {
        console.log(
          `🚨 Morning special-day / trend match: ${detectedTrend.label} (${detectedTrend.trendKey})`
        );
        postPayload = {
          kind: "trend",
          itemId: null,
          brandSlug: null,
          crossoverBrandSlugs: detectedTrend.brandSlugs || [],
          category: detectedTrend.category || "Special Day",
          type: "Trend",
          trendKey: detectedTrend.trendKey,
          text: detectedTrend.caption,
          imageUrl: DEFAULT_IMAGE_URL,
          metaLabel: `Special Day / Trend — ${detectedTrend.label}`,
        };
      } else {
        postPayload = pickBestItem({
          items: feedItems,
          existingTexts: dedupeTexts,
          recentDailyPosts: history.dailyPosts.slice(0, 30),
          morningPost: null,
          requireFreshInteresting: false,
          now,
        });
      }
    } else {
      // Afternoon slot: ONLY post if there's enough interesting content today AND it differs from morning
      if (detectedTrend && morningPost?.kind !== "trend") {
        console.log(
          `🚨 Afternoon newly-emerged special-day / trend match: ${detectedTrend.label} (${detectedTrend.trendKey})`
        );
        postPayload = {
          kind: "trend",
          itemId: null,
          brandSlug: null,
          crossoverBrandSlugs: detectedTrend.brandSlugs || [],
          category: detectedTrend.category || "Special Day",
          type: "Trend",
          trendKey: detectedTrend.trendKey,
          text: detectedTrend.caption,
          imageUrl: DEFAULT_IMAGE_URL,
          metaLabel: `Special Day / Trend — ${detectedTrend.label}`,
        };
      } else {
        const interest = evaluateAfternoonInterest(feedItems, now);
        if (!interest.qualified) {
          console.log(
            `⏭️  Skipping afternoon post: not enough fresh interesting content today (freshFood=${interest.freshFoodCount}, notableBrands=${interest.notableBrandCount}, freshCrossovers=${interest.freshCrossoverCount}).`
          );
          return;
        }

        postPayload = pickBestItem({
          items: feedItems,
          existingTexts: dedupeTexts,
          recentDailyPosts: history.dailyPosts.slice(0, 30),
          morningPost,
          requireFreshInteresting: true,
          now,
        });

        if (!postPayload) {
          console.log(
            `⏭️  Skipping afternoon post: no fresh, distinct high-interest drop differs from today's morning post (${morningPost?.label || "none"}).`
          );
          return;
        }
      }
    }
  }

  if (!postPayload) {
    console.log("No fresh unqueued items found in live-feed.json. Skipping.");
    return;
  }

  console.log(
    `\n📣 Target Post [${slot.toUpperCase()}] — Bluesky / Threads (${postPayload.metaLabel}):\n---\n${postPayload.text}\n---`
  );
  console.log(
    `\n📸 Target Post [${slot.toUpperCase()}] — Instagram (URL-free):\n---\n${formatTextForChannel(postPayload.text, "instagram")}\n---`
  );
  console.log(`🖼️  Image: ${postPayload.imageUrl}`);
  console.log(
    `📡 Channels: ${channels
      .map((c) => `${c.service}(${c.name}, queued=${queueCountByChannel.get(c.id) || 0})`)
      .join(", ")}`
  );

  if (opts.dryRun) {
    console.log("\n✅ Dry run complete — no posts were created in Buffer.");
    return;
  }

  // 4. Queue across each eligible channel
  const createMutation = `
    mutation CreateBrandBitePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post {
            id
            dueAt
          }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;

  let queuedCount = 0;
  for (const ch of channels) {
    const currentCount = queueCountByChannel.get(ch.id) || 0;
    if (currentCount >= MAX_QUEUED_PER_CHANNEL) {
      console.log(
        `⏭️  Skipping ${ch.service} (${ch.name}): already has ${currentCount} posts queued.`
      );
      continue;
    }

    const input = {
      channelId: ch.id,
      text: formatTextForChannel(postPayload.text, ch.service),
      schedulingType: "automatic",
      mode: opts.now || postPayload.kind === "trend" ? "shareNow" : "addToQueue",
      needsApproval: false,
      assets: [{ image: { url: postPayload.imageUrl } }],
      ...(ch.service === "instagram"
        ? {
            metadata: {
              instagram: {
                type: "post",
                shouldShareToFeed: true,
              },
            },
          }
        : {}),
    };

    const res = await bufferGraphQL(apiKey, createMutation, { input });
    const outcome = res?.createPost;
    if (outcome?.post?.id) {
      queuedCount++;
      console.log(
        `✅ Queued on ${ch.service} (${ch.name}) -> id=${outcome.post.id} dueAt=${outcome.post.dueAt || "now"}`
      );
    } else {
      console.error(
        `❌ Failed on ${ch.service} (${ch.name}): ${outcome?.message || JSON.stringify(outcome)}`
      );
    }
  }

  // 5. Persist ledger so afternoon runs know exactly what morning posted & special days respect cooldown
  if (queuedCount > 0 && !opts.text) {
    if (postPayload.kind === "trend" && detectedTrend) {
      history.firedAlerts.unshift({
        date: todayEt,
        trendKey: detectedTrend.trendKey,
        label: detectedTrend.label,
        firedAt: now.toISOString(),
      });
    }
    history.dailyPosts.unshift({
      date: todayEt,
      slot,
      kind: postPayload.kind,
      itemId: postPayload.itemId,
      brandSlug: postPayload.brandSlug,
      crossoverBrandSlugs: postPayload.crossoverBrandSlugs,
      category: postPayload.category,
      type: postPayload.type,
      trendKey: postPayload.trendKey,
      label: postPayload.metaLabel,
      postedAt: now.toISOString(),
    });
    await writeHistory(history);
    console.log("📒 Updated social posting ledger in src/data/trend-alerts-history.json.");
  }
}

main().catch((err) => {
  console.error("❌ Buffer automation error:", err.message);
  process.exit(1);
});
