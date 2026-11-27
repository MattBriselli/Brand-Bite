import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { ARTICLES } from "@/data/articles";
import { ReviewArticleView } from "@/components/ReviewArticleView";

interface ReviewDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  if (ARTICLES.length === 0) {
    // Required placeholder param for Next.js static export while ARTICLES is empty; marked noindex.
    return [{ slug: "coming-soon" }];
  }
  return ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ReviewDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: "Original Reviews Coming Soon | BrandBite",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `${article.title} (${article.review ? `${article.review.rating.toFixed(1)}/10` : "Review"}) | BrandBite`,
    description: article.excerpt,
    alternates: {
      canonical: `/reviews/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `/reviews/${article.slug}`,
      type: "article",
      ...(article.image ? { images: [article.image] } : {}),
    },
  };
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    if (slug === "coming-soon" && ARTICLES.length === 0) {
      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <section className="rounded-2xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 sm:p-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-brand)]">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              Coming Soon
            </span>
            <h1 className="section-headline font-black text-[var(--text-primary)]">
              First Original BrandBite Reviews Are Coming Soon
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              We never publish fabricated food reviews or AI-generated tasting scores. Check out our scoring rubric or browse 160+ live fast-food &amp; snack dispatches.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#c2410c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#9a3412] transition-colors"
              >
                See Our 10-Point Verdict Scale
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      );
    }
    notFound();
  }

  return <ReviewArticleView article={article} />;
}
