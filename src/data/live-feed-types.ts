import liveFeedJson from "./live-feed.json";
import { ArticleType, FoodCategory } from "./articles";

export interface LiveFeedSourceStatus {
  id: string;
  name: string;
  url: string;
  homepage: string;
  status: string;
  count: number;
  error?: string;
}

export interface LiveFeedItem {
  id: string;
  title: string;
  url: string;
  sourceId: string;
  sourceName: string;
  sourceBadgeColor: string;
  publishedAt: string;
  publishedFormatted: string;
  brand: string;
  brandSlug: string;
  type: ArticleType;
  category: FoodCategory;
  excerpt: string;
  image: string | null;
  tags: string[];
  isCrossover?: boolean;
  crossoverBrands?: string[];
  crossoverBrandSlugs?: string[];
}

export interface LiveFeedPayload {
  lastSyncedAt: string;
  totalItems: number;
  sources: LiveFeedSourceStatus[];
  items: LiveFeedItem[];
}

export const INITIAL_LIVE_FEED = liveFeedJson as LiveFeedPayload;
