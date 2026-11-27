"use client";

import type { Article, ArticleType } from "@/data/articles";

export const SIGHTINGS_API_URL =
  process.env.NEXT_PUBLIC_SIGHTINGS_API_URL ||
  "https://api.eatbrandbite.com/sightings";

export type SightingTypeOption =
  | "Limited-Time Offer"
  | "New Menu Drop"
  | "Regional Test"
  | "Store Shelf Sighting"
  | "Deal";

export const SIGHTING_TYPES: SightingTypeOption[] = [
  "Limited-Time Offer",
  "New Menu Drop",
  "Regional Test",
  "Store Shelf Sighting",
  "Deal",
];

export interface CommunitySighting {
  id: string;
  brandSlug: string;
  brandName: string;
  itemName: string;
  sightingType: SightingTypeOption;
  articleType: ArticleType;
  category: Article["category"];
  location: string | null;
  price: string | null;
  notes: string;
  spottedBy: string;
  createdAt: string;
  publishedFormatted: string;
}

export interface SubmitSightingInput {
  brandSlug: string;
  brandName: string;
  itemName: string;
  sightingType: SightingTypeOption;
  category: Article["category"];
  location?: string;
  price?: string;
  notes: string;
  spottedBy?: string;
  website?: string;
  elapsedMs?: number;
}

export const SIGHTING_CREATED_EVENT = "brandbite:sighting-created";
export const OPEN_SIGHTING_MODAL_EVENT = "brandbite:open-sighting-modal";

export function openSightingModal(detail?: { brandSlug?: string }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(OPEN_SIGHTING_MODAL_EVENT, { detail: detail || {} })
  );
}

export function broadcastSightingCreated(item: CommunitySighting) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SIGHTING_CREATED_EVENT, { detail: item }));
}

export async function fetchSightings(params?: {
  brand?: string;
  limit?: number;
  bustCache?: boolean;
}): Promise<CommunitySighting[]> {
  try {
    const url = new URL(SIGHTINGS_API_URL);
    if (params?.brand) url.searchParams.set("brand", params.brand);
    if (params?.limit) url.searchParams.set("limit", String(params.limit));
    if (params?.bustCache) url.searchParams.set("_t", String(Date.now()));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

export async function submitSighting(
  input: SubmitSightingInput
): Promise<{ ok: true; item: CommunitySighting } | { ok: false; error: string }> {
  try {
    const res = await fetch(SIGHTINGS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok || !data?.item) {
      return {
        ok: false,
        error:
          data?.error ||
          "Unable to publish your sighting right now. Please check your entry and try again.",
      };
    }
    broadcastSightingCreated(data.item);
    return { ok: true, item: data.item };
  } catch {
    return {
      ok: false,
      error: "Network error — please check your connection and try again.",
    };
  }
}
