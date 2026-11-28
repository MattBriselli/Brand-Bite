import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FEED_PATH = path.resolve(__dirname, "../src/data/live-feed.json");
const ARTICLES_PATH = path.resolve(__dirname, "../src/data/articles.ts");
const HISTORY_PATH = path.resolve(__dirname, "../src/data/newsletter-history.json");
const DOTENV_PATH = path.resolve(__dirname, "../.env");

const KIT_API_BASE = "https://api.kit.com/v4";
const SIGHTINGS_API = "https://api.eatbrandbite.com/sightings?limit=25";
const SITE_URL = "https://eatbrandbite.com";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const GROCERY_SNACK_SLUGS = new Set([
  "trader-joes",
  "costco",
  "aldi",
  "bucees",
  "wawa",
  "sheetz",
  "oreo",
  "doritos",
  "lays",
  "cheetos",
  "pringles",
  "reeses",
  "hersheys",
  "mms",
  "chips-ahoy",
  "mountain-dew",
  "takis",
]);

const NON_FOOD_RETAIL_REGEX =
  /\b(?:tvs?|television|hisense|samsung|laptop|macbook|iphone|ipad|airpods|mattress|tires?|vacuum|electronics|furniture|appliance|area rug|floral rug|angel reese|holiday hours|open on thanksgiving|bath collection|lawsuit|jensen huang|nvidia)\b/i;

