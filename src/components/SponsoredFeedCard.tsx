"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";
import { ExternalLink, Sparkles } from "lucide-react";
import {
  ACTIVE_PARTNER_OFFER,
  ADSENSE_CLIENT_ID,
  ADSENSE_INFEED_SLOT_ID,
} from "@/data/monetization";
import {
  trackSponsoredSlotClick,
  trackSponsoredSlotView,
} from "@/lib/analytics";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface SponsoredFeedCardProps {
  slotId?: string;
}

export function SponsoredFeedCard({
  slotId = "home_feed_pos_6",
}: SponsoredFeedCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const hasTrackedViewRef = useRef(false);
  const hasPushedAdSenseRef = useRef(false);

  const hasAdSense = Boolean(ADSENSE_CLIENT_ID && ADSENSE_INFEED_SLOT_ID);
  const partner = ACTIVE_PARTNER_OFFER;
  const isEnabled = hasAdSense || Boolean(partner);

  const provider: "adsense" | "partner" = hasAdSense ? "adsense" : "partner";
  const label = hasAdSense
    ? `AdSense:${ADSENSE_INFEED_SLOT_ID}`
    : partner?.sponsorName || "none";

  // Viewable-impression tracking (>= 50% visible for >= 1s)
  useEffect(() => {
    if (!isEnabled || !cardRef.current || hasTrackedViewRef.current) return;
    const el = cardRef.current;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (!timer && !hasTrackedViewRef.current) {
            timer = setTimeout(() => {
              hasTrackedViewRef.current = true;
              trackSponsoredSlotView({ slotId, provider, label });
              observer.disconnect();
            }, 1000);
          }
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0.5] }
    );

    observer.observe(el);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [isEnabled, slotId, provider, label]);

  // Push single manual AdSense slot (never Auto Ads)
  useEffect(() => {
    if (!hasAdSense || hasPushedAdSenseRef.current) return;
    try {
      hasPushedAdSenseRef.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore ad-blocker errors cleanly
    }
  }, [hasAdSense]);

  if (!isEnabled) {
    return null;
  }

  if (hasAdSense) {
    return (
      <article
        ref={cardRef}
        aria-label="Sponsored content"
        className="card min-h-[280px]"
      >
        <Script
          id="brandbite-adsense-lib"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <header className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[11px] bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              Sponsored
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Partner Placement
            </span>
          </div>
        </header>
        <div className="px-5 py-2 flex items-center justify-center min-h-[190px]">
          <ins
            className="adsbygoogle block w-full"
            style={{ display: "block", minHeight: "180px" }}
            data-ad-format="fluid"
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot={ADSENSE_INFEED_SLOT_ID}
          />
        </div>
        <footer className="px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-muted-card)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
          <span>Supports independent BrandBite coverage</span>
          <span>Ad</span>
        </footer>
      </article>
    );
  }

  if (!partner) return null;

  return (
    <article
      ref={cardRef}
      aria-label={`Sponsored: ${partner.sponsorName}`}
      className={`card ${partner.image ? "has-image" : ""}`}
    >
      {partner.image && (
        <img
          src={partner.image}
          alt={`${partner.sponsorName} — ${partner.headline}`}
          width={800}
          height={500}
          loading="lazy"
        />
      )}

      <header className="px-5 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
          <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[11px] bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-strong)]">
            Sponsored
          </span>
          <span className="text-[var(--text-secondary)] font-medium">
            {partner.sponsorName}
          </span>
        </div>
        <h3 className="text-lg font-extrabold text-[var(--text-primary)] leading-snug">
          <a
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() =>
              trackSponsoredSlotClick({
                slotId,
                provider: "partner",
                label: partner.sponsorName,
                destinationUrl: partner.url,
              })
            }
            className="card-link hover:text-[var(--accent-brand)] transition-colors"
          >
            {partner.headline}
          </a>
        </h3>
      </header>

      <div className="px-5 py-2 flex flex-col justify-between gap-3">
        <p className="snippet text-sm text-[var(--text-secondary)] leading-relaxed">
          {partner.description}
        </p>
        <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-3 flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
          <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Sparkles
              className="w-3.5 h-3.5 text-[var(--accent-brand)]"
              aria-hidden="true"
            />
            {partner.categoryLabel}
          </span>
          <span>Partner Pick</span>
        </div>
      </div>

      <footer className="px-5 py-3.5 mt-2 border-t border-[var(--border-subtle)] bg-[var(--bg-muted-card)] flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-[var(--text-secondary)]">
          {partner.sponsorName}
        </span>
        <a
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() =>
            trackSponsoredSlotClick({
              slotId,
              provider: "partner",
              label: partner.sponsorName,
              destinationUrl: partner.url,
            })
          }
          className="font-bold text-[var(--accent-brand)] hover:underline inline-flex items-center gap-1"
        >
          {partner.ctaLabel}
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </footer>
    </article>
  );
}
