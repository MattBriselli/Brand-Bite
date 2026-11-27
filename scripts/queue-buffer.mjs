import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FEED_PATH = path.resolve(__dirname, "../src/data/live-feed.json");
const DOTENV_PATH = path.resolve(__dirname, "../.env");

const BUFFER_ENDPOINT = "https://api.buffer.com";
const DEFAULT_IMAGE_URL = "https://eatbrandbite.com/brandbite-avatar.png";
const MAX_QUEUED_PER_CHANNEL = 8; // Safely under Buffer Free's 10-post-per-channel limit

const NON_FOOD_RETAIL_REGEX =
  /\b(?:tvs?|television|hisense|samsung|laptop|macbook|iphone|ipad|airpods|mattress|tires?|vacuum|electronics|furniture|appliance|holiday hours|open on thanksgiving|bath collection|lawsuit)\b/i;

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

    const hook =
      item.type === "Deal"
        ? "Worth grabbing before the promo ends?"
        : "Drive-thru detour or skip it?";

    return {
      text: clampCaption(`${emoji} ${cleanBrand}: ${cleanTitle}\n\n${hook}`, link),
      imageUrl: DEFAULT_IMAGE_URL,
      metaLabel: `${cleanBrand} — ${cleanTitle}`,
    };
  }

  return null;
}

async function main() {
  const opts = parseCliArgs(process.argv.slice(2));
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

  console.log(`\n📣 Target Post (${postPayload.metaLabel}):\n---\n${postPayload.text}\n---`);
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
      text: postPayload.text,
      schedulingType: "automatic",
      mode: "addToQueue",
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
