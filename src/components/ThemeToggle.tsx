"use client";

import React, { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "color-scheme";

function applySchemeToDom(stored: string | null) {
  const valid = stored === "light" || stored === "dark" ? stored : null;
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    meta.setAttribute("content", valid ?? "light dark");
  }
  if (valid) {
    document.documentElement.dataset.theme = valid;
  } else {
    delete document.documentElement.dataset.theme;
  }
}

export function ThemeToggle() {
  useEffect(() => {
    // Sync across open tabs if localStorage changes elsewhere
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        applySchemeToDom(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleToggle = () => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }

    const systemScheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const currentlyRendered =
      stored === "light" || stored === "dark" ? stored : systemScheme;

    // Select the opposite of what the user currently sees
    const target = currentlyRendered === "dark" ? "light" : "dark";

    try {
      if (target === systemScheme) {
        // User is undoing their override — remove entry so site follows OS preference again
        localStorage.removeItem(STORAGE_KEY);
        applySchemeToDom(null);
      } else {
        localStorage.setItem(STORAGE_KEY, target);
        applySchemeToDom(target);
      }
    } catch {
      applySchemeToDom(target);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] p-2 text-[var(--text-primary)] transition-colors cursor-pointer"
    >
      <span className="theme-show-when-light items-center gap-1.5">
        <Moon className="w-4 h-4 text-[var(--accent-brand)]" aria-hidden="true" />
        <span className="visually-hidden">Switch to dark theme</span>
      </span>
      <span className="theme-show-when-dark items-center gap-1.5">
        <Sun className="w-4 h-4 text-[#fbbf24]" aria-hidden="true" />
        <span className="visually-hidden">Switch to light theme</span>
      </span>
    </button>
  );
}
