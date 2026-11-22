"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { trackNewsletterUnsubscribe } from "@/lib/analytics";

const FEEDBACK_REASONS = [
  { id: "too_frequent", label: "Too many emails in my inbox" },
  { id: "prefer_web", label: "I prefer checking the website directly" },
  { id: "want_more_reviews", label: "Waiting for more in-house taste tests" },
  { id: "not_relevant", label: "Not the chains/snacks I follow" },
];

export default function NewsletterUnsubscribedPage() {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  useEffect(() => {
    trackNewsletterUnsubscribe();
  }, []);

  const handleReasonClick = (reasonId: string) => {
    setSelectedReason(reasonId);
    trackNewsletterUnsubscribe(reasonId);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <section className="rounded-2xl border border-[#e5dfd5] bg-white p-8 sm:p-10 text-center space-y-6 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#f3efe9] text-[#181512] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6 text-emerald-700" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="section-headline font-black text-[#181512]">
            You&apos;ve Been Unsubscribed from The Weekly Bite
          </h1>
          <p className="text-sm sm:text-base text-[#575049] leading-relaxed">
            No hard feelings and no further Friday digests will be sent to your address. You can still browse the free live wire anytime without an account.
          </p>
        </div>

        <div className="rounded-xl border border-[#e5dfd5] bg-[#faf8f5] p-5 space-y-3 text-left">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#181512]">
            Optional 1-Click Anonymous Feedback: Why did you leave?
          </p>
          {selectedReason ? (
            <p role="status" className="text-sm font-semibold text-emerald-800">
              Thanks for letting us know — your feedback helps shape future issues.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleReasonClick(r.id)}
                  className="rounded-lg border border-[#d6cfc7] bg-white hover:border-[#c2410c] px-3 py-1.5 text-xs font-semibold text-[#181512] transition-colors cursor-pointer"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            href="/#weekly-bite"
            className="font-semibold text-[#575049] hover:text-[#181512] underline underline-offset-4"
          >
            Unsubscribed by accident? Re-join here
          </Link>
          <Link
            href="/#feed"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#181512] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#c2410c] transition-colors"
          >
            Browse BrandBite Live Wire
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
