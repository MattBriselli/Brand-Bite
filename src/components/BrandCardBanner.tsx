"use client";

import React from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { BRANDS } from "@/data/articles";

interface BrandCardBannerProps {
  brandSlug?: string;
  brandName: string;
  category?: string;
  compact?: boolean;
}

const BRAND_ACCENT_BY_SLUG = new Map(
  BRANDS.map((b) => [b.slug, b.accentColor])
);

export function BrandCardBanner({
  brandSlug = "",
  brandName,
  category,
  compact = false,
}: BrandCardBannerProps) {
  const accent = BRAND_ACCENT_BY_SLUG.get(brandSlug) || "#b91c1c";

  return (
    <div
      className={`card-media relative flex flex-col items-center justify-center gap-2 overflow-hidden border-b border-[var(--border-subtle)] select-none ${
        compact ? "h-36 px-3" : "w-full aspect-[16/10] px-5"
      }`}
      style={{
        background: `linear-gradient(135deg, ${accent}1a 0%, ${accent}08 55%, var(--bg-muted-card) 100%)`,
      }}
      aria-hidden="true"
    >
      {/* Subtle decorative accent bar along top */}
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: accent }}
      />
      <BrandLogo
        slug={brandSlug}
        name={brandName}
        accentColor={accent}
        size={compact ? "md" : "lg"}
        className="shadow-sm"
      />
      <div className="text-center space-y-0.5 max-w-full">
        <p className="text-xs font-black tracking-tight text-[var(--text-primary)] truncate">
          {brandName}
        </p>
        {category && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] truncate">
            {category}
          </p>
        )}
      </div>
    </div>
  );
}
