"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, LogOut, Trash2, ShieldCheck } from "lucide-react";
import {
  AUTH_CHANGED_EVENT,
  GOOGLE_CLIENT_ID,
  GoogleUserSession,
  clearGoogleSession,
  createSessionFromCredential,
  readGoogleSession,
  saveGoogleSession,
} from "@/lib/google-auth";

const COMMENTS_API_URL = "https://api.eatbrandbite.com/comments";

interface ArticleComment {
  id: string;
  articleSlug: string;
  authorName: string;
  authorAvatar: string | null;
  isAuthor: boolean;
  body: string;
  createdAt: string;
  createdFormatted: string;
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

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

  // Fetch comments for this article
  useEffect(() => {
    let active = true;
    fetch(`${COMMENTS_API_URL}?slug=${encodeURIComponent(articleSlug)}`)
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
  }, [articleSlug]);

  // Load Google Identity Services script & render Sign-In button when signed out
  useEffect(() => {
    if (user) return;

    const initButton = () => {
      const gsi = window.google?.accounts?.id;
      if (!gsi || !googleBtnRef.current) return;

      gsi.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (!response?.credential) return;
          const session = createSessionFromCredential(response.credential);
          if (!session) return;
          setUser(session);
          setErrorMsg(null);
          saveGoogleSession(session);
        },
      });

      googleBtnRef.current.innerHTML = "";
      gsi.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
      });
    };

    if (window.google?.accounts?.id) {
      initButton();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", initButton);
      return () => existingScript.removeEventListener("load", initButton);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initButton;
    document.head.appendChild(script);
  }, [user]);

  const handleSignOut = () => {
    setUser(null);
    clearGoogleSession();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
    } catch {
      setErrorMsg("Network error — please try posting again.");
    } finally {
      setSubmitting(false);
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
      }
    } catch {
      // Ignore
    }
  };

  const isBrandBiteAdmin =
    user?.email === "mattbriselli@gmail.com" ||
    user?.email === "hello@eatbrandbite.com";

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
          Google-verified • Zero anonymous spam
        </span>
      </div>

      {/* Composer or Google Sign-In */}
      {!user ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted-card)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-[var(--text-primary)]">
              Tried one of these drops? Weigh in.
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Sign in with Google to comment with your name &amp; photo. We never publish your email.
            </p>
          </div>
          <div ref={googleBtnRef} className="shrink-0 min-h-[40px]" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  width={32}
                  height={32}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-[var(--border-subtle)] object-cover"
                />
              )}
              <div className="text-xs">
                <span className="font-bold text-[var(--text-primary)]">{user.name}</span>
                {isBrandBiteAdmin && (
                  <span className="ml-1.5 rounded bg-[var(--accent-brand)] px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white">
                    BrandBite
                  </span>
                )}
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

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-[var(--text-secondary)]">
              {body.length}/600 • No links or spam
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
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted-card)] p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {c.authorAvatar ? (
                    <img
                      src={c.authorAvatar}
                      alt={c.authorName}
                      width={28}
                      height={28}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full border border-[var(--border-subtle)] object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">
                      {c.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
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
                </div>

                {user && (isBrandBiteAdmin || user.name === c.authorName) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    aria-label="Delete comment"
                    className="p-1 text-[var(--text-secondary)] hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
