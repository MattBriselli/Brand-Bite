"use client";

const API_BASE = (
  process.env.NEXT_PUBLIC_SIGHTINGS_API_URL || "https://api.eatbrandbite.com/sightings"
).replace(/\/sightings\/?$/, "");

export function toDiscussionSlug(id: string): string {
  const clean = id
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110);
  return clean || "brandbite-dispatch";
}

export async function fetchUpvotes(idToken?: string): Promise<{
  counts: Record<string, number>;
  userUpvoted: Set<string>;
}> {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (idToken) {
      headers.Authorization = `Bearer ${idToken}`;
    }
    const res = await fetch(`${API_BASE}/upvotes`, { method: "GET", headers });
    if (!res.ok) return { counts: {}, userUpvoted: new Set() };
    const data = await res.json();
    if (!data?.ok) return { counts: {}, userUpvoted: new Set() };
    return {
      counts: (data.counts as Record<string, number>) || {},
      userUpvoted: new Set<string>(
        Array.isArray(data.userUpvoted) ? data.userUpvoted : []
      ),
    };
  } catch {
    return { counts: {}, userUpvoted: new Set() };
  }
}

export async function toggleUpvote(
  itemId: string,
  idToken: string
): Promise<
  | { ok: true; itemId: string; upvoted: boolean; count: number }
  | { ok: false; status: number; error: string }
> {
  try {
    const res = await fetch(`${API_BASE}/upvotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ itemId: itemId.toLowerCase() }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      return {
        ok: false,
        status: res.status,
        error: data?.error || "Could not save upvote.",
      };
    }
    return {
      ok: true,
      itemId: data.itemId,
      upvoted: Boolean(data.upvoted),
      count: Number(data.count || 0),
    };
  } catch {
    return { ok: false, status: 0, error: "Network error — please try again." };
  }
}

const previewCache = new Map<string, string | null>();

export async function fetchArticleSubtitle(url: string): Promise<string | null> {
  if (!url || !url.startsWith("https://")) return null;
  if (previewCache.has(url)) {
    return previewCache.get(url) ?? null;
  }
  try {
    const res = await fetch(
      `${API_BASE}/article-preview?url=${encodeURIComponent(url)}`,
      { method: "GET", headers: { Accept: "application/json" } }
    );
    if (!res.ok) {
      previewCache.set(url, null);
      return null;
    }
    const data = await res.json();
    const subtitle =
      data?.ok && typeof data.subtitle === "string" && data.subtitle.trim()
        ? data.subtitle.trim()
        : null;
    previewCache.set(url, subtitle);
    return subtitle;
  } catch {
    return null;
  }
}
