"use client";

import React, { useEffect, useState } from "react";
import { Flame, MapPin, Send, UserCheck } from "lucide-react";
import {
  fetchSightings,
  openSightingModal,
  SIGHTING_CREATED_EVENT,
  type CommunitySighting,
} from "@/lib/sightings";

interface BrandSightingsClientProps {
  brandSlug: string;
  brandName: string;
}

export function BrandSightingsClient({
  brandSlug,
  brandName,
}: BrandSightingsClientProps) {
  const [sightings, setSightings] = useState<CommunitySighting[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchSightings({ brand: brandSlug, limit: 20 }).then((items) => {
      if (!active) return;
      setSightings(items);
      setLoaded(true);
    });

    const onCreated = (event: Event) => {
      const custom = event as CustomEvent<CommunitySighting>;
      if (custom.detail && custom.detail.brandSlug === brandSlug) {
        setSightings((prev) =>
          prev.some((s) => s.id === custom.detail.id)
            ? prev
            : [custom.detail, ...prev]
        );
      }
    };

    window.addEventListener(SIGHTING_CREATED_EVENT, onCreated);
    return () => {
      active = false;
      window.removeEventListener(SIGHTING_CREATED_EVENT, onCreated);
    };
  }, [brandSlug]);

  return (
    <section aria-labelledby="brand-sightings-heading" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <h2
            id="brand-sightings-heading"
            className="section-headline font-black text-[var(--text-primary)]"
          >
            Community {brandName} Sightings ({sightings.length})
          </h2>
          <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
            Real-time reader dispatches — sanitized automatically and published live
          </p>
        </div>

        <button
          type="button"
          onClick={() => openSightingModal({ brandSlug })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#c2410c] px-4 py-2 text-xs font-bold text-white hover:bg-[#9a3412] transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          Report a {brandName} Sighting
        </button>
      </div>

      {sightings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 text-center space-y-3">
          <p className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
            {loaded
              ? `No reader sightings posted for ${brandName} yet.`
              : `Checking live ${brandName} reader sightings...`}
          </p>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            Spotted a regional test item, seasonal LTO, or drive-thru deal at {brandName}? Share it and it goes live right here after automatic sanitization.
          </p>
          <button
            type="button"
            onClick={() => openSightingModal({ brandSlug })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--pill-active-bg)] px-4 py-2 text-xs font-bold text-[var(--pill-active-text)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            Be the First to Spot Something at {brandName}
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {sightings.map((s) => (
            <article key={s.id} className="card">
              <header className="px-5 pt-4 pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[11px] bg-[var(--bg-subtle)] text-[var(--accent-brand)] border border-[var(--border-strong)]">
                      {s.sightingType}
                    </span>
                    <span className="px-2 py-0.5 rounded-md font-bold text-[11px] text-white bg-[#0f766e]">
                      Reader Sighting
                    </span>
                  </div>
                  <time
                    dateTime={s.createdAt}
                    className="text-[var(--text-secondary)] font-medium"
                  >
                    {s.publishedFormatted}
                  </time>
                </div>
                <h3 className="text-lg font-extrabold text-[var(--text-primary)] leading-snug">
                  {s.itemName}
                </h3>
              </header>

              <div className="px-5 py-2 flex flex-col justify-between gap-3">
                <p className="snippet text-sm text-[var(--text-secondary)] leading-relaxed">
                  {s.notes}
                </p>
                <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Flame
                      className="w-3.5 h-3.5 text-[var(--accent-brand)]"
                      aria-hidden="true"
                    />
                    {s.category}
                  </span>
                  <span className="inline-flex items-center gap-2 font-semibold">
                    {s.price && (
                      <span className="text-[var(--text-primary)] font-bold">
                        {s.price}
                      </span>
                    )}
                    {s.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" aria-hidden="true" />
                        {s.location}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <footer className="px-5 py-3.5 mt-2 border-t border-[var(--border-subtle)] bg-[var(--bg-muted-card)] flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[var(--text-primary)]">
                  {s.brandName}
                </span>
                <span className="font-semibold text-[var(--text-secondary)] inline-flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                  Spotted by {s.spottedBy}
                </span>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
