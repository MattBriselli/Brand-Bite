import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, BRANDS } from "@/data/articles";
import { INITIAL_LIVE_FEED } from "@/data/live-feed-types";
import { ArticleComments } from "@/components/ArticleComments";
import { BrandLogo } from "@/components/BrandLogo";
import { CopyableTitle } from "@/components/CopyableTitle";
import { BrandCardBanner } from "@/components/BrandCardBanner";
import { verdictBadgeClasses } from "@/lib/verdict";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ExternalLink,
  Flame,
  MapPin,
  Sparkles,
} from "lucide-react";

interface BrandDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BRANDS.map((brand) => ({
    slug: brand.slug,
  }));
}

export async function generateMetadata({
  params,
}: BrandDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = BRANDS.find((b) => b.slug === slug);
  if (!brand) {
    return { title: "Brand Not Found | BrandBite" };
  }
  const latestWireImage = (INITIAL_LIVE_FEED.items || []).find(
    (item) =>
      (item.brandSlug === brand.slug ||
        (item.crossoverBrandSlugs?.includes(brand.slug) ?? false)) &&
      Boolean(item.image)
  )?.image;
  const previewImage = latestWireImage || "/brandbite-avatar.png";

  return {
    title: `${brand.name} New Menu Items, Limited-Time Drops & News | BrandBite`,
    description: `Track live ${brand.name} limited-time offers, menu launches, and news dispatches on BrandBite. ${brand.description}`,
    alternates: {
      canonical: `/brands/${brand.slug}`,
    },
    openGraph: {
      title: `${brand.name} Menu News & Limited-Time Drops | BrandBite`,
      description: brand.description,
      url: `https://eatbrandbite.com/brands/${brand.slug}`,
      siteName: "BrandBite",
      type: "website",
      images: [
        {
          url: previewImage,
          alt: `${brand.name} menu drops and limited-time items on BrandBite`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${brand.name} Menu News & Limited-Time Drops | BrandBite`,
      description: brand.description,
      images: [previewImage],
    },
  };
}

export default async function BrandDetailPage({ params }: BrandDetailPageProps) {
  const { slug } = await params;
  const brand = BRANDS.find((b) => b.slug === slug);

  if (!brand) {
    notFound();
  }

  const wireItems = (INITIAL_LIVE_FEED.items || []).filter(
    (item) =>
      item.brandSlug === brand.slug ||
      (item.crossoverBrandSlugs?.includes(brand.slug) ?? false)
  );
  const brandReviews = ARTICLES.filter(
    (art) =>
      art.brandSlug === brand.slug ||
      art.tags.includes(brand.slug) ||
      (art.crossoverBrandSlugs?.includes(brand.slug) ?? false)
  );

  const brandJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${brand.name} Menu News & Limited-Time Drops`,
        description: brand.description,
        url: `https://eatbrandbite.com/brands/${brand.slug}`,
        about: {
          "@type": "Organization",
          name: brand.name,
        },
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
            name: "Brands A–Z",
            item: "https://eatbrandbite.com/brands",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: brand.name,
            item: `https://eatbrandbite.com/brands/${brand.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]"
      >
        <Link
          href="/brands"
          className="hover:text-[var(--accent-brand)] inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          All Brands A–Z
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[var(--text-primary)]">{brand.name}</span>
      </nav>

      <header className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] text-[var(--text-primary)]">
            {brand.segment}
          </span>
          <span className="text-xs text-[var(--text-secondary)] inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[var(--accent-brand)]" aria-hidden="true" />
            Headquarters: <strong className="text-[var(--text-primary)]">{brand.headquarters}</strong>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <BrandLogo
            slug={brand.slug}
            name={brand.name}
            accentColor={brand.accentColor}
            size="lg"
          />
          <CopyableTitle
            as="h1"
            href={`/brands/${brand.slug}`}
            className="hero-headline font-black text-[var(--text-primary)]"
          >
            {brand.name} Menu News &amp; Limited-Time Drops
          </CopyableTitle>
        </div>

        <p className="text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
          {brand.description}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--text-primary)] inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-brand)]" aria-hidden="true" />
              Known For:
            </span>{" "}
            {brand.signatureItem}
          </div>

          <Link
            href={`/?brand=${brand.slug}#feed`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--pill-active-bg)] px-4 py-2 text-xs font-bold text-[var(--pill-active-text)] hover:opacity-90 transition-opacity"
          >
            Filter {brand.name} in Full Live Wire
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Live Wire Dispatches for this Brand */}
      <section aria-labelledby="brand-live-wire-heading" className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <h2
            id="brand-live-wire-heading"
            className="section-headline font-black text-[var(--text-primary)]"
          >
            Live {brand.name} Dispatches ({wireItems.length})
          </h2>
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            Live coverage from industry &amp; newsroom feeds
          </span>
        </div>

        {wireItems.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10 text-center space-y-2">
            <p className="text-base font-bold text-[var(--text-primary)]">
              No {brand.name} stories in the current live window yet.
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              We monitor {brand.name} newsrooms and food blogs live — new drops appear here automatically as soon as they break.
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {wireItems.map((item) => {
              const hasImg = Boolean(item.image);
              return (
                <article
                  key={item.id}
                  className={`card ${hasImg ? "has-image" : ""} ${
                    item.isCrossover ? "ring-1 ring-fuchsia-500/35" : ""
                  }`}
                >
                  {hasImg && item.image ? (
                    <img
                      src={item.image}
                      alt={`${item.brand} — ${item.title}`}
                      width={800}
                      height={500}
                      loading="lazy"
                    />
                  ) : (
                    <BrandCardBanner
                      brandSlug={brand.slug}
                      brandName={brand.name}
                      category={item.category}
                    />
                  )}
                  <header className="px-5 pt-4 pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.isCrossover && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider text-[11px] bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-xs">
                            <Sparkles className="w-3 h-3" aria-hidden="true" />
                            Crossover
                          </span>
                        )}
                        <span
                          className="px-2 py-0.5 rounded-md font-bold text-[11px] text-white"
                          style={{ backgroundColor: item.sourceBadgeColor }}
                        >
                          {item.sourceName}
                        </span>
                      </div>
                      <time
                        dateTime={item.publishedAt}
                        className="text-[var(--text-secondary)] font-medium"
                      >
                        {item.publishedFormatted}
                      </time>
                    </div>
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)] leading-snug">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-link hover:text-[var(--accent-brand)] transition-colors"
                      >
                        {item.title}
                      </a>
                    </h3>
                  </header>

                  <div className="px-5 py-2 flex flex-col justify-between gap-3">
                    <p className="snippet text-sm text-[var(--text-secondary)] leading-relaxed">
                      {item.excerpt}
                    </p>
                    <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-3 flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Flame
                          className="w-3.5 h-3.5 text-[var(--accent-brand)]"
                          aria-hidden="true"
                        />
                        {item.category}
                      </span>
                      {item.isCrossover && item.crossoverBrands && item.crossoverBrands.length >= 2 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-fuchsia-700 dark:text-fuchsia-300 truncate max-w-[190px]">
                          <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />
                          <span className="truncate">{item.crossoverBrands.join(" × ")}</span>
                        </span>
                      ) : (
                        <span>{item.type}</span>
                      )}
                    </div>
                  </div>

                  <footer className="px-5 py-3.5 mt-2 border-t border-[var(--border-subtle)] bg-[var(--bg-muted-card)] flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-[var(--text-primary)]">{brand.name}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[var(--accent-brand)] hover:underline inline-flex items-center gap-1"
                    >
                      Read Source
                      <span className="sr-only"> for {item.title}</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Reader Discussion for this Brand */}
      <ArticleComments articleSlug={`brand-${brand.slug}`} />

      {/* Original BrandBite Reviews */}
      {brandReviews.length === 0 ? (
        <section className="rounded-2xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-brand)]">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              Coming Soon
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
              Original {brand.name} Taste Tests &amp; Verdicts
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              First-hand {brand.name} orders, real table photos, price paid, and honest Must Buy / Skip It calls — zero calorie counting, just whether it tastes great.
            </p>
          </div>
          <Link
            href="/reviews"
            className="rounded-xl bg-[#c2410c] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#9a3412] transition-colors"
          >
            See Our 10-Point Rubric
          </Link>
        </section>
      ) : (
        <section aria-labelledby="brand-reviews-heading" className="space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
            <h2
              id="brand-reviews-heading"
              className="section-headline font-black text-[var(--text-primary)]"
            >
              Original {brand.name} Reviews ({brandReviews.length})
            </h2>
            <Link
              href="/reviews"
              className="text-xs font-bold text-[var(--accent-brand)] hover:underline"
            >
              All BrandBite Reviews →
            </Link>
          </div>
          <div className="card-grid">
            {brandReviews.map((art) => (
              <article
                key={art.id}
                className={`card ${art.image ? "has-image" : ""}`}
              >
                {art.image && (
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
                    {art.review && (
                      <span
                        className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${verdictBadgeClasses(
                          art.review.verdict
                        )}`}
                      >
                        {art.review.rating.toFixed(1)}/10 • {art.review.verdict}
                      </span>
                    )}
                    <time
                      dateTime={art.publishedAt}
                      className="text-[var(--text-secondary)] font-medium"
                    >
                      {art.publishedDateFormatted}
                    </time>
                  </div>
                  <h3 className="text-lg font-extrabold text-[var(--text-primary)] leading-snug">
                    <Link
                      href={`/reviews/${art.slug}`}
                      className="card-link hover:text-[var(--accent-brand)] transition-colors"
                    >
                      {art.title}
                    </Link>
                  </h3>
                </header>
                <div className="px-5 py-2">
                  <p className="snippet text-sm text-[var(--text-secondary)] leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
                <footer className="px-5 py-3.5 mt-2 border-t border-[var(--border-subtle)] bg-[var(--bg-muted-card)] flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[var(--text-primary)]">
                    {art.review?.pricePaid || brand.name}
                  </span>
                  <Link
                    href={`/reviews/${art.slug}`}
                    className="font-bold text-[var(--accent-brand)] hover:underline inline-flex items-center gap-1"
                  >
                    Read Full Verdict
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </footer>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
