"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Flame,
  CheckCircle2,
  Bookmark,
  MessageSquare,
  ExternalLink,
  ArrowRight,
  ChevronUp,
  Clock,
} from "lucide-react";
import { WEEKLY_SPECIALS, type RotationCadence } from "@/data/weekly-specials";
import { INITIAL_LIVE_FEED } from "@/data/live-feed-types";
import { ArticleComments } from "@/components/ArticleComments";
import { BrandLogo } from "@/components/BrandLogo";
import { CopyableTitle } from "@/components/CopyableTitle";
import { fetchCommentCounts } from "@/lib/upvotes";

const REACTIONS_API_URL = "https://api.eatbrandbite.com/reactions";
const VOTES_STORAGE_KEY = "brandbite:special-votes";
const CLIENT_ID_STORAGE_KEY = "brandbite:client-id";

interface ReactionCount {
  tried: number;
  want: number;
}

interface UserVotes {
  [itemId: string]: {
    tried?: boolean;
    want?: boolean;
  };
}

function getOrCreateClientId(): string {
  try {
    let cid = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (!cid) {
      cid = `bb-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(CLIENT_ID_STORAGE_KEY, cid);
    }
    return cid;
  } catch {
    return "bb-anon";
  }
}

interface SpecialsOnNowProps {
  compact?: boolean;
}

export function SpecialsOnNow({ compact = false }: SpecialsOnNowProps) {
  const [cadenceFilter, setCadenceFilter] = useState<"All" | RotationCadence>("All");
  const [counts, setCounts] = useState<Record<string, ReactionCount>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  // Guarantee an expanded special card (and its comments drawer) never opens below the viewport
  useEffect(() => {
    if (!openCommentId) return;

    const ensureInViewport = (behavior: ScrollBehavior) => {
      const el = cardRefs.current[openCommentId];
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const topClearance = 84; // Sticky header clearance on mobile & desktop
      const bottomClearance = 20;
      const availableHeight = Math.max(200, viewportHeight - topClearance - bottomClearance);

      let deltaY = 0;
      if (rect.height > availableHeight) {
        // Card is taller than viewport: align its top cleanly below the sticky header
        if (rect.top < topClearance || rect.top > topClearance + 24) {
          deltaY = rect.top - topClearance;
        }
      } else if (rect.bottom > viewportHeight - bottomClearance) {
        // Card expanded below the bottom edge: scroll down just enough to bring it all in
        deltaY = rect.bottom - (viewportHeight - bottomClearance);
        // Never push the card's top above the sticky header
        if (rect.top - deltaY < topClearance) {
          deltaY = rect.top - topClearance;
        }
      } else if (rect.top < topClearance) {
        deltaY = rect.top - topClearance;
      }

      if (Math.abs(deltaY) > 6) {
        window.scrollBy({ top: deltaY, behavior });
      }
    };

    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        ensureInViewport("smooth");
      });
    });

    // One follow-up adjustment after comments finish hydrating & expanding height
    const followUpTimer = window.setTimeout(() => {
      ensureInViewport("smooth");
    }, 320);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(followUpTimer);
    };
  }, [openCommentId]);
  const [nowMs, setNowMs] = useState<number>(() => {
    const parsed = Date.parse(INITIAL_LIVE_FEED.lastSyncedAt);
    return Number.isFinite(parsed) ? parsed : 0;
  });

  // Auto-hide expired dated specials so stale items never hurt reader trust
  const activeSpecials = useMemo(() => {
    return WEEKLY_SPECIALS.filter((s) => {
      if (!s.expiresAt) return true;
      const exp = Date.parse(s.expiresAt);
      return !Number.isFinite(exp) || exp >= nowMs;
    });
  }, [nowMs]);

  // Match any fresh (< 7 day) live dispatch for each rotating brand
  const latestFreshByBrand = useMemo(() => {
    const cutoff = nowMs - 7 * 24 * 60 * 60 * 1000;
    const map = new Map<string, { title: string; url: string }>();
    for (const item of INITIAL_LIVE_FEED.items || []) {
      if (!item.brandSlug || map.has(item.brandSlug)) continue;
      const ts = Date.parse(item.publishedAt);
      if (Number.isFinite(ts) && ts >= cutoff) {
        map.set(item.brandSlug, { title: item.title, url: item.url });
      }
    }
    return map;
  }, [nowMs]);

  const visibleSpecials = useMemo(() => {
    const base = compact ? activeSpecials.slice(0, 4) : activeSpecials;
    if (compact || cadenceFilter === "All") return base;
    return base.filter((s) => s.cadence === cadenceFilter);
  }, [compact, cadenceFilter, activeSpecials]);

  // Restore user's local vote toggles & refresh real clock for expiration guard
  useEffect(() => {
    setNowMs(Date.now());
    try {
      const raw = localStorage.getItem(VOTES_STORAGE_KEY);
      if (raw) {
        setUserVotes(JSON.parse(raw) as UserVotes);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Fetch live reaction counts from Cloudflare D1
  useEffect(() => {
    const ids = WEEKLY_SPECIALS.map((s) => s.id).join(",");
    let active = true;
    fetch(`${REACTIONS_API_URL}?ids=${encodeURIComponent(ids)}`)
      .then((r) => r.json())
      .then((data) => {
        if (active && data?.ok && data.counts) {
          setCounts(data.counts);
        }
      })
      .catch(() => {
        // Silent fallback
      });
    fetchCommentCounts("special-").then((cMap) => {
      if (active) setCommentCounts(cMap);
    });
    const onCommentChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ articleSlug?: string; delta?: number }>).detail;
      if (!detail?.articleSlug || !detail.delta) return;
      const slugKey = detail.articleSlug.toLowerCase();
      if (!slugKey.startsWith("special-")) return;
      setCommentCounts((prev) => ({
        ...prev,
        [slugKey]: Math.max(0, (prev[slugKey] || 0) + Number(detail.delta || 0)),
      }));
    };
    window.addEventListener("brandbite:comment-changed", onCommentChanged);
    return () => {
      active = false;
      window.removeEventListener("brandbite:comment-changed", onCommentChanged);
    };
  }, []);

  const toggleReaction = async (itemId: string, reactionType: "tried" | "want") => {
    const currentlyActive = Boolean(userVotes[itemId]?.[reactionType]);
    const action = currentlyActive ? "remove" : "add";

    // Optimistic UI update
    const nextVotes: UserVotes = {
      ...userVotes,
      [itemId]: {
        ...(userVotes[itemId] || {}),
        [reactionType]: !currentlyActive,
      },
    };
    setUserVotes(nextVotes);
    try {
      localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(nextVotes));
    } catch {
      // Ignore storage errors
    }

    setCounts((prev) => {
      const cur = prev[itemId] || { tried: 0, want: 0 };
      const delta = action === "add" ? 1 : -1;
      return {
        ...prev,
        [itemId]: {
          ...cur,
          [reactionType]: Math.max(0, cur[reactionType] + delta),
        },
      };
    });

    try {
      const res = await fetch(REACTIONS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          reactionType,
          action,
          clientId: getOrCreateClientId(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok && data.counts) {
        setCounts((prev) => ({
          ...prev,
          [itemId]: data.counts,
        }));
      }
    } catch {
      // Keep optimistic state if offline
    }
  };

  return (
    <section
      id="specials-on-now"
      aria-labelledby="specials-on-now-heading"
      className="space-y-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--accent-brand)] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" aria-hidden="true" />
            Glanceable Menu Radar
          </p>
          <CopyableTitle
            as="h2"
            id="specials-on-now-heading"
            href="/specials"
            className={
              compact
                ? "text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5"
                : "hero-headline font-black text-[var(--text-primary)] mt-1"
            }
          >
            Specials On Now
          </CopyableTitle>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Weekly cookie drops, rotating bagel schmears &amp; seasonal scoops — tap what you&apos;ve tried or want to hunt down.
          </p>
        </div>

        {compact ? (
          <Link
            href="/specials"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] px-3.5 py-2 text-xs font-bold text-[var(--text-primary)] transition-colors whitespace-nowrap"
          >
            All {activeSpecials.length} Rotating Specials
            <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-brand)]" aria-hidden="true" />
          </Link>
        ) : (
          <div
            className="inline-flex rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-1"
            role="group"
            aria-label="Filter rotating specials by cadence"
          >
            {(["All", "Weekly Drop", "Monthly Drop", "Seasonal"] as const).map((opt) => {
              const active = cadenceFilter === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCadenceFilter(opt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleSpecials.map((special) => {
          const itemCounts = counts[special.id] || { tried: 0, want: 0 };
          const triedActive = Boolean(userVotes[special.id]?.tried);
          const wantActive = Boolean(userVotes[special.id]?.want);
          const isCommentsOpen = openCommentId === special.id;
          const specialCommentCount = commentCounts[`special-${special.id}`.toLowerCase()] || 0;

          return (
            <article
              key={special.id}
              ref={(el) => {
                cardRefs.current[special.id] = el;
              }}
              onClick={(e) => {
                const target = e.target as HTMLElement | null;
                if (
                  target?.closest(
                    'a, button, input, textarea, [data-stop-card-toggle="true"]'
                  )
                ) {
                  return;
                }
                if (typeof window !== "undefined" && window.getSelection()?.toString()) {
                  return;
                }
                setOpenCommentId(isCommentsOpen ? null : special.id);
              }}
              className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 flex flex-col justify-between gap-3.5 shadow-xs scroll-mt-24 transition-colors cursor-pointer ${
                isCommentsOpen
                  ? "sm:col-span-2 lg:col-span-4 border-[var(--accent-brand)]/50"
                  : "hover:border-[var(--accent-brand)]/60"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                  <Link
                    href={`/brands/${special.brandSlug}`}
                    className="inline-flex items-center gap-2 min-w-0 group"
                  >
                    <BrandLogo
                      slug={special.brandSlug}
                      name={special.brand}
                      accentColor={special.accentColor}
                      size="sm"
                    />
                    <span
                      className="rounded-md px-2 py-0.5 text-white group-hover:opacity-90 transition-opacity truncate"
                      style={{ backgroundColor: special.accentColor }}
                    >
                      {special.brand}
                    </span>
                  </Link>
                  <span className="text-[var(--text-secondary)] shrink-0">{special.windowLabel}</span>
                </div>

                <CopyableTitle
                  as="h3"
                  id={special.id}
                  href={`/specials#${special.id}`}
                  className="text-base font-extrabold text-[var(--text-primary)] leading-snug scroll-mt-24"
                >
                  {special.headline}
                </CopyableTitle>

                {special.goneByLabel && (
                  <p className="inline-flex items-start gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-extrabold text-[var(--text-primary)] leading-snug">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{special.goneByLabel}</span>
                  </p>
                )}

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {special.summary}
                </p>

                {special.flavors && special.flavors.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {special.flavors.map((flavor) => (
                      <span
                        key={flavor}
                        className="rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] font-bold text-[var(--text-primary)]"
                      >
                        {flavor}
                      </span>
                    ))}
                  </div>
                )}

                {special.promoCode && (
                  <p className="text-[11px] font-bold text-[var(--text-primary)]">
                    Code:{" "}
                    <code className="rounded border border-[var(--accent-brand)]/40 bg-[var(--bg-subtle)] px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-[var(--accent-brand)]">
                      {special.promoCode}
                    </code>
                  </p>
                )}

                {latestFreshByBrand.get(special.brandSlug) && (
                  <a
                    href={latestFreshByBrand.get(special.brandSlug)!.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-primary)] hover:border-[var(--accent-brand)] transition-colors line-clamp-2"
                  >
                    <span className="font-extrabold text-[var(--accent-brand)]">Latest: </span>
                    {latestFreshByBrand.get(special.brandSlug)!.title}
                  </a>
                )}

                <p className="text-[10px] font-semibold text-[var(--text-secondary)]">
                  Verified {special.verifiedAt}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    aria-pressed={triedActive}
                    onClick={() => toggleReaction(special.id, "tried")}
                    className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      triedActive
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-[var(--border-strong)] bg-[var(--bg-muted-card)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>I Tried It</span>
                    {itemCounts.tried > 0 && (
                      <span className="opacity-85">({itemCounts.tried})</span>
                    )}
                  </button>

                  <button
                    type="button"
                    aria-pressed={wantActive}
                    onClick={() => toggleReaction(special.id, "want")}
                    className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      wantActive
                        ? "border-[var(--accent-brand)] bg-[var(--accent-brand)] text-white"
                        : "border-[var(--border-strong)] bg-[var(--bg-muted-card)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Want to Try</span>
                    {itemCounts.want > 0 && (
                      <span className="opacity-85">({itemCounts.want})</span>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <button
                    type="button"
                    aria-expanded={isCommentsOpen}
                    onClick={() =>
                      setOpenCommentId(isCommentsOpen ? null : special.id)
                    }
                    className="inline-flex items-center gap-1 font-bold text-[var(--text-secondary)] hover:text-[var(--accent-brand)] transition-colors cursor-pointer"
                  >
                    {isCommentsOpen ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                        Hide Comments
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                        Comments{specialCommentCount > 0 ? ` (${specialCommentCount})` : ""}
                      </>
                    )}
                  </button>

                  <a
                    href={special.menuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[var(--accent-brand)] hover:underline inline-flex items-center gap-1"
                  >
                    {special.linkKind === "menu" ? "Live Menu" : "Visit Site"}
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {isCommentsOpen && (
                <div
                  data-stop-card-toggle="true"
                  className="pt-3 border-t border-[var(--border-subtle)] cursor-default"
                >
                  <ArticleComments articleSlug={`special-${special.id}`} />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
