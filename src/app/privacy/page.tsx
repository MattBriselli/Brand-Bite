import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy & Advertising Disclosure | BrandBite",
  description:
    "How BrandBite handles privacy, analytics, community sightings, and non-disruptive sponsorships & affiliate links.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]"
      >
        <Link
          href="/"
          className="hover:text-[var(--accent-brand)] inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Back to BrandBite
        </Link>
      </nav>

      <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-10 space-y-6 shadow-xs">
        <header className="space-y-2 border-b border-[var(--border-subtle)] pb-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-brand)]">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            Transparency &amp; Reader Trust
          </span>
          <h1 className="hero-headline font-black text-[var(--text-primary)]">
            Privacy &amp; Advertising Policy
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Effective Date: November 2026 • Domain: eatbrandbite.com
          </p>
        </header>

        <section className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          <h2 className="text-lg font-black text-[var(--text-primary)]">
            1. Analytics &amp; Site Performance
          </h2>
          <p>
            BrandBite uses <strong>Google Analytics 4</strong> and privacy-focused{" "}
            <strong>Cloudflare Web Analytics</strong> to understand aggregate traffic, page performance, popular restaurant chains, search terms, and outbound story clicks. We never sell personal data.
          </p>
        </section>

        <section className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          <h2 className="text-lg font-black text-[var(--text-primary)]">
            2. Fully Pseudonymized Comments, Upvotes &amp; Anti-Spam Protection
          </h2>
          <p>
            When you sign in with Google to upvote articles or post comments on BrandBite — or tap <strong>I Tried It</strong> / <strong>Want to Try</strong> reactions — we request only minimal <strong>email-only</strong> Google verification (never your name or profile photo) strictly to prevent anonymous bot spam. We <strong>never store or display your email address or raw Google account ID</strong>. Instead, our Cloudflare Worker immediately derives a one-way cryptographic pseudonym (keyed HMAC-SHA256 using an isolated server secret) paired with a randomized &ldquo;Adjective Noun&rdquo; handle and illustrated avatar, and passes comments through automated AI safety checks.
          </p>
        </section>

        <section className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          <h2 className="text-lg font-black text-[var(--text-primary)]">
            3. Non-Disruptive Advertising &amp; Affiliate Disclosure
          </h2>
          <p>
            To keep BrandBite free without pop-ups, auto-playing video ads, or newsletter ads, the web feed may display a clearly labeled{" "}
            <strong>Sponsored</strong> card powered by Google AdSense or curated food/snack affiliate partners (such as Amazon Associates or snack-box partners).
          </p>
          <p>
            Third-party vendors, including Google, may use cookies to serve ads based on prior visits to this or other websites. You can opt out of personalized advertising at any time via{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--accent-brand)] hover:underline"
            >
              Google Ads Settings
            </a>{" "}
            or{" "}
            <a
              href="https://optout.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--accent-brand)] hover:underline"
            >
              aboutads.info
            </a>
            . Editorial taste tests and ratings are never for sale.
          </p>
        </section>

        <section className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          <h2 className="text-lg font-black text-[var(--text-primary)]">
            4. The Weekly Bite Newsletter
          </h2>
          <p>
            If you subscribe to <em>The Weekly Bite</em>, your email address is used solely to send our Friday fast-food and snack roundup. Every email includes a one-click unsubscribe link, and we do not sell subscriber lists or run ads inside the newsletter.
          </p>
        </section>

        <section className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-4">
          <h2 className="text-base font-black text-[var(--text-primary)]">
            Contact
          </h2>
          <p>
            Questions about privacy, corrections, or tips? Email us at{" "}
            <a
              href="mailto:hello@eatbrandbite.com"
              className="font-semibold text-[var(--accent-brand)] hover:underline"
            >
              hello@eatbrandbite.com
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
