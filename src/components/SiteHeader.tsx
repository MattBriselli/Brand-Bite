"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Tag, BookOpen, Radio, Mail, Menu, X, Flame } from "lucide-react";
import { BrandBiteMark } from "@/components/BrandBiteMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ARTICLES } from "@/data/articles";

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Always collapse the expanded navigation drawer on route change or Escape
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  const isLiveActive = pathname === "/live" || pathname.startsWith("/live/");
  const isSpecialsActive = pathname === "/specials" || pathname.startsWith("/specials/");
  const isOriginalsActive = pathname === "/reviews" || pathname.startsWith("/reviews/");
  const isBrandsActive = pathname === "/brands" || pathname.startsWith("/brands/");

  const navLinkClass = (active: boolean) =>
    active
      ? "px-2.5 py-1.5 rounded-lg text-sm font-bold bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
      : "px-2 xl:px-2.5 py-1.5 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap";

  const mobileLinkClass = (active: boolean) =>
    active
      ? "px-3 py-2 rounded-lg font-bold bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] inline-flex items-center gap-1.5"
      : "px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] inline-flex items-center gap-1.5";

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
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="group flex items-center gap-2.5 focus:outline-none"
          >
            <BrandBiteMark className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 drop-shadow-xs group-hover:scale-105 transition-transform" />
            <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-[var(--text-primary)] whitespace-nowrap">
              BRAND<span className="text-[var(--accent-brand)]">BITE</span>
            </span>
          </Link>
          <Link
            href="/live"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Go to Live Feed"
            className="inline-flex items-center gap-1 rounded-full bg-[#b91c1c] hover:bg-[#991b1b] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap transition-colors"
          >
            🎄 Live
          </Link>
        </div>

        {/* Desktop inline nav — strictly single-line with active route state */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0">
          <Link
            href="/live"
            aria-current={isLiveActive ? "page" : undefined}
            className={navLinkClass(isLiveActive)}
          >
            <Radio
              className={`w-3.5 h-3.5 shrink-0 ${isLiveActive ? "text-white" : "text-emerald-600"}`}
              aria-hidden="true"
            />
            Live Feed
          </Link>
          <Link
            href="/specials"
            aria-current={isSpecialsActive ? "page" : undefined}
            className={navLinkClass(isSpecialsActive)}
          >
            <Flame
              className={`w-3.5 h-3.5 shrink-0 ${isSpecialsActive ? "text-white" : "text-[var(--accent-brand)]"}`}
              aria-hidden="true"
            />
            Specials
          </Link>
          <Link
            href="/?type=Deal#feed"
            onClick={(e) => handleFeedFilterNav(e, "Deal")}
            className={navLinkClass(false)}
          >
            <Tag className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" aria-hidden="true" />
            Deals
          </Link>
          <Link
            href="/reviews"
            aria-current={isOriginalsActive ? "page" : undefined}
            className={navLinkClass(isOriginalsActive)}
          >
            <Sparkles
              className={`w-3.5 h-3.5 shrink-0 ${isOriginalsActive ? "text-white" : "text-[var(--accent-brand)]"}`}
              aria-hidden="true"
            />
            Originals
            {ARTICLES.length > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold leading-none ${
                  isOriginalsActive
                    ? "bg-white/25 text-white"
                    : "bg-[var(--accent-brand)] text-white"
                }`}
              >
                {ARTICLES.length}
              </span>
            )}
          </Link>
          <Link
            href="/brands"
            aria-current={isBrandsActive ? "page" : undefined}
            className={navLinkClass(isBrandsActive)}
          >
            <BookOpen
              className={`w-3.5 h-3.5 shrink-0 ${isBrandsActive ? "text-white" : "text-[var(--text-secondary)]"}`}
              aria-hidden="true"
            />
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
              href="/live"
              aria-current={isLiveActive ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass(isLiveActive)}
            >
              <Radio className={`w-4 h-4 ${isLiveActive ? "text-white" : "text-emerald-600"}`} aria-hidden="true" />
              Live Feed
            </Link>
            <Link
              href="/?type=Deal#feed"
              onClick={(e) => handleFeedFilterNav(e, "Deal")}
              className={mobileLinkClass(false)}
            >
              <Tag className="w-4 h-4 text-[#f59e0b]" aria-hidden="true" />
              Deals &amp; Codes
            </Link>
            <Link
              href="/reviews"
              aria-current={isOriginalsActive ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass(isOriginalsActive)}
            >
              <Sparkles className={`w-4 h-4 ${isOriginalsActive ? "text-white" : "text-[var(--accent-brand)]"}`} aria-hidden="true" />
              Originals {ARTICLES.length > 0 ? `(${ARTICLES.length})` : ""}
            </Link>
            <Link
              href="/brands"
              aria-current={isBrandsActive ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass(isBrandsActive)}
            >
              <BookOpen className={`w-4 h-4 ${isBrandsActive ? "text-white" : "text-[var(--text-secondary)]"}`} aria-hidden="true" />
              Brands A–Z Directory
            </Link>
            <Link
              href="/specials"
              aria-current={isSpecialsActive ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass(isSpecialsActive)}
            >
              <Flame className={`w-4 h-4 ${isSpecialsActive ? "text-white" : "text-[#f59e0b]"}`} aria-hidden="true" />
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
