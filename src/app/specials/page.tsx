import React from "react";
import type { Metadata } from "next";
import { SpecialsOnNow } from "@/components/SpecialsOnNow";
import { WEEKLY_SPECIALS } from "@/data/weekly-specials";

export const metadata: Metadata = {
  title: "Specials On Now — Weekly Rotating Cookies, Bagels & Ice Cream | BrandBite",
  description:
    "Track weekly rotating menus from Crumbl, PopUp Bagels, Trader Joe's, Insomnia Cookies, Dirty Dough, Salt & Straw, Jeni's, and Krispy Kreme — vote I Tried It or Want to Try and join the discussion.",
  alternates: {
    canonical: "/specials",
  },
  openGraph: {
    title: "Specials On Now — Weekly Rotating Cookies, Bagels & Ice Cream | BrandBite",
    description:
      "Glanceable tracker for weekly rotating menus from Crumbl, PopUp Bagels, Trader Joe's, Insomnia Cookies, Salt & Straw, and more.",
    url: "https://eatbrandbite.com/specials",
    siteName: "BrandBite",
    type: "website",
    images: [
      {
        url: "/brandbite-avatar.png",
        width: 1024,
        height: 1024,
        alt: "BrandBite Specials On Now",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Specials On Now — Weekly Rotating Drops | BrandBite",
    description:
      "Weekly cookie drops, rotating bagel schmears, and seasonal scoops on menus right now.",
    images: ["/brandbite-avatar.png"],
  },
};

export default function SpecialsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "BrandBite Specials On Now — Weekly & Monthly Rotating Food Menus",
        url: "https://eatbrandbite.com/specials",
        numberOfItems: WEEKLY_SPECIALS.length,
        itemListElement: WEEKLY_SPECIALS.map((s, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: `${s.brand}: ${s.headline}`,
          description: s.flavors?.length
            ? `${s.flavors.join(", ")} — ${s.summary}`
            : s.summary,
          url: s.menuUrl,
        })),
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
            name: "Specials On Now",
            item: "https://eatbrandbite.com/specials",
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SpecialsOnNow />
    </div>
  );
}
