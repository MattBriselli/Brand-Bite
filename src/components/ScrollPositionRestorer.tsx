"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_PREFIX = "brandbite:scroll:";
let handledInitialDocumentLoad = false;

function getScrollKey(): string {
  return `${STORAGE_PREFIX}${window.location.pathname}${window.location.search}`;
}

export function ScrollPositionRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const key = getScrollKey();
    let userInteracted = false;

    const markInteracted = () => {
      userInteracted = true;
    };

    // Only restore on the actual initial document reload/back-forward, not subsequent SPA navigations
    const isInitialLoad = !handledInitialDocumentLoad;
    handledInitialDocumentLoad = true;

    const navEntries = performance.getEntriesByType?.("navigation") as
      | PerformanceNavigationTiming[]
      | undefined;
    const navType = navEntries?.[0]?.type;

    const shouldRestore =
      isInitialLoad &&
      !window.location.hash &&
      (navType === "reload" ||
        (navType === "back_forward" && window.scrollY < 10));

    const timeouts: number[] = [];
    let rafRestoreId: number | null = null;

    if (shouldRestore) {
      try {
        const raw = sessionStorage.getItem(key);
        const savedY = raw ? Number.parseInt(raw, 10) : NaN;

        if (Number.isFinite(savedY) && savedY > 0) {
          window.addEventListener("touchstart", markInteracted, { passive: true, once: true });
          window.addEventListener("wheel", markInteracted, { passive: true, once: true });
          window.addEventListener("pointerdown", markInteracted, { passive: true, once: true });
          window.addEventListener("keydown", markInteracted, { passive: true, once: true });

          const applyScroll = () => {
            if (userInteracted) return;
            window.scrollTo({ top: savedY, left: 0, behavior: "instant" as ScrollBehavior });
          };

          // Apply immediately, after first paint, and briefly after hydration/images settle
          applyScroll();
          rafRestoreId = window.requestAnimationFrame(applyScroll);
          timeouts.push(window.setTimeout(applyScroll, 120));
          timeouts.push(window.setTimeout(applyScroll, 350));
        }
      } catch {
        // Ignore storage access errors (e.g., private browsing restrictions)
      }
    }

    // Continuously save scroll position for the current route
    let saveRafId: number | null = null;
    const saveNow = () => {
      try {
        sessionStorage.setItem(getScrollKey(), String(Math.round(window.scrollY)));
      } catch {
        // Ignore quota / storage errors
      }
    };

    const onScroll = () => {
      if (saveRafId !== null) return;
      saveRafId = window.requestAnimationFrame(() => {
        saveRafId = null;
        saveNow();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", saveNow);
    window.addEventListener("beforeunload", saveNow);

    return () => {
      if (rafRestoreId !== null) window.cancelAnimationFrame(rafRestoreId);
      if (saveRafId !== null) window.cancelAnimationFrame(saveRafId);
      for (const id of timeouts) window.clearTimeout(id);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", saveNow);
      window.removeEventListener("beforeunload", saveNow);
      window.removeEventListener("touchstart", markInteracted);
      window.removeEventListener("wheel", markInteracted);
      window.removeEventListener("pointerdown", markInteracted);
      window.removeEventListener("keydown", markInteracted);
    };
  }, [pathname]);

  return null;
}
