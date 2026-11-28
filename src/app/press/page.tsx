import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  ExternalLink,
  Newspaper,
  Camera,
  Sparkles,
  Globe,
  ArrowRight,
} from "lucide-react";
import { BRANDS } from "@/data/articles";
import { INITIAL_LIVE_FEED } from "@/data/live-feed-types";
import { CopyableTitle } from "@/components/CopyableTitle";
import { SOCIAL_PROFILES } from "@/data/socials";

export const metadata: Metadata = {
  title: "Press & Brand Newsroom Inquiries | BrandBite",
  description:
    "Contact the BrandBite editorial desk for fast-food launch announcements, CPG snack releases, press releases, and brand media inquiries.",
  alternates: {
    canonical: "/press",
  },
  openGraph: {
    title: "Press & Brand Newsroom Inquiries | BrandBite",
    description:
      "Contact the BrandBite editorial desk at hello@eatbrandbite.com for fast-food launch announcements, CPG snack releases, and brand media inquiries.",
    url: "https://eatbrandbite.com/press",
    siteName: "BrandBite",
    type: "website",
    images: [
      {
        url: "/brandbite-avatar.png",
        width: 1024,
        height: 1024,
        alt: "BrandBite Press & Brand Newsroom",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Press & Brand Newsroom Inquiries | BrandBite",
    description:
      "Contact the BrandBite editorial desk at hello@eatbrandbite.com for fast-food launch announcements, CPG snack releases, and brand media inquiries.",
    images: ["/brandbite-avatar.png"],
  },
};

export default function PressPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-xs space-y-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-brand)]">
          <Newspaper className="w-3.5 h-3.5" aria-hidden="true" />
          Press &amp; Brand Relations
        </span>
        <CopyableTitle
          as="h1"
          href="/press"
          className="hero-headline font-black text-[var(--text-primary)]"
        >
          BrandBite Editorial &amp; Newsroom Desk
        </CopyableTitle>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          BrandBite covers limited-time restaurant menus, fast-food launches, and packaged grocery &amp; convenience snack releases across hundreds of national and regional brands.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href="mailto:hello@eatbrandbite.com?subject=Brand%20%2F%20Press%20Inquiry%20%E2%80%94%20BrandBite"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-brand)] hover:opacity-90 px-5 py-3 text-sm font-bold text-white transition-opacity"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            hello@eatbrandbite.com
          </a>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted-card)] hover:bg-[var(--bg-subtle)] px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition-colors"
          >
            Editorial Rubric
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-brand)]">
            <Globe className="w-4 h-4" aria-hidden="true" />
            Live Coverage
          </div>
          <p className="text-lg font-black text-[var(--text-primary)]">
            Hundreds of Brands &amp; {INITIAL_LIVE_FEED.sources.length} Live Feeds
          </p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Dedicated brand hubs and a live menu &amp; snack feed updated continuously, plus our ad-free Friday newsletter, <em>The Weekly Bite</em>.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-brand)]">
            <Camera className="w-4 h-4" aria-hidden="true" />
            Original Coverage
          </div>
          <p className="text-lg font-black text-[var(--text-primary)]">
            First-Hand Taste Tests
          </p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            High-resolution original photography, clear launch dates, regional availability notes, and our 10-point Craveability Verdict scale.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-brand)]">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            Cross-Platform Distribution
          </div>
          <p className="text-lg font-black text-[var(--text-primary)]">
            Web, Newsletter &amp; Social
          </p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Every featured launch is formatted for web discovery, rich social cards, and direct distribution across Instagram, Threads, and Bluesky.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-black text-[var(--text-primary)]">
          For Brand Representatives &amp; PR Teams
        </h2>
        <ul className="space-y-2.5 text-sm text-[var(--text-secondary)] list-disc pl-5">
          <li>
            <strong className="text-[var(--text-primary)]">Press Releases &amp; Embargoed Launches:</strong> Send upcoming menu drops, seasonal LTO calendars, and retail rollout dates to{" "}
            <a
              href="mailto:hello@eatbrandbite.com"
              className="font-bold text-[var(--accent-brand)] hover:underline"
            >
              hello@eatbrandbite.com
            </a>
            .
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Product &amp; Media Inquiries:</strong> Reach our editorial desk directly via email for review inquiries, high-resolution press assets, or regional test-market confirmations.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Corrections &amp; Updates:</strong> Spotted an outdated launch date or regional availability detail on a brand hub? Email us and we will update it promptly.
          </li>
        </ul>

        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-secondary)] mr-1">
            Official Channels:
          </span>
          {SOCIAL_PROFILES.filter((p) => Boolean(p.url)).map((profile) => (
            <a
              key={profile.id}
              href={profile.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted-card)] hover:bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] transition-colors"
            >
              <span>{profile.label}</span>
              <span className="text-[var(--text-secondary)] font-medium">
                ({profile.handle})
              </span>
              <ExternalLink className="w-3 h-3 text-[var(--accent-brand)]" aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
