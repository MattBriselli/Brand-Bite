"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  LiveFeedPayload,
} from "@/data/live-feed-types";
import {
  Search,
  Star,
  Flame,
  Calendar,
  Scale,
  X,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Building2,
  Radio,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

type FeedMode = "unified" | "wire" | "editorial";

interface UnifiedCardItem {
  kind: "editorial" | "wire";
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
  image: string;
  imageAlt: string;
  excerpt: string;
  sourceId: string;
  sourceName: string;
  sourceBadgeColor: string;
  editorialArticle?: Article;
  wireItem?: LiveFeedItem;
}

const CATEGORY_FALLBACK_SVG: Record<Article["category"], string> = {
  "Tacos & Burritos": "/images/taco-bell-street-chalupa.svg",
  "Burgers & Sandwiches": "/images/culvers-roasted-garlic-pub-burger.svg",
  "Chicken & Wings": "/images/wendys-ghost-pepper-ranch-chicken.svg",
  "Cookies & Sweets": "/images/oreo-strawberry-shortcake.svg",
  "Chips & Crisps": "/images/doritos-korean-bbq-hot-honey.svg",
  "Coffee & Drinks": "/images/starbucks-pistachio-cortado-foam.svg",
  "Frozen & Grocery": "/images/trader-joes-spicy-tempura-kimbap.svg",
};

export function HomeFeed() {
  const searchParams = useSearchParams();
  const [liveFeed, setLiveFeed] = useState<LiveFeedPayload>(INITIAL_LIVE_FEED);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [feedMode, setFeedMode] = useState<FeedMode>("unified");
  const [selectedSourceId, setSelectedSourceId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"All" | ArticleType>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "rating-desc" | "calories-asc">("latest");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");

  useEffect(() => {
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
    } else if (typeParam === null) {
      setSelectedType("All");
    }

    if (brandParam) {
      setSelectedBrandSlug(brandParam);
    }

    if (modeParam === "wire" || modeParam === "editorial" || modeParam === "unified") {
      setFeedMode(modeParam);
    }
  }, [searchParams]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/sync-feeds", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LiveFeedPayload = await res.json();
      setLiveFeed(data);
      setSyncMessage(
        `Synced ${data.items.length} fresh dispatches across ${data.sources.filter((s) => s.status === "ok").length} live feeds.`
      );
    } catch {
      setSyncMessage("Could not reach external feeds right now; displaying cached wire.");
    } finally {
      setIsSyncing(false);
    }
  };

  const featuredArticle = useMemo(
    () => ARTICLES.find((a) => a.isFeatured) || ARTICLES[0],
    []
  );

  // Merge Editorial + Live Wire into a single normalized array
  const allUnifiedItems: UnifiedCardItem[] = useMemo(() => {
    const editorialMapped: UnifiedCardItem[] = ARTICLES.map((art) => ({
      kind: "editorial",
      id: art.id,
      title: art.title,
      href: `/articles/${art.slug}`,
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
      sourceName: "BrandBite Editorial [SAMPLE]",
      sourceBadgeColor: "#181512",
      editorialArticle: art,
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
      image: item.image || CATEGORY_FALLBACK_SVG[item.category],
      imageAlt: `${item.brand} — ${item.title}`,
      excerpt: item.excerpt,
      sourceId: item.sourceId,
      sourceName: item.sourceName,
      sourceBadgeColor: item.sourceBadgeColor,
      wireItem: item,
    }));

    if (feedMode === "editorial") return editorialMapped;
    if (feedMode === "wire") return wireMapped;
    return [...editorialMapped, ...wireMapped];
  }, [liveFeed.items, feedMode]);

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
      if (sortBy === "rating-desc") {
        const rA = a.editorialArticle?.review?.rating ?? -1;
        const rB = b.editorialArticle?.review?.rating ?? -1;
        if (rB !== rA) return rB - rA;
      }
      if (sortBy === "calories-asc") {
        const cA = a.editorialArticle?.review?.nutrition.calories ?? 99999;
        const cB = b.editorialArticle?.review?.nutrition.calories ?? 99999;
        if (cA !== cB) return cA - cB;
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

  const comparedArticles = useMemo(
    () =>
      compareIds
        .map((id) => ARTICLES.find((a) => a.id === id))
        .filter((a): a is Article => Boolean(a && a.review)),
    [compareIds]
  );

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedCategory("All Categories");
    setSelectedBrandSlug("all");
    setSelectedSourceId("all");
    setSortBy("latest");
  };

  const availableLetters = useMemo(() => {
    const letters = Array.from(new Set(BRANDS.map((b) => b.letter))).sort();
    return ["ALL", ...letters];
  }, []);

  const visibleBrands = useMemo(() => {
    if (selectedLetter === "ALL") return BRANDS;
    return BRANDS.filter((b) => b.letter === selectedLetter);
  }, [selectedLetter]);

  // All distinct brands across static + live wire for the dropdown
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero / Lead Review Section */}
      <section aria-labelledby="hero-section-label">
        <div className="flex items-center justify-between mb-4">
          <p
            id="hero-section-label"
            className="text-xs font-extrabold uppercase tracking-widest text-[#c2410c] flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            Featured Cover Taste Test
          </p>
          <span className="text-xs font-medium text-[#575049]">
            Updated Daily • Independent Fast Food &amp; Snack Coverage
          </span>
        </div>

        <div className="featured-card-container">
          <article className="featured-card shadow-sm">
            <img
              src={featuredArticle.image}
              alt={featuredArticle.imageAlt}
              width={800}
              height={500}
              fetchPriority="high"
            />
            <header className="p-6 sm:p-8 pb-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold mb-3">
                <span className="rounded-md bg-[#c2410c] px-2.5 py-1 text-white uppercase tracking-wider">
                  {featuredArticle.type}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrandSlug(featuredArticle.brandSlug);
                    document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-md bg-[#f3efe9] px-2.5 py-1 text-[#181512] hover:bg-[#e5dfd5] transition-colors cursor-pointer"
                >
                  {featuredArticle.brand}
                </button>
                <span className="text-[#575049] font-medium">
                  {featuredArticle.publishedDateFormatted}
                </span>
              </div>

              <h1 className="hero-headline font-black text-[#181512]">
                <Link
                  href={`/articles/${featuredArticle.slug}`}
                  className="hover:text-[#c2410c] transition-colors"
                >
                  {featuredArticle.title}
                </Link>
              </h1>
            </header>

            <div className="featured-card-content px-6 sm:px-8 py-2 space-y-4">
              <p className="text-base text-[#575049] leading-relaxed">
                {featuredArticle.excerpt}
              </p>

              {featuredArticle.review && (
                <div className="grid grid-cols-3 gap-2.5 rounded-xl bg-[#faf8f5] border border-[#e5dfd5] p-3.5">
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#575049]">
                      BrandBite Score
                    </span>
                    <span className="text-lg font-black text-[#c2410c] flex items-center gap-1 mt-0.5">
                      <Star className="w-4 h-4 fill-[#c2410c]" aria-hidden="true" />
                      {featuredArticle.review.rating.toFixed(1)} / 10
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#575049]">
                      Price Paid
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[#181512] block mt-0.5">
                      {featuredArticle.review.pricePaid}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#575049]">
                      Nutrition
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[#181512] block mt-0.5">
                      {featuredArticle.review.nutrition.calories} Cal
                    </span>
                  </div>
                </div>
              )}
            </div>

            <footer className="px-6 sm:px-8 pt-3 pb-6 sm:pb-8 flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/articles/${featuredArticle.slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#c2410c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#9a3412] transition-colors"
              >
                Read Full Review &amp; Nutrition
                <span className="sr-only"> about {featuredArticle.title}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              {featuredArticle.ltoEndDate && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9a3412] bg-[#fff7ed] border border-[#fed7aa] px-3 py-1.5 rounded-lg">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  LTO Ends: {featuredArticle.ltoEndDate}
                </span>
              )}
            </footer>
          </article>
        </div>
      </section>

      {/* Synthesized Multi-Source Wire Status Banner */}
      <section
        aria-labelledby="wire-banner-heading"
        className="rounded-2xl border-2 border-[#181512] bg-white p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                Live Feed Synthesizer
              </span>
              <span className="text-xs text-[#575049] font-medium">
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
            <h2 id="wire-banner-heading" className="text-lg sm:text-xl font-black text-[#181512]">
              Aggregating {liveFeed.items.length} Live Dispatches Across 6 Fast-Food &amp; Snack Feeds
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 rounded-xl bg-[#c2410c] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#9a3412] disabled:opacity-60 transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              {isSyncing ? "Syncing 6 Feeds..." : "Sync Live Feeds Now"}
            </button>
          </div>
        </div>

        {syncMessage && (
          <div
            role="status"
            className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-950 flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              {syncMessage}
            </span>
            <button
              type="button"
              onClick={() => setSyncMessage(null)}
              className="text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Clickable Feed Source Pills */}
        <div className="pt-2 border-t border-[#f3efe9] flex flex-wrap items-center justify-between gap-3">
          <div className="tag-list" role="group" aria-label="Filter by syndicated feed source">
            <button
              type="button"
              aria-pressed={selectedSourceId === "all"}
              onClick={() => setSelectedSourceId("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedSourceId === "all"
                  ? "bg-[#181512] text-white"
                  : "bg-[#f3efe9] text-[#181512] hover:bg-[#e5dfd5]"
              }`}
            >
              All Sources ({ARTICLES.length + liveFeed.items.length})
            </button>

            <button
              type="button"
              aria-pressed={selectedSourceId === "brandbite-editorial"}
              onClick={() => {
                setFeedMode("unified");
                setSelectedSourceId("brandbite-editorial");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedSourceId === "brandbite-editorial"
                  ? "bg-[#c2410c] text-white"
                  : "bg-[#faf8f5] border border-[#e5dfd5] text-[#181512] hover:bg-[#f3efe9]"
              }`}
            >
              BrandBite Taste Tests ({ARTICLES.length})
            </button>

            {liveFeed.sources.map((src) => {
              const isSelected = selectedSourceId === src.id;
              return (
                <button
                  key={src.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (feedMode === "editorial") setFeedMode("unified");
                    setSelectedSourceId(isSelected ? "all" : src.id);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#c2410c] text-white"
                      : "bg-[#faf8f5] border border-[#e5dfd5] text-[#181512] hover:bg-[#f3efe9]"
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
          </div>
        </div>
      </section>

      {/* Semantic <search> and Filtering Controls */}
      <section id="feed" aria-labelledby="feed-heading" className="scroll-mt-24 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e5dfd5] pb-4">
          <div>
            <h2 id="feed-heading" className="section-headline font-black text-[#181512]">
              Synthesized Fast Food &amp; Snack Feed
            </h2>
            <p className="text-sm text-[#575049] mt-1">
              Combining BrandBite&apos;s full nutrition taste tests with live dispatches from Brand Eating, Chain Newsrooms (Burger King, Yum!, Taco Bell, McDonald&apos;s), The Impulsive Buy, NRN, Food Dive, and r/fastfood.
            </p>
          </div>

          {/* Feed Mode Switcher */}
          <div
            className="inline-flex rounded-xl border border-[#d6cfc7] bg-white p-1"
            role="group"
            aria-label="Feed display mode"
          >
            <button
              type="button"
              aria-pressed={feedMode === "unified"}
              onClick={() => setFeedMode("unified")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                feedMode === "unified"
                  ? "bg-[#181512] text-white"
                  : "text-[#575049] hover:text-[#181512]"
              }`}
            >
              Unified ({ARTICLES.length + liveFeed.items.length})
            </button>
            <button
              type="button"
              aria-pressed={feedMode === "wire"}
              onClick={() => {
                setFeedMode("wire");
                if (selectedSourceId === "brandbite-editorial") {
                  setSelectedSourceId("all");
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                feedMode === "wire"
                  ? "bg-[#181512] text-white"
                  : "text-[#575049] hover:text-[#181512]"
              }`}
            >
              Live Wire Only ({liveFeed.items.length})
            </button>
            <button
              type="button"
              aria-pressed={feedMode === "editorial"}
              onClick={() => {
                setFeedMode("editorial");
                setSelectedSourceId("all");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                feedMode === "editorial"
                  ? "bg-[#181512] text-white"
                  : "text-[#575049] hover:text-[#181512]"
              }`}
            >
              Editorial Reviews ({ARTICLES.length})
            </button>
          </div>
        </div>

        <search className="rounded-2xl border border-[#e5dfd5] bg-white p-5 shadow-xs space-y-5">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="grid grid-cols-1 md:grid-cols-12 gap-3"
          >
            <div className="md:col-span-6 relative">
              <label htmlFor="site-search-input" className="sr-only">
                Search fast food reviews, news, brands, or ingredients
              </label>
              <Search
                className="w-4 h-4 text-[#575049] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="site-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all 6 feeds + reviews (e.g. 'Taco Bell', 'Burger King', 'Oreo')..."
                className="w-full rounded-xl border border-[#d6cfc7] bg-[#faf8f5] pl-10 pr-9 py-2.5 text-sm text-[#181512] placeholder:text-[#575049]/75 focus:border-[#c2410c] focus:bg-white focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#575049] hover:text-[#181512] cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="md:col-span-3">
              <label htmlFor="brand-select" className="sr-only">
                Filter by Brand
              </label>
              <select
                id="brand-select"
                value={selectedBrandSlug}
                onChange={(e) => setSelectedBrandSlug(e.target.value)}
                className="w-full rounded-xl border border-[#d6cfc7] bg-[#faf8f5] px-3.5 py-2.5 text-sm font-semibold text-[#181512] focus:border-[#c2410c] focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Detected Brands</option>
                {brandDropdownOptions.map(([slug, label]) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="sort-select" className="sr-only">
                Sort Posts By
              </label>
              <div className="relative">
                <SlidersHorizontal
                  className="w-4 h-4 text-[#575049] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "latest" | "rating-desc" | "calories-asc"
                    )
                  }
                  className="w-full rounded-xl border border-[#d6cfc7] bg-[#faf8f5] pl-10 pr-3.5 py-2.5 text-sm font-semibold text-[#181512] focus:border-[#c2410c] focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="latest">Sort: Newest Dispatches First</option>
                  <option value="rating-desc">Sort: Highest Review Score</option>
                  <option value="calories-asc">Sort: Lowest Calories First</option>
                </select>
              </div>
            </div>
          </form>

          {/* Post Type Tabs (News vs. Reviews vs. LTOs vs. Deals) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#f3efe9]">
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
                    onClick={() => setSelectedType(type)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#181512] text-white shadow-xs"
                        : "bg-[#f3efe9] text-[#181512] hover:bg-[#e5dfd5]"
                    }`}
                  >
                    {type === "All" ? "All Dispatches" : type === "News" ? "News" : `${type}s`}{" "}
                    <span className="opacity-75 font-normal">({count})</span>
                  </button>
                );
              })}
            </div>

            {(selectedType !== "All" ||
              selectedCategory !== "All Categories" ||
              selectedBrandSlug !== "all" ||
              selectedSourceId !== "all" ||
              searchQuery.trim() !== "") && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-[#c2410c] hover:underline inline-flex items-center gap-1 cursor-pointer"
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
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#c2410c] text-white"
                      : "bg-[#faf8f5] border border-[#e5dfd5] text-[#575049] hover:text-[#181512] hover:border-[#d6cfc7]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </search>

        {/* Responsive Subgrid Card Feed */}
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-[#e5dfd5] bg-white p-12 text-center space-y-3">
            <p className="text-lg font-bold text-[#181512]">
              No matching fast-food posts or snack dispatches found.
            </p>
            <p className="text-sm text-[#575049]">
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
            {filteredItems.map((item) => {
              const editorial = item.editorialArticle;
              const isCompared = editorial ? compareIds.includes(editorial.id) : false;

              return (
                <article key={item.id} className="card">
                  {/* Region 1: Media (direct <img> child, no wrapper div) */}
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    width={800}
                    height={500}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = CATEGORY_FALLBACK_SVG[item.category];
                      if (fallback && target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />

                  {/* Region 2: Header (direct <header> child with primary .card-link inside heading) */}
                  <header className="px-5 pt-4 pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[11px] ${
                            item.type === "Review"
                              ? "bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]"
                              : item.type === "News"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : item.type === "Limited-Time Offer"
                              ? "bg-purple-50 text-purple-900 border border-purple-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {item.type}
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
                        className="text-[#575049] font-medium"
                      >
                        {item.publishedFormatted}
                      </time>
                    </div>

                    <h3 className="text-lg font-extrabold text-[#181512] leading-snug">
                      {item.isExternal ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="card-link hover:text-[#c2410c] transition-colors"
                        >
                          {item.title}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="card-link hover:text-[#c2410c] transition-colors"
                        >
                          {item.title}
                        </Link>
                      )}
                    </h3>
                  </header>

                  {/* Region 3: Content (single <div> grouping excerpt + metadata badges) */}
                  <div className="px-5 py-2 flex flex-col justify-between gap-3">
                    <p className="snippet text-sm text-[#575049] leading-relaxed">
                      {item.excerpt}
                    </p>

                    {editorial?.review ? (
                      <div className="rounded-xl bg-[#faf8f5] border border-[#e5dfd5] p-3 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 font-extrabold text-[#c2410c]">
                          <Star
                            className="w-4 h-4 fill-[#c2410c]"
                            aria-hidden="true"
                          />
                          <span>{editorial.review.rating.toFixed(1)}/10</span>
                          <span className="text-[#181512] font-bold">
                            • {editorial.review.verdict}
                          </span>
                        </div>
                        <div className="text-[#575049] font-semibold">
                          {editorial.review.pricePaid.split(" ")[0]} •{" "}
                          {editorial.review.nutrition.calories} Cal
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-[#faf8f5] border border-[#e5dfd5] p-3 flex items-center justify-between gap-2 text-xs text-[#575049]">
                        <span className="font-bold text-[#181512] flex items-center gap-1.5">
                          <Flame
                            className="w-3.5 h-3.5 text-[#c2410c]"
                            aria-hidden="true"
                          />
                          {item.category}
                        </span>
                        {editorial?.dealCode ? (
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            Code: {editorial.dealCode}
                          </span>
                        ) : (
                          <span className="truncate max-w-[140px]">
                            {item.isExternal ? "Syndicated Wire" : "Menu Dispatch"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Region 4: Footer (direct <footer> child with elevated independent controls) */}
                  <footer className="px-5 py-3.5 mt-2 border-t border-[#f3efe9] bg-[#faf8f5]/60 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBrandSlug(item.brandSlug)}
                        className="font-bold text-[#181512] bg-[#f3efe9] hover:bg-[#e5dfd5] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        {item.brand}
                      </button>

                      {editorial?.review && (
                        <button
                          type="button"
                          aria-pressed={isCompared}
                          onClick={() => toggleCompare(editorial.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                            isCompared
                              ? "bg-[#181512] text-white"
                              : "border border-[#d6cfc7] bg-white text-[#575049] hover:text-[#181512]"
                          }`}
                        >
                          <Scale className="w-3 h-3" aria-hidden="true" />
                          {isCompared ? "Comparing" : "Compare"}
                        </button>
                      )}
                    </div>

                    {item.isExternal ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#c2410c] hover:text-[#9a3412] inline-flex items-center gap-1"
                      >
                        Source
                        <span className="sr-only"> for {item.title}</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="font-bold text-[#c2410c] hover:text-[#9a3412] inline-flex items-center gap-1"
                      >
                        Read more
                        <span className="sr-only"> about {item.title}</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    )}
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Side-by-side Nutrition & Rating Comparison Drawer when items are selected */}
      {comparedArticles.length > 0 && (
        <section
          aria-label="Nutrition and Score Comparison"
          className="sticky bottom-4 z-20 rounded-2xl border-2 border-[#181512] bg-white p-5 shadow-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5dfd5] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#c2410c]" aria-hidden="true" />
              <h3 className="text-base font-black text-[#181512]">
                Side-by-Side Taste &amp; Nutrition Comparison ({comparedArticles.length}/2)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="text-xs font-bold text-[#575049] hover:text-[#181512] inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              Clear Comparison
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparedArticles.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#e5dfd5] bg-[#faf8f5] p-4 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase text-[#c2410c]">
                      {item.brand}
                    </span>
                    <h4 className="text-sm font-extrabold text-[#181512]">
                      {item.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCompare(item.id)}
                    aria-label={`Remove ${item.title} from comparison`}
                    className="text-[#575049] hover:text-[#181512] p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {item.review && (
                  <dl className="grid grid-cols-4 gap-2 text-xs pt-2 border-t border-[#e5dfd5]">
                    <div>
                      <dt className="text-[#575049]">Score</dt>
                      <dd className="font-black text-[#c2410c] text-sm">
                        {item.review.rating.toFixed(1)}/10
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#575049]">Calories</dt>
                      <dd className="font-extrabold text-[#181512] text-sm">
                        {item.review.nutrition.calories}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#575049]">Sodium</dt>
                      <dd className="font-extrabold text-[#181512] text-sm">
                        {item.review.nutrition.sodium}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#575049]">Protein</dt>
                      <dd className="font-extrabold text-[#181512] text-sm">
                        {item.review.nutrition.protein}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            ))}
            {comparedArticles.length === 1 && (
              <div className="rounded-xl border border-dashed border-[#d6cfc7] p-4 flex items-center justify-center text-center text-xs text-[#575049]">
                Click <strong>&ldquo;Compare&rdquo;</strong> on any second reviewed item above to compare calories, sodium, protein, and scores side by side.
              </div>
            )}
          </div>
        </section>
      )}

      {/* A–Z Brand Directory Preview Section */}
      <section
        id="brands-directory"
        aria-labelledby="brands-directory-heading"
        className="rounded-2xl border border-[#e5dfd5] bg-white p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e5dfd5] pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#c2410c] flex items-center gap-1.5">
              <Building2 className="w-4 h-4" aria-hidden="true" />
              Index of Chains &amp; Snack Makers
            </span>
            <h2
              id="brands-directory-heading"
              className="section-headline font-black text-[#181512] mt-1"
            >
              A–Z Brand &amp; Chain Directory
            </h2>
          </div>
          <Link
            href="/brands"
            className="text-sm font-bold text-[#c2410c] hover:text-[#9a3412] inline-flex items-center gap-1"
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
                    ? "bg-[#181512] text-white"
                    : "bg-[#f3efe9] text-[#181512] hover:bg-[#e5dfd5]"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {visibleBrands.map((brand) => {
            const count = allUnifiedItems.filter((a) => a.brandSlug === brand.slug).length;
            const isSelected = selectedBrandSlug === brand.slug;
            return (
              <div
                key={brand.slug}
                className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-colors ${
                  isSelected
                    ? "border-[#c2410c] bg-[#fff7ed]"
                    : "border-[#e5dfd5] bg-[#faf8f5] hover:border-[#d6cfc7]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#575049]">
                      {brand.segment}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-[#e5dfd5] text-[#181512]">
                      {count} {count === 1 ? "post" : "posts"}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#181512] mt-1">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-[#575049] mt-1 line-clamp-2">
                    {brand.signatureItem}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#e5dfd5]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrandSlug(brand.slug);
                      document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-xs font-bold text-[#c2410c] hover:underline cursor-pointer"
                  >
                    {count > 0 ? `Filter ${brand.name} (${count})` : `Select ${brand.name}`}
                  </button>
                  <Link
                    href={`/brands?brand=${brand.slug}`}
                    className="text-xs font-semibold text-[#575049] hover:text-[#181512]"
                  >
                    Profile →
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
        className="rounded-2xl border border-[#e5dfd5] bg-white p-6 sm:p-8"
      >
        <h2 id="faq-heading" className="text-xl font-black text-[#181512] mb-2">
          How BrandBite Synthesizes &amp; Reviews Fast Food &amp; Snacks
        </h2>
        <p className="text-sm text-[#575049] mb-4">
          Every dispatch in the unified feed either comes from our in-house retail taste tests or is synthesized directly from 6 live RSS/JSON feeds and chain newsrooms.
        </p>

        <div className="divide-y divide-[#e5dfd5]">
          <details name="editorial-faq" className="faq-item" open>
            <summary>Which external feeds are synthesized into the Live Wire?</summary>
            <p className="text-sm leading-relaxed">
              Our feed synthesizer ([scripts/sync-feeds.mjs]) pulls from 6 sources concurrently: <strong>Brand Eating</strong> (Blogger JSON API), <strong>Chain Newsrooms</strong> (Burger King, Yum! Brands, Taco Bell, KFC, Pizza Hut, Wendy&apos;s, McDonald&apos;s, Popeyes, Krispy Kreme), <strong>The Impulsive Buy</strong> (WordPress RSS), <strong>Nation&apos;s Restaurant News</strong> (XML RSS), <strong>Food Dive</strong> (CPG &amp; packaged snacks RSS), and <strong>r/fastfood</strong> (community sightings &amp; press releases).
            </p>
          </details>
          <details name="editorial-faq" className="faq-item">
            <summary>How are incoming feed items categorized automatically?</summary>
            <p className="text-sm leading-relaxed">
              Each syndicated item is parsed, stripped of tracking pixels, decoded, deduplicated, and classified by <strong>Brand</strong> (e.g., Taco Bell, Burger King, Popeyes, Oreo), <strong>Post Type</strong> (<em>Review</em>, <em>Limited-Time Offer</em>, <em>Deal</em>, or <em>News</em>), and <strong>Food Category</strong> so all filters work across both in-house and live wire items.
            </p>
          </details>
          <details name="editorial-faq" className="faq-item">
            <summary>How can I refresh the feed or run it on an automated schedule?</summary>
            <p className="text-sm leading-relaxed">
              Click <strong>&ldquo;Sync Live Feeds Now&rdquo;</strong> at the top of the feed, run <code>npm run sync-feeds</code> from the terminal, or set up a recurring background task with the <code>/schedule</code> command.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
