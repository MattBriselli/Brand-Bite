"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Tag, BookOpen, Radio, Mail, Menu, X, Flame } from "lucide-react";
import { BrandBiteMark } from "@/components/BrandBiteMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ARTICLES, BRANDS } from "@/data/articles";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleFeedFilterNav = (
    e: React.MouseEvent<HTMLAnchorElement>,
    type: "All" | "Deal" | "News"
  ) => {
    setMobileMenuOpen(false);
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      window.dispatchEvent(
        new CustomEvent("brandbite:apply-filter", { detail: { type } })
      );
      document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-strong)] bg-[var(--bg-header)]/95 backdrop-blur-md shadow-2xs">
      {/* Festive Christmas ribbon along the top edge */}
      <div className="holiday-ribbon" aria-hidden="true" />

      {/* Single clean masthead bar on both mobile and desktop */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        <Link href="/" className="group flex items-center gap-2.5 focus:outline-none shrink-0">
          <BrandBiteMark className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 drop-shadow-xs group-hover:scale-105 transition-transform" />
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-[var(--text-primary)] whitespace-nowrap">
              BRAND<span className="text-[var(--accent-brand)]">BITE</span>
            </span>
            <span className="hidden xl:inline-flex items-center gap-1 rounded-full bg-[#b91c1c] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap">
              🎄 Live
            </span>
          </div>
        </Link>

        {/* Desktop inline nav — strictly single-line */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0">
          <Link
            href="/#feed"
            onClick={(e) => handleFeedFilterNav(e, "All")}
            className="px-2 xl:px-2.5 py-1.5 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            Live Feed
          </Link>
          <Link
            href="/specials"
            className="px-2 xl:px-2.5 py-1.5 rounded-lg text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Flame className="w-3.5 h-3.5 text-[var(--accent-brand)] shrink-0" aria-hidden="true" />
            Specials
          </Link>
          <Link
            href="/?type=Deal#feed"
            onClick={(e) => handleFeedFilterNav(e, "Deal")}
            className="px-2 xl:px-2.5 py-1.5 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Tag className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" aria-hidden="true" />
            Deals
          </Link>
          <Link
            href="/reviews"
            className="px-2 xl:px-2.5 py-1.5 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
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
            className="px-2 xl:px-2.5 py-1.5 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" aria-hidden="true" />
            Brands
          </Link>
          <a
            href="#weekly-bite"
            className="px-2 xl:px-2.5 py-1.5 rounded-lg text-sm font-bold text-[var(--accent-brand)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Newsletter
          </a>
        </nav>

        {/* Right utility controls (single row on mobile + desktop) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle />
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
              onClick={(e) => handleFeedFilterNav(e, "All")}
              className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] inline-flex items-center gap-1.5"
            >
              <Radio className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Live Feed
            </Link>
            <Link
              href="/?type=Deal#feed"
              onClick={(e) => handleFeedFilterNav(e, "Deal")}
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
              href="/specials"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#f59e0b]" aria-hidden="true" />
              Specials On Now
            </Link>
            <a
              href="#weekly-bite"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg font-bold text-[var(--accent-brand)] hover:bg-[var(--bg-subtle)] inline-flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              The Weekly Bite
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
