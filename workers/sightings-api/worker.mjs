/**
 * BrandBite Community Sightings API (Cloudflare Worker + D1 + Workers AI)
 * Endpoint: https://api.eatbrandbite.com/sightings
 *
 * Multi-layer sanitization before publishing directly live on eatbrandbite.com:
 * 1. Strict CORS origin check + 4 KB payload cap + honeypot + human fill-time gate
 * 2. Salted SHA-256 IP rate limiting in D1 (raw IP is never stored) + 2h duplicate guard
 * 3. NFKC normalization, HTML/control/bidi stripping, zero-link/email/phone enforcement
 * 4. Deterministic profanity/slur/spam lexicon + Workers AI food-relevance & safety check
 */

const ALLOWED_ORIGINS = new Set([
  "https://eatbrandbite.com",
  "https://www.eatbrandbite.com",
  "https://brandbite-feed.web.app",
  "https://brandbite-feed.firebaseapp.com",
  "http://localhost:3000",
]);

const ALLOWED_TYPES = new Map([
  ["Limited-Time Offer", "Limited-Time Offer"],
  ["New Menu Drop", "News"],
  ["Regional Test", "News"],
  ["Store Shelf Sighting", "News"],
  ["Deal", "Deal"],
]);

const ALLOWED_CATEGORIES = new Set([
  "Burgers & Sandwiches",
  "Chicken & Wings",
  "Tacos & Burritos",
  "Pizza & Italian",
  "Breakfast & Diners",
  "Coffee & Drinks",
  "Cookies & Sweets",
  "Chips & Crisps",
  "Frozen & Grocery",
]);

// Word-boundary profanity, slur, NSFW, hate, and scam/spam blocklist
const BLOCKED_TERMS_REGEX = new RegExp(
  "\\b(" +
    [
      "fuck", "fucking", "fucker", "fucked", "motherfucker", "shit", "shitty", "bullshit",
      "bitch", "bitches", "asshole", "bastard", "dick", "dickhead", "cock", "pussy",
      "cunt", "whore", "slut", "fag", "faggot", "dyke", "tranny", "retard", "retarded",
      "nigger", "nigga", "chink", "spic", "kike", "wetback", "gook", "coon", "raghead",
      "nazi", "hitler", "kkk", "jihad", "isis", "rape", "rapist", "pedophile", "pedo",
      "porn", "pornhub", "onlyfans", "nsfw", "xxx", "viagra", "cialis", "casino",
      "betting", "crypto", "bitcoin", "ethereum", "solana", "airdrop", "telegram",
      "whatsapp", "forex", "loan", "seo", "backlinks", "kill yourself", "kys"
    ].join("|") +
    ")\\b",
  "i"
);

// Reject URLs, bare domains, markdown links, email addresses, and phone numbers
const URL_OR_DOMAIN_REGEX =
  /(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:com|net|org|io|co|xyz|gg|ly|me|app|dev|info|biz|ru|cn|tk|link|shop|store|online|site)\b)/i;
const EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/;

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://eatbrandbite.com";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(request, body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...corsHeaders(request),
      ...extraHeaders,
    },
  });
}

function cleanText(raw, maxLen) {
  if (typeof raw !== "string") return "";
  let text = raw
    .normalize("NFKC")
    // Strip zero-width, control, and bidirectional spoofing characters
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, " ")
    // Strip any HTML / script / angle-bracket tags
    .replace(/<[^>]*>/g, " ")
    .replace(/[<>]/g, "")
    // Collapse repeated punctuation/character floods (e.g., "aaaaaaa" -> "aaa")
    .replace(/(.)\1{4,}/g, "$1$1$1")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();

  // Tame ALL-CAPS shouting if longer than 14 letters
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 14) {
    const upper = letters.replace(/[^A-Z]/g, "").length;
    if (upper / letters.length > 0.8) {
      text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
  }

  return text.slice(0, maxLen).trim();
}

