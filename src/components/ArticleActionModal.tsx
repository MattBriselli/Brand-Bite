"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  ArrowUp,
  ExternalLink,
  ArrowRight,
  Link2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ArticleComments } from "@/components/ArticleComments";
import { showCopyToast } from "@/components/CopyToastHost";
import { GoogleUserSession } from "@/lib/google-auth";
import { fetchArticleSubtitle, toDiscussionSlug } from "@/lib/upvotes";

export interface ArticleModalItem {
  id: string;
  title: string;
  href: string;
  isExternal: boolean;
  type: string;
  brand: string;
  brandSlug: string;
  category: string;
  publishedAt: string;
  publishedFormatted: string;
  recencyLabel: string;
  image: string | null;
  imageAlt: string;
  excerpt: string;
  sourceName: string;
  sourceBadgeColor: string;
  editorialSlug?: string;
  isCrossover?: boolean;
  crossoverBrands?: string[];
}

interface ArticleActionModalProps {
  item: ArticleModalItem | null;
  onClose: () => void;
  user: GoogleUserSession | null;
  upvoteCount: number;
  hasUpvoted: boolean;
  upvoting: boolean;
  onToggleUpvote: (itemId: string) => void;
  onOutboundRead: (item: ArticleModalItem) => void;
}

export function ArticleActionModal({
  item,
  onClose,
  user,
  upvoteCount,
  hasUpvoted,
  upvoting,
  onToggleUpvote,
  onOutboundRead,
}: ArticleActionModalProps) {
  const [liveSubtitle, setLiveSubtitle] = useState<string | null>(null);
  const [loadingSubtitle, setLoadingSubtitle] = useState(false);
  const [authHint, setAuthHint] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // Close on Escape and lock body scroll while open
  useEffect(() => {
    if (!item) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [item, onClose]);

  // Clear auth hint once user signs in
  useEffect(() => {
    if (user) setAuthHint(false);
  }, [user]);

  // Fetch real subtitle/meta description for external wire articles
  useEffect(() => {
    if (!item) return;
    setImgFailed(false);
    setLiveSubtitle(null);
    setAuthHint(false);

    if (!item.isExternal || !item.href.startsWith("https://")) {
      setLoadingSubtitle(false);
      return;
    }

    let active = true;
    setLoadingSubtitle(true);
    fetchArticleSubtitle(item.href)
      .then((subtitle) => {
        if (active && subtitle) {
          setLiveSubtitle(subtitle);
        }
      })
      .finally(() => {
        if (active) setLoadingSubtitle(false);
      });

    return () => {
      active = false;
    };
  }, [item]);

  if (!item) return null;

  const discussionSlug = item.editorialSlug || toDiscussionSlug(item.id);
  const displayedSubtitle = liveSubtitle || item.excerpt;

  const handleUpvoteClick = () => {
    if (!user) {
      setAuthHint(true);
      return;
    }
    onToggleUpvote(item.id);
  };

  const handleCopyLink = async () => {
    const shareUrl = item.isExternal
      ? item.href
      : `${window.location.origin}${item.href}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Ignore clipboard errors
    }
    showCopyToast("Article link copied!");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-2xl max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-2xl">
        {/* Sticky modal header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandLogo slug={item.brandSlug} name={item.brand} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-extrabold text-[var(--text-primary)] truncate">
                  {item.brand}
                </span>
                <span className="px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] bg-[var(--bg-subtle)] text-[var(--accent-brand)]">
                  {item.type}
                </span>
                {item.isCrossover && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider text-[10px] bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-xs">
                    <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                    Crossover
                  </span>
                )}
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: item.sourceBadgeColor }}
                >
                  {item.sourceName}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {item.recencyLabel} • {item.publishedFormatted}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close article preview"
            className="shrink-0 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted-card)] hover:bg-[var(--bg-subtle)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {item.image && !imgFailed && (
            <div className="w-full max-h-64 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
              <img
                src={item.image}
                alt={item.imageAlt}
                onError={() => setImgFailed(true)}
                className="w-full h-full max-h-64 object-cover"
              />
            </div>
          )}

          <div className="space-y-2.5">
            {item.isCrossover && (
              <div className="inline-flex flex-wrap items-center gap-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-extrabold text-fuchsia-700 dark:text-fuchsia-300">
                <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Brand Crossover</span>
                {item.crossoverBrands && item.crossoverBrands.length >= 2 && (
                  <span className="font-bold text-[var(--text-primary)]">
                    • {item.crossoverBrands.join(" × ")}
                  </span>
                )}
              </div>
            )}
            <h2
              id="article-modal-title"
              className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-snug"
            >
              {item.title}
            </h2>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted-card)] p-3.5 sm:p-4 space-y-1.5">
              {loadingSubtitle && !liveSubtitle ? (
                <p className="text-xs text-[var(--text-secondary)] inline-flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-brand)]" aria-hidden="true" />
                  Loading article summary...
                </p>
              ) : null}
              {displayedSubtitle && (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {displayedSubtitle}
                </p>
              )}
              {liveSubtitle && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]/80 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[var(--accent-brand)]" aria-hidden="true" />
                  Summary from {item.sourceName}
                </p>
              )}
            </div>
          </div>

          {/* Action Bar: Upvote (no downvote), Read Full Story, Copy Link */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={upvoting}
                aria-pressed={hasUpvoted}
                onClick={handleUpvoteClick}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer disabled:opacity-60 ${
                  hasUpvoted
                    ? "bg-[#c2410c] text-white shadow-xs"
                    : "border border-[var(--border-strong)] bg-[var(--bg-muted-card)] text-[var(--text-primary)] hover:border-[var(--accent-brand)] hover:text-[var(--accent-brand)]"
                }`}
              >
                <ArrowUp className="w-4 h-4" aria-hidden="true" />
                <span>{hasUpvoted ? "Upvoted" : "Upvote"}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] leading-none ${
                    hasUpvoted
                      ? "bg-white/20 text-white"
                      : "bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                  }`}
                >
                  {upvoteCount}
                </span>
              </button>

              {item.isExternal ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onOutboundRead(item)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] hover:opacity-90 px-4 py-2.5 text-xs sm:text-sm font-bold transition-opacity"
                >
                  Read at {item.sourceName}
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              ) : (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] hover:opacity-90 px-4 py-2.5 text-xs sm:text-sm font-bold transition-opacity"
                >
                  Read Full BrandBite Article
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              )}

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-muted-card)] hover:bg-[var(--bg-subtle)] px-3.5 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                Copy Link
              </button>
            </div>

            {authHint && !user && (
              <p className="text-xs font-semibold text-[var(--accent-brand)]">
                Sign in with Google below to upvote or comment on this article.
              </p>
            )}
          </div>

          {/* Embedded Google-Verified Discussion */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <ArticleComments articleSlug={discussionSlug} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
