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

    // Prevent the browser's native scroll restoration from scrolling onto the
    // footer while static Suspense fallbacks are still hydrating.
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {
      // Ignore restricted history APIs
    }

    const key = getScrollKey();
    let userInteracted = false;
    let isRestoring = false;

    const markInteracted = () => {
      userInteracted = true;
      isRestoring = false;
    };

    const saveNow = () => {
      if (isRestoring) return;
      try {
        const y = Math.max(0, Math.round(window.scrollY));
        if (y < 24) {
          sessionStorage.removeItem(getScrollKey());
        } else {
          sessionStorage.setItem(getScrollKey(), String(y));
        }
      } catch {
        // Ignore quota / storage errors
      }
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
    let observer: MutationObserver | null = null;

    if (shouldRestore) {
      try {
        const raw = sessionStorage.getItem(key);
        const savedY = raw ? Number.parseInt(raw, 10) : NaN;

        if (Number.isFinite(savedY) && savedY >= 24) {
          isRestoring = true;
          window.addEventListener("touchstart", markInteracted, { passive: true, once: true });
          window.addEventListener("wheel", markInteracted, { passive: true, once: true });
          window.addEventListener("pointerdown", markInteracted, { passive: true, once: true });
          window.addEventListener("keydown", markInteracted, { passive: true, once: true });

          const applyScroll = () => {
            if (userInteracted) return;
            // Wait until Suspense fallback has hydrated into real page content
            if (document.querySelector('[data-loading-fallback="true"]')) {
              return;
            }
            const maxScroll = Math.max(
              0,
              document.documentElement.scrollHeight - window.innerHeight
            );
            let targetY = savedY;
            if (savedY > maxScroll) {
              // Saved offset was deeper than the freshly hydrated page (e.g. after
              // "Show More" pagination reset). Clamp above the footer instead of
              // dumping the reader onto the footer.
              const footer = document.querySelector("footer");
              const aboveFooter = footer
                ? Math.max(0, footer.getBoundingClientRect().top + window.scrollY - window.innerHeight)
                : maxScroll;
              targetY = Math.min(maxScroll, aboveFooter);
            }
            window.scrollTo({ top: targetY, left: 0, behavior: "instant" as ScrollBehavior });
          };

          const scheduleSettlePasses = () => {
            applyScroll();
            rafRestoreId = window.requestAnimationFrame(applyScroll);
            timeouts.push(window.setTimeout(applyScroll, 120));
            timeouts.push(window.setTimeout(applyScroll, 350));
            timeouts.push(
              window.setTimeout(() => {
                isRestoring = false;
              }, 450)
            );
          };

          if (document.querySelector('[data-loading-fallback="true"]')) {
            observer = new MutationObserver(() => {
              if (!document.querySelector('[data-loading-fallback="true"]')) {
                observer?.disconnect();
                observer = null;
                scheduleSettlePasses();
              }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            // Safety cap so isRestoring always releases even if observer never fires
            timeouts.push(
              window.setTimeout(() => {
                if (observer) {
                  observer.disconnect();
                  observer = null;
                }
                scheduleSettlePasses();
              }, 1200)
            );
          } else {
            scheduleSettlePasses();
          }
        }
      } catch {
        isRestoring = false;
      }
    } else if (!isInitialLoad) {
      // On SPA navigation to a route (e.g. clicking "Live" from the footer of "/"),
      // clear any stale saved scroll offset for the destination route instead of
      // accidentally saving the previous route's scrollY before Next.js resets it.
      try {
        sessionStorage.removeItem(key);
      } catch {
        // Ignore storage errors
      }
    }

    // Continuously save scroll position for the current route
    let saveRafId: number | null = null;
    const onScroll = () => {
      if (isRestoring) return;
      if (saveRafId !== null) return;
      saveRafId = window.requestAnimationFrame(() => {
        saveRafId = null;
        saveNow();
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveNow();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", saveNow);
    window.addEventListener("beforeunload", saveNow);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (observer) observer.disconnect();
      if (rafRestoreId !== null) window.cancelAnimationFrame(rafRestoreId);
      if (saveRafId !== null) window.cancelAnimationFrame(saveRafId);
      for (const id of timeouts) window.clearTimeout(id);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", saveNow);
      window.removeEventListener("beforeunload", saveNow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("touchstart", markInteracted);
      window.removeEventListener("wheel", markInteracted);
      window.removeEventListener("pointerdown", markInteracted);
      window.removeEventListener("keydown", markInteracted);
    };
  }, [pathname]);

  return null;
}