function cleanPrice(raw) {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const cleaned = raw.trim().replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const num = Number.parseFloat(cleaned);
  if (!Number.isFinite(num) || num < 0.25 || num > 99.99) {
    return "INVALID";
  }
  return `$${num.toFixed(2)}`;
}

function slugifyBrand(raw) {
  return raw
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function hashIp(ip, salt) {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function containsProhibitedPatterns(...fields) {
  const combined = fields.filter(Boolean).join(" \n ");
  if (URL_OR_DOMAIN_REGEX.test(combined)) {
    return "Links and website URLs aren't allowed in sightings — just share the item details.";
  }
  if (EMAIL_REGEX.test(combined) || PHONE_REGEX.test(combined)) {
    return "Please don't include email addresses or phone numbers in public sightings.";
  }
  if (BLOCKED_TERMS_REGEX.test(combined)) {
    return "Your submission tripped our language/spam filter. Please keep sightings family-friendly and focused on the food.";
  }
  // Gibberish check: require vowel presence in words
  const alpha = combined.replace(/[^a-zA-Z]/g, "");
  if (alpha.length >= 10 && !/[aeiouyAEIOUY]/.test(alpha)) {
    return "Please enter a clear menu item name and description.";
  }
  return null;
}

async function runAiModeration(env, payload) {
  if (!env.AI) return { allow: true };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const prompt = [
      `Brand: ${payload.brandName}`,
      `Item: ${payload.itemName}`,
      `Type: ${payload.sightingType} (${payload.category})`,
      `Location: ${payload.location || "N/A"}`,
      `Spotter: ${payload.spottedBy}`,
      `Notes: ${payload.notes}`,
    ].join("\n");

    const aiPromise = env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        {
          role: "system",
          content:
            'You moderate community food/snack sightings for a family-friendly fast-food & grocery news site. Respond ONLY with compact JSON: {"allow":true} if the submission plausibly describes a real restaurant menu item, drink, grocery snack, or food deal and contains NO profanity, slurs, harassment, sexual content, political bait, personal info, or troll gibberish. Otherwise respond {"allow":false,"reason":"short polite reason"}.',
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 45,
      temperature: 0,
    });

    const result = await Promise.race([
      aiPromise,
      new Promise((_, reject) =>
        controller.signal.addEventListener("abort", () => reject(new Error("timeout")))
      ),
    ]);
    clearTimeout(timer);

    const rawText = typeof result?.response === "string" ? result.response.trim() : "";
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.allow === false) {
        return {
          allow: false,
          reason:
            cleanText(parsed.reason || "", 140) ||
            "Please keep sightings focused on real fast-food menu items or packaged snacks.",
        };
      }
    }
    return { allow: true };
  } catch (err) {
    // Fail open to deterministic sanitizer if AI binding times out
    console.error(
      JSON.stringify({
        message: "ai_moderation_fallback",
        error: err instanceof Error ? err.message : String(err),
      })
    );
    return { allow: true };
  }
}

