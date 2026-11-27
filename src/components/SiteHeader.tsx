"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Tag, BookOpen, Radio, Mail } from "lucide-react";
import { BrandBiteMark } from "@/components/BrandBiteMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SubmitSightingModal } from "@/components/SubmitSightingModal";
import { ARTICLES, BRANDS } from "@/data/articles";
import { INITIAL_LIVE_FEED } from "@/data/live-feed-types";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-page)]/95 backdrop-blur-md">
      {/* Top ticker bar */}
      <div className="bg-[#181512] text-[#faf8f5] text-xs py-2 px-4 border-b border-[#2c2621]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#c2410c] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              <Radio className="w-3 h-3" aria-hidden="true" /> Live Wire Active
            </span>
            <span>
              Auto-syncing <strong>{INITIAL_LIVE_FEED.sources.length} live fast-food &amp; snack feeds</strong> across {BRANDS.length} chains &amp; brands every 6h
            </span>
          </p>
          <div className="flex items-center gap-4 text-[#d6cfc7]">
            <Link href="/reviews" className="hover:text-white underline-offset-4 hover:underline">
              {ARTICLES.length > 0 ? `Original Reviews (${ARTICLES.length})` : "Original Reviews (Coming Soon)"}
            </Link>
            <Link href="/brands" className="hover:text-white underline-offset-4 hover:underline">
              Brands A–Z Directory
            </Link>
          </div>
        </div>
      </div>

      {/* Main masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3 focus:outline-none">
            <BrandBiteMark className="w-11 h-11 shrink-0 drop-shadow-xs group-hover:scale-105 transition-transform" />
            <div>
              <span className="block text-2xl font-black tracking-tight text-[var(--text-primary)]">
                BRAND<span className="text-[var(--accent-brand)]">BITE</span>
              </span>
              <span className="block text-xs font-medium text-[var(--text-secondary)]">
                Fast Food Menu Drops &amp; Packaged Snack Feed • Community Sightings Live
              </span>
            </div>
          </Link>
        </div>

        <nav aria-label="Primary navigation" className="flex items-center flex-wrap gap-1 sm:gap-2">
          <Link
            href="/#feed"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5"
          >
            <Radio className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            Live Feed
          </Link>
          <Link
            href="/?type=News#feed"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            Menu News
          </Link>
          <Link
            href="/?type=Limited-Time+Offer#feed"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5"
          >
            <Tag className="w-4 h-4 text-[#f59e0b]" aria-hidden="true" />
            LTOs &amp; Deals
          </Link>
          <Link
            href="/reviews"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-[var(--accent-brand)]" aria-hidden="true" />
            Our Reviews
            {ARTICLES.length === 0 ? (
              <span className="rounded-full bg-[var(--bg-subtle)] border border-[var(--border-strong)] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                Soon
              </span>
            ) : (
              <span className="rounded-full bg-[#c2410c] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                {ARTICLES.length}
              </span>
            )}
          </Link>
          <Link
            href="/brands"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-[var(--text-secondary)]" aria-hidden="true" />
            Brands A–Z
          </Link>
          <Link
            href="/#weekly-bite"
            className="px-3 py-2 rounded-lg text-sm font-bold text-[var(--accent-brand)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            The Weekly Bite
          </Link>
          <ThemeToggle />
          <SubmitSightingModal />
        </nav>
      </div>
    </header>
  );
}
