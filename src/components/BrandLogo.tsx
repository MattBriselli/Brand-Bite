"use client";

import React, { useState } from "react";
import {
  BRAND_DOMAINS,
  BRAND_LOGO_BG,
  LOCAL_BRAND_LOGOS,
} from "@/data/brand-domains";

interface BrandLogoProps {
  slug: string;
  name: string;
  accentColor?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<"sm" | "md" | "lg", string> = {
  sm: "w-8 h-8 rounded-lg p-1 text-[11px]",
  md: "w-10 h-10 rounded-xl p-1.5 text-xs",
  lg: "w-13 h-13 sm:w-14 sm:h-14 rounded-2xl p-1.5 text-sm",
};

function getInitials(name: string): string {
  const words = name
    .replace(/['’&]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function BrandLogo({
  slug,
  name,
  accentColor = "#c2410c",
  size = "md",
  className = "",
}: BrandLogoProps) {
  const localSrc = LOCAL_BRAND_LOGOS[slug];
  const domain = BRAND_DOMAINS[slug];
  const customBg = BRAND_LOGO_BG[slug];
  const imgSrc =
    localSrc ||
    (domain
      ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
      : null);

  const [failed, setFailed] = useState(!imgSrc);

  if (failed || !imgSrc) {
    return (
      <span
        aria-hidden="true"
        style={{ backgroundColor: accentColor }}
        className={`shrink-0 inline-flex items-center justify-center font-black tracking-tight text-white shadow-2xs select-none ${SIZE_CLASSES[size]} ${className}`}
      >
        {getInitials(name)}
      </span>
    );
  }

  return (
    <span
      style={customBg ? { backgroundColor: customBg } : undefined}
      className={`shrink-0 inline-flex items-center justify-center ${
        customBg ? "" : "bg-white"
      } border border-[var(--border-subtle)] shadow-2xs overflow-hidden ${SIZE_CLASSES[size]} ${className}`}
    >
      <img
        src={imgSrc}
        alt={`${name} logo`}
        width={64}
        height={64}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        onLoad={(e) => {
          // Guard against Google returning its tiny 16x16 generic globe fallback
          if (!localSrc && e.currentTarget.naturalWidth <= 16) {
            setFailed(true);
          }
        }}
        className="w-full h-full object-contain"
      />
    </span>
  );
}