function formatSightingRow(row) {
  const dt = new Date(row.created_at);
  const formatted = Number.isNaN(dt.getTime())
    ? "Just now"
    : dt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return {
    id: row.id,
    brandSlug: row.brand_slug,
    brandName: row.brand_name,
    itemName: row.item_name,
    sightingType: row.sighting_type,
    articleType: ALLOWED_TYPES.get(row.sighting_type) || "News",
    category: row.category,
    location: row.location || null,
    price: row.price || null,
    notes: row.notes,
    spottedBy: row.spotted_by,
    createdAt: row.created_at,
    publishedFormatted: formatted,
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (url.pathname === "/health") {
      return jsonResponse(request, { ok: true, service: "brandbite-sightings-api" });
    }

    if (url.pathname !== "/sightings") {
      return jsonResponse(request, { ok: false, error: "Not found" }, 404);
    }

    if (request.method === "GET") {
      try {
        const brand = cleanText(url.searchParams.get("brand") || "", 50);
        const limitRaw = Number.parseInt(url.searchParams.get("limit") || "40", 10);
        const limit = Number.isFinite(limitRaw)
          ? Math.min(Math.max(limitRaw, 1), 60)
          : 40;

        let stmt;
        if (brand && brand !== "all") {
          stmt = env.DB.prepare(
            `SELECT id, brand_slug, brand_name, item_name, sighting_type, category, location, price, notes, spotted_by, created_at
             FROM sightings
             WHERE status = 'approved' AND brand_slug = ?
             ORDER BY created_at DESC
             LIMIT ?`
          ).bind(brand, limit);
        } else {
          stmt = env.DB.prepare(
            `SELECT id, brand_slug, brand_name, item_name, sighting_type, category, location, price, notes, spotted_by, created_at
             FROM sightings
             WHERE status = 'approved'
             ORDER BY created_at DESC
             LIMIT ?`
          ).bind(limit);
        }

        const { results } = await stmt.all();
        const items = (results || []).map(formatSightingRow);

        return jsonResponse(
          request,
          { ok: true, count: items.length, items },
          200,
          { "Cache-Control": "public, max-age=5, stale-while-revalidate=20" }
        );
      } catch (err) {
        console.error(
          JSON.stringify({
            message: "get_sightings_failed",
            error: err instanceof Error ? err.message : String(err),
          })
        );
        return jsonResponse(
          request,
          { ok: false, error: "Unable to load community sightings right now." },
          500
        );
      }
    }

    if (request.method === "POST") {
      const origin = request.headers.get("Origin") || "";
      if (origin && !ALLOWED_ORIGINS.has(origin)) {
        return jsonResponse(request, { ok: false, error: "Forbidden origin." }, 403);
      }

      const contentLength = Number.parseInt(
        request.headers.get("Content-Length") || "0",
        10
      );
      if (contentLength > 4096) {
        return jsonResponse(request, { ok: false, error: "Submission is too large." }, 413);
      }

      let rawBody;
      try {
        const text = await request.text();
        if (text.length > 4096) {
          return jsonResponse(request, { ok: false, error: "Submission is too large." }, 413);
        }
        rawBody = JSON.parse(text);
      } catch {
        return jsonResponse(request, { ok: false, error: "Invalid JSON payload." }, 400);
      }

      // Anti-bot honeypot & fill-time check
      if (rawBody.website && String(rawBody.website).trim() !== "") {
        return jsonResponse(request, { ok: false, error: "Spam detected." }, 400);
      }
      if (
        typeof rawBody.elapsedMs === "number" &&
        rawBody.elapsedMs > 0 &&
        rawBody.elapsedMs < 1200
      ) {
        return jsonResponse(
          request,
          { ok: false, error: "Submitted too quickly — please review your details and try again." },
          429
        );
      }

      const brandName = cleanText(rawBody.brandName, 50);
      const rawBrandSlug = cleanText(rawBody.brandSlug, 50);
      const brandSlug =
        rawBrandSlug && rawBrandSlug !== "other"
          ? slugifyBrand(rawBrandSlug)
          : slugifyBrand(brandName) || "community-find";

      const itemName = cleanText(rawBody.itemName, 90);
      const sightingType = cleanText(rawBody.sightingType, 32);
      const category = cleanText(rawBody.category, 40);
      const location = cleanText(rawBody.location || "", 60) || null;
      const price = cleanPrice(rawBody.price || "");
      const notes = cleanText(rawBody.notes, 320);
      const spottedBy =
        cleanText(rawBody.spottedBy || "", 26).replace(/^@+/, "") ||
        "Community Spotter";

      if (brandName.length < 2) {
        return jsonResponse(
          request,
          { ok: false, error: "Please select or enter a chain or snack brand name." },
          422
        );
      }
      if (itemName.length < 3) {
        return jsonResponse(
          request,
          { ok: false, error: "Please enter the menu item or snack name (at least 3 characters)." },
          422
        );
      }
      if (!ALLOWED_TYPES.has(sightingType)) {
        return jsonResponse(
          request,
          { ok: false, error: "Please choose a valid sighting type." },
          422
        );
      }
      if (!ALLOWED_CATEGORIES.has(category)) {
        return jsonResponse(
          request,
          { ok: false, error: "Please choose a valid food category." },
          422
        );
      }
      if (price === "INVALID") {
        return jsonResponse(
          request,
          { ok: false, error: "If entering a price, use a valid amount like $4.99." },
          422
        );
      }
      if (notes.length < 8) {
        return jsonResponse(
          request,
          { ok: false, error: "Please add a quick note (at least 8 characters) on where or how you spotted it." },
          422
        );
      }

      const patternError = containsProhibitedPatterns(
        brandName,
        itemName,
        location,
        notes,
        spottedBy
      );
      if (patternError) {
        return jsonResponse(request, { ok: false, error: patternError }, 422);
      }

      // Rate-limit & duplicate check in D1
      const clientIp = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
      const ipHash = await hashIp(clientIp, env.IP_HASH_SALT || "brandbite-v1");
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

      try {
        const rateRow = await env.DB.prepare(
          `SELECT COUNT(*) AS cnt FROM sightings WHERE ip_hash = ? AND created_at >= ?`
        )
          .bind(ipHash, oneHourAgo)
          .first();

        if (rateRow && Number(rateRow.cnt) >= 5) {
          return jsonResponse(
            request,
            {
              ok: false,
              error: "You've shared 5 sightings this hour — thank you! Please wait a bit before posting more.",
            },
            429
          );
        }

        const dupRow = await env.DB.prepare(
          `SELECT id FROM sightings WHERE brand_slug = ? AND LOWER(item_name) = LOWER(?) AND created_at >= ? LIMIT 1`
        )
          .bind(brandSlug, itemName, twoHoursAgo)
          .first();

        if (dupRow) {
          return jsonResponse(
            request,
            {
              ok: false,
              error: "That exact item sighting was just posted recently — check the live feed!",
            },
            409
          );
        }

        // Workers AI safety & food-relevance check
        const moderation = await runAiModeration(env, {
          brandName,
          itemName,
          sightingType,
          category,
          location,
          notes,
          spottedBy,
        });

        if (!moderation.allow) {
          console.log(
            JSON.stringify({
              message: "sighting_rejected_by_ai",
              brandSlug,
              reason: moderation.reason,
            })
          );
          return jsonResponse(request, { ok: false, error: moderation.reason }, 422);
        }

        const id = `sighting-${crypto.randomUUID()}`;
        const createdAt = new Date().toISOString();

        await env.DB.prepare(
          `INSERT INTO sightings (id, brand_slug, brand_name, item_name, sighting_type, category, location, price, notes, spotted_by, status, ip_hash, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?)`
        )
          .bind(
            id,
            brandSlug,
            brandName,
            itemName,
            sightingType,
            category,
            location,
            price,
            notes,
            spottedBy,
            ipHash,
            createdAt
          )
          .run();

        console.log(
          JSON.stringify({
            message: "sighting_published",
            id,
            brandSlug,
            sightingType,
            category,
          })
        );

        const createdItem = formatSightingRow({
          id,
          brand_slug: brandSlug,
          brand_name: brandName,
          item_name: itemName,
          sighting_type: sightingType,
          category,
          location,
          price,
          notes,
          spotted_by: spottedBy,
          created_at: createdAt,
        });

        return jsonResponse(request, { ok: true, item: createdItem }, 201, {
          "Cache-Control": "no-store",
        });
      } catch (err) {
        console.error(
          JSON.stringify({
            message: "post_sighting_failed",
            error: err instanceof Error ? err.message : String(err),
          })
        );
        return jsonResponse(
          request,
          { ok: false, error: "Could not save your sighting right now. Please try again." },
          500
        );
      }
    }

    return jsonResponse(request, { ok: false, error: "Method not allowed" }, 405);
  },
};
