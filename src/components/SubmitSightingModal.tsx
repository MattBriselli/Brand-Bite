"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { BRANDS, CATEGORIES, type Article } from "@/data/articles";
import {
  OPEN_SIGHTING_MODAL_EVENT,
  SIGHTING_TYPES,
  submitSighting,
  type CommunitySighting,
  type SightingTypeOption,
} from "@/lib/sightings";
import {
  trackSightingModalOpen,
  trackSightingSubmitted,
} from "@/lib/analytics";

const FOOD_CATEGORIES = CATEGORIES.filter(
  (c): c is Article["category"] => c !== "All Categories"
);

function inferCategoryFromSegment(
  segment?: string,
  signatureItem?: string
): Article["category"] {
  const s = `${segment || ""} ${signatureItem || ""}`.toLowerCase();
  if (s.includes("chicken") || s.includes("wing")) return "Chicken & Wings";
  if (s.includes("taco") || s.includes("burrito") || s.includes("quesadilla") || s.includes("mexican")) {
    return "Tacos & Burritos";
  }
  if (s.includes("pizza") || s.includes("italian") || s.includes("breadstick")) {
    return "Pizza & Italian";
  }
  if (s.includes("diner") || s.includes("pancake") || s.includes("waffle") || s.includes("breakfast")) {
    return "Breakfast & Diners";
  }
  if (s.includes("coffee") || s.includes("latte") || s.includes("smoothie") || s.includes("soda") || s.includes("drink")) {
    return "Coffee & Drinks";
  }
  if (s.includes("chip") || s.includes("crisp") || s.includes("pretzel") || s.includes("popcorn")) {
    return "Chips & Crisps";
  }
  if (s.includes("cookie") || s.includes("donut") || s.includes("ice cream") || s.includes("bakery") || s.includes("candy") || s.includes("sweet")) {
    return "Cookies & Sweets";
  }
  if (s.includes("grocery") || s.includes("frozen")) {
    return "Frozen & Grocery";
  }
  return "Burgers & Sandwiches";
}