const COMPETITOR_NAMES_REGEX =
  /\b(?:snack\s*wire|brand\s*eating|the\s*impulsive\s*buy|impulsive\s*buy|sporked|guilty\s*eats|chew\s*boom|snackolator|tasting\s*table|mashed|qsr\s*magazine|food\s*dive|nation'?s\s*restaurant\s*news|nosh)\b/gi;

function parseArgs(argv) {
  const modeArg = argv.find((a) => a.startsWith("--mode="));
  return {
    dryRun: argv.includes("--dry-run"),
    mode: modeArg ? modeArg.split("=")[1] : "draft", // "draft" | "schedule"
  };
}

async function loadKitApiKey() {
  if (process.env.KIT_API_KEY) return process.env.KIT_API_KEY.trim();
  try {
    const raw = await fs.readFile(DOTENV_PATH, "utf8");
    const match = raw.match(/^KIT_API_KEY=(.+)$/m);
    if (match?.[1]) return match[1].trim().replace(/^['"]|['"]$/g, "");
  } catch {
    // Ignore missing .env
  }
  throw new Error(
    "Missing KIT_API_KEY. Set it in local gitignored .env or GitHub Actions Secrets."
  );
}

async function kitRequest(apiKey, endpoint, options = {}) {
  const res = await fetch(`${KIT_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": apiKey,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      `Kit API ${res.status} on ${endpoint}: ${JSON.stringify(data)}`
    );
  }
  return data;
}

function scrubText(text = "") {
  return text
    .replace(/\s+[-–—]\s+[A-Za-z0-9 .,'&|:]+$/, "")
    .replace(/^Reported by [^•]+•\s*/i, "")
    .replace(COMPETITOR_NAMES_REGEX, "BrandBite")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeHeadline(title = "") {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
}

async function loadHistory() {
  try {
    const raw = await fs.readFile(HISTORY_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      sentUrls: Array.isArray(parsed.sentUrls) ? parsed.sentUrls : [],
      sentSightingIds: Array.isArray(parsed.sentSightingIds)
        ? parsed.sentSightingIds
        : [],
      sentHeadlines: Array.isArray(parsed.sentHeadlines)
        ? parsed.sentHeadlines
        : [],
      broadcasts: Array.isArray(parsed.broadcasts) ? parsed.broadcasts : [],
    };
  } catch {
    return { sentUrls: [], sentSightingIds: [], sentHeadlines: [], broadcasts: [] };
  }
}

async function fetchRecentSightings(cutoffMs, sentSightingIds) {
  try {
    const res = await fetch(SIGHTINGS_API);
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data.sightings) ? data.sightings : [];
    return items
      .filter((s) => {
        if (!s?.id || sentSightingIds.has(s.id)) return false;
        const ts = Date.parse(s.createdAt);
        return Number.isFinite(ts) && ts >= cutoffMs;
      })
      .slice(0, 2);
  } catch {
    return [];
  }
}

async function loadRecentOriginals(cutoffMs, sentUrls) {
  try {
    const src = await fs.readFile(ARTICLES_PATH, "utf8");
    const articlesBlockMatch = src.match(
      /export const ARTICLES:\s*Article\[\]\s*=\s*\[([\s\S]*?)\n\];/
    );
    if (!articlesBlockMatch) return [];
    const block = articlesBlockMatch[1];

    const entries = [];
    const slugRegex = /slug:\s*"([^"]+)"/g;
    let m;
    while ((m = slugRegex.exec(block)) !== null) {
      const start = Math.max(0, m.index - 200);
      const chunk = block.slice(start, m.index + 1200);
      const slug = m[1];
      const url = `${SITE_URL}/reviews/${slug}`;
      if (sentUrls.has(url)) continue;

      const title = chunk.match(/title:\s*"([^"]+)"/)?.[1];
      const excerpt = chunk.match(/excerpt:\s*"([^"]+)"/)?.[1];
      const publishedAt = chunk.match(/publishedAt:\s*"([^"]+)"/)?.[1];
      if (!title || !publishedAt) continue;

      const ts = Date.parse(`${publishedAt}T12:00:00Z`);
      if (Number.isFinite(ts) && ts >= cutoffMs) {
        entries.push({ title, excerpt: excerpt || "", url, publishedAt });
      }
    }
    return entries.slice(0, 2);
  } catch {
    return [];
  }
}

function nextFriday9amEtIso() {
  // Schedule for next Friday at 14:00 UTC (9:00 AM EST / 10:00 AM EDT)
  const now = new Date();
  const target = new Date(now);
  const day = target.getUTCDay(); // 5 = Friday
  let daysAhead = (5 - day + 7) % 7;
  if (daysAhead === 0 && target.getUTCHours() >= 14) {
    daysAhead = 7;
  }
  target.setUTCDate(target.getUTCDate() + daysAhead);
  target.setUTCHours(14, 0, 0, 0);
  return target.toISOString();
}

function buildEmailHtml({
  lead,
  driveThru,
  grocery,
  deals,
  sightings,
  originals,
}) {
  const renderBulletList = (items) =>
    items
      .map((item) => {
        const href =
          item.brandSlug && item.brandSlug !== "industry-wire"
            ? `${SITE_URL}/brands/${item.brandSlug}`
            : SITE_URL;
        return `<li style="margin:0 0 12px 0;line-height:1.5;">
          <strong style="color:#181512;">${escapeHtml(item.cleanBrand)}</strong> — 
          <a href="${href}" style="color:#c2410c;text-decoration:underline;font-weight:600;">${escapeHtml(item.cleanTitle)}</a>
        </li>`;
      })
      .join("\n");

  const leadHref =
    lead.brandSlug && lead.brandSlug !== "industry-wire"
      ? `${SITE_URL}/brands/${lead.brandSlug}`
      : SITE_URL;

  const sightingsSection =
    sightings.length > 0
      ? `
      <div style="margin:28px 0 0 0;padding-top:20px;border-top:1px solid #e5dfd5;">
        <h2 style="margin:0 0 12px 0;font-size:15px;text-transform:uppercase;letter-spacing:0.06em;color:#0f766e;">👀 Spotted by Readers</h2>
        <ul style="margin:0;padding-left:18px;font-size:15px;color:#3d352e;">
          ${sightings
            .map(
              (s) => `<li style="margin:0 0 10px 0;line-height:1.5;">
                <strong style="color:#181512;">${escapeHtml(s.brandName)}: ${escapeHtml(s.itemName)}</strong>
                ${s.location ? ` (${escapeHtml(s.location)})` : ""}
                ${s.price ? ` — ${escapeHtml(s.price)}` : ""}
              </li>`
            )
            .join("\n")}
        </ul>
      </div>`
      : "";

  const originalsSection =
    originals.length > 0
      ? `
      <div style="margin:28px 0 0 0;padding-top:20px;border-top:1px solid #e5dfd5;">
        <h2 style="margin:0 0 12px 0;font-size:15px;text-transform:uppercase;letter-spacing:0.06em;color:#c2410c;">✨ From the BrandBite Desk</h2>
        <ul style="margin:0;padding-left:18px;font-size:15px;color:#3d352e;">
          ${originals
            .map(
              (o) => `<li style="margin:0 0 12px 0;line-height:1.5;">
                <a href="${o.url}" style="color:#c2410c;text-decoration:underline;font-weight:700;">${escapeHtml(o.title)}</a>
                ${o.excerpt ? `<br><span style="font-size:14px;color:#575049;">${escapeHtml(o.excerpt)}</span>` : ""}
              </li>`
            )
            .join("\n")}
        </ul>
      </div>`
      : "";

  return `
<div style="background:#faf8f5;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#181512;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5dfd5;border-radius:16px;overflow:hidden;">
    <!-- Masthead -->
    <div style="height:5px;background:repeating-linear-gradient(135deg,#b91c1c 0px,#b91c1c 12px,#faf8f5 12px,#faf8f5 20px,#166534 20px,#166534 32px,#faf8f5 32px,#faf8f5 40px);"></div>
    <div style="background:#181512;padding:22px 24px;color:#faf8f5;">
      <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:-0.02em;">
        BRAND<span style="color:#ef4444;">BITE</span> <span style="font-size:13px;font-weight:700;color:#86efac;">🎄 Holiday Edition</span>
      </p>
      <p style="margin:4px 0 0 0;font-size:13px;color:#d6cfc7;">
        The Weekly Bite • Fast-food drops, snack-aisle chaos &amp; zero calorie lectures (always ad-free)
      </p>
    </div>

    <div style="padding:24px;">
      <p style="margin:0 0 18px 0;font-size:14px;line-height:1.55;color:#575049;">
        Another week of limited-edition menu decisions nobody technically asked for, yet here we all are. Here&apos;s what actually matters before the weekend:
      </p>
      <!-- 1. The Lead Drop -->
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:18px;">
        <p style="margin:0 0 6px 0;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#c2410c;">
          🔥 The Lead Drop
        </p>
        <h1 style="margin:0 0 8px 0;font-size:20px;line-height:1.3;color:#181512;">
          ${escapeHtml(lead.cleanBrand)}: ${escapeHtml(lead.cleanTitle)}
        </h1>
        ${
          lead.cleanExcerpt
            ? `<p style="margin:0 0 14px 0;font-size:14px;line-height:1.55;color:#575049;">${escapeHtml(lead.cleanExcerpt)}</p>`
            : ""
        }
        <a href="${leadHref}" style="display:inline-block;background:#c2410c;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 16px;border-radius:10px;">
          Track ${escapeHtml(lead.cleanBrand)} on BrandBite →
        </a>
      </div>

      <!-- 2. Drive-Thru Radar -->
      ${
        driveThru.length > 0
          ? `<div style="margin:26px 0 0 0;">
              <h2 style="margin:0 0 12px 0;font-size:15px;text-transform:uppercase;letter-spacing:0.06em;color:#181512;">🍔 Drive-Thru Radar</h2>
              <ul style="margin:0;padding-left:18px;font-size:15px;color:#3d352e;">
                ${renderBulletList(driveThru)}
              </ul>
            </div>`
          : ""
      }

      <!-- 3. Grocery & Convenience Finds -->
      ${
        grocery.length > 0
          ? `<div style="margin:26px 0 0 0;padding-top:20px;border-top:1px solid #e5dfd5;">
              <h2 style="margin:0 0 12px 0;font-size:15px;text-transform:uppercase;letter-spacing:0.06em;color:#181512;">🛒 Grocery &amp; Convenience Finds</h2>
              <ul style="margin:0;padding-left:18px;font-size:15px;color:#3d352e;">
                ${renderBulletList(grocery)}
              </ul>
            </div>`
          : ""
      }

      <!-- 4. Worth Grabbing (Deals) -->
      ${
        deals.length > 0
          ? `<div style="margin:26px 0 0 0;padding-top:20px;border-top:1px solid #e5dfd5;">
              <h2 style="margin:0 0 12px 0;font-size:15px;text-transform:uppercase;letter-spacing:0.06em;color:#181512;">💸 Worth Grabbing This Weekend</h2>
              <ul style="margin:0;padding-left:18px;font-size:15px;color:#3d352e;">
                ${renderBulletList(deals)}
              </ul>
            </div>`
          : ""
      }

      ${sightingsSection}
      ${originalsSection}

      <!-- Footer CTA -->
      <div style="margin:30px 0 0 0;padding:18px;background:#f5f1ea;border-radius:12px;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#181512;">
          Spotted a wild LTO or grocery drop before we did?
        </p>
        <p style="margin:0 0 12px 0;font-size:13px;color:#575049;">
          Report it live on <a href="${SITE_URL}" style="color:#b91c1c;font-weight:700;">eatbrandbite.com</a> or follow the daily snack chaos on
          <a href="https://www.instagram.com/eat.brand.bite/" style="color:#b91c1c;font-weight:600;">Instagram</a>,
          <a href="https://www.threads.com/@eat.brand.bite" style="color:#b91c1c;font-weight:600;">Threads</a> &amp;
          <a href="https://bsky.app/profile/eatbrandbite.com" style="color:#b91c1c;font-weight:600;">Bluesky</a>.
        </p>
        <p style="margin:0;font-size:11px;color:#78716c;">
          The Weekly Bite is 100% ad-free • Zero nutrition policing • Just vibes &amp; drive-thrus
        </p>
      </div>
    </div>
  </div>
</div>`.trim();
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const apiKey = await loadKitApiKey();

  // 1. Subscriber Gate: never create or send a broadcast until at least 1 real subscriber exists
  const subData = await kitRequest(apiKey, "/subscribers?status=active");
  const activeCount = (subData?.subscribers || []).length;
  console.log(`📬 Kit active subscribers: ${activeCount}`);

  if (activeCount < 1 && !opts.dryRun) {
    console.log(
      "⏸️  Skipping broadcast: 0 active subscribers on the list. Will automatically activate once your first subscriber joins."
    );
    return;
  }

  // 2. Load history ledger + live feed (strict 7-day freshness cutoff)
  const history = await loadHistory();

  // Idempotency guard for redundant Cloudflare + GitHub triggers:
  // never create a second Weekly Bite broadcast within 5 days of the last one.
  if (!dryRun && Array.isArray(history.issues) && history.issues.length > 0) {
    const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
    const recentIssue = history.issues.find((iss) => {
      const ts = Date.parse(iss.createdAt || iss.date || "");
      return Number.isFinite(ts) && ts >= fiveDaysAgo;
    });
    if (recentIssue) {
      console.log(
        `⏭️  Weekly Bite issue already created recently (${recentIssue.createdAt || recentIssue.date}). Skipping redundant cron trigger.`
      );
      return;
    }
  }

  const sentUrls = new Set(history.sentUrls);
  const sentHeadlines = new Set(history.sentHeadlines);
  const sentSightingIds = new Set(history.sentSightingIds);

  const feed = JSON.parse(await fs.readFile(FEED_PATH, "utf8"));
  const nowMs = Date.now();
  const cutoffMs = nowMs - SEVEN_DAYS_MS;

  const freshPool = (feed.items || [])
    .map((item) => {
      const cleanBrand =
        item.brand && !/wire|desk/i.test(item.brand)
          ? scrubText(item.brand)
          : "Food & Snack Desk";
      const cleanTitle = scrubText(item.title);
      const cleanExcerpt = scrubText(item.excerpt || "").slice(0, 220);
      return { ...item, cleanBrand, cleanTitle, cleanExcerpt };
    })
    .filter((item) => {
      if (!item.cleanTitle || item.cleanTitle.length < 14) return false;
      if (NON_FOOD_RETAIL_REGEX.test(item.cleanTitle)) return false;
      if (sentUrls.has(item.url)) return false;
      if (sentHeadlines.has(normalizeHeadline(item.cleanTitle))) return false;
      const ts = Date.parse(item.publishedAt);
      return Number.isFinite(ts) && ts >= cutoffMs;
    });

  // Enforce max 1 item per brand across the entire issue
  const usedBrands = new Set();
  const takeFresh = (predicate, limit) => {
    const picked = [];
    for (const item of freshPool) {
      if (picked.length >= limit) break;
      const brandKey = item.brandSlug || item.cleanBrand.toLowerCase();
      if (usedBrands.has(brandKey)) continue;
      if (!predicate(item)) continue;
      usedBrands.add(brandKey);
      picked.push(item);
    }
    return picked;
  };

  const leadList = takeFresh(
    (i) =>
      (i.type === "Limited-Time Offer" || i.type === "News") &&
      i.brandSlug &&
      i.brandSlug !== "industry-wire",
    1
  );
  const lead = leadList[0] || takeFresh(() => true, 1)[0];

  if (!lead) {
    console.log("⏸️  Not enough fresh 7-day items to build an issue. Skipping.");
    return;
  }

  const grocery = takeFresh(
    (i) => GROCERY_SNACK_SLUGS.has(i.brandSlug),
    3
  );
  const deals = takeFresh((i) => i.type === "Deal", 3);
  const driveThru = takeFresh(
    (i) =>
      !GROCERY_SNACK_SLUGS.has(i.brandSlug) &&
      i.brandSlug &&
      i.brandSlug !== "industry-wire",
    4
  );

  const [sightings, originals] = await Promise.all([
    fetchRecentSightings(cutoffMs, sentSightingIds),
    loadRecentOriginals(cutoffMs, sentUrls),
  ]);

  const featuredAll = [lead, ...driveThru, ...grocery, ...deals];
  if (featuredAll.length < 4 && !opts.dryRun) {
    console.log(
      `⏸️  Only ${featuredAll.length} fresh items found this week (minimum 4). Skipping.`
    );
    return;
  }

  // Timeless, unnumbered subject line anchored to this week's top drops
  const secondHighlight = grocery[0]?.cleanBrand || driveThru[0]?.cleanBrand;
  const subject = secondHighlight
    ? `🍔 ${lead.cleanBrand}, ${secondHighlight} & this week's most questionable food drops`
    : `🍔 ${lead.cleanBrand} & this week's drive-thru drops (The Weekly Bite)`;

  const previewText = `${lead.cleanBrand}: ${lead.cleanTitle}`.slice(0, 120);
  const html = buildEmailHtml({
    lead,
    driveThru,
    grocery,
    deals,
    sightings,
    originals,
  });

  console.log(`\n📧 Subject: ${subject}`);
  console.log(`📝 Preview: ${previewText}`);
  console.log(
    `📊 Sections: Lead(1), Drive-Thru(${driveThru.length}), Grocery(${grocery.length}), Deals(${deals.length}), Sightings(${sightings.length}), Originals(${originals.length})`
  );

  if (opts.dryRun) {
    const previewPath = "/tmp/weekly-bite-preview.html";
    await fs.writeFile(previewPath, html, "utf8");
    console.log(`\n✅ Dry run complete — preview saved to ${previewPath} (Kit untouched).`);
    return;
  }

  const sendAt = opts.mode === "schedule" ? nextFriday9amEtIso() : null;
  const broadcastPayload = {
    subject,
    preview_text: previewText,
    content: html,
    description: `BrandBite Weekly Bite (${opts.mode})`,
    public: false,
    send_at: sendAt,
  };

  const created = await kitRequest(apiKey, "/broadcasts", {
    method: "POST",
    body: JSON.stringify(broadcastPayload),
  });

  const broadcastId = created?.broadcast?.id;
  console.log(
    `✅ Kit Broadcast created! id=${broadcastId} mode=${opts.mode} send_at=${sendAt || "DRAFT (review in Kit)"}`
  );

  // Update anti-repeat history ledger
  for (const item of featuredAll) {
    history.sentUrls.push(item.url);
    history.sentHeadlines.push(normalizeHeadline(item.cleanTitle));
  }
  for (const o of originals) {
    history.sentUrls.push(o.url);
  }
  for (const s of sightings) {
    history.sentSightingIds.push(s.id);
  }
  history.broadcasts.unshift({
    id: broadcastId,
    subject,
    mode: opts.mode,
    sendAt,
    createdAt: new Date().toISOString(),
    itemCount: featuredAll.length + sightings.length + originals.length,
  });

  // Keep ledger tidy (last 500 URLs/headlines)
  history.sentUrls = Array.from(new Set(history.sentUrls)).slice(-500);
  history.sentHeadlines = Array.from(new Set(history.sentHeadlines)).slice(-500);
  history.sentSightingIds = Array.from(new Set(history.sentSightingIds)).slice(-300);
  history.broadcasts = history.broadcasts.slice(0, 100);

  await fs.writeFile(HISTORY_PATH, JSON.stringify(history, null, 2) + "\n", "utf8");
  console.log("📒 Updated src/data/newsletter-history.json ledger.");
}

main().catch((err) => {
  console.error("❌ Newsletter automation error:", err.message);
  process.exit(1);
});
