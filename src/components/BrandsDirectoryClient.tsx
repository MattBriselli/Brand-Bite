"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BRANDS, BrandInfo } from "@/data/articles";
import { INITIAL_LIVE_FEED } from "@/data/live-feed-types";
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
  Clock,
} from "lucide-react";

const SEGMENTS: ("All" | BrandInfo["segment"])[] = [
  "All",
  "Fast Food",
  "Casual & Diner",
  "Packaged Snacks",
  "Coffee & Bakery",
  "Grocery",
];

export function BrandsDirectoryClient() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<"All" | BrandInfo["segment"]>("All");
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");

  useEffect(() => {
    const brandParam = searchParams.get("brand");
    if (brandParam) {
      const found = BRANDS.find((b) => b.slug === brandParam);
      if (found) {
        setQuery(found.name);
      }
    }
  }, [searchParams]);

  const letters = useMemo(() => {
    const set = new Set(BRANDS.map((b) => b.letter));
    return ["ALL", ...Array.from(set).sort()];
  }, []);

  const filteredBrands = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BRANDS.filter((b) => {
      if (selectedSegment !== "All" && b.segment !== selectedSegment) return false;
      if (selectedLetter !== "ALL" && b.letter !== selectedLetter) return false;
      if (q) {
        const hay = `${b.name} ${b.segment} ${b.signatureItem} ${b.description} ${b.headquarters}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, selectedSegment, selectedLetter]);

  const lastTrackedQueryRef = useRef("");
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2 || trimmed === lastTrackedQueryRef.current) return;
    const timer = setTimeout(() => {
      lastTrackedQueryRef.current = trimmed;
      trackFeedSearch({
        query: trimmed,
        surface: "brands_directory",
        resultsCount: filteredBrands.length,
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [query, filteredBrands.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <header className="space-y-3 border-b border-[var(--border-subtle)] pb-6">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--accent-brand)] inline-flex items-center gap-1.5">
          <Building2 className="w-4 h-4" aria-hidden="true" />
          Complete Index of Chains &amp; CPG Makers
        </span>
        <h1 className="hero-headline font-black text-[var(--text-primary)]">
          Brands &amp; Chains A–Z Directory
        </h1>
        <p className="text-base text-[var(--text-secondary)] max-w-2xl">
          Track live syndicated menu dispatches and community sightings across major fast-food chains, coffee houses, grocery private labels, and snack brands. Original BrandBite taste tests for each brand are coming soon.
        </p>
      </header>

      <search className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-xs">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <label htmlFor="brand-dir-search" className="sr-only">
              Search brands by name, specialty, or headquarters
            </label>
            <Search
              className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="brand-dir-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brands (e.g., Taco Bell, Burger King, Oreo, Trader Joe's)..."
              className="theme-input w-full rounded-xl border pl-10 pr-9 py-2.5 text-sm focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear brand search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="tag-list" role="group" aria-label="Filter by industry segment">
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
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

        <div className="tag-list pt-2 border-t border-[var(--border-subtle)]" role="group" aria-label="Filter by starting letter">
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
      </search>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBrands.map((brand) => {
          const brandWireItems = (INITIAL_LIVE_FEED.items || []).filter(
            (w) => w.brandSlug === brand.slug
          );
          return (
            <section
              key={brand.slug}
              aria-labelledby={`brand-heading-${brand.slug}`}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] text-[var(--text-primary)]">
                    {brand.segment}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent-brand)]" aria-hidden="true" />
                    {brand.headquarters}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <h2
                    id={`brand-heading-${brand.slug}`}
                    className="text-2xl font-black text-[var(--text-primary)]"
                  >
                    {brand.name}
                  </h2>
                  <span className="text-xs font-bold text-[var(--accent-brand)]">
                    {brandWireItems.length}{" "}
                    {brandWireItems.length === 1 ? "Live Dispatch" : "Live Dispatches"}
                  </span>
                </div>

                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {brand.description}
                </p>

                <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-[var(--text-primary)] inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--accent-brand)]" aria-hidden="true" />
                      Signature Focus:
                    </span>{" "}
                    <span className="text-[var(--text-secondary)]">{brand.signatureItem}</span>
                  </div>
                </div>

                {brandWireItems.length > 0 ? (
                  <div className="pt-2 space-y-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                      Latest Live Wire Dispatches:
                    </h3>
                    <ul className="space-y-2">
                      {brandWireItems.slice(0, 3).map((wire) => (
                        <li key={wire.id}>
                          <a
                            href={wire.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted-card)] px-3.5 py-2.5 text-xs hover:border-[var(--accent-brand)] transition-colors"
                          >
                            <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-brand)] truncate">
                              {wire.title}
                            </span>
                            <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--text-secondary)]">
                              {wire.sourceName}
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-secondary)] italic pt-1">
                    No active dispatches in the current live wire window — watching feeds automatically every 6 hours.
                  </p>
                )}

                <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-muted-card)] px-3.5 py-2.5 text-xs text-[var(--text-secondary)] flex items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">
                    In-House {brand.name} Taste Tests
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-[var(--accent-brand)]">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    Coming Soon
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <Link
                  href={`/brands/${brand.slug}`}
                  className="text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-brand)] inline-flex items-center gap-1"
                >
                  Open {brand.name} Page
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
        })}
      </div>
    </div>
  );
}
