"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  ExternalLink,
  Flame,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import type { LiveFeedItem } from "@/data/live-feed-types";
import { BrandCardBanner } from "@/components/BrandCardBanner";
import {
  ArticleActionModal,
  type ArticleModalItem,
} from "@/components/ArticleActionModal";
import {
  AUTH_CHANGED_EVENT,
  clearGoogleSession,
  readGoogleSession,
  type GoogleUserSession,
} from "@/lib/google-auth";
import {
  fetchCommentCounts,
  fetchUpvotes,
  toDiscussionSlug,
  toggleUpvote,
} from "@/lib/upvotes";
import { recordCardClick } from "@/lib/trending";
import { trackOutboundDispatch } from "@/lib/analytics";

interface BrandDispatchesClientProps {
  brandSlug: string;
  brandName: string;
  items: LiveFeedItem[];
}

export function BrandDispatchesClient({
  brandSlug,
  brandName,
  items,
}: BrandDispatchesClientProps) {
  const [googleUser, setGoogleUser] = useState<GoogleUserSession | null>(null);
  const [upvoteCounts, setUpvoteCounts] = useState<Record<string, number>>({});
  const [userUpvotedIds, setUserUpvotedIds] = useState<Set<string>>(() => new Set());
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(() => new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [brokenImages, setBrokenImages] = useState<Set<string>>(() => new Set());
  const [activeModalItem, setActiveModalItem] = useState<ArticleModalItem | null>(null);

  useEffect(() => {
    setGoogleUser(readGoogleSession());
    const onAuthChanged = (e: Event) => {
      const custom = e as CustomEvent<GoogleUserSession | null>;
      setGoogleUser(custom.detail ?? readGoogleSession());
    };
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
  }, []);

  useEffect(() => {
    let active = true;
    fetchUpvotes(googleUser?.idToken).then(({ counts, userUpvoted }) => {
      if (!active) return;
      setUpvoteCounts(counts);
      setUserUpvotedIds(userUpvoted);
    });
    return () => {
      active = false;
    };
  }, [googleUser?.idToken]);

  useEffect(() => {
    let active = true;
    fetchCommentCounts().then((counts) => {
      if (active) setCommentCounts(counts);
    });
    const onCommentChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ articleSlug?: string; delta?: number }>).detail;
      if (!detail?.articleSlug || !detail.delta) return;
      const slugKey = detail.articleSlug.toLowerCase();
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

  const openModal = (item: LiveFeedItem) => {
    recordCardClick(item.id, item.brandSlug);
    setActiveModalItem({
      id: item.id,
      title: item.title,
      href: item.url,
      isExternal: true,
      type: item.type,
      brand: item.brand,
      brandSlug: item.brandSlug,
      category: item.category,
      publishedAt: item.publishedAt,
      publishedFormatted: item.publishedFormatted,
      recencyLabel: item.publishedFormatted,
      image: item.image && !brokenImages.has(item.id) ? item.image : null,
      imageAlt: `${item.brand} — ${item.title}`,
      excerpt: item.excerpt,
      sourceName: item.sourceName,
      sourceBadgeColor: item.sourceBadgeColor,
      isCrossover: item.isCrossover,
      crossoverBrands: item.crossoverBrands,
      crossoverBrandSlugs: item.crossoverBrandSlugs,
    });
  };

  const handleToggleUpvote = async (itemId: string, fallbackItem?: LiveFeedItem) => {
    const normalizedId = itemId.toLowerCase();
    if (!googleUser) {
      if (fallbackItem) openModal(fallbackItem);
      return;
    }
    if (upvotingIds.has(normalizedId)) return;

    setUpvotingIds((prev) => new Set(prev).add(normalizedId));
    try {
      const result = await toggleUpvote(normalizedId, googleUser.idToken);
      if (!result.ok) {
        if (result.status === 401) {
          clearGoogleSession();
          setGoogleUser(null);
        }
        return;
      }
      setUpvoteCounts((prev) => ({ ...prev, [normalizedId]: result.count }));
      setUserUpvotedIds((prev) => {
        const next = new Set(prev);
        if (result.upvoted) next.add(normalizedId);
        else next.delete(normalizedId);
        return next;
      });
    } finally {
      setUpvotingIds((prev) => {
        const next = new Set(prev);
        next.delete(normalizedId);
        return next;
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10 text-center space-y-2">
        <p className="text-base font-bold text-[var(--text-primary)]">
          No {brandName} stories in the current live window yet.
        </p>
        <p className="text-sm text-[var(--text-secondary)]">
          We monitor {brandName} newsrooms and food blogs live — new drops appear here automatically as soon as they break.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="card-grid">
        {items.map((item) => {
          const hasImg = Boolean(item.image && !brokenImages.has(item.id));
          const normalizedId = item.id.toLowerCase();
          const itemUpvotes = upvoteCounts[normalizedId] || 0;
          const isUpvoted = userUpvotedIds.has(normalizedId);
          const isUpvoting = upvotingIds.has(normalizedId);
          const itemComments = commentCounts[toDiscussionSlug(item.id)] || 0;

          return (
            <article
              key={item.id}
              className={`card ${hasImg ? "has-image" : ""} ${
                item.isCrossover ? "ring-1 ring-fuchsia-500/35" : ""
              }`}
            >
              {hasImg && item.image ? (
                <img
                  src={item.image}
                  alt={`${item.brand} — ${item.title}`}
                  width={800}
                  height={500}
                  loading="lazy"
                  onError={() =>
                    setBrokenImages((prev) => new Set(prev).add(item.id))
                  }
                />
              ) : (
                <BrandCardBanner
                  brandSlug={brandSlug}
                  brandName={brandName}
                  category={item.category}
                />
              )}

              <header className="px-5 pt-4 pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.isCrossover && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider text-[11px] bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-xs">
                        <Sparkles className="w-3 h-3" aria-hidden="true" />
                        Crossover
                      </span>
                    )}
                    <span
                      className="px-2 py-0.5 rounded-md font-bold text-[11px] text-white"
                      style={{ backgroundColor: item.sourceBadgeColor }}
                    >
                      {item.sourceName}
                    </span>
                  </div>
                  <time
                    dateTime={item.publishedAt}
                    className="text-[var(--text-secondary)] font-medium"
                  >
                    {item.publishedFormatted}
                  </time>
                </div>

                <h3 className="text-lg font-extrabold text-[var(--text-primary)] leading-snug">
                  <button
                    type="button"
                    onClick={() => openModal(item)}
                    className="card-link text-left hover:text-[var(--accent-brand)] transition-colors cursor-pointer"
                  >
                    {item.title}
                  </button>
                </h3>
              </header>

              <div className="px-5 py-2 flex flex-col justify-between gap-3">
                <p className="snippet text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.excerpt}
                </p>
                <div className="rounded-xl bg-[var(--bg-muted-card)] border border-[var(--border-subtle)] p-3 flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Flame
                      className="w-3.5 h-3.5 text-[var(--accent-brand)]"
                      aria-hidden="true"
                    />
                    {item.category}
                  </span>
                  {item.isCrossover &&
                  item.crossoverBrands &&
                  item.crossoverBrands.length >= 2 ? (
                    <span className="inline-flex items-center gap-1 font-bold text-fuchsia-700 dark:text-fuchsia-300 truncate max-w-[190px]">
                      <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {item.crossoverBrands.join(" × ")}
                      </span>
                    </span>
                  ) : (
                    <span>{item.type}</span>
                  )}
                </div>
              </div>

              <footer className="px-5 py-3.5 mt-2 border-t border-[var(--border-subtle)] bg-[var(--bg-muted-card)] flex items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1 min-w-0">
                  {item.isCrossover &&
                  item.crossoverBrandSlugs &&
                  item.crossoverBrandSlugs.length >= 2 ? (
                    item.crossoverBrandSlugs.slice(0, 3).map((slug, i) => (
                      <Link
                        key={slug}
                        href={`/brands/${slug}`}
                        className={`font-bold px-2 py-0.5 rounded-md transition-opacity hover:opacity-85 truncate max-w-[110px] ${
                          slug === brandSlug
                            ? "bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                            : "bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300"
                        }`}
                      >
                        {item.crossoverBrands?.[i] || slug}
                      </Link>
                    ))
                  ) : (
                    <span className="font-bold text-[var(--text-primary)] truncate">
                      {brandName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {itemComments > 0 && (
                    <button
                      type="button"
                      onClick={() => openModal(item)}
                      aria-label={`${itemComments} comments on ${item.title}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--accent-brand)] transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3 text-[var(--accent-brand)]" aria-hidden="true" />
                      <span>{itemComments}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isUpvoting}
                    aria-pressed={isUpvoted}
                    aria-label={
                      isUpvoted
                        ? `Remove upvote from ${item.title}`
                        : `Upvote ${item.title}`
                    }
                    onClick={() => handleToggleUpvote(item.id, item)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-extrabold transition-colors cursor-pointer ${
                      isUpvoted
                        ? "bg-[var(--accent-brand)] text-white"
                        : "border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent-brand)] hover:text-[var(--accent-brand)]"
                    }`}
                  >
                    <ArrowUp className="w-3 h-3" aria-hidden="true" />
                    <span>{itemUpvotes}</span>
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      recordCardClick(item.id, item.brandSlug);
                      trackOutboundDispatch({
                        title: item.title,
                        brand: item.brand,
                        sourceName: item.sourceName,
                        url: item.url,
                      });
                    }}
                    className="font-bold text-[var(--accent-brand)] hover:underline inline-flex items-center gap-1"
                  >
                    Source
                    <span className="sr-only"> for {item.title}</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </footer>
            </article>
          );
        })}
      </div>

      <ArticleActionModal
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
        user={googleUser}
        upvoteCount={
          activeModalItem
            ? upvoteCounts[activeModalItem.id.toLowerCase()] || 0
            : 0
        }
        hasUpvoted={
          activeModalItem
            ? userUpvotedIds.has(activeModalItem.id.toLowerCase())
            : false
        }
        upvoting={
          activeModalItem
            ? upvotingIds.has(activeModalItem.id.toLowerCase())
            : false
        }
        onToggleUpvote={(id) => handleToggleUpvote(id)}
        onOutboundRead={(modalItem) => {
          recordCardClick(modalItem.id, modalItem.brandSlug);
          trackOutboundDispatch({
            title: modalItem.title,
            brand: modalItem.brand,
            sourceName: modalItem.sourceName,
            url: modalItem.href,
          });
        }}
      />
    </>
  );
}
