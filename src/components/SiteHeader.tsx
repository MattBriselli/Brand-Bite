"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Flame, Sparkles, Tag, Utensils, BookOpen, Send, X, CheckCircle2, Radio } from "lucide-react";

export function SiteHeader() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [submittedTip, setSubmittedTip] = useState<string | null>(null);

  const openTipModal = () => {
    setSubmittedTip(null);
    dialogRef.current?.showModal();
  };

  const handleDialogClose = () => {
    const dialog = dialogRef.current;
    if (dialog && dialog.returnValue === "submit") {
      setSubmittedTip("Thanks! Our editors received your menu sighting.");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#e5dfd5] bg-[#faf8f5]/95 backdrop-blur-md">
      {/* Top ticker bar */}
      <div className="bg-[#181512] text-[#faf8f5] text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#c2410c] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              <Radio className="w-3 h-3" aria-hidden="true" /> Live Wire Active
            </span>
            <span>
              Synthesizing <strong>6 live fast-food &amp; snack feeds</strong> (Brand Eating, BK/Yum!/Taco Bell Newsrooms, Impulsive Buy, NRN, Food Dive, r/fastfood)
            </span>
          </p>
          <div className="flex items-center gap-4 text-[#d6cfc7]">
            <Link href="/?type=Review#feed" className="hover:text-white underline-offset-4 hover:underline">
              Latest Reviews
            </Link>
            <Link href="/brands" className="hover:text-white underline-offset-4 hover:underline">
              Brands A–Z Directory
            </Link>
          </div>
        </div>
      </div>

      {/* Main masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3 focus:outline-none">
            <div className="w-11 h-11 rounded-xl bg-[#c2410c] text-white flex items-center justify-center shadow-sm group-hover:bg-[#9a3412] transition-colors">
              <Utensils className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="block text-2xl font-black tracking-tight text-[#181512]">
                BRAND<span className="text-[#c2410c]">BITE</span>
              </span>
              <span className="block text-xs font-medium text-[#575049]">
                Fast Food News, Packaged Snacks &amp; Honest Taste Tests
              </span>
            </div>
          </Link>
        </div>

        <nav aria-label="Primary navigation" className="flex items-center flex-wrap gap-1 sm:gap-2">
          <Link
            href="/#feed"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[#181512] hover:bg-[#f3efe9] transition-colors"
          >
            Unified Feed
          </Link>
          <Link
            href="/?mode=wire#feed"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[#181512] hover:bg-[#f3efe9] transition-colors inline-flex items-center gap-1.5"
          >
            <Radio className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            Live Wire
          </Link>
          <Link
            href="/?type=Review#feed"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[#181512] hover:bg-[#f3efe9] transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-[#c2410c]" aria-hidden="true" />
            Reviews
          </Link>
          <Link
            href="/?type=News#feed"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[#181512] hover:bg-[#f3efe9] transition-colors"
          >
            Menu News
          </Link>
          <Link
            href="/?type=Limited-Time+Offer#feed"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[#181512] hover:bg-[#f3efe9] transition-colors inline-flex items-center gap-1.5"
          >
            <Tag className="w-4 h-4 text-[#d97706]" aria-hidden="true" />
            LTOs &amp; Deals
          </Link>
          <Link
            href="/brands"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[#181512] hover:bg-[#f3efe9] transition-colors inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-[#575049]" aria-hidden="true" />
            Brands A–Z
          </Link>
          <button
            type="button"
            onClick={openTipModal}
            className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-[#181512] px-3.5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#c2410c] transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            Submit a Sighting
          </button>
        </nav>
      </div>

      {submittedTip && (
        <div
          role="status"
          className="bg-emerald-900 text-emerald-50 text-xs font-medium py-2 px-4 text-center flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-300" aria-hidden="true" />
          <span>{submittedTip}</span>
          <button
            type="button"
            onClick={() => setSubmittedTip(null)}
            className="ml-2 underline text-emerald-200 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Native <dialog> modal with closedby="any" and form method="dialog" */}
      <dialog
        ref={dialogRef}
        onClose={handleDialogClose}
        className="site-modal"
        {...({ closedby: "any" } as any)}
      >
        <form method="dialog" className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-[#e5dfd5] pb-4 mb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c2410c]">
                Reader Tip Line
              </span>
              <h2 className="text-xl font-black text-[#181512] mt-0.5">
                Spotted a New Menu Item or Snack?
              </h2>
            </div>
            <button
              type="submit"
              value="cancel"
              formNoValidate
              aria-label="Close modal"
              className="rounded-lg p-2 text-[#575049] hover:bg-[#f3efe9] hover:text-[#181512] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <p className="text-sm text-[#575049] mb-4">
            Send us a heads-up on regional test items, limited-edition store shelves, or fast-food promos you want us to review next.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="tip-brand" className="block text-xs font-bold uppercase tracking-wider text-[#181512] mb-1">
                Brand or Chain Name
              </label>
              <input
                id="tip-brand"
                name="brand"
                type="text"
                required
                placeholder="e.g. Taco Bell, Trader Joe's, Oreo..."
                className="w-full rounded-lg border border-[#d6cfc7] bg-white px-3.5 py-2 text-sm text-[#181512] focus:border-[#c2410c] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="tip-item" className="block text-xs font-bold uppercase tracking-wider text-[#181512] mb-1">
                Item Name &amp; Where You Spotted It
              </label>
              <input
                id="tip-item"
                name="item"
                type="text"
                required
                placeholder="e.g. Churro Chillers spotted in Irvine, CA test kitchen"
                className="w-full rounded-lg border border-[#d6cfc7] bg-white px-3.5 py-2 text-sm text-[#181512] focus:border-[#c2410c] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="tip-email" className="block text-xs font-bold uppercase tracking-wider text-[#181512] mb-1">
                Your Email (Optional, for hat-tip credit)
              </label>
              <input
                id="tip-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="reader@example.com"
                className="w-full rounded-lg border border-[#d6cfc7] bg-white px-3.5 py-2 text-sm text-[#181512] focus:border-[#c2410c] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#e5dfd5] pt-4">
            <button
              type="submit"
              value="cancel"
              formNoValidate
              className="rounded-lg border border-[#d6cfc7] px-4 py-2 text-sm font-semibold text-[#575049] hover:bg-[#f3efe9] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              value="submit"
              className="rounded-lg bg-[#c2410c] px-5 py-2 text-sm font-bold text-white hover:bg-[#9a3412] cursor-pointer"
            >
              Send Tip to Editors
            </button>
          </div>
        </form>
      </dialog>
    </header>
  );
}
