import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, BRANDS } from "@/data/articles";
import { NutritionFactsCard } from "@/components/NutritionFactsCard";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  XCircle,
  Star,
  Tag,
  User,
} from "lucide-react";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const brandInfo = BRANDS.find((b) => b.slug === article.brandSlug);
  const relatedArticles = ARTICLES.filter(
    (a) =>
      a.id !== article.id &&
      (a.brandSlug === article.brandSlug || a.category === article.category)
  ).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Sample Content Disclaimer */}
      <div role="status" className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-center text-sm font-bold text-amber-900">
        ⚠️ This is <u>fabricated placeholder content</u> for demonstration purposes only. The review text, scores, nutrition facts, prices, and bylines are not real.
      </div>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#575049]">
        <Link href="/" className="hover:text-[#c2410c] inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          All Dispatches
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/?brand=${article.brandSlug}#feed`}
          className="hover:text-[#c2410c]"
        >
          {article.brand}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#181512] truncate max-w-xs sm:max-w-md">
          {article.title}
        </span>
      </nav>

      {/* Main Article & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article className="lg:col-span-8 space-y-8">
          <header className="space-y-4 border-b border-[#e5dfd5] pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-md bg-[#c2410c] px-2.5 py-1 text-white uppercase tracking-wider">
                {article.type}
              </span>
              <Link
                href={`/?brand=${article.brandSlug}#feed`}
                className="rounded-md bg-[#f3efe9] px-2.5 py-1 text-[#181512] hover:bg-[#e5dfd5] transition-colors"
              >
                {article.brand}
              </Link>
              <span className="rounded-md border border-[#e5dfd5] bg-white px-2.5 py-1 text-[#575049]">
                {article.category}
              </span>
            </div>

            <h1 className="hero-headline font-black text-[#181512]">
              {article.title}
            </h1>

            <p className="text-lg text-[#575049] font-medium leading-relaxed">
              {article.subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-[#575049]">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#181512]">
                  <User className="w-3.5 h-3.5 text-[#c2410c]" aria-hidden="true" />
                  By {article.author}
                </span>
                <time
                  dateTime={article.publishedAt}
                  className="inline-flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  {article.publishedDateFormatted}
                </time>
              </div>

              {article.ltoEndDate && (
                <span className="inline-flex items-center gap-1.5 font-bold text-[#9a3412] bg-[#fff7ed] border border-[#fed7aa] px-3 py-1 rounded-lg">
                  Available Through: {article.ltoEndDate}
                </span>
              )}
            </div>
          </header>

          {/* Hero Figure with Caption */}
          <figure className="rounded-2xl overflow-clip border border-[#e5dfd5] bg-white shadow-xs">
            <img
              src={article.image}
              alt={article.imageAlt}
              width={800}
              height={500}
              fetchPriority="high"
              className="block w-full h-auto aspect-16/10 object-cover"
            />
            <figcaption className="px-5 py-3 text-xs text-[#575049] bg-[#faf8f5] border-t border-[#e5dfd5]">
              {article.imageAlt} • <strong>[SAMPLE]</strong> Placeholder illustration — not a real product photo.
            </figcaption>
          </figure>

          {/* Deal Code Callout if Deal */}
          {article.dealCode && (
            <div className="rounded-2xl border-2 border-emerald-700 bg-emerald-50 p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                  Active Promo Code / Offer
                </span>
                <p className="text-sm font-semibold text-emerald-950 mt-0.5">
                  Use this code in the official {article.brand} app or at participating registers:
                </p>
              </div>
              <code className="px-4 py-2 rounded-xl bg-white border border-emerald-300 font-mono text-base font-black text-emerald-900">
                {article.dealCode}
              </code>
            </div>
          )}

          {/* Editorial Body Copy */}
          <div className="space-y-5 text-base text-[#181512] leading-relaxed">
            {article.body.map((paragraph, index) => (
              <p key={index} className="leading-7">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Structured Review Scorecard (Pros, Cons, Verdict) */}
          {article.review && (
            <section
              aria-labelledby="verdict-card-heading"
              className="rounded-2xl border-2 border-[#181512] bg-white p-6 sm:p-8 space-y-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5dfd5] pb-5">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#c2410c]">
                    BrandBite Sample Verdict (Not Real)
                  </span>
                  <h2
                    id="verdict-card-heading"
                    className="text-2xl font-black text-[#181512] mt-1"
                  >
                    {article.title.replace(/^Review:\s*/, "")}
                  </h2>
                </div>

                <div className="flex items-center gap-3 bg-[#fff7ed] border border-[#fed7aa] px-4 py-3 rounded-2xl">
                  <Star className="w-7 h-7 fill-[#c2410c] text-[#c2410c]" aria-hidden="true" />
                  <div>
                    <span className="block text-2xl font-black text-[#181512] leading-none">
                      {article.review.rating.toFixed(1)}{" "}
                      <span className="text-sm font-bold text-[#575049]">/ 10</span>
                    </span>
                    <span className="block text-xs font-extrabold uppercase tracking-wider text-[#c2410c] mt-0.5">
                      {article.review.verdict}
                    </span>
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#faf8f5] rounded-xl p-4 border border-[#e5dfd5] text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#575049]">
                    Price Paid
                  </dt>
                  <dd className="font-extrabold text-[#181512] mt-0.5">
                    {article.review.pricePaid}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#575049]">
                    Release &amp; Availability
                  </dt>
                  <dd className="font-semibold text-[#181512] mt-0.5">
                    {article.review.availability}
                  </dd>
                </div>
              </dl>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    The Good (Pros)
                  </h3>
                  <ul className="space-y-2 text-sm text-[#181512]">
                    {article.review.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" aria-hidden="true" />
                    The Drawbacks (Cons)
                  </h3>
                  <ul className="space-y-2 text-sm text-[#181512]">
                    {article.review.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-700 font-bold">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Article Tags */}
          <footer className="pt-4 border-t border-[#e5dfd5] flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#575049] inline-flex items-center gap-1 mr-1">
              <Tag className="w-3.5 h-3.5" aria-hidden="true" />
              Filed Under:
            </span>
            <div className="tag-list">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?brand=${article.brandSlug}#feed`}
                  className="px-3 py-1 rounded-lg bg-[#f3efe9] hover:bg-[#e5dfd5] text-xs font-semibold text-[#181512] transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </footer>
        </article>

        {/* Right Sidebar: Nutrition Facts + Brand Profile Card */}
        <aside className="lg:col-span-4 space-y-6">
          {article.review && (
            <NutritionFactsCard
              itemName={article.title.replace(/^(Review|Limited-Time Offer):\s*/, "")}
              nutrition={article.review.nutrition}
            />
          )}

          {brandInfo && (
            <section
              aria-labelledby="sidebar-brand-heading"
              className="rounded-2xl border border-[#e5dfd5] bg-white p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#c2410c]">
                  Chain / Brand Dossier
                </span>
                <span className="text-xs font-semibold text-[#575049]">
                  {brandInfo.segment}
                </span>
              </div>
              <h2
                id="sidebar-brand-heading"
                className="text-xl font-black text-[#181512]"
              >
                {brandInfo.name}
              </h2>
              <p className="text-sm text-[#575049] leading-relaxed">
                {brandInfo.description}
              </p>
              <dl className="text-xs space-y-1.5 pt-2 border-t border-[#e5dfd5]">
                <div className="flex justify-between">
                  <dt className="text-[#575049]">Headquarters:</dt>
                  <dd className="font-bold text-[#181512]">{brandInfo.headquarters}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#575049]">Known For:</dt>
                  <dd className="font-bold text-[#181512] text-right">
                    {brandInfo.signatureItem}
                  </dd>
                </div>
              </dl>
              <div className="pt-2">
                <Link
                  href={`/?brand=${brandInfo.slug}#feed`}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#181512] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#c2410c] transition-colors"
                >
                  Browse All {brandInfo.name} Coverage
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </section>
          )}
        </aside>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section
          aria-labelledby="related-heading"
          className="pt-8 border-t border-[#e5dfd5] space-y-6"
        >
          <h2 id="related-heading" className="section-headline font-black text-[#181512]">
            More Fast Food &amp; Snack Dispatches You Might Like
          </h2>

          <div className="card-grid">
            {relatedArticles.map((rel) => (
              <article key={rel.id} className="card">
                <img
                  src={rel.image}
                  alt={rel.imageAlt}
                  width={800}
                  height={500}
                  loading="lazy"
                />
                <header className="px-5 pt-4 pb-2">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#c2410c] uppercase">
                      {rel.brand} • {rel.type}
                    </span>
                    <time dateTime={rel.publishedAt} className="text-[#575049]">
                      {rel.publishedDateFormatted}
                    </time>
                  </div>
                  <h3 className="text-base font-extrabold text-[#181512] leading-snug">
                    <Link
                      href={`/articles/${rel.slug}`}
                      className="card-link hover:text-[#c2410c]"
                    >
                      {rel.title}
                    </Link>
                  </h3>
                </header>
                <div className="px-5 py-2">
                  <p className="snippet text-sm text-[#575049]">{rel.excerpt}</p>
                </div>
                <footer className="px-5 py-3 border-t border-[#f3efe9] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#575049]">{rel.category}</span>
                  <Link
                    href={`/articles/${rel.slug}`}
                    className="font-bold text-[#c2410c] inline-flex items-center gap-1"
                  >
                    Read more
                    <span className="sr-only"> about {rel.title}</span>
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
