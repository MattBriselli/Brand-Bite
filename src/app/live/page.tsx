import React, { Suspense } from "react";
import type { Metadata } from "next";
import { HomeFeed } from "@/components/HomeFeed";

export const metadata: Metadata = {
  title: "Live Fast-Food & Snack Feed + RSS | BrandBite",
  description:
    "Focused live stream of fast-food menu launches, limited-time offers, drive-thru deals, and grocery snack drops across hundreds of brands — also available via RSS at /live.xml.",
  alternates: {
    canonical: "/live",
    types: {
      "application/rss+xml": "https://eatbrandbite.com/live.xml",
    },
  },
  openGraph: {
    title: "Live Fast-Food & Snack Feed | BrandBite",
    description:
      "Real-time fast-food menu drops, deals, and packaged snack releases across hundreds of brands.",
    url: "https://eatbrandbite.com/live",
    siteName: "BrandBite",
    type: "website",
    images: [
      {
        url: "/brandbite-avatar.png",
        width: 1024,
        height: 1024,
        alt: "BrandBite Live Feed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Fast-Food & Snack Feed | BrandBite",
    description:
      "Real-time fast-food menu drops, deals, and packaged snack releases across hundreds of brands.",
    images: ["/brandbite-avatar.png"],
  },
};

export default function LiveFeedPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "BrandBite Live Fast-Food & Snack Feed",
    url: "https://eatbrandbite.com/live",
    description:
      "Live curated wire of fast-food menu drops, limited-time items, deals, and packaged snack launches.",
    isPartOf: { "@id": "https://eatbrandbite.com/#website" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense
        fallback={
          <div
            data-loading-fallback="true"
            className="max-w-7xl mx-auto px-4 py-12 min-h-screen text-sm text-[var(--text-secondary)]"
          >
            Loading Live Feed...
          </div>
        }
      >
        <HomeFeed liveOnly />
      </Suspense>
    </>
  );
}
