import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FEED_PATH = path.resolve(__dirname, "../src/data/live-feed.json");
const TREND_HISTORY_PATH = path.resolve(__dirname, "../src/data/trend-alerts-history.json");
const DOTENV_PATH = path.resolve(__dirname, "../.env");

const BUFFER_ENDPOINT = "https://api.buffer.com";
const DEFAULT_IMAGE_URL = "https://eatbrandbite.com/brandbite-avatar.png";
const MAX_QUEUED_PER_CHANNEL = 8; // Safely under Buffer Free's 10-post-per-channel limit

const NON_FOOD_RETAIL_REGEX =
  /\b(?:tvs?|television|hisense|samsung|laptop|macbook|iphone|ipad|airpods|mattress|tires?|vacuum|electronics|furniture|appliance|area rug|floral rug|angel reese|holiday hours|open on thanksgiving|bath collection|lawsuit)\b/i;

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

const SARDONIC_HOOKS = {
  deal: [
    "Economy's rough, at least the drive-thru is negotiating.",
    "Finally, a financial decision we can justify in a paper bag.",
    "Not saying this is a balanced meal, just saying the math checks out.",
    "Our budgeting app is going to pretend it didn't see this.",
  ],
  sweets: [
    "Our dentist just felt a disturbance in the force.",
    "Grocery aisle impulse control: 0. Snack innovation: 1.",
    "Scientists were so preoccupied with whether they could, they forgot to ask if we'd eat the whole box in one sitting.",
    "Bold of them to assume we have the willpower to walk past this aisle.",
  ],
  drinks: [
    "Because regular caffeine wasn't chaotic enough for this economy.",
    "Sure, let's make one more seasonal beverage our entire personality.",
    "Do we need another limited-edition drink? No. Will we investigate? Obviously.",
  ],
  default: [
    "Nobody asked for this, which means we're legally obligated to investigate.",
    "Will this fix anything in our lives? No. Are we still curious? Obviously.",
    "Another completely normal, totally necessary menu innovation.",
    "Bold of them to assume we have the self-control to drive past this.",
    "Drop what you're pretending to work on — new menu lore just dropped.",
  ],
};

function pickHook(item, seedText) {
  const bucket =
    item.type === "Deal"
      ? SARDONIC_HOOKS.deal
      : item.category === "Cookies & Sweets" || item.category === "Snacks & Chips"
      ? SARDONIC_HOOKS.sweets
      : item.category === "Coffee & Drinks"
      ? SARDONIC_HOOKS.drinks
      : SARDONIC_HOOKS.default;
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
    }
  }
  return opts;
}

async function pickNextPostFromFeed(existingTexts) {
  const raw = await fs.readFile(FEED_PATH, "utf8");
  const feed = JSON.parse(raw);
  const items = feed.items || [];

  const normalizedExisting = existingTexts.map((t) =>
    t.toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  const isAlreadyQueued = (brand, headline, link) => {
    const normHead = headline.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 32);
    const normLink = link.toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalizedExisting.some(
      (ex) => (normHead && ex.includes(normHead)) || (normLink && ex.includes(normLink))
    );
  };

  // Prefer Limited-Time Offers & Deals with real brand pages first
  const ranked = [
    ...items.filter(
      (i) =>
        (i.type === "Limited-Time Offer" || i.type === "Deal") &&
        i.brandSlug &&
        i.brandSlug !== "industry-wire"
    ),
    ...items.filter((i) => i.brandSlug && i.brandSlug !== "industry-wire"),
    ...items,
  ];

  for (const item of ranked) {
    const cleanBrand =
      item.brand && !/wire|desk/i.test(item.brand)
        ? scrubCompetitors(item.brand)
        : "New Drop";
    const cleanTitle = scrubCompetitors(item.title);
    if (!cleanTitle || cleanTitle.length < 12) continue;
    if (NON_FOOD_RETAIL_REGEX.test(cleanTitle)) continue;

    const link =
      item.brandSlug && item.brandSlug !== "industry-wire"
        ? `https://eatbrandbite.com/brands/${item.brandSlug}`
        : "https://eatbrandbite.com";

    if (isAlreadyQueued(cleanBrand, cleanTitle, link)) continue;

    const emoji =
      item.type === "Deal"
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

    const handle = item.brandSlug ? BRAND_SOCIAL_HANDLES[item.brandSlug] : null;
    const brandTag =
      cleanBrand !== "New Drop"
        ? `#${cleanBrand.replace(/[^a-zA-Z0-9]/g, "")}`
        : null;
    const tagLine = [handle, brandTag].filter(Boolean).join(" ");

    const hook = pickHook(item, cleanTitle);

    const captionBody = tagLine
      ? `${emoji} ${cleanBrand}: ${cleanTitle}\n\n${hook}\n${tagLine}`
      : `${emoji} ${cleanBrand}: ${cleanTitle}\n\n${hook}`;

    return {
      text: clampCaption(captionBody, link),
      imageUrl: DEFAULT_IMAGE_URL,
      metaLabel: `${cleanBrand} — ${cleanTitle}`,
    };
  }

  return null;
}

