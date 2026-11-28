"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ARTICLES,
  ARTICLE_TYPES,
  BRANDS,
  CATEGORIES,
  Article,
  ArticleType,
} from "@/data/articles";
import {
  INITIAL_LIVE_FEED,
  LiveFeedItem,
} from "@/data/live-feed-types";
import {
  Search,
  Star,
  Flame,
  X,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Building2,
  Radio,
  ExternalLink,
  Clock,
  Camera,
  ThumbsUp,
  MapPin,
  Send,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  trackOutboundDispatch,
  trackBrandFilter,
  trackFeedSearch,
  trackFeedFilterSelect,
  trackSocialClick,
} from "@/lib/analytics";
import { SOCIAL_PROFILES } from "@/data/socials";
import { SponsoredFeedCard } from "@/components/SponsoredFeedCard";
import { SpecialsOnNow } from "@/components/SpecialsOnNow";
import { CopyableTitle } from "@/components/CopyableTitle";
import { BrandCardBanner } from "@/components/BrandCardBanner";
import { BrandLogo } from "@/components/BrandLogo";
import { showCopyToast } from "@/components/CopyToastHost";
import { Rss, LayoutGrid, List } from "lucide-react";
import {
  fetchSightings,
  openSightingModal,
  SIGHTING_CREATED_EVENT,
  type CommunitySighting,
} from "@/lib/sightings";

type FeedMode = "unified" | "wire" | "editorial";
type TimeRange = "all" | "week" | "day";

interface UnifiedCardItem {
  kind: "editorial" | "wire" | "sighting";
  id: string;
  title: string;
  href: string;
  isExternal: boolean;
  type: ArticleType;
  brand: string;
  brandSlug: string;
  category: Article["category"];
  publishedAt: string;
  publishedFormatted: string;
  image: string | null;
  imageAlt: string;
  excerpt: string;
  sourceId: string;
  sourceName: string;
  sourceBadgeColor: string;
  editorialArticle?: Article;
  wireItem?: LiveFeedItem;
  sightingItem?: CommunitySighting;
}

const HOME_FILTERS_STORAGE_KEY = "brandbite:home-filters";

function formatRelativeRecency(
  publishedAt: string,
  referenceNowMs: number,
  fallback: string
): { short: string; full: string; isRecent: boolean } {
  const ts = Date.parse(publishedAt);
  if (!Number.isFinite(ts) || !referenceNowMs) {
    return { short: fallback, full: fallback, isRecent: false };
  }
  const diffMs = Math.max(0, referenceNowMs - ts);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) {
    if (diffMins <= 1) {
      return { short: "Just now", full: "Just now", isRecent: true };
    }
    return { short: `${diffMins}m ago`, full: `${diffMins} min ago`, isRecent: true };
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return {
      short: `${diffHours}h ago`,
      full: `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`,
      isRecent: true,
    };
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return {
      short: `${diffDays}d ago`,
      full: `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`,
      isRecent: false,
    };
  }
  return { short: fallback, full: fallback, isRecent: false };
}

interface HomeFeedProps {
  liveOnly?: boolean;
}

