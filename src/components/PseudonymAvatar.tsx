"use client";

import React from "react";

interface PseudonymAvatarProps {
  seed: string;
  name: string;
  size?: number;
  className?: string;
}

const BG_PALETTES: [string, string][] = [
  ["#fde68a", "#f59e0b"],
  ["#fed7aa", "#ea580c"],
  ["#fecaca", "#ef4444"],
  ["#fbcfe8", "#ec4899"],
  ["#e9d5ff", "#9333ea"],
  ["#c7d2fe", "#4f46e5"],
  ["#bfdbfe", "#2563eb"],
  ["#bae6fd", "#0284c7"],
  ["#a7f3d0", "#059669"],
  ["#d9f99d", "#65a30d"],
  ["#fef08a", "#ca8a04"],
  ["#f5d0fe", "#c026d3"],
];

const SHIRT_COLORS = [
  "#1e293b",
  "#c2410c",
  "#0f766e",
  "#4338ca",
  "#be123c",
  "#15803d",
  "#7e22ce",
  "#0369a1",
];

const SKIN_TONES = [
  "#fde4cf",
  "#f6c8a8",
  "#e2a679",
  "#c68652",
  "#8d5524",
  "#ffe5d9",
];

const HAIR_COLORS = [
  "#1f2937",
  "#451a03",
  "#78350f",
  "#b45309",
  "#9a3412",
  "#374151",
  "#581c87",
  "#0f766e",
];

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], hash: number, shift: number): T {
  return arr[((hash >>> shift) ^ (hash * 31)) % arr.length];
}

/**
 * Deterministic, zero-PII illustrated portrait avatar.
 * Renders completely locally as an inline SVG — zero external trackers or broken URLs.
 */
export function PseudonymAvatar({
  seed,
  name,
  size = 32,
  className = "",
}: PseudonymAvatarProps) {
  const safeSeed = seed || name || "brandbite-reader";
  const h1 = hashSeed(safeSeed);
  const h2 = hashSeed(`${safeSeed}:v2`);

  const [bgLight, bgAccent] = BG_PALETTES[h1 % BG_PALETTES.length];
  const shirt = SHIRT_COLORS[(h1 >>> 4) % SHIRT_COLORS.length];
  const skin = SKIN_TONES[(h1 >>> 8) % SKIN_TONES.length];
  const hair = HAIR_COLORS[(h2 >>> 2) % HAIR_COLORS.length];
  const hairStyle = (h2 >>> 6) % 4;
  const hasGlasses = (h2 >>> 10) % 3 === 0;
  const mouthStyle = (h2 >>> 13) % 3;
  const gradId = `av-${(h1 >>> 0).toString(36)}-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${name} avatar`}
      className={`shrink-0 rounded-full border border-[var(--border-subtle)] overflow-hidden ${className}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bgLight} />
          <stop offset="100%" stopColor={bgAccent} />
        </linearGradient>
      </defs>

      {/* Backdrop */}
      <rect width="64" height="64" fill={`url(#${gradId})`} />
      <circle cx="52" cy="12" r="14" fill="white" fillOpacity="0.16" />

      {/* Shoulders / shirt */}
      <path
        d="M12 64 C12 49, 21 44, 32 44 C43 44, 52 49, 52 64 Z"
        fill={shirt}
      />
      {/* Shirt collar highlight */}
      <path
        d="M25 45 Q32 51 39 45"
        fill="none"
        stroke="white"
        strokeOpacity="0.45"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Neck */}
      <rect x="27" y="38" width="10" height="9" rx="4" fill={skin} />

      {/* Hair back (for longer styles) */}
      {hairStyle === 1 && (
        <ellipse cx="32" cy="30" rx="17" ry="18" fill={hair} />
      )}
      {hairStyle === 2 && (
        <>
          <circle cx="17" cy="24" r="7" fill={hair} />
          <circle cx="47" cy="24" r="7" fill={hair} />
        </>
      )}

      {/* Ears */}
      <circle cx="17.5" cy="30" r="3.5" fill={skin} />
      <circle cx="46.5" cy="30" r="3.5" fill={skin} />

      {/* Head */}
      <rect x="18" y="16" width="28" height="27" rx="13" fill={skin} />

      {/* Hair top / hat */}
      {hairStyle === 0 && (
        <path
          d="M17 26 C17 15, 24 11, 32 11 C40 11, 47 15, 47 26 C43 21, 37 19, 32 20 C26 19, 21 21, 17 26 Z"
          fill={hair}
        />
      )}
      {hairStyle === 1 && (
        <path
          d="M17 25 C17 14, 24 11, 32 11 C40 11, 47 14, 47 25 C41 19, 23 19, 17 25 Z"
          fill={hair}
        />
      )}
      {hairStyle === 2 && (
        <path
          d="M18 24 C19 14, 25 11, 32 11 C39 11, 45 14, 46 24 C40 18, 24 18, 18 24 Z"
          fill={hair}
        />
      )}
      {hairStyle === 3 && (
        /* Cute beanie */
        <>
          <path
            d="M16 24 C16 14, 23 10, 32 10 C41 10, 48 14, 48 24 Z"
            fill={shirt}
          />
          <rect x="15" y="21" width="34" height="5" rx="2.5" fill="white" fillOpacity="0.28" />
          <circle cx="32" cy="9" r="3.2" fill={shirt} />
        </>
      )}

      {/* Rosy cheeks */}
      <circle cx="22.5" cy="33" r="2.4" fill="#fb7185" fillOpacity="0.35" />
      <circle cx="41.5" cy="33" r="2.4" fill="#fb7185" fillOpacity="0.35" />

      {/* Eyes */}
      <circle cx="26" cy="29" r="2.1" fill="#1f2937" />
      <circle cx="38" cy="29" r="2.1" fill="#1f2937" />
      <circle cx="26.7" cy="28.3" r="0.65" fill="white" />
      <circle cx="38.7" cy="28.3" r="0.65" fill="white" />

      {/* Optional glasses */}
      {hasGlasses && (
        <g stroke="#1f2937" strokeWidth="1.5" fill="white" fillOpacity="0.18">
          <circle cx="26" cy="29" r="4.5" />
          <circle cx="38" cy="29" r="4.5" />
          <line x1="30.5" y1="29" x2="33.5" y2="29" />
        </g>
      )}

      {/* Friendly smile */}
      {mouthStyle === 0 && (
        <path
          d="M27 35 Q32 39.5 37 35"
          fill="none"
          stroke="#1f2937"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
      {mouthStyle === 1 && (
        <path
          d="M27 35 Q32 40 37 35 Z"
          fill="#1f2937"
        />
      )}
      {mouthStyle === 2 && (
        <path
          d="M28 35.5 Q32 38.5 36 35.5"
          fill="none"
          stroke="#1f2937"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
