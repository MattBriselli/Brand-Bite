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
    <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-page)]/95 backdrop-blur-md">
      {/* Top ticker bar — hidden on small mobile screens to maximize vertical scroll space */}
      <div className="hidden sm:block bg-[#181512] text-[#faf8f5] text-xs py-1.5 px-4 border-b border-[#2c2621]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#c2410c] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              <Radio className="w-3 h-3" aria-hidden="true" /> Live Feed Active
            </span>
            <span>
              Auto-syncing <strong>{INITIAL_LIVE_FEED.sources.length} live fast-food &amp; snack feeds</strong> across {BRANDS.length} chains &amp; brands every 6h
            </span>
          </p>
          <div className="flex items-center gap-4 text-[#d6cfc7]">
            <Link href="/reviews" className="hover:text-white underline-offset-4 hover:underline">
              {ARTICLES.length > 0 ? `Originals & Roundups (${ARTICLES.length})` : "Original Reviews (Coming Soon)"}
            </Link>
            <Link href="/brands" className="hover:text-white underline-offset-4 hover:underline">
              Brands A–Z Directory
            </Link>
          </div>
        </div>
      </div>

      {/* Main masthead — single sleek bar on mobile (~56px), full inline nav on desktop */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="group flex items-center gap-2.5 sm:gap-3 focus:outline-none min-w-0">
          <BrandBiteMark className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 drop-shadow-xs group-hover:scale-105 transition-transform" />
          <div className="min-w-0">
            <span className="block text-xl sm:text-2xl font-black tracking-tight leading-none text-[var(--text-primary)]">
              BRAND<span className="text-[var(--accent-brand)]">BITE</span>
            </span>
            <span className="hidden sm:block text-xs font-medium text-[var(--text-secondary)] mt-0.5 truncate">
              Fast Food Menu Drops &amp; Packaged Snack Feed • Holiday Edition
            </span>
          </div>
        </Link>

        {/* Desktop inline nav */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1">
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
            Originals
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
            Weekly Bite
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
              href="/?type=Limited-Time+Offer#feed"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] inline-flex items-center gap-1.5"
            >
              <Tag className="w-4 h-4 text-[#f59e0b]" aria-hidden="true" />
              LTOs &amp; Deals
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