async function main() {
  const opts = parseCliArgs(process.argv.slice(2));

  // If a same-day trend alert already fired today, skip the generic scheduled post
  if (!opts.text && !opts.now) {
    try {
      const trendHistory = JSON.parse(
        await fs.readFile(TREND_HISTORY_PATH, "utf8")
      );
      const today = new Date().toISOString().slice(0, 10);
      const todayAlert = (trendHistory.firedAlerts || []).find(
        (a) => a.date === today
      );
      if (todayAlert) {
        console.log(
          `⏭️  Same-day trend alert already posted today ("${todayAlert.label}"). Skipping generic scheduled post.`
        );
        return;
      }
    } catch {
      // No trend history yet; continue normally
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
    throw new Error("No connected Instagram, Threads, or Bluesky channels found in Buffer.");
  }

  // 2. Check existing scheduled queue to prevent duplicates or exceeding Free Plan limits
  let existingPosts = [];
  try {
    const postsData = await bufferGraphQL(
      apiKey,
      `query ($orgId: OrganizationId!) {
        posts(first: 30, input: { organizationId: $orgId, filter: { status: [scheduled] } }) {
          edges {
            node {
              id
              channelId
              text
            }
          }
        }
      }`,
      { orgId }
    );
    existingPosts = (postsData?.posts?.edges || []).map((e) => e.node);
  } catch (err) {
    console.warn("Note: Could not fetch existing queue for dedupe:", err.message);
  }

  const queueCountByChannel = new Map();
  for (const p of existingPosts) {
    queueCountByChannel.set(
      p.channelId,
      (queueCountByChannel.get(p.channelId) || 0) + 1
    );
  }

  // 3. Determine post content (custom CLI override OR auto-curated from live-feed.json)
  let postPayload;
  if (opts.text) {
    postPayload = {
      text: scrubCompetitors(opts.text),
      imageUrl: opts.image || DEFAULT_IMAGE_URL,
      metaLabel: "Custom CLI Post",
    };
  } else {
    postPayload = await pickNextPostFromFeed(existingPosts.map((p) => p.text || ""));
    if (!postPayload) {
      console.log("No fresh unqueued items found in live-feed.json. Skipping.");
      return;
    }
  }

  console.log(`\n📣 Target Post — Bluesky / Threads (${postPayload.metaLabel}):\n---\n${postPayload.text}\n---`);
  console.log(`\n📸 Target Post — Instagram (URL-free):\n---\n${formatTextForChannel(postPayload.text, "instagram")}\n---`);
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
      mode: opts.now ? "shareNow" : "addToQueue",
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
      console.log(
        `✅ Queued on ${ch.service} (${ch.name}) -> id=${outcome.post.id} dueAt=${outcome.post.dueAt || "auto"}`
      );
    } else {
      console.error(
        `❌ Failed on ${ch.service} (${ch.name}): ${outcome?.message || JSON.stringify(outcome)}`
      );
    }
  }
}

main().catch((err) => {
  console.error("❌ Buffer automation error:", err.message);
  process.exit(1);
});
