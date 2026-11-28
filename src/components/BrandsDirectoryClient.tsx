"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ARTICLES, BRANDS, BrandInfo } from "@/data/articles";
import { INITIAL_LIVE_FEED, LiveFeedItem } from "@/data/live-feed-types";
import { BrandLogo } from "@/components/BrandLogo";
import { CopyableTitle } from "@/components/CopyableTitle";
import { BrandCardBanner } from "@/components/BrandCardBanner";
import {
  trackFeedFilterSelect,
  trackFeedSearch,
} from "@/lib/analytics";
import {
  Search,
  Building2,
  MapPin,
  ArrowRight,
  X,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flame,
  Newspaper,
  Clock,
  SlidersHorizontal,
} from "lucide-react";

const SEGMENTS: ("All" | BrandInfo["segment"])[] = [
  "All",
  "Fast Food",
  "Casual & Diner",
  "Packaged Snacks",
  "Coffee & Bakery",
  "Grocery",
];

type RecencyFilter = "off" | "today" | "week";

const RECENCY_OPTIONS: { id: RecencyFilter; label: string; shortLabel: string }[] = [
  { id: "off", label: "Off", shortLabel: "Off" },
  { id: "today", label: "Updated Today", shortLabel: "Today" },
  { id: "week", label: "Updated This Week", shortLabel: "This Week" },
];

const BRANDS_FILTERS_STORAGE_KEY = "brandbite:brands-filters";

interface BrandEntry {
  brand: BrandInfo;
  wireItems: LiveFeedItem[];
  originals: typeof ARTICLES;
  totalUpdates: number;
  latestTimestamp: number | null;
  latestRecency: { text: string; isToday: boolean } | null;
}

function formatRecencyLabel(
  ts: number | null,
  referenceNowMs: number
): { text: string; isToday: boolean } | null {
  if (!ts || !Number.isFinite(ts) || !referenceNowMs) return null;
  const diffMs = Math.max(0, referenceNowMs - ts);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) {
    return {
      text: diffMins <= 1 ? "Updated just now" : `Updated ${diffMins}m ago`,
      isToday: true,
    };
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return {
      text: `Updated ${diffHours}h ago`,
      isToday: true,
    };
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return {
      text: `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`,
      isToday: false,
    };
  }
  return {
    text: new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    isToday: false,
  };
}

