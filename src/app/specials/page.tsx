import React from "react";
import type { Metadata } from "next";
import { SpecialsOnNow } from "@/components/SpecialsOnNow";
import { WeeklyBiteSignup } from "@/components/WeeklyBiteSignup";

export const metadata: Metadata = {
  title: "Specials On Now — Weekly Rotating Cookies, Bagels & Ice Cream | BrandBite",
  description:
    "Track weekly rotating menus from Crumbl, PopUp Bagels, Chip City, Insomnia Cookies, Dirty Dough, Salt & Straw, Jeni's, and Krispy Kreme — vote I Tried It or Want to Try and join the discussion.",
  alternates: {
    canonical: "/specials",
  },
  openGraph: {
    title: "Specials On Now — Weekly Rotating Cookies, Bagels & Ice Cream | BrandBite",
    description:
      "Glanceable tracker for weekly rotating menus from Crumbl, PopUp Bagels, Chip City, Insomnia Cookies, Salt & Straw, and more.",
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
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      <SpecialsOnNow />
      <WeeklyBiteSignup placement="home_banner" />
    </div>
  );
}