export function SubmitSightingModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openedAtRef = useRef<number>(0);

  const sortedBrands = useMemo(
    () => [...BRANDS].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const [brandSlug, setBrandSlug] = useState<string>("");
  const [customBrandName, setCustomBrandName] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [sightingType, setSightingType] =
    useState<SightingTypeOption>("Limited-Time Offer");
  const [category, setCategory] = useState<Article["category"]>(
    "Burgers & Sandwiches"
  );
  const [location, setLocation] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [spottedBy, setSpottedBy] = useState<string>("");
  const [honeypot, setHoneypot] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedItem, setSubmittedItem] = useState<CommunitySighting | null>(
    null
  );

  const openModal = (presetBrandSlug?: string, placement = "header") => {
    setErrorMsg(null);
    setSubmittedItem(null);
    openedAtRef.current = Date.now();
    if (presetBrandSlug) {
      const found = BRANDS.find((b) => b.slug === presetBrandSlug);
      if (found) {
        setBrandSlug(found.slug);
        setCategory(inferCategoryFromSegment(found.segment, found.signatureItem));
      }
    }
    trackSightingModalOpen(placement);
    dialogRef.current?.showModal();
  };

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ brandSlug?: string; placement?: string }>;
      openModal(custom.detail?.brandSlug, custom.detail?.placement || "inline_cta");
    };
    window.addEventListener(OPEN_SIGHTING_MODAL_EVENT, handler);
    return () => window.removeEventListener(OPEN_SIGHTING_MODAL_EVENT, handler);
  }, []);

  const handleBrandChange = (nextSlug: string) => {
    setBrandSlug(nextSlug);
    const found = BRANDS.find((b) => b.slug === nextSlug);
    if (found) {
      setCategory(inferCategoryFromSegment(found.segment, found.signatureItem));
    }
  };

  const resetFormFields = () => {
    setItemName("");
    setLocation("");
    setPrice("");
    setNotes("");
    setHoneypot("");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);

    const selectedBrand = BRANDS.find((b) => b.slug === brandSlug);
    const resolvedBrandName =
      brandSlug === "other"
        ? customBrandName.trim()
        : selectedBrand?.name || "";

    if (!resolvedBrandName) {
      setErrorMsg("Please select a chain or enter the snack/restaurant brand name.");
      return;
    }

    setIsSubmitting(true);
    const elapsedMs = openedAtRef.current
      ? Math.max(0, Date.now() - openedAtRef.current)
      : 2500;

    const result = await submitSighting({
      brandSlug: brandSlug || "other",
      brandName: resolvedBrandName,
      itemName,
      sightingType,
      category,
      location: location.trim() || undefined,
      price: price.trim() || undefined,
      notes,
      spottedBy: spottedBy.trim() || undefined,
      website: honeypot,
      elapsedMs,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMsg(result.error);
      return;
    }

    trackSightingSubmitted({
      brandSlug: result.item.brandSlug,
      sightingType: result.item.sightingType,
      category: result.item.category,
    });
    setSubmittedItem(result.item);
    resetFormFields();
  };

  const closeModal = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => openModal(undefined, "header")}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--pill-active-bg)] px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-bold text-[var(--pill-active-text)] hover:opacity-90 transition-opacity cursor-pointer"
      >
        <Send className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Submit a </span>Sighting
      </button>

      <dialog
        ref={dialogRef}
        className="site-modal"
        {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      >
        <div className="p-5 sm:p-7 max-h-[90dvh] overflow-y-auto">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 mb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-brand)]">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Live Community Tip Line
              </span>
              <h2 className="text-xl font-black text-[var(--text-primary)] mt-1">
                Spotted a New Menu Drop or Snack?
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Sanitized automatically &amp; published straight to the live BrandBite feed.
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close sighting modal"
              className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {submittedItem ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-600">
                  <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Your Sighting Is Live on BrandBite!</span>
                </div>
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {submittedItem.brandName} — {submittedItem.itemName}
                </p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {submittedItem.notes}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                  <span className="rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2 py-0.5 text-[var(--text-primary)]">
                    {submittedItem.sightingType}
                  </span>
                  {submittedItem.price && <span>Price: {submittedItem.price}</span>}
                  {submittedItem.location && <span>• {submittedItem.location}</span>}
                  <span>• Spotted by {submittedItem.spottedBy}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedItem(null);
                    openedAtRef.current = Date.now();
                  }}
                  className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted-card)] hover:bg-[var(--bg-subtle)] px-4 py-2.5 text-xs sm:text-sm font-bold text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Submit Another Sighting
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    document
                      .getElementById("feed")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-xl bg-[#c2410c] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#9a3412] transition-colors cursor-pointer"
                >
                  View Live in Feed →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot anti-bot field */}
              <div className="visually-hidden" aria-hidden="true">
                <label htmlFor="sighting-website-hp">Leave this field empty</label>
                <input
                  id="sighting-website-hp"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-red-500"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="sighting-brand"
                    className="block text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] mb-1.5"
                  >
                    Chain or Snack Brand *
                  </label>
                  <select
                    id="sighting-brand"
                    required
                    value={brandSlug}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="theme-input w-full rounded-xl border px-3 py-2.5 text-base sm:text-sm font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a brand...
                    </option>
                    {sortedBrands.map((b) => (
                      <option key={b.slug} value={b.slug}>
                        {b.name}
                      </option>
                    ))}
                    <option value="other">Other Chain / Grocery Brand...</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sighting-type"
                    className="block text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] mb-1.5"
                  >
                    Sighting Type *
                  </label>
                  <select
                    id="sighting-type"
                    value={sightingType}
                    onChange={(e) =>
                      setSightingType(e.target.value as SightingTypeOption)
                    }
                    className="theme-input w-full rounded-xl border px-3 py-2.5 text-base sm:text-sm font-semibold focus:outline-none cursor-pointer"
                  >
                    {SIGHTING_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {brandSlug === "other" && (
                <div>
                  <label
                    htmlFor="sighting-custom-brand"
                    className="block text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] mb-1.5"
                  >
                    Brand or Store Name *
                  </label>
                  <input
                    id="sighting-custom-brand"
                    type="text"
                    required
                    minLength={2}
                    maxLength={50}
                    value={customBrandName}
                    onChange={(e) => setCustomBrandName(e.target.value)}
                    placeholder="e.g., Trader Joe's, Doritos, Culver's..."
                    className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="sighting-item"
                  className="block text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] mb-1.5"
                >
                  Menu Item or Snack Name *
                </label>
                <input
                  id="sighting-item"
                  type="text"
                  required
                  minLength={3}
                  maxLength={90}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g., Spicy Maple Bacon Waffle Chicken Sandwich"
                  className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="sighting-category"
                    className="block text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] mb-1.5"
                  >
                    Category *
                  </label>
                  <select
                    id="sighting-category"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as Article["category"])
                    }
                    className="theme-input w-full rounded-xl border px-3 py-2.5 text-base sm:text-sm font-semibold focus:outline-none cursor-pointer"
                  >
                    {FOOD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sighting-location"
                    className="block text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] mb-1.5"
                  >
                    City / Store (Optional)
                  </label>
                  <div className="relative">
                    <MapPin
                      className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="sighting-location"
                      type="text"
                      maxLength={60}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Columbus, OH"
                      className="theme-input w-full rounded-xl border pl-8 pr-3 py-2.5 text-base sm:text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="sighting-price"
                    className="block text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] mb-1.5"
                  >
                    Price (Optional)
                  </label>
                  <input
                    id="sighting-price"
                    type="text"
                    inputMode="decimal"
                    maxLength={10}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="$5.49"
                    className="theme-input w-full rounded-xl border px-3 py-2.5 text-base sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label
                    htmlFor="sighting-notes"
                    className="block text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]"
                  >
                    What Did You Spot? *
                  </label>
                  <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                    {notes.length}/320
                  </span>
                </div>
                <textarea
                  id="sighting-notes"
                  required
                  minLength={8}
                  maxLength={320}
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe flavor details, drive-thru menu board promo, or store aisle sighting (no URLs or personal contact info)..."
                  className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm focus:outline-none resize-y"
                />
              </div>

              <div>
                <label
                  htmlFor="sighting-spotter"
                  className="block text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] mb-1.5"
                >
                  Credit Name / Handle (Optional)
                </label>
                <input
                  id="sighting-spotter"
                  type="text"
                  maxLength={26}
                  value={spottedBy}
                  onChange={(e) => setSpottedBy(e.target.value)}
                  placeholder="Defaults to Community Spotter"
                  className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-3 flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                <ShieldCheck
                  className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-[var(--text-primary)]">Instant Sanitized Publishing:</strong>{" "}
                  HTML, links, emails, phone numbers, and profanity are automatically stripped or blocked before your tip goes live.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted-card)] hover:bg-[var(--bg-subtle)] px-4 py-2.5 text-xs sm:text-sm font-bold text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#c2410c] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#9a3412] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  {isSubmitting ? "Sanitizing & Posting..." : "Publish Sighting Live"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
