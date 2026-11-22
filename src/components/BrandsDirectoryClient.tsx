"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BRANDS, BrandInfo } from "@/data/articles";
import { INITIAL_LIVE_FEED } from "@/data/live-feed-types";
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <header className="space-y-3 border-b border-[#e5dfd5] pb-6">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#c2410c] inline-flex items-center gap-1.5">
          <Building2 className="w-4 h-4" aria-hidden="true" />
          Complete Index of Chains &amp; CPG Makers
        </span>
        <h1 className="hero-headline font-black text-[#181512]">
          Brands &amp; Chains A–Z Directory
        </h1>
        <p className="text-base text-[#575049] max-w-2xl">
          Track live syndicated menu dispatches across major fast-food chains, coffee houses, grocery private labels, and snack brands. Original BrandBite taste tests for each brand are coming soon.
        </p>
      </header>

      <search className="rounded-2xl border border-[#e5dfd5] bg-white p-5 space-y-4 shadow-xs">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <label htmlFor="brand-dir-search" className="sr-only">
              Search brands by name, specialty, or headquarters
            </label>
            <Search
              className="w-4 h-4 text-[#575049] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="brand-dir-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brands (e.g., Taco Bell, Burger King, Oreo, Trader Joe's)..."
              className="w-full rounded-xl border border-[#d6cfc7] bg-[#faf8f5] pl-10 pr-9 py-2.5 text-sm text-[#181512] focus:border-[#c2410c] focus:bg-white focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear brand search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#575049] hover:text-[#181512] cursor-pointer"
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
                  onClick={() => setSelectedSegment(seg)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? "bg-[#181512] text-white"
                      : "bg-[#f3efe9] text-[#181512] hover:bg-[#e5dfd5]"
                  }`}
                >
                  {seg}
                </button>
              );
            })}
          </div>
        </form>

        <div className="tag-list pt-2 border-t border-[#f3efe9]" role="group" aria-label="Filter by starting letter">
          {letters.map((letter) => {
            const active = selectedLetter === letter;
            return (
              <button
                key={letter}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedLetter(letter)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                  active
                    ? "bg-[#c2410c] text-white"
                    : "bg-[#faf8f5] border border-[#e5dfd5] text-[#575049] hover:text-[#181512]"
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
              className="rounded-2xl border border-[#e5dfd5] bg-white p-6 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#f3efe9] text-[#181512]">
                    {brand.segment}
                  </span>
                  <span className="text-xs text-[#575049] inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#c2410c]" aria-hidden="true" />
                    {brand.headquarters}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <h2
                    id={`brand-heading-${brand.slug}`}
                    className="text-2xl font-black text-[#181512]"
                  >
                    {brand.name}
                  </h2>
                  <span className="text-xs font-bold text-[#c2410c]">
                    {brandWireItems.length}{" "}
                    {brandWireItems.length === 1 ? "Live Dispatch" : "Live Dispatches"}
                  </span>
                </div>

                <p className="text-sm text-[#575049] leading-relaxed">
                  {brand.description}
                </p>

                <div className="rounded-xl bg-[#faf8f5] border border-[#e5dfd5] p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-[#181512] inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#c2410c]" aria-hidden="true" />
                      Signature Focus:
                    </span>{" "}
                    <span className="text-[#575049]">{brand.signatureItem}</span>
                  </div>
                </div>

                {brandWireItems.length > 0 ? (
                  <div className="pt-2 space-y-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#575049]">
                      Latest Live Wire Dispatches:
                    </h3>
                    <ul className="space-y-2">
                      {brandWireItems.slice(0, 3).map((wire) => (
                        <li key={wire.id}>
                          <a
                            href={wire.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between gap-2 rounded-xl border border-[#e5dfd5] bg-white px-3.5 py-2.5 text-xs hover:border-[#c2410c] transition-colors"
                          >
                            <span className="font-semibold text-[#181512] group-hover:text-[#c2410c] truncate">
                              {wire.title}
                            </span>
                            <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-[#575049]">
                              {wire.sourceName}
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-[#575049] italic pt-1">
                    No active dispatches in the current 80-item live wire window — watching feeds automatically every 6 hours.
                  </p>
                )}

                <div className="rounded-xl border border-dashed border-[#d6cfc7] bg-[#faf8f5]/70 px-3.5 py-2.5 text-xs text-[#575049] flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#181512]">
                    In-House {brand.name} Taste Tests
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#9a3412]">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    Coming Soon
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f3efe9] flex items-center justify-between">
                <Link
                  href={`/?brand=${brand.slug}#feed`}
                  className="text-xs font-bold text-[#c2410c] hover:text-[#9a3412] inline-flex items-center gap-1"
                >
                  Filter {brand.name} on Live Feed
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
