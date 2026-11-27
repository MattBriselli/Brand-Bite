"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

export function showCopyToast(message = "Link copied!") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("brandbite:toast", { detail: { message } })
  );
}

export function CopyToastHost() {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<{ message?: string }>).detail;
      setMessage(detail?.message || "Link copied!");
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setMessage(null);
        timerRef.current = null;
      }, 2200);
    };

    window.addEventListener("brandbite:toast", onToast);
    return () => {
      window.removeEventListener("brandbite:toast", onToast);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[#132018] text-white px-4 py-2 text-xs sm:text-sm font-bold shadow-lg">
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0">
          <Check className="w-3 h-3" aria-hidden="true" />
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
}
