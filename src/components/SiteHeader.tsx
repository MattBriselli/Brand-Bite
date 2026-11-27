"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Tag, BookOpen, Radio, Mail, Menu, X } from "lucide-react";
import { BrandBiteMark } from "@/components/BrandBiteMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SubmitSightingModal } from "@/components/SubmitSightingModal";
import { ARTICLES, BRANDS } from "@/data/articles";
import { INITIAL_LIVE_FEED } from "@/data/live-feed-types";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-page)]">
      {/* Festive Christmas ribbon along the top edge */}
      <div className="holiday-ribbon" aria-hidden="true" />
      {/* Top ticker bar — single-line on desktop, hidden on mobile for max scroll space */}
      <div className="hidden md:block bg-[#13261b] text-[#faf8f5] text-xs py-1.5 px-4 border-b border-[#1f3d2b]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <p className="flex items-center gap-2 font-medium whitespace-nowrap truncate">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#b91c1c] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shrink-0">
              <Radio className="w-3 h-3" aria-hidden="true" /> 🎄 Live
            </span>
            <span className="truncate">
              Tracking <strong>{INITIAL_LIVE_FEED.sources.length} live fast-food &amp; snack feeds</strong> across {BRANDS.length} chains
            </span>
          </p>
          <div className="flex items-center gap-4 text-[#d6cfc7] whitespace-nowrap shrink-0">
            <Link href="/reviews" className="hover:text-white underline-offset-4 hover:underline">
              {ARTICLES.length > 0 ? `Originals (${ARTICLES.length})` : "Originals"}
            </Link>
            <Link href="/press" className="hover:text-white underline-offset-4 hover:underline">
              Press &amp; Brands
            </Link>
          </div>
        </div>
      </div>

      {/* Main masthead — clean single-line bar on both mobile and desktop */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        <Link href="/" className="group flex items-center gap-2.5 focus:outline-none shrink-0">
          <BrandBiteMark className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 drop-shadow-xs group-hover:scale-105 transition-transform" />
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-[var(--text-primary)] whitespace-nowrap">
              BRAND<span className="text-[var(--accent-brand)]">BITE</span>
            </span>
            <span className="hidden xl:inline text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">
              Fast-Food &amp; Snack Drops
            </span>
          </div>
        </Link>

        {/* Desktop inline nav — strictly single-line */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 shrink-0">
          <Link
            href="/#feed"
            className="px-2.5 py-1.5 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            Live Feed
          </Link>
          <Link
            href="/?type=Deal#feed"
            className="px-2.5 py-1.5 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Tag className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" aria-hidden="true" />
            Deals
          </Link>
          <Link
            href="/reviews"
            className="px-2.5 py-1.5 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-brand)] shrink-0" aria-hidden="true" />
            Originals
            {ARTICLES.length > 0 && (
              <span className="rounded-full bg-[var(--accent-brand)] px-1.5 py-0.5 text-[10px] font-extrabold text-white leading-none">
                {ARTICLES.length}
              </span>
            )}
          </Link>
          <Link
            href="/brands"
            className="px-2.5 py-1.5 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" aria-hidden="true" />
            Brands
          </Link>
          <Link
            href="/#weekly-bite"
            className="px-2.5 py-1.5 rounded-lg text-sm font-bold text-[var(--accent-brand)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Newsletter
          </Link>
        </nav>

        {/* Right utility controls (single row on mobile + desktop) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle />
          <SubmitSightingModal />
          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] p-2 text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Menu className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible compact mobile menu drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2.5"
        >
          <div className="grid grid-cols-2 gap-1.5 text-sm font-semibold">
            <Link
              href="/#feed"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] inline-flex items-center gap-1.5"
            >
              <Radio className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Live Feed
            </Link>
            <Link
              href="/?type=Deal#feed"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] inline-flex items-center gap-1.5"
            >
              <Tag className="w-4 h-4 text-[#f59e0b]" aria-hidden="true" />
              Deals &amp; Codes
            </Link>
            <Link
              href="/reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[var(--accent-brand)]" aria-hidden="true" />
              Originals {ARTICLES.length > 0 ? `(${ARTICLES.length})` : ""}
            </Link>
            <Link
              href="/brands"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-[var(--text-secondary)]" aria-hidden="true" />
              Brands A–Z ({BRANDS.length})
            </Link>
            <Link
              href="/?type=News#feed"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
            >
              Menu News
            </Link>
            <Link
              href="/#weekly-bite"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg font-bold text-[var(--accent-brand)] hover:bg-[var(--bg-subtle)] inline-flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              The Weekly Bite
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
