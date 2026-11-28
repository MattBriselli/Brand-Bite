import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { INITIAL_LIVE_FEED } from "@/data/live-feed-types";
import { CopyableTitle } from "@/components/CopyableTitle";
import { BrandDispatchesClient } from "@/components/BrandDispatchesClient";

export const metadata: Metadata = {
  title: "Fast Food & Snack Brand Crossovers & Collabs | BrandBite",
  description:
    "Track the latest fast-food and snack aisle brand crossovers, mashups, and limited-time collaborations — from cereal and candy pairings to restaurant pop-culture menus.",
  alternates: {
    canonical: "/crossovers",
  },
  openGraph: {
    title: "Fast Food & Snack Brand Crossovers & Collabs | BrandBite",
    description:
      "Every live fast-food and snack brand crossover, mashup, and limited-time collaboration tracked in one place on BrandBite.",
    url: "https://eatbrandbite.com/crossovers",
    siteName: "BrandBite",
    type: "website",
    images: [
      {
        url: "/brandbite-avatar.png",
        width: 1024,
        height: 1024,
        alt: "BrandBite Brand Crossovers & Collabs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fast Food & Snack Brand Crossovers & Collabs | BrandBite",
    description:
      "Every live fast-food and snack brand crossover, mashup, and limited-time collaboration tracked on BrandBite.",
    images: ["/brandbite-avatar.png"],
  },
};

export default function CrossoversPage() {
  const crossoverItems = (INITIAL_LIVE_FEED.items || []).filter(
    (item) => item.isCrossover
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "BrandBite Brand Crossovers & Collabs",
        description:
          "Live tracker of fast-food and packaged snack brand crossovers, flavor mashups, and limited-time collaborations.",
        url: "https://eatbrandbite.com/crossovers",
        isPartOf: { "@id": "https://eatbrandbite.com/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://eatbrandbite.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Brand Crossovers",
            item: "https://eatbrandbite.com/crossovers",
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="rounded-2xl border border-fuchsia-500/30 bg-[var(--bg-surface)] p-6 sm:p-8 shadow-xs space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          Brand Crossovers • Updated Live
        </span>
        <CopyableTitle
          as="h1"
          href="/crossovers"
          className="hero-headline font-black text-[var(--text-primary)]"
        >
          Brand Crossovers &amp; Collabs ({crossoverItems.length})
        </CopyableTitle>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
          Two iconic brands, one limited-time drop — from candy-meets-cookie mashups and cereal collabs to drive-thru pop-culture menus. Tap any card to upvote or join the discussion.
        </p>
        <div className="pt-1 flex flex-wrap items-center gap-3">
          <Link
            href="/live"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--pill-active-bg)] px-4 py-2 text-xs font-bold text-[var(--pill-active-text)] hover:opacity-90 transition-opacity"
          >
            Browse Full Live Feed
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
          <Link
            href="/specials"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted-card)] hover:bg-[var(--bg-subtle)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] transition-colors"
          >
            Specials On Now
          </Link>
        </div>
      </header>

      <BrandDispatchesClient
        brandSlug="crossovers"
        brandName="Brand Crossovers"
        items={crossoverItems}
      />
    </div>
  );
}
