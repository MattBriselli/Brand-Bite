import React, { Suspense } from "react";
import type { Metadata } from "next";
import { BRANDS } from "@/data/articles";
import { BrandsDirectoryClient } from "@/components/BrandsDirectoryClient";

export const metadata: Metadata = {
  title: `Brands A–Z Directory | ${BRANDS.length} Fast Food & Snack Chains | BrandBite`,
  description: `Browse ${BRANDS.length} fast-food chains, coffee shops, grocery favorites, and packaged snack makers tracked live on BrandBite.`,
  alternates: {
    canonical: "/brands",
  },
  openGraph: {
    title: `Brands A–Z Directory | ${BRANDS.length} Fast Food & Snack Chains | BrandBite`,
    description: `Browse ${BRANDS.length} fast-food chains, coffee shops, grocery favorites, and packaged snack makers tracked live on BrandBite.`,
    url: "https://eatbrandbite.com/brands",
    siteName: "BrandBite",
    type: "website",
    images: [
      {
        url: "/brandbite-avatar.png",
        width: 1024,
        height: 1024,
        alt: "BrandBite Brands A–Z Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Brands A–Z Directory | ${BRANDS.length} Fast Food & Snack Chains | BrandBite`,
    description: `Browse ${BRANDS.length} fast-food chains, coffee shops, grocery favorites, and packaged snack makers tracked live on BrandBite.`,
    images: ["/brandbite-avatar.png"],
  },
};

export default function BrandsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-sm text-[var(--text-secondary)]">
          Loading Brands A–Z Directory...
        </div>
      }
    >
      <BrandsDirectoryClient />
    </Suspense>
  );
}
