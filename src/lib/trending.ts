"use client";

const API_BASE = (
  process.env.NEXT_PUBLIC_SIGHTINGS_API_URL || "https://api.eatbrandbite.com/sightings"
).replace(/\/sightings\/?$/, "");

const CLIENT_ID_STORAGE_KEY = "brandbite:client-id";
const recordedClicksThisSession = new Set<string>();

function getClientId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(CLIENT_ID_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function recordCardClick(itemId: string, brandSlug: string): void {
  if (typeof window === "undefined" || !itemId) return;
  const normalizedId = itemId.toLowerCase();
  if (recordedClicksThisSession.has(normalizedId)) return;
  recordedClicksThisSession.add(normalizedId);

  const payload = JSON.stringify({
    itemId: normalizedId,
    brandSlug: (brandSlug || "industry-wire").toLowerCase(),
    clientId: getClientId(),
  });
  const endpoint = `${API_BASE}/clicks`;

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "text/plain" });
      if (navigator.sendBeacon(endpoint, blob)) return;
    }
  } catch {
    // Fall through to fetch
  }

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Non-blocking telemetry
  });
}

export async function fetchTrendingSignals(
  hours = 72
): Promise<{
  clicks: Record<string, number>;
  upvotes: Record<string, number>;
  comments: Record<string, number>;
}> {
  try {
    const res = await fetch(`${API_BASE}/trending?hours=${hours}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { clicks: {}, upvotes: {}, comments: {} };
    const data = await res.json();
    if (!data?.ok) return { clicks: {}, upvotes: {}, comments: {} };
    return {
      clicks: (data.clicks as Record<string, number>) || {},
      upvotes: (data.upvotes as Record<string, number>) || {},
      comments: (data.comments as Record<string, number>) || {},
    };
  } catch {
    return { clicks: {}, upvotes: {}, comments: {} };
  }
}

export async function fetchTrendingClicks(
  hours = 72
): Promise<Record<string, number>> {
  const { clicks } = await fetchTrendingSignals(hours);
  return clicks;
}

export interface TrendingCandidate {
  id: string;
  brandSlug: string;
  sourceId: string;
  publishedAt: string;
  type: string;
  kind: "editorial" | "wire" | "sighting";
  editorialArticle?: { slug: string };
}

export interface TrendingMetrics {
  score: number;
  clicks: number;
  upvotes: number;
  comments: number;
  distinctSources48h: number;
  reasonLabel: string;
}

function toSlugKey(item: TrendingCandidate): string {
  if (item.editorialArticle?.slug) {
    return item.editorialArticle.slug.toLowerCase();
  }
  const clean = item.id
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110);
  return clean || "brandbite-dispatch";
}

export function computeTrendingMetricsMap<T extends TrendingCandidate>(
  items: T[],
  clickCounts: Record<string, number>,
  referenceNowMs: number,
  upvoteCounts: Record<string, number> = {},
  commentCounts: Record<string, number> = {}
): Map<string, TrendingMetrics> {
  const now = referenceNowMs || Date.now();
  const window48hCutoff = now - 48 * 60 * 60 * 1000;

  // Count distinct outlets covering each brand within the last 48 hours
  const brandSources48h = new Map<string, Set<string>>();
  for (const item of items) {
    if (!item.brandSlug || item.brandSlug === "industry-wire") continue;
    const ts = Date.parse(item.publishedAt);
    if (!Number.isFinite(ts) || ts < window48hCutoff) continue;
    let set = brandSources48h.get(item.brandSlug);
    if (!set) {
      set = new Set<string>();
      brandSources48h.set(item.brandSlug, set);
    }
    set.add(item.sourceId);
  }

  const metricsMap = new Map<string, TrendingMetrics>();
  for (const item of items) {
    const ts = Date.parse(item.publishedAt);
    const ageHours = Number.isFinite(ts)
      ? Math.max(0, (now - ts) / (1000 * 60 * 60))
      : 999;

    const distinctSources48h =
      item.brandSlug && item.brandSlug !== "industry-wire"
        ? brandSources48h.get(item.brandSlug)?.size || 0
        : 0;
    const clicks = clickCounts[item.id.toLowerCase()] || 0;
    const upvotes = upvoteCounts[item.id.toLowerCase()] || 0;
    const comments = commentCounts[toSlugKey(item)] || 0;

    // Cross-source buzz + reader likes (upvotes), comments & clicks + recency decay
    const buzzPoints = distinctSources48h >= 2 ? (distinctSources48h - 1) * 12 : 0;
    const commentPoints = comments * 18;
    const upvotePoints = upvotes * 14;
    const clickPoints = clicks * 6;
    const recencyPoints =
      ageHours < 6
        ? 10
        : ageHours < 24
        ? 6
        : ageHours < 48
        ? 3
        : ageHours < 72
        ? 1
        : ageHours > 168
        ? -10
        : 0;
    const typePoints =
      item.kind === "editorial"
        ? 4
        : item.type === "Deal" || item.type === "Limited-Time Offer"
        ? 2
        : 0;

    const score =
      buzzPoints + commentPoints + upvotePoints + clickPoints + recencyPoints + typePoints;

    let reasonLabel = "Notable drop";
    if (upvotes >= 1 && comments >= 1) {
      reasonLabel = `${upvotes} ${upvotes === 1 ? "like" : "likes"} · ${comments} ${comments === 1 ? "comment" : "comments"}`;
    } else if (comments >= 1) {
      reasonLabel = `${comments} ${comments === 1 ? "comment" : "comments"}`;
    } else if (upvotes >= 1) {
      reasonLabel = `${upvotes} ${upvotes === 1 ? "like" : "likes"}`;
    } else if (clicks >= 3) {
      reasonLabel = `${clicks} clicks`;
    } else if (distinctSources48h >= 2) {
      reasonLabel = `${distinctSources48h} sources covering`;
    } else if (clicks >= 1) {
      reasonLabel = "Getting clicks";
    } else if (ageHours < 24) {
      reasonLabel = "Fresh today";
    }

    metricsMap.set(item.id, {
      score,
      clicks,
      upvotes,
      comments,
      distinctSources48h,
      reasonLabel,
    });
  }

  return metricsMap;
}

export function pickTopTrendingItems<T extends TrendingCandidate>(
  items: T[],
  metricsMap: Map<string, TrendingMetrics>,
  limit = 4
): { item: T; metrics: TrendingMetrics }[] {
  const ranked = [...items]
    .map((item) => ({
      item,
      metrics: metricsMap.get(item.id) || {
        score: 0,
        clicks: 0,
        upvotes: 0,
        comments: 0,
        distinctSources48h: 0,
        reasonLabel: "Notable drop",
      },
    }))
    .sort((a, b) => {
      if (b.metrics.score !== a.metrics.score) {
        return b.metrics.score - a.metrics.score;
      }
      return b.item.publishedAt.localeCompare(a.item.publishedAt);
    });

  const picked: { item: T; metrics: TrendingMetrics }[] = [];
  const seenBrands = new Set<string>();

  for (const entry of ranked) {
    if (picked.length >= limit) break;
    const slug = entry.item.brandSlug;
    if (slug === "industry-wire" && ranked.length > limit * 2) continue;
    if (slug && seenBrands.has(slug)) continue;
    if (slug) seenBrands.add(slug);
    picked.push(entry);
  }

  return picked;
}