export function BrandsDirectoryClient() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<"All" | BrandInfo["segment"]>("All");
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
  const [recencyFilter, setRecencyFilter] = useState<RecencyFilter>("off");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const [nowMs, setNowMs] = useState<number>(() => {
    const parsed = Date.parse(INITIAL_LIVE_FEED.lastSyncedAt);
    return Number.isFinite(parsed) ? parsed : 0;
  });

  // Sync real clock after mount & restore sticky directory filters across reloads
  useEffect(() => {
    setNowMs(Date.now());
    try {
      const raw = localStorage.getItem(BRANDS_FILTERS_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<{
          query: string;
          selectedSegment: "All" | BrandInfo["segment"];
          selectedLetter: string;
          recencyFilter: RecencyFilter;
        }>;
        const hasBrandParam = Boolean(searchParams.get("brand"));
        if (!hasBrandParam && typeof saved.query === "string") {
          setQuery(saved.query);
        }
        if (saved.selectedSegment && SEGMENTS.includes(saved.selectedSegment)) {
          setSelectedSegment(saved.selectedSegment);
        }
        if (typeof saved.selectedLetter === "string" && saved.selectedLetter) {
          setSelectedLetter(saved.selectedLetter);
        }
        if (
          saved.recencyFilter === "off" ||
          saved.recencyFilter === "today" ||
          saved.recencyFilter === "week"
        ) {
          setRecencyFilter(saved.recencyFilter);
        }
      }
    } catch {
      // Ignore storage read errors
    } finally {
      setFiltersHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist sticky directory filters whenever they change
  useEffect(() => {
    if (!filtersHydrated) return;
    try {
      localStorage.setItem(
        BRANDS_FILTERS_STORAGE_KEY,
        JSON.stringify({ query, selectedSegment, selectedLetter, recencyFilter })
      );
    } catch {
      // Ignore storage write errors
    }
  }, [filtersHydrated, query, selectedSegment, selectedLetter, recencyFilter]);

  useEffect(() => {
    const brandParam = searchParams.get("brand");
    if (brandParam) {
      const found = BRANDS.find((b) => b.slug === brandParam);
      if (found) {
        setQuery(found.name);
        setExpandedSlugs(new Set([found.slug]));
      }
    }
  }, [searchParams]);

  const letters = useMemo(() => {
    const set = new Set(BRANDS.map((b) => b.letter));
    return ["ALL", ...Array.from(set).sort()];
  }, []);

  // Precompute live dispatches + originals per brand once
  const brandEntries = useMemo<BrandEntry[]>(() => {
    const wireBySlug = new Map<string, LiveFeedItem[]>();
    for (const item of INITIAL_LIVE_FEED.items || []) {
      const list = wireBySlug.get(item.brandSlug) || [];
      list.push(item);
      wireBySlug.set(item.brandSlug, list);
    }

    return [...BRANDS]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((brand) => {
        const wireItems = wireBySlug.get(brand.slug) || [];
        const originals = ARTICLES.filter(
          (art) => art.brandSlug === brand.slug || art.tags.includes(brand.slug)
        );
        const timestamps: number[] = [];
        for (const w of wireItems) {
          const t = Date.parse(w.publishedAt);
          if (Number.isFinite(t)) timestamps.push(t);
        }
        for (const a of originals) {
          const t = Date.parse(a.publishedAt);
          if (Number.isFinite(t)) timestamps.push(t);
        }
        const latestTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : null;
        return {
          brand,
          wireItems,
          originals,
          totalUpdates: wireItems.length + originals.length,
          latestTimestamp,
          latestRecency: formatRecencyLabel(latestTimestamp, nowMs),
        };
      });
  }, [nowMs]);

  const filteredEntries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const todayCutoff = nowMs - 24 * 60 * 60 * 1000;
    const weekCutoff = nowMs - 7 * 24 * 60 * 60 * 1000;

    return brandEntries.filter(({ brand, latestTimestamp }) => {
      if (selectedSegment !== "All" && brand.segment !== selectedSegment) return false;
      if (selectedLetter !== "ALL" && brand.letter !== selectedLetter) return false;
      if (recencyFilter === "today") {
        if (!latestTimestamp || latestTimestamp < todayCutoff) return false;
      } else if (recencyFilter === "week") {
        if (!latestTimestamp || latestTimestamp < weekCutoff) return false;
      }
      if (q) {
        const hay = `${brand.name} ${brand.segment} ${brand.signatureItem} ${brand.description} ${brand.headquarters}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [brandEntries, query, selectedSegment, selectedLetter, recencyFilter, nowMs]);

  const activeEntries = useMemo(
    () => filteredEntries.filter((e) => e.totalUpdates > 0),
    [filteredEntries]
  );

  const quietEntries = useMemo(
    () => filteredEntries.filter((e) => e.totalUpdates === 0),
    [filteredEntries]
  );

  const isSearchMode = query.trim().length > 0;

  const toggleExpanded = (slug: string) => {
    setExpandedSlugs((prev) => {
      if (prev.has(slug)) {
        return new Set();
      }
      return new Set([slug]);
    });
  };

  // Close expanded card when clicking outside any brand card or pressing Escape
  useEffect(() => {
    if (expandedSlugs.size === 0 || isSearchMode) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-brand-card]")) return;
      setExpandedSlugs(new Set());
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setExpandedSlugs(new Set());
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expandedSlugs.size, isSearchMode]);

  const lastTrackedQueryRef = useRef("");
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2 || trimmed === lastTrackedQueryRef.current) return;
    const timer = setTimeout(() => {
      lastTrackedQueryRef.current = trimmed;
      trackFeedSearch({
        query: trimmed,
        surface: "brands_directory",
        resultsCount: filteredEntries.length,
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [query, filteredEntries.length]);

  const renderBrandCard = (entry: BrandEntry, isQuiet: boolean) => {
    const { brand, wireItems, originals, totalUpdates } = entry;
    const isExpanded = isSearchMode || expandedSlugs.has(brand.slug);
    const previewHeadline = wireItems[0]?.title || originals[0]?.title || null;

    if (!isExpanded) {
      // Compact card for initial directory scan
      return (
        <section
          key={brand.slug}
          data-brand-card="compact"
          aria-labelledby={`brand-heading-${brand.slug}`}
          onClick={() => toggleExpanded(brand.slug)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleExpanded(brand.slug);
            }
          }}
          className={`group rounded-xl border p-3.5 flex flex-col justify-between gap-2.5 transition-all cursor-pointer text-left ${
            isQuiet
              ? "border-[var(--border-subtle)] bg-[var(--bg-muted-card)] opacity-55 grayscale hover:opacity-90 hover:grayscale-0 hover:border-[var(--border-strong)]"
              : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-brand)] hover:shadow-sm"
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] truncate">
                {brand.segment}
              </span>
              <span
                className={`shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                  isQuiet
                    ? "bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                    : "bg-[#c2410c]/12 text-[var(--accent-brand)]"
                }`}
              >
                {totalUpdates === 0
                  ? "0 updates"
                  : `${totalUpdates} ${totalUpdates === 1 ? "update" : "updates"}`}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <BrandLogo
                  slug={brand.slug}
                  name={brand.name}
                  accentColor={brand.accentColor}
                  size="sm"
                />
                <h3
                  id={`brand-heading-${brand.slug}`}
                  className={`text-base font-black leading-tight truncate ${
                    isQuiet
                      ? "text-[var(--text-secondary)]"
                      : "text-[var(--text-primary)] group-hover:text-[var(--accent-brand)] transition-colors"
                  }`}
                >
                  {brand.name}
                </h3>
              </div>
              <ChevronDown
                className="w-4 h-4 shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--accent-brand)] transition-colors"
                aria-hidden="true"
              />
            </div>

            {previewHeadline ? (
              <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                {previewHeadline}
              </p>
            ) : (
              <p className="text-[11px] text-[var(--text-secondary)] italic line-clamp-1">
                Quiet on the live wire
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 text-[11px]">
            {entry.latestRecency ? (
              <span
                className={`inline-flex items-center gap-1 font-semibold truncate ${
                  entry.latestRecency.isToday
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                {entry.latestRecency.text}
              </span>
            ) : (
              <span className="text-[var(--text-secondary)] truncate">
                {brand.headquarters}
              </span>
            )}
            <Link
              href={`/brands/${brand.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 font-bold text-[var(--accent-brand)] hover:underline inline-flex items-center gap-0.5"
            >
              Hub
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </section>
      );
    }

    // Expanded / Larger card (shown on click or while searching — includes article images!)
    return (
      <section
        key={brand.slug}
        data-brand-card="expanded"
        aria-labelledby={`brand-heading-${brand.slug}`}
        className={`rounded-2xl border p-6 flex flex-col justify-between gap-5 shadow-sm transition-all ${
          isSearchMode ? "" : "col-span-full"
        } ${
          isQuiet
            ? "border-[var(--border-strong)] bg-[var(--bg-muted-card)] opacity-85"
            : "border-[var(--accent-brand)]/60 bg-[var(--bg-surface)] ring-1 ring-[var(--accent-brand)]/20"
        }`}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] text-[var(--text-primary)]">
                {brand.segment}
              </span>
              <span className="text-xs text-[var(--text-secondary)] inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--accent-brand)]" aria-hidden="true" />
                {brand.headquarters}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                  isQuiet
                    ? "bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                    : "bg-[#c2410c]/12 text-[var(--accent-brand)]"
                }`}
              >
                {totalUpdates} {totalUpdates === 1 ? "Live Update" : "Live Updates"}
              </span>
              {!isSearchMode && (
                <button
                  type="button"
                  onClick={() => toggleExpanded(brand.slug)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-muted-card)] px-2.5 py-1 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Collapse
                  <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <BrandLogo
              slug={brand.slug}
              name={brand.name}
              accentColor={brand.accentColor}
              size="lg"
            />
            <div className="space-y-1.5 min-w-0">
              <CopyableTitle
                as="h3"
                id={`brand-heading-${brand.slug}`}
                href={`/brands/${brand.slug}`}
                className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]"
              >
                {brand.name}
              </CopyableTitle>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                {brand.description}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-3 text-xs">
            <span className="font-bold text-[var(--text-primary)] inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-brand)]" aria-hidden="true" />
              Signature Focus:
            </span>{" "}
            <span className="text-[var(--text-secondary)]">{brand.signatureItem}</span>
          </div>

          {/* Original BrandBite Articles with images */}
          {originals.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--accent-brand)] inline-flex items-center gap-1.5">
                <Newspaper className="w-3.5 h-3.5" aria-hidden="true" />
                BrandBite Originals
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {originals.map((art) => (
                  <Link
                    key={art.id}
                    href={`/reviews/${art.slug}`}
                    className="group flex flex-col sm:flex-row overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted-card)] hover:border-[var(--accent-brand)] transition-colors"
                  >
                    {art.image && (
                      <div className="sm:w-32 sm:shrink-0 h-32 sm:h-auto overflow-hidden bg-[var(--bg-subtle)]">
                        <img
                          src={art.image}
                          alt={art.imageAlt}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-3 flex flex-col justify-between gap-1.5 min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent-brand)]">
                        {art.type} • {art.publishedDateFormatted}
                      </span>
                      <p className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-[var(--accent-brand)] line-clamp-2 leading-snug">
                        {art.title}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                        {art.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Live Wire Dispatches with article images */}
          {wireItems.length > 0 ? (
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)] inline-flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[var(--accent-brand)]" aria-hidden="true" />
                Latest Live Wire Dispatches ({wireItems.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {wireItems.slice(0, 6).map((wire) => (
                  <a
                    key={wire.id}
                    href={wire.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted-card)] hover:border-[var(--accent-brand)] transition-colors"
                  >
                    {wire.image ? (
                      <div className="w-full h-36 overflow-hidden bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)]">
                        <img
                          src={wire.image}
                          alt={`${brand.name} — ${wire.title}`}
                          loading="lazy"
                          onError={(e) => {
                            const wrapper = e.currentTarget.parentElement;
                            if (wrapper) wrapper.style.display = "none";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <BrandCardBanner
                        brandSlug={brand.slug}
                        brandName={brand.name}
                        category={wire.category}
                        compact
                      />
                    )}
                    <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span
                            className="px-1.5 py-0.5 rounded font-bold text-white truncate"
                            style={{ backgroundColor: wire.sourceBadgeColor }}
                          >
                            {wire.sourceName}
                          </span>
                          <span className="text-[var(--text-secondary)] shrink-0">
                            {wire.publishedFormatted}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-brand)] line-clamp-2 leading-snug">
                          {wire.title}
                        </p>
                        {wire.excerpt && (
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                            {wire.excerpt}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent-brand)] pt-1">
                        Read Source
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            originals.length === 0 && (
              <p className="text-xs text-[var(--text-secondary)] italic">
                No active dispatches in the current live window — we watch {brand.name} live and new drops appear automatically.
              </p>
            )
          )}
        </div>

        <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/brands/${brand.slug}`}
            className="text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-brand)] inline-flex items-center gap-1"
          >
            Open Full {brand.name} Page
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
          <Link
            href={`/?brand=${brand.slug}#feed`}
            className="text-xs font-bold text-[var(--accent-brand)] hover:underline inline-flex items-center gap-1"
          >
            Filter on Live Feed
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <header className="space-y-3 border-b border-[var(--border-subtle)] pb-6">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--accent-brand)] inline-flex items-center gap-1.5">
          <Building2 className="w-4 h-4" aria-hidden="true" />
          Complete Index of Chains &amp; CPG Makers
        </span>
        <CopyableTitle
          as="h1"
          href="/brands"
          className="hero-headline font-black text-[var(--text-primary)]"
        >
          Brands &amp; Chains A–Z Directory
        </CopyableTitle>
        <p className="text-base text-[var(--text-secondary)] max-w-2xl">
          Active brands with live news sit up top; quieter chains rest below. Click any card — or search — to expand full details and article photos.
        </p>
      </header>

      <search className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-xs">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <label htmlFor="brand-dir-search" className="sr-only">
              Search brands by name, specialty, or headquarters
            </label>
            <Search
              className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="brand-dir-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brands (e.g., Taco Bell, Pop-Tarts)..."
              className="theme-input w-full rounded-xl border pl-9 pr-8 py-2 sm:py-2.5 text-sm focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear brand search"
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
            {(selectedSegment !== "All" || selectedLetter !== "ALL" || recencyFilter !== "off") && (
              <span className="rounded-full bg-[var(--accent-brand)] text-white px-1.5 py-0.5 text-[10px] leading-none">
                {[selectedSegment !== "All", selectedLetter !== "ALL", recencyFilter !== "off"].filter(Boolean).length}
              </span>
            )}
          </button>

          <div
            className={`${mobileFiltersOpen ? "flex" : "hidden"} md:flex tag-list w-full md:w-auto`}
            role="group"
            aria-label="Filter by industry segment"
          >
            {SEGMENTS.map((seg) => {
              const active = selectedSegment === seg;
              return (
                <button
                  key={seg}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedSegment(seg);
                    trackFeedFilterSelect({ filterKind: "segment", filterValue: seg });
                  }}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)]"
                      : "bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:opacity-85"
                  }`}
                >
                  {seg}
                </button>
              );
            })}
          </div>
        </form>

        <div
          className={`${
            mobileFiltersOpen ? "flex" : "hidden"
          } md:flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]`}
        >
          <div className="tag-list" role="group" aria-label="Filter by starting letter">
            {letters.map((letter) => {
              const active = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedLetter(letter);
                    trackFeedFilterSelect({ filterKind: "letter", filterValue: letter });
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                    active
                      ? "bg-[#c2410c] text-white"
                      : "bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <div
            className="flex flex-wrap items-center gap-1 w-full sm:w-auto max-w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted-card)] p-1"
            role="group"
            aria-label="Filter by recent updates"
          >
            <span className="px-1.5 sm:px-2 text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] inline-flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
              Recency:
            </span>
            {RECENCY_OPTIONS.map((opt) => {
              const active = recencyFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setRecencyFilter(opt.id);
                    trackFeedFilterSelect({ filterKind: "time_range", filterValue: opt.id });
                  }}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className="sm:hidden">{opt.shortLabel}</span>
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </search>

      {filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10 text-center space-y-2">
          <p className="text-base font-bold text-[var(--text-primary)]">
            No brands match that filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedSegment("All");
              setSelectedLetter("ALL");
              setRecencyFilter("off");
            }}
            className="text-xs font-bold text-[var(--accent-brand)] hover:underline cursor-pointer"
          >
            Reset directory filters
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* TOP HALF: Brands with live updates */}
          {activeEntries.length > 0 && (
            <section aria-labelledby="active-brands-heading" className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
                <h2
                  id="active-brands-heading"
                  className="text-lg sm:text-xl font-black text-[var(--text-primary)] inline-flex items-center gap-2"
                >
                  <Flame className="w-5 h-5 text-[var(--accent-brand)]" aria-hidden="true" />
                  Active on the Wire ({activeEntries.length})
                </h2>
                <span className="text-xs text-[var(--text-secondary)]">
                  {isSearchMode
                    ? "Showing expanded cards with article photos"
                    : "Click any card to expand dispatches & photos"}
                </span>
              </div>

              <div
                className={
                  isSearchMode
                    ? "grid grid-cols-1 gap-6"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5"
                }
              >
                {activeEntries.map((entry) => renderBrandCard(entry, false))}
              </div>
            </section>
          )}

          {/* BOTTOM HALF: Grayed-out brands with 0 current updates */}
          {quietEntries.length > 0 && (
            <section aria-labelledby="quiet-brands-heading" className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
                <h2
                  id="quiet-brands-heading"
                  className="text-base sm:text-lg font-extrabold text-[var(--text-secondary)]"
                >
                  Quiet on the Wire Right Now ({quietEntries.length})
                </h2>
                <span className="text-xs text-[var(--text-secondary)]">
                  Watched live — automatically move up top the moment news breaks
                </span>
              </div>

              <div
                className={
                  isSearchMode
                    ? "grid grid-cols-1 gap-6"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                }
              >
                {quietEntries.map((entry) => renderBrandCard(entry, true))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
