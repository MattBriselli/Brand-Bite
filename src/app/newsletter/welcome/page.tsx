"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Mail } from "lucide-react";
import { trackNewsletterConfirmed } from "@/lib/analytics";

export default function NewsletterWelcomePage() {
  useEffect(() => {
    trackNewsletterConfirmed();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <section className="rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 sm:p-10 text-center space-y-5 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[var(--accent-brand)]">
          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
          Subscription Confirmed
        </span>

        <h1 className="hero-headline font-black text-[var(--text-primary)]">
          Welcome to The Weekly Bite!
        </h1>

        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
          You&apos;re on the list. Every Friday morning, we&apos;ll send you the week&apos;s best fast-food menu launches, weekend deals, and snack aisle sightings — and you can unsubscribe in a single click from the bottom of any issue.
        </p>

        <div className="pt-3">
          <Link
            href="/#feed"
            className="inline-flex items-center gap-2 rounded-xl bg-[#c2410c] px-6 py-3 text-sm font-bold text-white hover:bg-[#9a3412] transition-colors"
          >
            Back to the Live Fast-Food Wire
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
