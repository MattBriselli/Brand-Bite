"use client";

import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  LogOut,
  Trash2,
  ShieldCheck,
  Pencil,
  Heart,
  Check,
  X,
} from "lucide-react";
import { PseudonymAvatar } from "@/components/PseudonymAvatar";
import {
  AUTH_CHANGED_EVENT,
  GoogleUserSession,
  clearGoogleSession,
  loadGoogleOAuthScript,
  readGoogleSession,
  signInWithGoogleEmailOnly,
} from "@/lib/google-auth";

const COMMENTS_API_URL = "https://api.eatbrandbite.com/comments";
const COMMENT_LIKES_API_URL = "https://api.eatbrandbite.com/comment-likes";

interface ArticleComment {
  id: string;
  articleSlug: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  isAuthor: boolean;
  body: string;
  createdAt: string;
  updatedAt?: string | null;
  createdFormatted: string;
  likeCount?: number;
  likedByMe?: boolean;
}

interface ArticleCommentsProps {
  articleSlug: string;
  compact?: boolean;
}

export function ArticleComments({ articleSlug, compact = false }: ArticleCommentsProps) {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<GoogleUserSession | null>(null);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [likeAuthHintId, setLikeAuthHintId] = useState<string | null>(null);
  const [likingIds, setLikingIds] = useState<Set<string>>(() => new Set());

  // Inline edit state (strictly original poster only)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Restore active Google session & sync across components
  useEffect(() => {
    setUser(readGoogleSession());
    const onAuthChanged = (e: Event) => {
      const custom = e as CustomEvent<GoogleUserSession | null>;
      setUser(custom.detail ?? readGoogleSession());
    };
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
  }, []);

  useEffect(() => {
    if (user) setLikeAuthHintId(null);
  }, [user]);

  // Fetch comments for this article (passing Bearer token when signed in so likedByMe hydrates)
  useEffect(() => {
    let active = true;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (user?.idToken) {
      headers.Authorization = `Bearer ${user.idToken}`;
    }
    fetch(`${COMMENTS_API_URL}?slug=${encodeURIComponent(articleSlug)}`, {
      headers,
    })
      .then((r) => r.json())
      .then((data) => {
        if (active && data?.ok && Array.isArray(data.items)) {
          setComments(data.items);
        }
      })
      .catch(() => {
        // Silent fallback
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [articleSlug, user?.idToken]);

  // Preload Google OAuth2 script when signed out so popup opens immediately on click
  useEffect(() => {
    if (user) return;
    loadGoogleOAuthScript();
  }, [user]);

  const handleGoogleSignIn = async () => {
    if (signingIn) return;
    setSigningIn(true);
    setErrorMsg(null);
    try {
      const result = await signInWithGoogleEmailOnly();
      if (!result.ok) {
        setErrorMsg(result.error);
        return;
      }
      setUser(result.session);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setEditingId(null);
    clearGoogleSession();
  };

  const submitNewComment = async () => {
    if (!user || submitting) return;
    const trimmed = body.trim();
    if (trimmed.length < 2) {
      setErrorMsg("Write a quick thought before posting.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(COMMENTS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({
          articleSlug,
          body: trimmed,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        if (res.status === 401) {
          handleSignOut();
        }
        setErrorMsg(data?.error || "Could not post comment. Please try again.");
        return;
      }

      setComments((prev) => [data.item, ...prev]);
      setBody("");
      window.dispatchEvent(
        new CustomEvent("brandbite:comment-changed", {
          detail: { articleSlug, delta: 1 },
        })
      );
    } catch {
      setErrorMsg("Network error — please try posting again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitNewComment();
  };

  const startEditing = (comment: ArticleComment) => {
    setEditingId(comment.id);
    setEditBody(comment.body);
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditBody("");
    setEditError(null);
  };

  const saveEdit = async (commentId: string) => {
    if (!user || editSaving) return;
    const trimmed = editBody.trim();
    if (trimmed.length < 2) {
      setEditError("Comment is too short.");
      return;
    }

    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(COMMENTS_API_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({ id: commentId, body: trimmed }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        if (res.status === 401) {
          handleSignOut();
        }
        setEditError(data?.error || "Could not update comment.");
        return;
      }
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, ...data.item } : c))
      );
      cancelEditing();
    } catch {
      setEditError("Network error — please try saving again.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleLike = async (comment: ArticleComment) => {
    if (!user) {
      setLikeAuthHintId(comment.id);
      return;
    }
    if (likingIds.has(comment.id)) return;

    const wasLiked = Boolean(comment.likedByMe);
    const prevCount = Number(comment.likeCount || 0);

    // Optimistic update
    setLikingIds((prev) => new Set(prev).add(comment.id));
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? {
              ...c,
              likedByMe: !wasLiked,
              likeCount: Math.max(0, prevCount + (wasLiked ? -1 : 1)),
            }
          : c
      )
    );

    try {
      const res = await fetch(COMMENT_LIKES_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({ commentId: comment.id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        // Roll back
        setComments((prev) =>
          prev.map((c) =>
            c.id === comment.id
              ? { ...c, likedByMe: wasLiked, likeCount: prevCount }
              : c
          )
        );
        if (res.status === 401) {
          handleSignOut();
        }
        return;
      }

      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id
            ? {
                ...c,
                likedByMe: Boolean(data.liked),
                likeCount: Number(data.likeCount || 0),
              }
            : c
        )
      );
    } catch {
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id
            ? { ...c, likedByMe: wasLiked, likeCount: prevCount }
            : c
        )
      );
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(comment.id);
        return next;
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;
    try {
      const res = await fetch(
        `${COMMENTS_API_URL}?id=${encodeURIComponent(commentId)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user.idToken}` },
        }
      );
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        if (editingId === commentId) cancelEditing();
        window.dispatchEvent(
          new CustomEvent("brandbite:comment-changed", {
            detail: { articleSlug, delta: -1 },
          })
        );
      }
    } catch {
      // Ignore
    }
  };

  const isBrandBiteAdmin = Boolean(user?.isAuthor);

  return (
    <section
      id={compact ? undefined : "comments"}
      aria-labelledby={compact ? undefined : "comments-heading"}
      className={
        compact
          ? "space-y-4"
          : "rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-xs space-y-6"
      }
    >
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] ${compact ? "pb-3" : "pb-4"}`}>
        <div className="flex items-center gap-2">
          <MessageSquare className={`${compact ? "w-4 h-4" : "w-5 h-5"} text-[var(--accent-brand)]`} aria-hidden="true" />
          <h2
            id={compact ? undefined : "comments-heading"}
            className={`${compact ? "text-base" : "text-lg sm:text-xl"} font-black text-[var(--text-primary)]`}
          >
            Reader Discussion ({comments.length})
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          Fully pseudonymized
        </span>
      </div>

      {/* Composer or Google Sign-In */}
      {!user ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted-card)] p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-[var(--text-primary)]">
                Tried one of these drops? Weigh in.
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Sign in with Google (email-only verification — we never request your name or photo) to post under a randomized pseudonym &amp; illustrated avatar.
              </p>
            </div>
            <button
              type="button"
              disabled={signingIn}
              onClick={handleGoogleSignIn}
              className="shrink-0 inline-flex items-center justify-center gap-2.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] disabled:opacity-60 px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] shadow-2xs transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span>{signingIn ? "Signing in..." : "Sign in with Google"}</span>
            </button>
          </div>
          {errorMsg && (
            <p role="alert" className="text-xs font-semibold text-red-600">
              {errorMsg}
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <PseudonymAvatar
                seed={user.avatarSeed}
                name={user.handle}
                size={32}
              />
              <div className="text-xs">
                <span className="font-bold text-[var(--text-primary)]">{user.handle}</span>
                {isBrandBiteAdmin && (
                  <span className="ml-1.5 rounded bg-[var(--accent-brand)] px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white">
                    BrandBite
                  </span>
                )}
                <span className="ml-1.5 text-[11px] text-[var(--text-secondary)]">
                  (your pseudonym)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              Sign out
            </button>
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                void submitNewComment();
              }
            }}
            maxLength={600}
            rows={3}
            placeholder="Worth the drive-thru detour or hard pass? Drop your take..."
            className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none resize-y"
          />

          {errorMsg && (
            <p role="alert" className="text-xs font-semibold text-red-600">
              {errorMsg}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-[var(--text-secondary)]">
              {body.length}/600 • Shift+Enter to post • Enter for new line
            </span>
            <button
              type="submit"
              disabled={submitting || body.trim().length < 2}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-brand)] hover:opacity-90 disabled:opacity-50 px-4 py-2 text-xs sm:text-sm font-bold text-white transition-opacity cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      )}

      {/* Comment List */}
      {loading ? (
        <p className="text-xs text-[var(--text-secondary)]">Loading discussion...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">
          No comments yet — be the first to weigh in.
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => {
            const isOriginalPoster = Boolean(user && user.pseudoId === c.authorId);
            const canDelete = Boolean(user && (isBrandBiteAdmin || isOriginalPoster));
            const isEditing = editingId === c.id;
            const likeCount = Number(c.likeCount || 0);
            const likedByMe = Boolean(c.likedByMe);

            return (
              <li
                key={c.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted-card)] p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <PseudonymAvatar
                      seed={c.authorAvatar || c.authorId || c.authorName}
                      name={c.authorName}
                      size={28}
                    />
                    <span className="text-xs font-extrabold text-[var(--text-primary)]">
                      {c.authorName}
                    </span>
                    {c.isAuthor && (
                      <span className="rounded bg-[var(--accent-brand)] px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white">
                        BrandBite
                      </span>
                    )}
                    <time
                      dateTime={c.createdAt}
                      className="text-[11px] text-[var(--text-secondary)]"
                    >
                      • {c.createdFormatted}
                    </time>
                    {c.updatedAt && (
                      <span className="text-[11px] italic text-[var(--text-secondary)]">
                        (edited)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isOriginalPoster && !isEditing && (
                      <button
                        type="button"
                        onClick={() => startEditing(c)}
                        aria-label="Edit comment"
                        title="Edit comment"
                        className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-brand)] transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        aria-label="Delete comment"
                        title="Delete comment"
                        className="p-1 text-[var(--text-secondary)] hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.shiftKey) {
                          e.preventDefault();
                          void saveEdit(c.id);
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          cancelEditing();
                        }
                      }}
                      maxLength={600}
                      rows={3}
                      className="theme-input w-full rounded-xl border px-3 py-2 text-sm focus:outline-none resize-y"
                    />
                    {editError && (
                      <p role="alert" className="text-xs font-semibold text-red-600">
                        {editError}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        {editBody.length}/600 • Shift+Enter to save • Esc to cancel
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={editSaving}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => void saveEdit(c.id)}
                          disabled={editSaving || editBody.trim().length < 2}
                          className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent-brand)] hover:opacity-90 disabled:opacity-50 px-3 py-1 text-xs font-bold text-white cursor-pointer"
                        >
                          <Check className="w-3 h-3" aria-hidden="true" />
                          {editSaving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                    {c.body}
                  </p>
                )}

                {/* Comment footer: Like button */}
                {!isEditing && (
                  <div className="pt-1 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      disabled={likingIds.has(c.id)}
                      aria-pressed={likedByMe}
                      aria-label={likedByMe ? "Unlike comment" : "Like comment"}
                      onClick={() => void handleToggleLike(c)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-60 ${
                        likedByMe
                          ? "bg-[#c2410c] text-white"
                          : "border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent-brand)] hover:text-[var(--accent-brand)]"
                      }`}
                    >
                      <Heart
                        className={`w-3 h-3 ${likedByMe ? "fill-current" : ""}`}
                        aria-hidden="true"
                      />
                      <span>{likeCount > 0 ? likeCount : "Like"}</span>
                    </button>

                    {likeAuthHintId === c.id && !user && (
                      <span className="text-[11px] font-semibold text-[var(--accent-brand)]">
                        Sign in with Google above to like comments.
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
