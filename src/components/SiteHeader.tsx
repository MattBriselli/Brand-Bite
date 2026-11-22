"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Sparkles, Tag, Utensils, BookOpen, Send, X, Radio, Clock } from "lucide-react";

export function SiteHeader() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openTipModal = () => {
    dialogRef.current?.showModal();
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
              Auto-syncing <strong>6 live fast-food &amp; snack feeds</strong> every 6h (Brand Eating, IHOP &amp; Chain Newsrooms, Impulsive Buy, NRN, Food Dive)
            </span>
          </p>
          <div className="flex items-center gap-4 text-[#d6cfc7]">
            <Link href="/?mode=editorial#feed" className="hover:text-white underline-offset-4 hover:underline">
              Original Reviews (Coming Soon)
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
                Live Fast Food &amp; Packaged Snack Wire • Taste Tests Coming Soon
              </span>
            </div>
          </Link>
        </div>

        <nav aria-label="Primary navigation" className="flex items-center flex-wrap gap-1 sm:gap-2">
          <Link
            href="/#feed"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[#181512] hover:bg-[#f3efe9] transition-colors inline-flex items-center gap-1.5"
          >
            <Radio className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            Live Feed
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
            href="/?mode=editorial#feed"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[#181512] hover:bg-[#f3efe9] transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-[#c2410c]" aria-hidden="true" />
            Our Reviews
            <span className="rounded-full bg-[#f3efe9] border border-[#d6cfc7] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#575049]">
              Soon
            </span>
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

      {/* Native <dialog> modal with closedby="any" and form method="dialog" */}
      <dialog
        ref={dialogRef}
        className="site-modal"
        {...({ closedby: "any" } as any)}
      >
        <form method="dialog" className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-[#e5dfd5] pb-4 mb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#c2410c]">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                Coming Soon • Reader Tip Line
              </span>
              <h2 className="text-xl font-black text-[#181512] mt-1">
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

          <div className="rounded-xl border border-[#e5dfd5] bg-[#faf8f5] p-4 space-y-2 text-sm text-[#575049] leading-relaxed">
            <p className="font-bold text-[#181512]">
              Community Sighting Submissions — Coming Soon
            </p>
            <p>
              Direct reader tips, store-shelf photo uploads, and regional test-kitchen requests will open alongside our first batch of original in-house taste tests.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-end border-t border-[#e5dfd5] pt-4">
            <button
              type="submit"
              value="close"
              className="rounded-lg bg-[#181512] px-5 py-2 text-sm font-bold text-white hover:bg-[#c2410c] transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </form>
      </dialog>
    </header>
  );
}