export function HomeFeed({ liveOnly = false }: HomeFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const liveFeed = INITIAL_LIVE_FEED;

  const clearFilterQueryParams = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    let changed = false;
    for (const param of ["type", "mode", "brand"]) {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        changed = true;
      }
    }
    if (changed) {
      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      router.replace(nextUrl, { scroll: false });
    }
  };

  const [communitySightings, setCommunitySightings] = useState<CommunitySighting[]>([]);
  const [feedMode, setFeedMode] = useState<FeedMode>("unified");
  const [selectedSourceId, setSelectedSourceId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"All" | ArticleType>("All");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [nowMs, setNowMs] = useState<number>(() => {
    const parsed = Date.parse(liveFeed.lastSyncedAt);
    return Number.isFinite(parsed) ? parsed : 0;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "brand-asc">("latest");
  const [viewDensity, setViewDensity] = useState<"card" | "concise">("card");
  const [selectedLetter, setSelectedLetter] = useState<string>("ACTIVE");
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const [brokenImageIds, setBrokenImageIds] = useState<Set<string>>(() => new Set());
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const prevSearchParamsRef = useRef<string | null>(null);

  // Restore sticky feed filters & radio selections across reloads
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HOME_FILTERS_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<{
          feedMode: FeedMode;
          selectedSourceId: string;
          searchQuery: string;
          selectedType: "All" | ArticleType;
          timeRange: TimeRange;
          selectedCategory: string;
          selectedBrandSlug: string;
          sortBy: "latest" | "brand-asc";
          viewDensity: "card" | "concise";
          selectedLetter: string;
        }>;

        const hasTypeParam = Boolean(searchParams.get("type"));
        const hasBrandParam = Boolean(searchParams.get("brand"));
        const hasModeParam = Boolean(searchParams.get("mode"));

        if (
          !hasModeParam &&
          saved.feedMode &&
          (saved.feedMode === "unified" ||
            saved.feedMode === "wire" ||
            saved.feedMode === "editorial")
        ) {
          setFeedMode(saved.feedMode);
        }
        if (typeof saved.selectedSourceId === "string" && saved.selectedSourceId) {
          setSelectedSourceId(saved.selectedSourceId);
        }
        if (typeof saved.searchQuery === "string") {
          setSearchQuery(saved.searchQuery);
        }
        if (
          !hasTypeParam &&
          saved.selectedType &&
          (saved.selectedType === "All" ||
            ARTICLE_TYPES.includes(saved.selectedType as ArticleType))
        ) {
          setSelectedType(saved.selectedType);
        }
        if (
          saved.timeRange === "all" ||
          saved.timeRange === "week" ||
          saved.timeRange === "day"
        ) {
          setTimeRange(saved.timeRange);
        }
        if (
          typeof saved.selectedCategory === "string" &&
          (saved.selectedCategory === "All Categories" ||
            CATEGORIES.includes(saved.selectedCategory as Article["category"]))
        ) {
          setSelectedCategory(saved.selectedCategory);
        }
        if (
          !hasBrandParam &&
          typeof saved.selectedBrandSlug === "string" &&
          saved.selectedBrandSlug
        ) {
          setSelectedBrandSlug(saved.selectedBrandSlug);
        }
        if (saved.sortBy === "latest" || saved.sortBy === "brand-asc") {
          setSortBy(saved.sortBy);
        }
        if (saved.viewDensity === "card" || saved.viewDensity === "concise") {
          setViewDensity(saved.viewDensity);
        }
        if (typeof saved.selectedLetter === "string" && saved.selectedLetter) {
          setSelectedLetter(saved.selectedLetter);
        }
      }
    } catch {
      // Ignore storage read/parse errors
    } finally {
      setFiltersHydrated(true);
      setNowMs(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist sticky feed filters & radio selections whenever they change
  useEffect(() => {
    if (!filtersHydrated) return;
    try {
      localStorage.setItem(
        HOME_FILTERS_STORAGE_KEY,
        JSON.stringify({
          feedMode,
          selectedSourceId,
          searchQuery,
          selectedType,
          timeRange,
          selectedCategory,
          selectedBrandSlug,
          sortBy,
          viewDensity,
          selectedLetter,
        })
      );
    } catch {
      // Ignore storage write errors
    }
  }, [
    filtersHydrated,
    feedMode,
    selectedSourceId,
    searchQuery,
    selectedType,
    timeRange,
    selectedCategory,
    selectedBrandSlug,
    sortBy,
    viewDensity,
    selectedLetter,
  ]);

  useEffect(() => {
    let active = true;
    fetchSightings({ limit: 40 }).then((items) => {
      if (active) setCommunitySightings(items);
    });

    const onCreated = (event: Event) => {
      const custom = event as CustomEvent<CommunitySighting>;
      if (custom.detail) {
        setCommunitySightings((prev) =>
          prev.some((s) => s.id === custom.detail.id)
            ? prev
            : [custom.detail, ...prev]
        );
      }
    };

    window.addEventListener(SIGHTING_CREATED_EVENT, onCreated);

    const onHeaderFilter = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: "All" | ArticleType }>).detail;
      if (detail?.type) {
        setFeedMode("unified");
        setSelectedSourceId("all");
        setSelectedType(detail.type);
        setTimeRange("all");
        setSelectedCategory("All Categories");
        setSelectedBrandSlug("all");
        setSearchQuery("");
      }
    };
    window.addEventListener("brandbite:apply-filter", onHeaderFilter);

    return () => {
      active = false;
      window.removeEventListener(SIGHTING_CREATED_EVENT, onCreated);
      window.removeEventListener("brandbite:apply-filter", onHeaderFilter);
    };
  }, []);

  useEffect(() => {
    const serialized = searchParams.toString();
    const isSubsequentNav =
      prevSearchParamsRef.current !== null && prevSearchParamsRef.current !== serialized;
    prevSearchParamsRef.current = serialized;

    const typeParam = searchParams.get("type");
    const brandParam = searchParams.get("brand");
    const modeParam = searchParams.get("mode");

    if (
      typeParam &&
      (typeParam === "Review" ||
        typeParam === "News" ||
        typeParam === "Limited-Time Offer" ||
        typeParam === "Deal")
    ) {
      setFeedMode("unified");
      setSelectedType(typeParam);
      setSelectedSourceId("all");
      document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
    } else if (typeParam === null && isSubsequentNav) {
      setSelectedType("All");
    }

    if (brandParam) {
      setSelectedBrandSlug(brandParam);
    }

    if (modeParam === "wire" || modeParam === "editorial" || modeParam === "unified") {
      setFeedMode(modeParam);
    } else if (modeParam === null && isSubsequentNav) {
      setFeedMode("unified");
    }

    if (typeParam || brandParam || modeParam) {
      clearFilterQueryParams();
    }
  }, [searchParams]);

  const markImageBroken = (id: string) => {
    setBrokenImageIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Lead live wire dispatch (prefer newest item with a verified image)
  const leadWireDispatch = useMemo(() => {
    const items = liveFeed.items || [];
    return (
      items.find((item) => Boolean(item.image) && !brokenImageIds.has(item.id)) ||
      items[0] ||
      null
    );
  }, [liveFeed.items, brokenImageIds]);

  // Merge Editorial (currently empty — Coming Soon) + Live Wire
  const allUnifiedItems: UnifiedCardItem[] = useMemo(() => {
    const editorialMapped: UnifiedCardItem[] = ARTICLES.map((art) => ({
      kind: "editorial",
      id: art.id,
      title: art.title,
      href: `/reviews/${art.slug}`,
      isExternal: false,
      type: art.type,
      brand: art.brand,
      brandSlug: art.brandSlug,
      category: art.category,
      publishedAt: `${art.publishedAt}T12:00:00.000Z`,
      publishedFormatted: art.publishedDateFormatted,
      image: art.image,
      imageAlt: art.imageAlt,
      excerpt: art.excerpt,
      sourceId: "brandbite-editorial",
      sourceName: "BrandBite Original",
      sourceBadgeColor: "#181512",
      editorialArticle: art,
    }));

    const sightingsMapped: UnifiedCardItem[] = communitySightings.map((s) => ({
      kind: "sighting",
      id: s.id,
      title: `${s.brandName}: ${s.itemName}`,
      href: `/#feed`,
      isExternal: false,
      type: s.articleType,
      brand: s.brandName,
      brandSlug: s.brandSlug,
      category: s.category,
      publishedAt: s.createdAt,
      publishedFormatted: s.publishedFormatted,
      image: null,
      imageAlt: `${s.brandName} — ${s.itemName}`,
      excerpt: s.notes,
      sourceId: "community-sightings",
      sourceName: "Reader Sighting",
      sourceBadgeColor: "#0f766e",
      sightingItem: s,
    }));

    const wireMapped: UnifiedCardItem[] = (liveFeed.items || []).map((item) => ({
      kind: "wire",
      id: item.id,
      title: item.title,
      href: item.url,
      isExternal: true,
      type: item.type,
      brand: item.brand,
      brandSlug: item.brandSlug,
      category: item.category,
      publishedAt: item.publishedAt,
      publishedFormatted: item.publishedFormatted,
      image: item.image,
      imageAlt: `${item.brand} — ${item.title}`,
      excerpt: item.excerpt,
      sourceId: item.sourceId,
      sourceName: item.sourceName,
      sourceBadgeColor: item.sourceBadgeColor,
      wireItem: item,
    }));

    if (feedMode === "editorial") return editorialMapped;
    if (feedMode === "wire") return wireMapped;
    return [...sightingsMapped, ...editorialMapped, ...wireMapped];
  }, [liveFeed.items, communitySightings, feedMode]);

  const timeRangeCounts = useMemo(() => {
    const dayCutoff = nowMs - 24 * 60 * 60 * 1000;
    const weekCutoff = nowMs - 7 * 24 * 60 * 60 * 1000;
    let day = 0;
    let week = 0;
    for (const item of allUnifiedItems) {
      const ts = Date.parse(item.publishedAt);
      if (!Number.isFinite(ts)) continue;
      if (ts >= weekCutoff) week++;
      if (ts >= dayCutoff) day++;
    }
    return { all: allUnifiedItems.length, week, day };
  }, [allUnifiedItems, nowMs]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const cutoffMs =
      timeRange === "day"
        ? nowMs - 24 * 60 * 60 * 1000
        : timeRange === "week"
        ? nowMs - 7 * 24 * 60 * 60 * 1000
        : null;

    const list = allUnifiedItems.filter((item) => {
      if (cutoffMs !== null) {
        const ts = Date.parse(item.publishedAt);
        if (!Number.isFinite(ts) || ts < cutoffMs) return false;
      }
      if (selectedSourceId !== "all" && item.sourceId !== selectedSourceId) {
        return false;
      }
      if (selectedType !== "All" && item.type !== selectedType) return false;
      if (
        selectedCategory !== "All Categories" &&
        item.category !== selectedCategory
      ) {
        return false;
      }
      if (selectedBrandSlug !== "all" && item.brandSlug !== selectedBrandSlug) {
        return false;
      }
      if (q) {
        const tags =
          item.editorialArticle?.tags || item.wireItem?.tags || [];
        const haystack = [
          item.title,
          item.brand,
          item.category,
          item.sourceName,
          item.excerpt,
          ...tags,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "brand-asc") {
        const cmp = a.brand.localeCompare(b.brand);
        if (cmp !== 0) return cmp;
      }
      return b.publishedAt.localeCompare(a.publishedAt);
    });
  }, [
    allUnifiedItems,
    timeRange,
    nowMs,
    selectedSourceId,
    selectedType,
    selectedCategory,
    selectedBrandSlug,
    searchQuery,
    sortBy,
  ]);

  const lastTrackedSearchRef = useRef("");
  useEffect(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (trimmed.length < 2 || trimmed === lastTrackedSearchRef.current) return;
    const timer = setTimeout(() => {
      lastTrackedSearchRef.current = trimmed;
      trackFeedSearch({
        query: trimmed,
        surface: "home_feed",
        resultsCount: filteredItems.length,
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [searchQuery, filteredItems.length]);

  const resetFilters = () => {
    clearFilterQueryParams();
    setFeedMode("unified");
    setSearchQuery("");
    setSelectedType("All");
    setTimeRange("all");
    setSelectedCategory("All Categories");
    setSelectedBrandSlug("all");
    setSelectedSourceId("all");
    setSortBy("latest");
  };

  const availableLetters = useMemo(() => {
    const letters = Array.from(new Set(BRANDS.map((b) => b.letter))).sort();
    return ["ACTIVE", "ALL", ...letters];
  }, []);

  const visibleBrands = useMemo(() => {
    if (selectedLetter === "ACTIVE") {
      const counts = new Map<string, number>();
      for (const item of liveFeed.items || []) {
        counts.set(item.brandSlug, (counts.get(item.brandSlug) || 0) + 1);
      }
      return [...BRANDS]
        .sort(
          (a, b) =>
            (counts.get(b.slug) || 0) - (counts.get(a.slug) || 0) ||
            a.name.localeCompare(b.name)
        )
        .slice(0, 20);
    }
    if (selectedLetter === "ALL") return BRANDS;
    return BRANDS.filter((b) => b.letter === selectedLetter);
  }, [selectedLetter, liveFeed.items]);

  const brandDropdownOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of BRANDS) {
      map.set(b.slug, `${b.name} (${b.segment})`);
    }
    for (const item of liveFeed.items || []) {
      if (!map.has(item.brandSlug)) {
        map.set(item.brandSlug, item.brand);
      }
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [liveFeed.items]);

  const isViewingEditorialOnly =
    (feedMode === "editorial" || selectedSourceId === "brandbite-editorial") &&
    ARTICLES.length === 0;

  const leadEditorial = ARTICLES.find((a) => Boolean(a.image)) || ARTICLES[0] || null;
  const heroItemId = leadEditorial?.id || leadWireDispatch?.id || null;

  const isDefaultUnfilteredFeed =
    feedMode === "unified" &&
    selectedSourceId === "all" &&
    selectedType === "All" &&
    timeRange === "all" &&
    selectedCategory === "All Categories" &&
    selectedBrandSlug === "all" &&
    searchQuery.trim() === "";

  const displayItems = useMemo(() => {
    if (isDefaultUnfilteredFeed && heroItemId) {
      return filteredItems.filter((item) => item.id !== heroItemId);
    }
    return filteredItems;
  }, [filteredItems, isDefaultUnfilteredFeed, heroItemId]);

  const leadHasImage = Boolean(
    leadEditorial
      ? leadEditorial.image && !brokenImageIds.has(leadEditorial.id)
      : leadWireDispatch?.image && !brokenImageIds.has(leadWireDispatch.id)
  );

  const activeAdvancedFilterCount =
    (selectedCategory !== "All Categories" ? 1 : 0) +
    (selectedSourceId !== "all" ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Compact Latest Original / Lead Dispatch Spotlight (homepage only) */}
      {!liveOnly && (leadEditorial || leadWireDispatch) && (
        <section aria-labelledby="hero-section-label">
          {leadEditorial ? (
            <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-xs flex flex-col sm:flex-row items-stretch">
              {leadHasImage && leadEditorial.image && (
                <Link
                  href={`/reviews/${leadEditorial.slug}`}
                  className="sm:w-44 md:w-52 h-36 sm:h-auto shrink-0 overflow-hidden bg-[var(--bg-subtle)] block"
                >
                  <img
                    src={leadEditorial.image}
                    alt={leadEditorial.imageAlt}
                    width={480}
                    height={320}
                    fetchPriority="high"
                    onError={() => markImageBroken(leadEditorial.id)}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              )}
              <div className="p-4 sm:p-5 flex-1 min-w-0 flex flex-col justify-between gap-2.5">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                    <span
                      id="hero-section-label"
                      className="inline-flex items-center gap-1 text-[var(--accent-brand)] uppercase tracking-wider font-extrabold"
                    >
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      Latest Original
                    </span>
                    <span className="rounded bg-[#c2410c] px-2 py-0.5 text-white uppercase tracking-wider">
                      {leadEditorial.type}
                    </span>
                    <span className="text-[var(--text-secondary)] font-medium">
                      {leadEditorial.publishedDateFormatted}
                    </span>
                  </div>

                  <h1 className="text-lg sm:text-xl font-black text-[var(--text-primary)] leading-snug">
                    <Link
                      href={`/reviews/${leadEditorial.slug}`}
                      className="hover:text-[var(--accent-brand)] transition-colors"
                    >
                      {leadEditorial.title}
                    </Link>
                  </h1>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {leadEditorial.excerpt}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <Link
                    href={`/reviews/${leadEditorial.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#c2410c] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#9a3412] transition-colors"
                  >
                    Read Guide
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>

                  <Link
                    href="/reviews"
                    className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent-brand)] transition-colors"
                  >
                    All Originals ({ARTICLES.length}) →
                  </Link>
                </div>
              </div>
            </article>
          ) : leadWireDispatch ? (
            <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-xs flex flex-col sm:flex-row items-stretch">
              {leadHasImage && leadWireDispatch.image && (
                <a
                  href={leadWireDispatch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:w-44 md:w-52 h-36 sm:h-auto shrink-0 overflow-hidden bg-[var(--bg-subtle)] block"
                >
                  <img
                    src={leadWireDispatch.image}
                    alt={`${leadWireDispatch.brand} — ${leadWireDispatch.title}`}
                    width={480}
                    height={320}
                    fetchPriority="high"
                    onError={() => markImageBroken(leadWireDispatch.id)}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </a>
              )}
              <div className="p-4 sm:p-5 flex-1 min-w-0 flex flex-col justify-between gap-2.5">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                    <span
                      id="hero-section-label"
                      className="inline-flex items-center gap-1 text-emerald-600 uppercase tracking-wider font-extrabold"
                    >
                      <Radio className="w-3.5 h-3.5" aria-hidden="true" />
                      Latest on the Wire
                    </span>
                    <span
                      className="rounded px-2 py-0.5 text-white"
                      style={{ backgroundColor: leadWireDispatch.sourceBadgeColor }}
                    >
                      {leadWireDispatch.sourceName}
                    </span>
                    <span className="text-[var(--text-secondary)] font-medium">
                      {leadWireDispatch.publishedFormatted}
                    </span>
                  </div>

                  <h1 className="text-lg sm:text-xl font-black text-[var(--text-primary)] leading-snug">
                    <a
                      href={leadWireDispatch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[var(--accent-brand)] transition-colors"
                    >
                      {leadWireDispatch.title}
                    </a>
                  </h1>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {leadWireDispatch.excerpt}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <a
                    href={leadWireDispatch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#c2410c] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#9a3412] transition-colors"
                  >
                    Read at {leadWireDispatch.sourceName}
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          ) : null}
        </section>
      )}

      {/* Compact Social Follow CTA Strip & Specials On Now (homepage only) */}
      {!liveOnly && (
        <>
          <section
            aria-label="Follow BrandBite on social media"
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3.5 sm:px-5 sm:py-4 flex flex-wrap items-center justify-between gap-3 shadow-xs"
      >
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-[var(--text-primary)]">
            🎄 Save yourself 47 tabs of menu news
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Follow BrandBite for daily drive-thru drops, limited-time menus &amp; fun snack launches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SOCIAL_PROFILES.filter((p) => Boolean(p.url)).map((profile) => (
            <a
              key={profile.id}
              href={profile.url!}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackSocialClick(profile.id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted-card)] hover:bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] transition-colors"
            >
              <span>{profile.label}</span>
              <span className="hidden sm:inline text-[var(--text-secondary)] font-medium">
                {profile.handle}
              </span>
              <ExternalLink className="w-3 h-3 text-[var(--accent-brand)]" aria-hidden="true" />
            </a>
          ))}
          <a
            href="#weekly-bite"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] px-3 py-1.5 text-xs font-bold text-white transition-colors"
          >
            Weekly Newsletter
          </a>
        </div>
      </section>

          {/* Glanceable Weekly & Monthly Rotating Specials Strip */}
          <SpecialsOnNow compact />
        </>
      )}

      {/* Semantic <search> and Filtering Controls */}
      <section id="feed" aria-labelledby="feed-heading" className="scroll-mt-20 lg:scroll-mt-6 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div className="space-y-1">
            {liveOnly && (
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 inline-flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" aria-hidden="true" />
                Live Wire • Updated Continuously
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2.5">
              <CopyableTitle
                as={liveOnly ? "h1" : "h2"}
                id="feed-heading"
                href={liveOnly ? "/live" : "/#feed"}
                className={
                  liveOnly
                    ? "hero-headline font-black text-[var(--text-primary)]"
                    : "section-headline font-black text-[var(--text-primary)]"
                }
              >
                Live Fast Food &amp; Snack Feed
              </CopyableTitle>
              <a
                href="/live.xml"
                target="_blank"
                rel="noopener noreferrer"
                title="Open Live Wire RSS Feed"
                className="inline-flex items-center gap-1 rounded-full border border-[#ea580c]/40 bg-[#ea580c]/10 px-2.5 py-1 text-[11px] font-extrabold text-[#c2410c] hover:bg-[#ea580c]/20 transition-colors"
              >
                <Rss className="w-3 h-3" aria-hidden="true" />
                RSS
              </a>
              {liveOnly && (
                <button
                  type="button"
                  onClick={async () => {
                    const rssUrl = `${window.location.origin}/live.xml`;
                    try {
                      await navigator.clipboard.writeText(rssUrl);
                    } catch {
                      // Ignore clipboard errors
                    }
                    showCopyToast("RSS feed URL copied!");
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--border-strong)] bg-[var(--bg-muted-card)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Copy RSS Link
                </button>
              )}
              {!liveOnly && (
                <Link
                  href="/live"
                  className="text-xs font-bold text-[var(--accent-brand)] hover:underline inline-flex items-center gap-1"
                >
                  Full Live Page →
                </Link>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {liveFeed.items.length} real-time dispatches across hundreds of chains &amp; snack makers — updated live.
            </p>
          </div>

          {/* Feed Mode & Density Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-1"
              role="group"
              aria-label="Feed display mode"
            >
              <button
                type="button"
                aria-pressed={feedMode !== "editorial"}
                onClick={() => {
                  clearFilterQueryParams();
                  setFeedMode("unified");
                  setSelectedType("All");
                  if (selectedSourceId === "brandbite-editorial") {
                    setSelectedSourceId("all");
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  feedMode !== "editorial"
                    ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Live Wire ({liveFeed.items.length})
              </button>
              <button
                type="button"
                aria-pressed={feedMode === "editorial"}
                onClick={() => {
                  clearFilterQueryParams();
                  setFeedMode("editorial");
                  setSelectedType("All");
                  setSelectedSourceId("all");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                  feedMode === "editorial"
                    ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Originals
                <span className="rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] px-1.5 py-0.5 text-[10px] uppercase font-extrabold">
                  {ARTICLES.length > 0 ? ARTICLES.length : "Soon"}
                </span>
              </button>
            </div>

            <div
              className="inline-flex rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-1"
              role="group"
              aria-label="Card or concise view layout"
            >
              <button
                type="button"
                aria-pressed={viewDensity === "card"}
                onClick={() => setViewDensity("card")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 ${
                  viewDensity === "card"
                    ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
                Card
              </button>
              <button
                type="button"
                aria-pressed={viewDensity === "concise"}
                onClick={() => setViewDensity("concise")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 ${
                  viewDensity === "concise"
                    ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <List className="w-3.5 h-3.5" aria-hidden="true" />
                Concise
              </button>
            </div>
          </div>
        </div>

        <search className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3"
          >
            {/* Keyword Search + Mobile Filters Toggle on a single compact row */}
            <div className="md:col-span-5 flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <label htmlFor="feed-search" className="sr-only">
                  Search fast food news, brands, or flavors
                </label>
                <Search
                  className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="feed-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search menu drops, chains, snacks..."
                  className="theme-input w-full rounded-xl border pl-9 pr-8 py-2 sm:py-2.5 text-sm focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search query"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <button
                type="button"
                aria-expanded={mobileFiltersOpen}
                onClick={() => setMobileFiltersOpen((prev) => !prev)}
                className="md:hidden inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted-card)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] shrink-0 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent-brand)]" aria-hidden="true" />
                Filters
                {(() => {
                  const activeCount = [
                    selectedBrandSlug !== "all",
                    selectedType !== "All",
                    timeRange !== "all",
                    selectedCategory !== "All Categories",
                    selectedSourceId !== "all",
                    sortBy !== "latest",
                  ].filter(Boolean).length;
                  return activeCount > 0 ? (
                    <span className="rounded-full bg-[var(--accent-brand)] text-white px-1.5 py-0.5 text-[10px] leading-none">
                      {activeCount}
                    </span>
                  ) : null;
                })()}
              </button>
            </div>

            {/* Brand Selector (collapsible on mobile, always visible on md+) */}
            <div className={`${mobileFiltersOpen ? "block" : "hidden"} md:block md:col-span-4`}>
              <label htmlFor="brand-filter" className="sr-only">
                Filter by Brand or Chain
              </label>
              <select
                id="brand-filter"
                value={selectedBrandSlug}
                onChange={(e) => {
                  const val = e.target.value;
                  clearFilterQueryParams();
                  setSelectedBrandSlug(val);
                  trackBrandFilter(val);
                }}
                className="theme-input w-full rounded-xl border px-3.5 py-2 sm:py-2.5 text-sm font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Brands &amp; Chains</option>
                {brandDropdownOptions.map(([slug, label]) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector (collapsible on mobile, always visible on md+) */}
            <div className={`${mobileFiltersOpen ? "block" : "hidden"} md:block md:col-span-3`}>
              <label htmlFor="sort-filter" className="sr-only">
                Sort dispatches
              </label>
              <div className="relative">
                <SlidersHorizontal
                  className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <select
                  id="sort-filter"
                  value={sortBy}
                  onChange={(e) => {
                    const val = e.target.value as "latest" | "brand-asc";
                    setSortBy(val);
                    trackFeedFilterSelect({ filterKind: "sort", filterValue: val });
                  }}
                  className="theme-input w-full rounded-xl border pl-10 pr-3.5 py-2 sm:py-2.5 text-sm font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="latest">Sort: Newest Dispatches First</option>
                  <option value="brand-asc">Sort: Brand Name (A–Z)</option>
                  <option value="rating-desc" disabled>
                    Sort: Review Score (Coming Soon)
                  </option>
                </select>
              </div>
            </div>
          </form>

          {/* Post Type Tabs & Recency (collapsible on mobile, always visible on md+) */}
          <div
            className={`${
              mobileFiltersOpen ? "flex" : "hidden"
            } md:flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]`}
          >
            <div className="tag-list" role="group" aria-label="Filter by post type">
              {ARTICLE_TYPES.map((type) => {
                const isActive = selectedType === type;
                const count =
                  type === "All"
                    ? allUnifiedItems.length
                    : allUnifiedItems.filter((a) => a.type === type).length;
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      clearFilterQueryParams();
                      setSelectedType(type);
                      trackFeedFilterSelect({ filterKind: "type", filterValue: type });
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] shadow-xs"
                        : "bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:opacity-85"
                    }`}
                  >
                    {type === "All" ? "All Dispatches" : type === "News" ? "News" : `${type}s`}{" "}
                    <span className="opacity-75 font-normal">({count})</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Compact Time Range Filter: All Time / Last Week / Last Day */}
              <div
                className="inline-flex items-center rounded-lg border border-[var(--border-strong)] bg-[var(--bg-muted-card)] p-0.5"
                role="group"
                aria-label="Filter by recency"
              >
                {(
                  [
                    { id: "all", label: "All Time", count: timeRangeCounts.all },
                    { id: "week", label: "Last Week", count: timeRangeCounts.week },
                    { id: "day", label: "Last Day", count: timeRangeCounts.day },
                  ] as const
                ).map((opt) => {
                  const isActive = timeRange === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setTimeRange(opt.id);
                        trackFeedFilterSelect({
                          filterKind: "time_range",
                          filterValue: opt.id,
                        });
                      }}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[var(--accent-brand)] text-white shadow-xs"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {opt.label}{" "}
                      <span className="opacity-75 font-normal">({opt.count})</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                aria-expanded={showMoreFilters}
                onClick={() => setShowMoreFilters((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  showMoreFilters || activeAdvancedFilterCount > 0
                    ? "border-[var(--accent-brand)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                    : "border-[var(--border-strong)] bg-[var(--bg-muted-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  Categories &amp; Sources
                  {activeAdvancedFilterCount > 0 ? ` (${activeAdvancedFilterCount})` : ""}
                </span>
                {showMoreFilters ? (
                  <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>

              {(feedMode === "editorial" ||
                selectedType !== "All" ||
                timeRange !== "all" ||
                selectedCategory !== "All Categories" ||
                selectedBrandSlug !== "all" ||
                selectedSourceId !== "all" ||
                searchQuery.trim() !== "") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-bold text-[var(--accent-brand)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  Reset ({filteredItems.length})
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Advanced Filters: Categories & Live Feed Sources */}
          {showMoreFilters && (
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                  Food Categories
                </p>
                <div className="tag-list" role="group" aria-label="Filter by food category">
                  {CATEGORIES.map((category) => {
                    const isActive = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => {
                          setSelectedCategory(category);
                          trackFeedFilterSelect({ filterKind: "category", filterValue: category });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isActive
                            ? "bg-[#c2410c] text-white"
                            : "bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                  Live Sources ({liveFeed.sources.length} feeds)
                </p>
                <div className="tag-list" role="group" aria-label="Filter by syndicated feed source">
                  <button
                    type="button"
                    aria-pressed={selectedSourceId === "all" && feedMode !== "editorial"}
                    onClick={() => {
                      setFeedMode("unified");
                      setSelectedSourceId("all");
                      trackFeedFilterSelect({ filterKind: "source", filterValue: "all" });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedSourceId === "all" && feedMode !== "editorial"
                        ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)]"
                        : "bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:opacity-85"
                    }`}
                  >
                    All Sources ({liveFeed.items.length})
                  </button>

                  {liveFeed.sources
                    .filter((src) => src.count > 0)
                    .map((src) => {
                      const isSelected = selectedSourceId === src.id && feedMode !== "editorial";
                      return (
                        <button
                          key={src.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            const nextVal = isSelected ? "all" : src.id;
                            setFeedMode("unified");
                            setSelectedSourceId(nextVal);
                            trackFeedFilterSelect({ filterKind: "source", filterValue: nextVal });
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#c2410c] text-white"
                              : "bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              src.status === "ok" ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            aria-hidden="true"
                          />
                          <span>{src.name}</span>
                          <span className="opacity-75">({src.count})</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </search>

        {/* Responsive Subgrid Card Feed or Coming Soon State */}
        {isViewingEditorialOnly ? (
          <div className="rounded-2xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] p-10 sm:p-14 text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-strong)] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-brand)]">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              Coming Soon
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Original BrandBite Reviews Are Coming Soon
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              We never publish fabricated taste tests or fake ratings. Check back soon for our first hands-on fast-food, diner, and snack reviews — or browse {liveFeed.items.length} real dispatches on the Live Wire right now.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-xl bg-[#c2410c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#9a3412] transition-colors cursor-pointer"
              >
                Browse {liveFeed.items.length} Live Wire Dispatches
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center space-y-3">
            <p className="text-lg font-bold text-[var(--text-primary)]">
              No matching fast-food posts or snack dispatches found.
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Try clearing one of your active source, brand, category, or search filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#c2410c] px-4 py-2 text-sm font-bold text-white hover:bg-[#9a3412] cursor-pointer"
            >
              Show All Dispatches
            </button>
          </div>
        ) : viewDensity === "concise" ? (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] divide-y divide-[var(--border-subtle)] overflow-hidden shadow-xs">
            {displayItems.map((item) => {
              const isOriginal = Boolean(item.editorialArticle);
              const recency = formatRelativeRecency(
                item.publishedAt,
                nowMs,
                item.publishedFormatted
              );
              return (
                <article
                  key={item.id}
                  className="px-3.5 sm:px-4 py-3 hover:bg-[var(--bg-muted-card)] transition-colors flex items-center justify-between gap-2.5 sm:gap-3"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <BrandLogo
                      slug={item.brandSlug}
                      name={item.brand}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-0.5">
                        <span className="px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] bg-[var(--bg-subtle)] text-[var(--accent-brand)]">
                          {item.type}
                        </span>
                        <span className="font-bold text-[var(--text-primary)] truncate">
                          {item.brand}
                        </span>
                        <span className="text-[var(--text-secondary)]">•</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: item.sourceBadgeColor }}
                        >
                          {item.sourceName}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug truncate">
                        {isOriginal && item.editorialArticle ? (
                          <Link
                            href={`/reviews/${item.editorialArticle.slug}`}
                            className="hover:text-[var(--accent-brand)] transition-colors"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <a
                            href={item.wireItem?.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--accent-brand)] transition-colors"
                          >
                            {item.title}
                          </a>
                        )}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 text-[11px] sm:text-xs text-[var(--text-secondary)]">
                    <time
                      dateTime={item.publishedAt}
                      title={item.publishedFormatted}
                      className={`font-semibold whitespace-nowrap ${
                        recency.isRecent
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      <span className="sm:hidden">{recency.short}</span>
                      <span className="hidden sm:inline">{recency.full}</span>
                    </time>
                    {isOriginal && item.editorialArticle ? (
                      <Link
                        href={`/reviews/${item.editorialArticle.slug}`}
                        aria-label={`Read ${item.title}`}
                        className="text-[var(--accent-brand)] hover:opacity-80"
                      >
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    ) : (
                      <a
                        href={item.wireItem?.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${item.title} at ${item.sourceName}`}
                        className="text-[var(--text-secondary)] hover:text-[var(--accent-brand)]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="card-grid">
            {displayItems.map((item, idx) => {
              const hasValidImage = Boolean(item.image && !brokenImageIds.has(item.id));

              return (
                <React.Fragment key={item.id}>
                  <article
                    className={`card ${hasValidImage ? "has-image" : ""}`}
                  >
                  {/* Region 1: Media (article photo when available; crisp BrandLogo banner fallback so Subgrid never leaves a blank void) */}
                  {hasValidImage && item.image ? (
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      width={800}
                      height={500}
                      loading="lazy"
                      onError={() => markImageBroken(item.id)}
                    />
                  ) : (
                    <BrandCardBanner
                      brandSlug={item.brandSlug}
                      brandName={item.brand}
                      category={item.category}
                    />
                  )}

                  {/* Region 2: Header (direct <header> child with primary .card-link inside heading) */}
                  <header className="px-5 pt-4 pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[11px] bg-[var(--bg-subtle)] text-[var(--accent-brand)] border border-[var(--border-strong)]">
                          {item.sightingItem
                            ? item.sightingItem.sightingType
                            : item.editorialArticle?.review
                            ? `${item.editorialArticle.review.rating.toFixed(1)}/10 • ${item.editorialArticle.review.verdict}`
                            : item.type}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-md font-bold text-[11px] text-white"
                          style={{ backgroundColor: item.sourceBadgeColor }}
                        >
                          {item.sourceName}
                        </span>
                      </div>
                      <time
                        dateTime={item.publishedAt}
                        className="text-[var(--text-secondary)] font-medium"
                      >
                        {item.publishedFormatted}
                      </time>
                    </div>

                    <h3 className="text-lg font-extrabold text-[var(--text-primary)] leading-snug">
                      {item.kind === "sighting" ? (
                        <span>{item.title}</span>
                      ) : item.isExternal ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            trackOutboundDispatch({
                              title: item.title,
                              brand: item.brand,
                              sourceName: item.sourceName,
                              url: item.href,
                            })
                          }
                          className="card-link hover:text-[var(--accent-brand)] transition-colors"
                        >
                          {item.title}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="card-link hover:text-[var(--accent-brand)] transition-colors"
                        >
                          {item.title}
                        </Link>
                      )}
                    </h3>
                  </header>

                  {/* Region 3: Content (single <div> grouping excerpt + category badge) */}
                  <div className="px-5 py-2 flex flex-col justify-between gap-3">
                    <p className="snippet text-sm text-[var(--text-secondary)] leading-relaxed">
                      {item.excerpt}
                    </p>

                    <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-3 flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Flame
                          className="w-3.5 h-3.5 text-[var(--accent-brand)]"
                          aria-hidden="true"
                        />
                        {item.category}
                      </span>
                      {item.sightingItem ? (
                        <span className="inline-flex items-center gap-2 font-semibold truncate max-w-[170px]">
                          {item.sightingItem.price && (
                            <span className="text-[var(--text-primary)] font-bold">
                              {item.sightingItem.price}
                            </span>
                          )}
                          {item.sightingItem.location ? (
                            <span className="inline-flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                              {item.sightingItem.location}
                            </span>
                          ) : (
                            <span>{item.sightingItem.sightingType}</span>
                          )}
                        </span>
                      ) : (
                        <span className="truncate max-w-[140px]">
                          Live Wire Dispatch
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Region 4: Footer (direct <footer> child with elevated independent controls) */}
                  <footer className="px-5 py-3.5 mt-2 border-t border-[var(--border-subtle)] bg-[var(--bg-muted-card)] flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        trackBrandFilter(item.brandSlug);
                        setSelectedBrandSlug(item.brandSlug);
                      }}
                      className="font-bold text-[var(--text-primary)] bg-[var(--bg-subtle)] hover:opacity-85 px-2.5 py-1 rounded-md transition-opacity cursor-pointer"
                    >
                      {item.brand}
                    </button>

                    {item.sightingItem ? (
                      <span className="font-semibold text-[var(--text-secondary)] inline-flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                        Spotted by {item.sightingItem.spottedBy}
                      </span>
                    ) : item.kind === "editorial" ? (
                      <Link
                        href={item.href}
                        className="font-bold text-[var(--accent-brand)] hover:underline inline-flex items-center gap-1"
                      >
                        Read Verdict
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackOutboundDispatch({
                            title: item.title,
                            brand: item.brand,
                            sourceName: item.sourceName,
                            url: item.href,
                          })
                        }
                        className="font-bold text-[var(--accent-brand)] hover:underline inline-flex items-center gap-1"
                      >
                        Read Source
                        <span className="sr-only"> for {item.title}</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </footer>
                </article>
                {idx === 4 && <SponsoredFeedCard slotId="home_feed_pos_6" />}
              </React.Fragment>
              );
            })}
            {filteredItems.length > 0 && filteredItems.length <= 4 && (
              <SponsoredFeedCard slotId="home_feed_pos_6" />
            )}
          </div>
        )}
      </section>

      {/* A–Z Brand Directory Preview & FAQ (homepage only) */}
      {!liveOnly && (
        <>
          <section
            id="brands-directory"
        aria-labelledby="brands-directory-heading"
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--accent-brand)] flex items-center gap-1.5">
              <Building2 className="w-4 h-4" aria-hidden="true" />
              Index of Chains &amp; Snack Makers
            </span>
            <h2
              id="brands-directory-heading"
              className="section-headline font-black text-[var(--text-primary)] mt-1"
            >
              A–Z Brand &amp; Chain Directory
            </h2>
          </div>
          <Link
            href="/brands"
            className="text-sm font-bold text-[var(--accent-brand)] hover:underline inline-flex items-center gap-1"
          >
            Open Full Directory Page
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Alphabet Filter Strip */}
        <div className="tag-list" role="group" aria-label="Filter brands by first letter">
          {availableLetters.map((letter) => {
            const active = selectedLetter === letter;
            return (
              <button
                key={letter}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedLetter(letter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                  active
                    ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)]"
                    : "bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:opacity-85"
                }`}
              >
                {letter === "ACTIVE"
                  ? "Most Active (20)"
                  : letter === "ALL"
                  ? "All Brands"
                  : letter}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {visibleBrands.map((brand) => {
            const count = (liveFeed.items || []).filter(
              (a) => a.brandSlug === brand.slug
            ).length;
            const isSelected = selectedBrandSlug === brand.slug;
            return (
              <div
                key={brand.slug}
                className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-colors ${
                  isSelected
                    ? "border-[var(--accent-brand)] bg-[var(--bg-subtle)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-muted-card)] hover:border-[var(--border-strong)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {brand.segment}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                      {count} live {count === 1 ? "post" : "posts"}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[var(--text-primary)] mt-1">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                    {brand.signatureItem}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => {
                      trackBrandFilter(brand.slug);
                      setFeedMode("unified");
                      setSelectedBrandSlug(brand.slug);
                      document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-xs font-bold text-[var(--accent-brand)] hover:underline cursor-pointer"
                  >
                    {count > 0 ? `Filter ${brand.name} (${count})` : `Check ${brand.name}`}
                  </button>
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    Brand Page →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Native <details name="editorial-faq"> Exclusive Accordion Section */}
      <section
        aria-labelledby="faq-heading"
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8"
      >
        <h2 id="faq-heading" className="text-xl font-black text-[var(--text-primary)] mb-2">
          About BrandBite&apos;s Live Wire, Specials &amp; Upcoming Reviews
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Every card in the feed links directly to real reporting and brand menus, updated live alongside BrandBite Originals and reader comments.
        </p>

        <div className="divide-y divide-[var(--border-subtle)]">
          <details name="editorial-faq" className="faq-item" open>
            <summary>Which live sources power the BrandBite Wire?</summary>
            <p className="text-sm leading-relaxed">
              Our feed synthesizer pulls concurrently from {liveFeed.sources.length} active feeds covering hundreds of U.S. chains, cult grocers, and snack makers: <strong>Brand Eating</strong>, <strong>The Impulsive Buy</strong>, <strong>Sporked</strong>, <strong>QSR Magazine</strong>, <strong>Mashed</strong>, <strong>NOSH</strong>, <strong>Tasting Table</strong>, <strong>Nation&apos;s Restaurant News</strong>, <strong>Food Dive</strong>, plus category chain, bakery, and grocery wires.
            </p>
          </details>
          <details name="editorial-faq" className="faq-item">
            <summary>How do reader comments &amp; reactions work?</summary>
            <p className="text-sm leading-relaxed">
              Tap <strong>I Tried It</strong> or <strong>Want to Try</strong> on any rotating drop on <strong>Specials On Now</strong>, or sign in with Google to leave a comment directly on BrandBite articles, weekly specials, and brand hub pages. Comments pass through automated AI spam &amp; safety checks before posting live.
            </p>
          </details>
          <details name="editorial-faq" className="faq-item">
            <summary>When are original BrandBite reviews launching?</summary>
            <p className="text-sm leading-relaxed">
              Original first-hand taste tests, 10-point verdict scores, real table photos, and retail prices paid are <strong>coming soon</strong> — zero calorie counting and zero placeholder or AI-generated food reviews.
            </p>
          </details>
          <details name="editorial-faq" className="faq-item">
            <summary>How fresh is the live feed?</summary>
            <p className="text-sm leading-relaxed">
              Our feed continuously monitors fast-food newsrooms, snack desks, and rotating bakery menus, deduplicating and categorizing new menu drops, deals, and grocery finds live throughout the day.
            </p>
          </details>
        </div>
      </section>
        </>
      )}
    </div>
  );
}
