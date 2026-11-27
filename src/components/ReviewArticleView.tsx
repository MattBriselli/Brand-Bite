"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flame,
  MapPin,
  Receipt,
  Star,
  XCircle,
} from "lucide-react";
import type { Article } from "@/data/articles";
import { verdictBadgeClasses } from "@/lib/verdict";
import { trackReviewRead } from "@/lib/analytics";
import { WeeklyBiteSignup } from "@/components/WeeklyBiteSignup";

interface ReviewArticleViewProps {
  article: Article;
}

export function ReviewArticleView({ article }: ReviewArticleViewProps) {
  useEffect(() => {
    trackReviewRead({
      slug: article.slug,
      brandSlug: article.brandSlug,
      rating: article.review?.rating,
      verdict: article.review?.verdict,
    });
  }, [article.slug, article.brandSlug, article.review?.rating, article.review?.verdict]);

  const jsonLd = article.review
    ? {
        "@context": "https://schema.org",
        "@type": "Review",
        name: article.title,
        headline: article.title,
        description: article.excerpt,
        datePublished: article.publishedAt,
        ...(article.image
          ? {
              image: article.image.startsWith("http")
                ? article.image
                : `https://eatbrandbite.com${article.image}`,
            }
          : {}),
        author: {
          "@type": "Person",
          name: article.author || "Matt",
        },
        publisher: {
          "@type": "Organization",
          name: "BrandBite",
          url: "https://eatbrandbite.com",
        },
        itemReviewed: {
          "@type": "Product",
          name: article.title,
          brand: {
            "@type": "Brand",
            name: article.brand,
          },
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: article.review.rating,
          bestRating: 10,
          worstRating: 1,
        },
      }
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]"
      >
        <Link href="/" className="hover:text-[var(--accent-brand)]">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href="/reviews"
          className="hover:text-[var(--accent-brand)] inline-flex items-center gap-1"
        >
          Original Reviews
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/brands/${article.brandSlug}`}
          className="hover:text-[var(--accent-brand)]"
        >
          {article.brand}
        </Link>
      </nav>

      <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-clip shadow-xs">
        {article.image && (
          <img
            src={article.image}
            alt={article.imageAlt}
            width={1200}
            height={750}
            fetchPriority="high"
            className="w-full aspect-[16/10] object-cover border-b border-[var(--border-subtle)]"
          />
        )}

        <div className="p-6 sm:p-10 space-y-8">
          <header className="space-y-4 border-b border-[var(--border-subtle)] pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-md bg-[#c2410c] px-2.5 py-1 text-white uppercase tracking-wider">
                BrandBite Original {article.type}
              </span>
              <Link
                href={`/brands/${article.brandSlug}`}
                className="rounded-md bg-[var(--bg-subtle)] px-2.5 py-1 text-[var(--text-primary)] hover:opacity-85 transition-opacity"
              >
                {article.brand}
              </Link>
              <span className="inline-flex items-center gap-1 text-[var(--text-secondary)] font-semibold">
                <Flame
                  className="w-3.5 h-3.5 text-[var(--accent-brand)]"
                  aria-hidden="true"
                />
                {article.category}
              </span>
              <span className="text-[var(--text-secondary)] font-medium">
                • {article.publishedDateFormatted} • By {article.author}
              </span>
            </div>

            <h1 className="hero-headline font-black text-[var(--text-primary)]">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                {article.subtitle}
              </p>
            )}
          </header>

          {/* 10-Point Craveability Scorecard (Zero Calorie Counting) */}
          {article.review && (
            <section
              aria-label="Craveability Verdict Scorecard"
              className="rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-muted-card)] p-5 sm:p-6 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] px-4 py-3 text-center min-w-[84px]">
                    <span className="block text-2xl sm:text-3xl font-black leading-none">
                      {article.review.rating.toFixed(1)}
                    </span>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider opacity-80 mt-1">
                      Out of 10
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${verdictBadgeClasses(
                        article.review.verdict
                      )}`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      {article.review.verdict}
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                      First-Hand BrandBite Craveability Verdict
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--text-secondary)]">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2 text-[var(--text-primary)]">
                    <Receipt
                      className="w-3.5 h-3.5 text-[var(--accent-brand)]"
                      aria-hidden="true"
                    />
                    Price Paid: <strong>{article.review.pricePaid}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2 text-[var(--text-primary)]">
                    <MapPin
                      className="w-3.5 h-3.5 text-[var(--accent-brand)]"
                      aria-hidden="true"
                    />
                    {article.review.availability}
                  </span>
                </div>
              </div>

              {(article.review.pros.length > 0 ||
                article.review.cons.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 space-y-2">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      What Hits
                    </h2>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--text-primary)]">
                      {article.review.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">+</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 space-y-2">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" aria-hidden="true" />
                      What Misses
                    </h2>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--text-primary)]">
                      {article.review.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-500 font-bold">–</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Editorial Body */}
          <div className="space-y-5 text-base text-[var(--text-primary)] leading-relaxed">
            {article.body.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {article.tags.length > 0 && (
            <footer className="pt-6 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
              <div className="tag-list">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-[var(--bg-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <Link
                href={`/brands/${article.brandSlug}`}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--accent-brand)] hover:underline"
              >
                More {article.brand} Coverage
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </footer>
          )}
        </div>
      </article>

      <div className="flex items-center justify-between gap-4">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          All Original Reviews
        </Link>
        <Link
          href="/#feed"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--accent-brand)] hover:underline"
        >
          Browse Live Fast-Food Wire
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      <WeeklyBiteSignup placement="home_banner" />
    </div>
  );
}
