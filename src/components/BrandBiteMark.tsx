import React, { useId } from "react";

interface BrandBiteMarkProps {
  className?: string;
}

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
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <mask id={maskId}>
          <rect width="64" height="64" fill="white" />
          <circle cx="57" cy="9" r="10.5" fill="black" />
          <circle cx="46" cy="4" r="7.5" fill="black" />
          <circle cx="61" cy="20" r="7.5" fill="black" />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
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
        <path
          d="M14 29 C14 16, 48 16, 48 29 Z"
          fill="#fbbf24"
          stroke="#181512"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <ellipse cx="25" cy="22" rx="2.3" ry="1.2" transform="rotate(-18 25 22)" fill="#fffbeb" />
        <ellipse cx="33" cy="20.5" rx="2.3" ry="1.2" transform="rotate(12 33 20.5)" fill="#fffbeb" />
        <ellipse cx="39.5" cy="23.5" rx="2.1" ry="1.1" transform="rotate(22 39.5 23.5)" fill="#fffbeb" />
        <path
          d="M12.5 32 Q18 29 23 32 T33 32 T43 32 T49.5 32"
          fill="none"
          stroke="#22c55e"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        <rect
          x="13"
          y="34.5"
          width="36"
          height="7.5"
          rx="3.75"
          fill="#451a03"
          stroke="#181512"
          strokeWidth="2.2"
        />
        <path
          d="M16 34.5 L46 34.5 L35 42.5 L28 36.5 Z"
          fill="#facc15"
          stroke="#181512"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M15 43.5 H47 C47 49, 43 51, 31 51 C19 51, 15 49, 15 43.5 Z"
          fill="#f59e0b"
          stroke="#181512"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
