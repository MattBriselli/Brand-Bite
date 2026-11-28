import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Clock,
  Flame,
  Receipt,
  Sparkles,
  Star,
  ThumbsUp,
} from "lucide-react";
import { ARTICLES } from "@/data/articles";
import { CopyableTitle } from "@/components/CopyableTitle";
import { verdictBadgeClasses } from "@/lib/verdict";

export const metadata: Metadata = {
  title: "Original Fast Food & Snack Taste Tests & Roundups | BrandBite",
  description:
    "Original BrandBite seasonal roundups, first-hand taste tests, real table photos, exact retail prices paid, and 10-point Craveability Verdicts.",
  alternates: {
    canonical: "/reviews",
  },
  openGraph: {
    title: "Original Fast Food & Snack Taste Tests & Roundups | BrandBite",
    description:
      "Original BrandBite seasonal roundups, first-hand taste tests, and 10-point Craveability Verdicts.",
    url: "https://eatbrandbite.com/reviews",
    siteName: "BrandBite",
    type: "website",
    images: [
      {
        url: ARTICLES[0]?.image || "/brandbite-avatar.png",
        width: 1080,
        height: 1080,
        alt: ARTICLES[0]?.imageAlt || "BrandBite Originals & Taste Tests",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Original Fast Food & Snack Taste Tests & Roundups | BrandBite",
    description:
      "Original BrandBite seasonal roundups, first-hand taste tests, and 10-point Craveability Verdicts.",
    images: [ARTICLES[0]?.image || "/brandbite-avatar.png"],
  },
};

const RUBRIC_TIERS = [
  {
    range: "9.0 – 10.0",
    verdict: "Must Buy" as const,
    summary: "Drop everything and hit the drive-thru or snack aisle before this limited-time drop disappears.",
  },
  {
    range: "7.5 – 8.9",
    verdict: "Worth Trying" as const,
    summary: "Delivers on the promo hype and justifies the price tag — easy recommendation.",
  },
  {
    range: "6.0 – 7.4",
    verdict: "Solid Pick" as const,
    summary: "Scratching a specific craving well, even if it doesn't dethrone the regular menu.",
  },
  {
    range: "4.0 – 5.9",
    verdict: "Mixed Bag" as const,
    summary: "Good idea on paper, uneven execution in the bag or wrapper.",
  },
  {
    range: "1.0 – 3.9",
    verdict: "Skip It" as const,
    summary: "Save your appetite and order a classic instead.",
  },
];

export default function ReviewsIndexPage() {
  const sortedReviews = [...ARTICLES].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <header className="space-y-3 border-b border-[var(--border-subtle)] pb-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[var(--accent-brand)]">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          In-House Editorial • First-Hand Taste Tests
        </span>
        <CopyableTitle
          as="h1"
          href="/reviews"
          className="hero-headline font-black text-[var(--text-primary)]"
        >
          BrandBite Original Reviews &amp; Verdicts
        </CopyableTitle>
        <p className="text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
          Unedited photos of what actually comes out of the bag, exact prices paid, and honest 10-point Craveability Verdicts — never AI-fabricated and zero calorie counting.
        </p>
      </header>

      {sortedReviews.length === 0 ? (
        <section className="rounded-2xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-strong)] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-brand)]">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              First Taste Tests Coming Soon
            </span>
            <h2 className="section-headline font-black text-[var(--text-primary)]">
              Zero Fake Reviews — Ever.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Every review on this page is written only after buying and eating the real menu item or packaged snack in person. While our first batch of hands-on taste tests is in the works, here is how we score every item:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                <Camera className="w-4 h-4 text-[var(--accent-brand)]" aria-hidden="true" />
                Real Bag &amp; Box Photos
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                No studio food-stylist press renders — you see what actually gets handed through the window.
              </p>
            </div>
            <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                <Receipt className="w-4 h-4 text-[var(--accent-brand)]" aria-hidden="true" />
                Exact Price Paid
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Real register price paid so you know whether a limited-time offer actually feels worth the money.
              </p>
            </div>
            <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                <ThumbsUp className="w-4 h-4 text-[var(--accent-brand)]" aria-hidden="true" />
                Pure Craveability
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Flavor, crunch, sauce ratio, and repeat-order factor — life&apos;s too short for nutrition panels.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
              The 10-Point BrandBite Verdict Scale
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {RUBRIC_TIERS.map((tier) => (
                <div
                  key={tier.verdict}
                  className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-[var(--text-primary)]">
                      {tier.range}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${verdictBadgeClasses(
                        tier.verdict
                      )}`}
                    >
                      {tier.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {tier.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/#feed"
              className="inline-flex items-center gap-2 rounded-xl bg-[#c2410c] px-6 py-3 text-sm font-bold text-white hover:bg-[#9a3412] transition-colors"
            >
              Browse Live Fast-Food &amp; Snack Feed
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      ) : (
        <div className="card-grid">
          {sortedReviews.map((art) => {
            const hasImg = Boolean(art.image);
            return (
              <article
                key={art.id}
                className={`card ${hasImg ? "has-image" : ""}`}
              >
                {hasImg && art.image && (
                  <img
                    src={art.image}
                    alt={art.imageAlt}
                    width={800}
                    height={500}
                    loading="lazy"
                  />
                )}
                <header className="px-5 pt-4 pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                    <div className="flex items-center gap-1.5">
                      {art.review && (
                        <span
                          className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] inline-flex items-center gap-1 ${verdictBadgeClasses(
                            art.review.verdict
                          )}`}
                        >
                          <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                          {art.review.rating.toFixed(1)}/10 • {art.review.verdict}
                        </span>
                      )}
                    </div>
                    <time
                      dateTime={art.publishedAt}
                      className="text-[var(--text-secondary)] font-medium"
                    >
                      {art.publishedDateFormatted}
                    </time>
                  </div>
                  <h2 className="text-lg font-extrabold text-[var(--text-primary)] leading-snug">
                    <Link
                      href={`/reviews/${art.slug}`}
                      className="card-link hover:text-[var(--accent-brand)] transition-colors"
                    >
                      {art.title}
                    </Link>
                  </h2>
                </header>

                <div className="px-5 py-2 flex flex-col justify-between gap-3">
                  <p className="snippet text-sm text-[var(--text-secondary)] leading-relaxed">
                    {art.excerpt}
                  </p>
                  <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-3 flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Flame
                        className="w-3.5 h-3.5 text-[var(--accent-brand)]"
                        aria-hidden="true"
                      />
                      {art.category}
                    </span>
                    {art.review && (
                      <span className="font-bold text-[var(--text-primary)]">
                        {art.review.pricePaid}
                      </span>
                    )}
                  </div>
                </div>

                <footer className="px-5 py-3.5 mt-2 border-t border-[var(--border-subtle)] bg-[var(--bg-muted-card)] flex items-center justify-between gap-2 text-xs">
                  <Link
                    href={`/brands/${art.brandSlug}`}
                    className="font-bold text-[var(--text-primary)] bg-[var(--bg-subtle)] hover:opacity-85 px-2.5 py-1 rounded-md transition-opacity"
                  >
                    {art.brand}
                  </Link>
                  <Link
                    href={`/reviews/${art.slug}`}
                    className="font-bold text-[var(--accent-brand)] hover:underline inline-flex items-center gap-1"
                  >
                    Read Full Verdict
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      )}

      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5 max-w-2xl">
          <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
            Press Releases &amp; Newsroom Tips
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Announcing a limited-time menu drop, regional test item, or seasonal grocery launch? Send press releases, launch dates, and newsroom inquiries directly to our editorial desk.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="mailto:hello@eatbrandbite.com?subject=BrandBite%20Press%20%2F%20Launch%20Tip"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] px-4 py-2 text-xs font-bold text-white transition-colors"
          >
            hello@eatbrandbite.com
          </a>
          <Link
            href="/press"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted-card)] hover:bg-[var(--bg-subtle)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] transition-colors"
          >
            Press &amp; Brand Desk →
          </Link>
        </div>
      </section>
    </div>
  );
}
