import React, { useId } from "react";

interface BrandBiteMarkProps {
  className?: string;
}

// Seasonal Christmas Edition Chomp-Ticket Logo (Crimson ticket + Santa hat + snow accents)
export function BrandBiteMark({ className = "w-11 h-11" }: BrandBiteMarkProps) {
  const uid = useId();
  const gradId = `${uid}-grad`;
  const maskId = `${uid}-chomp`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <mask id={maskId}>
          <rect width="64" height="64" fill="white" />
          <circle cx="57" cy="9" r="10.5" fill="black" />
          <circle cx="46" cy="4" r="7.5" fill="black" />
          <circle cx="61" cy="20" r="7.5" fill="black" />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        {/* Festive crimson ticket badge */}
        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          rx="15"
          fill={`url(#${gradId})`}
          stroke="#181512"
          strokeWidth="3"
        />
        <circle cx="57" cy="9" r="10.5" fill="none" stroke="#181512" strokeWidth="3" />
        <circle cx="46" cy="4" r="7.5" fill="none" stroke="#181512" strokeWidth="3" />
        <circle cx="61" cy="20" r="7.5" fill="none" stroke="#181512" strokeWidth="3" />

        {/* Subtle holiday snow dots */}
        <circle cx="12" cy="13" r="1.8" fill="#fef3c7" opacity="0.9" />
        <circle cx="52" cy="46" r="1.6" fill="#fef3c7" opacity="0.85" />
        <circle cx="11" cy="50" r="1.4" fill="#fef3c7" opacity="0.8" />

        {/* Sesame Top Bun */}
        <path
          d="M14 31 C14 19, 48 19, 48 31 Z"
          fill="#fbbf24"
          stroke="#181512"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <ellipse cx="26" cy="25" rx="2.1" ry="1.1" transform="rotate(-15 26 25)" fill="#fffbeb" />
        <ellipse cx="34" cy="23.5" rx="2.1" ry="1.1" transform="rotate(10 34 23.5)" fill="#fffbeb" />
        <ellipse cx="40.5" cy="26" rx="2" ry="1" transform="rotate(20 40.5 26)" fill="#fffbeb" />

        {/* Festive Santa Hat perched on top-left of bun */}
        <path
          d="M16 21 C18 11, 29 8, 36 12 C32 14, 30 17, 30 21 Z"
          fill="#ef4444"
          stroke="#181512"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <rect
          x="14.5"
          y="18.5"
          width="17.5"
          height="4.4"
          rx="2.2"
          transform="rotate(-10 23 20.5)"
          fill="#ffffff"
          stroke="#181512"
          strokeWidth="1.6"
        />
        <circle cx="37.5" cy="12.5" r="3" fill="#ffffff" stroke="#181512" strokeWidth="1.6" />

        {/* Crisp Lettuce */}
        <path
          d="M12.5 34 Q18 31 23 34 T33 34 T43 34 T49.5 34"
          fill="none"
          stroke="#22c55e"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        {/* Patty */}
        <rect
          x="13"
          y="36.5"
          width="36"
          height="7.2"
          rx="3.6"
          fill="#451a03"
          stroke="#181512"
          strokeWidth="2.2"
        />
        {/* Melted Cheese Drip */}
        <path
          d="M16 36.5 L46 36.5 L35 44.2 L28 38.5 Z"
          fill="#facc15"
          stroke="#181512"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Bottom Bun */}
        <path
          d="M15 45 H47 C47 50.5, 43 52.5, 31 52.5 C19 52.5, 15 50.5, 15 45 Z"
          fill="#f59e0b"
          stroke="#181512"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
