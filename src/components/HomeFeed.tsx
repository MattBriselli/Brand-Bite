"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
} from "lucide-react";
import {
  trackOutboundDispatch,
  trackBrandFilter,
  trackFeedSearch,
  trackFeedFilterSelect,
} from "@/lib/analytics";
import { WeeklyBiteSignup } from "@/components/WeeklyBiteSignup";
import { SponsoredFeedCard } from "@/components/SponsoredFeedCard";
import {
  fetchSightings,
  openSightingModal,
  SIGHTING_CREATED_EVENT,
  type CommunitySighting,
} from "@/lib/sightings";

type FeedMode = "unified" | "wire" | "editorial";

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

export function HomeFeed() {
  const searchParams = useSearchParams();
  const liveFeed = INITIAL_LIVE_FEED;

  const [communitySightings, setCommunitySightings] = useState<CommunitySighting[]>([]);
  const [feedMode, setFeedMode] = useState<FeedMode>("unified");
  const [selectedSourceId, setSelectedSourceId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"All" | ArticleType>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "brand-asc">("latest");
  const [selectedLetter, setSelectedLetter] = useState<string>("ACTIVE");
  const [brokenImageIds, setBrokenImageIds] = useState<Set<string>>(() => new Set());
  const hasHydratedFiltersRef = useRef(false);
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
          selectedCategory: string;
          selectedBrandSlug: string;
          sortBy: "latest" | "brand-asc";
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
        if (typeof saved.selectedLetter === "string" && saved.selectedLetter) {
          setSelectedLetter(saved.selectedLetter);
        }
      }
    } catch {
      // Ignore storage read/parse errors
    } finally {
      hasHydratedFiltersRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist sticky feed filters & radio selections whenever they change
  useEffect(() => {
    if (!hasHydratedFiltersRef.current) return;
    try {
      localStorage.setItem(
        HOME_FILTERS_STORAGE_KEY,
        JSON.stringify({
          feedMode,
          selectedSourceId,
          searchQuery,
          selectedType,
          selectedCategory,
          selectedBrandSlug,
          sortBy,
          selectedLetter,
        })
      );
    } catch {
      // Ignore storage write errors
    }
  }, [
    feedMode,
    selectedSourceId,
    searchQuery,
    selectedType,
    selectedCategory,
    selectedBrandSlug,
    sortBy,
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
    return () => {
      active = false;
      window.removeEventListener(SIGHTING_CREATED_EVENT, onCreated);
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
      setSelectedType(typeParam);
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

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = allUnifiedItems.filter((item) => {
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
    setFeedMode("unified");
    setSearchQuery("");
    setSelectedType("All");
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

  const leadHasImage = Boolean(
    leadWireDispatch?.image && !brokenImageIds.has(leadWireDispatch.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero / Lead Live Wire Dispatch */}
      {leadWireDispatch && (
        <section aria-labelledby="hero-section-label">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <p
              id="hero-section-label"
              className="text-xs font-extrabold uppercase tracking-widest text-[var(--accent-brand)] flex items-center gap-1.5"
            >
              <Radio className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              Latest Live Wire Dispatch
            </p>
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Auto-Synced Every 6 Hours • Real Fast-Food &amp; Snack Coverage
            </span>
          </div>

          <div className="featured-card-container">
            <article
              className={`featured-card shadow-sm ${leadHasImage ? "has-image" : ""}`}
            >
              {leadHasImage && leadWireDispatch.image && (
                <img
                  src={leadWireDispatch.image}
                  alt={`${leadWireDispatch.brand} — ${leadWireDispatch.title}`}
                  width={800}
                  height={500}
                  fetchPriority="high"
                  onError={() => markImageBroken(leadWireDispatch.id)}
                />
              )}
              <header className="p-6 sm:p-8 pb-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold mb-3">
                  <span className="rounded-md bg-[#c2410c] px-2.5 py-1 text-white uppercase tracking-wider">
                    {leadWireDispatch.type}
                  </span>
                  <span
                    className="rounded-md px-2.5 py-1 text-white"
                    style={{ backgroundColor: leadWireDispatch.sourceBadgeColor }}
                  >
                    {leadWireDispatch.sourceName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedMode("unified");
                      setSelectedBrandSlug(leadWireDispatch.brandSlug);
                      document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="rounded-md bg-[var(--bg-subtle)] px-2.5 py-1 text-[var(--text-primary)] hover:opacity-85 transition-opacity cursor-pointer"
                  >
                    {leadWireDispatch.brand}
                  </button>
                  <span className="text-[var(--text-secondary)] font-medium">
                    {leadWireDispatch.publishedFormatted}
                  </span>
                </div>

                <h1 className="hero-headline font-black text-[var(--text-primary)]">
                  <a
                    href={leadWireDispatch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--accent-brand)] transition-colors"
                  >
                    {leadWireDispatch.title}
                  </a>
                </h1>
              </header>

              <div className="featured-card-content px-6 sm:px-8 py-2 space-y-4">
                <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                  {leadWireDispatch.excerpt}
                </p>
              </div>

              <footer className="px-6 sm:px-8 pt-3 pb-6 sm:pb-8 flex flex-wrap items-center justify-between gap-3">
                <a
                  href={leadWireDispatch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#c2410c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#9a3412] transition-colors"
                >
                  Read Full Story at {leadWireDispatch.sourceName}
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>

                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  Category: <strong className="text-[var(--text-primary)]">{leadWireDispatch.category}</strong>
                </span>
              </footer>
            </article>
          </div>
        </section>
      )}

      {/* The Weekly Bite Newsletter Signup Banner */}
      <WeeklyBiteSignup placement="home_banner" />

      {/* Original Human Angle / Taste Tests — Coming Soon Section */}
      <section aria-labelledby="coming-soon-reviews-heading" className="featured-card-container">
        <article className="featured-card border-dashed border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 sm:p-7 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-strong)] px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-brand)]">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                Coming Soon • In-House Editorial
              </span>
              <h2
                id="coming-soon-reviews-heading"
                className="text-xl sm:text-2xl font-black text-[var(--text-primary)]"
              >
                Original BrandBite Taste Tests &amp; Craveability Verdicts
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Right now you&apos;re browsing 100% live fast-food and packaged-snack dispatches from across the industry. First-hand human reviews — never fabricated, zero calorie counting — are on the way.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setFeedMode("editorial");
                document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted-card)] hover:bg-[var(--bg-subtle)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Preview Reviews Slot →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                <Camera className="w-4 h-4 text-[var(--accent-brand)]" aria-hidden="true" />
                Real Photos &amp; Receipts
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Unedited photos of what actually comes out of the drive-thru bag, diner booth, or snack box, plus exact retail price paid.
              </p>
            </div>

            <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                <Star className="w-4 h-4 text-[var(--accent-brand)]" aria-hidden="true" />
                Honest 10-Point Verdicts
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Personal taste-test notes, texture &amp; flavor highlights, and Must Buy / Skip It calls — written only after eating the item.
              </p>
            </div>

            <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                <ThumbsUp className="w-4 h-4 text-[var(--accent-brand)]" aria-hidden="true" />
                Worth the Trip?
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Pure craveability: whether it lives up to the promo poster, justifies the price tag, and earns a repeat order.
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Synthesized Multi-Source Wire Status Banner */}
      <section
        aria-labelledby="wire-banner-heading"
        className="rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5" aria-hidden="true" />
                Live Feed Synthesizer
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                Last synced:{" "}
                {liveFeed.lastSyncedAt
                  ? new Date(liveFeed.lastSyncedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "Never"}
              </span>
            </div>
            <h2 id="wire-banner-heading" className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
              Tracking {liveFeed.items.length} Live Dispatches Across Active Fast-Food &amp; Snack Feeds
            </h2>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] px-3.5 py-2 text-xs font-bold text-[var(--text-secondary)]">
            <Clock className="w-3.5 h-3.5 text-[var(--accent-brand)]" aria-hidden="true" />
            Refreshed automatically every 6h via GitHub
          </span>
        </div>

        {/* Clickable Feed Source Pills */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
          <div className="tag-list" role="group" aria-label="Filter by syndicated feed source">
            <button
              type="button"
              aria-pressed={selectedSourceId === "all" && feedMode !== "editorial"}
              onClick={() => {
                setFeedMode("unified");
                setSelectedSourceId("all");
                trackFeedFilterSelect({ filterKind: "source", filterValue: "all" });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedSourceId === "all" && feedMode !== "editorial"
                  ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)]"
                  : "bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:opacity-85"
              }`}
            >
              All Live Sources ({liveFeed.items.length})
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#c2410c] text-white"
                        : "bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        src.status === "ok" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{src.name}</span>
                    <span className="opacity-75 font-normal">({src.count})</span>
                  </button>
                );
              })}

            <button
              type="button"
              aria-pressed={selectedSourceId === "community-sightings" && feedMode !== "editorial"}
              onClick={() => {
                const nextVal =
                  selectedSourceId === "community-sightings" ? "all" : "community-sightings";
                setFeedMode("unified");
                setSelectedSourceId(nextVal);
                trackFeedFilterSelect({ filterKind: "source", filterValue: nextVal });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedSourceId === "community-sightings" && feedMode !== "editorial"
                  ? "bg-[#0f766e] text-white"
                  : "bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-teal-500" aria-hidden="true" />
              <span>Reader Sightings</span>
              <span className="opacity-75 font-normal">({communitySightings.length})</span>
            </button>

            <button
              type="button"
              aria-pressed={feedMode === "editorial" || selectedSourceId === "brandbite-editorial"}
              onClick={() => {
                setFeedMode("editorial");
                setSelectedSourceId("brandbite-editorial");
                trackFeedFilterSelect({ filterKind: "mode", filterValue: "editorial" });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                feedMode === "editorial" || selectedSourceId === "brandbite-editorial"
                  ? "bg-[#c2410c] text-white"
                  : "bg-[var(--bg-muted-card)] border border-dashed border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>BrandBite Reviews (Coming Soon)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Semantic <search> and Filtering Controls */}
      <section id="feed" aria-labelledby="feed-heading" className="scroll-mt-6 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 id="feed-heading" className="section-headline font-black text-[var(--text-primary)]">
              Live Fast Food &amp; Snack Feed
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Real-time dispatches across {BRANDS.length} chains &amp; snack makers — tracking limited-time menu drops, seasonal deals, and grocery finds every 6 hours.
            </p>
          </div>

          {/* Feed Mode Switcher */}
          <div
            className="inline-flex rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-1"
            role="group"
            aria-label="Feed display mode"
          >
            <button
              type="button"
              aria-pressed={feedMode !== "editorial"}
              onClick={() => {
                setFeedMode("unified");
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
                setFeedMode("editorial");
                setSelectedSourceId("all");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                feedMode === "editorial"
                  ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Our Reviews
              <span className="rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] px-1.5 py-0.5 text-[10px] uppercase font-extrabold">
                Soon
              </span>
            </button>
          </div>
        </div>

        <search className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs space-y-5">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="grid grid-cols-1 md:grid-cols-12 gap-3"
          >
            {/* Keyword Search */}
            <div className="md:col-span-5 relative">
              <label htmlFor="feed-search" className="sr-only">
                Search fast food news, snack sightings, brands, or flavors
              </label>
              <Search
                className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="feed-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu drops, chains, snacks, or flavors..."
                className="theme-input w-full rounded-xl border pl-10 pr-9 py-2.5 text-sm focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Brand Selector */}
            <div className="md:col-span-4">
              <label htmlFor="brand-filter" className="sr-only">
                Filter by Brand or Chain
              </label>
              <select
                id="brand-filter"
                value={selectedBrandSlug}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedBrandSlug(val);
                  trackBrandFilter(val);
                }}
                className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Brands &amp; Chains</option>
                {brandDropdownOptions.map(([slug, label]) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-3">
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
                  className="theme-input w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm font-semibold focus:outline-none cursor-pointer"
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

          {/* Post Type Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[var(--border-subtle)]">
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

            {(feedMode === "editorial" ||
              selectedType !== "All" ||
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
                Reset Active Filters ({filteredItems.length} shown)
              </button>
            )}
          </div>

          {/* Category Pills using flex-wrap: balance */}
          <div className="tag-list pt-1" role="group" aria-label="Filter by food category">
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
        ) : filteredItems.length === 0 && selectedSourceId === "community-sightings" ? (
          <div className="rounded-2xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] p-10 sm:p-14 text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-600">
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              Live Community Tip Line
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Be the First to Share a Menu or Snack Sighting
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              Spotted a regional test item, drive-thru menu board promo, or limited-edition store shelf snack? Submit it now — every entry is sanitized automatically and goes straight onto the live wire.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  openSightingModal(
                    selectedBrandSlug !== "all" ? { brandSlug: selectedBrandSlug } : undefined
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#c2410c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#9a3412] transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                Submit a Sighting Live
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted-card)] px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                Browse All Dispatches
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
        ) : (
          <div className="card-grid">
            {filteredItems.map((item, idx) => {
              const hasValidImage = Boolean(item.image && !brokenImageIds.has(item.id));

              return (
                <React.Fragment key={item.id}>
                  <article
                    className={`card ${hasValidImage ? "has-image" : ""}`}
                  >
                  {/* Region 1: Media (direct <img> child when available; omitted cleanly when absent) */}
                  {hasValidImage && item.image && (
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      width={800}
                      height={500}
                      loading="lazy"
                      onError={() => markImageBroken(item.id)}
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

      {/* A–Z Brand Directory Preview Section */}
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
                  ? `All (${BRANDS.length})`
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
          About BrandBite&apos;s Live Wire, Reader Sightings &amp; Upcoming Reviews
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Every card in the feed links directly to real external reporting or sanitized reader sightings, refreshed automatically in the cloud.
        </p>

        <div className="divide-y divide-[var(--border-subtle)]">
          <details name="editorial-faq" className="faq-item" open>
            <summary>Which live sources power the BrandBite Wire?</summary>
            <p className="text-sm leading-relaxed">
              Our feed synthesizer pulls concurrently from {liveFeed.sources.length} active feeds covering {BRANDS.length} U.S. chains, cult grocers, and snack makers: <strong>Brand Eating</strong>, <strong>The Impulsive Buy</strong>, <strong>Sporked</strong>, <strong>QSR Magazine</strong>, <strong>Mashed</strong>, <strong>NOSH</strong>, <strong>Tasting Table</strong>, <strong>Nation&apos;s Restaurant News</strong>, <strong>Food Dive</strong>, plus 7 category chain &amp; grocery wires.
            </p>
          </details>
          <details name="editorial-faq" className="faq-item">
            <summary>How do Community Sightings work?</summary>
            <p className="text-sm leading-relaxed">
              Click <strong>Submit a Sighting</strong> in the header or on any brand page to report a new LTO, regional test item, or store-shelf snack. Submissions pass through an edge sanitization &amp; AI safety check (stripping HTML, blocking links/PII/profanity, and rate-limiting spam) and go live immediately.
            </p>
          </details>
          <details name="editorial-faq" className="faq-item">
            <summary>When are original BrandBite reviews launching?</summary>
            <p className="text-sm leading-relaxed">
              Original first-hand taste tests, 10-point verdict scores, real table photos, and retail prices paid are <strong>coming soon</strong> — zero calorie counting and zero placeholder or AI-generated food reviews.
            </p>
          </details>
          <details name="editorial-faq" className="faq-item">
            <summary>How often does the live feed update?</summary>
            <p className="text-sm leading-relaxed">
              A scheduled GitHub Actions workflow checks all feeds every 6 hours, deduplicates and categorizes new items by brand and food type, and automatically redeploys the site on Firebase Hosting whenever fresh dispatches arrive.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
