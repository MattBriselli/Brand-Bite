"use client";

import React, { useId, useRef, useState } from "react";
import { Mail, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { NEWSLETTER_FORM_ACTION } from "@/data/socials";
import { BRANDS } from "@/data/articles";
import {
  trackNewsletterFocus,
  trackNewsletterSignupAttempt,
} from "@/lib/analytics";

interface WeeklyBiteSignupProps {
  placement: "home_banner" | "footer";
  compact?: boolean;
}

export function WeeklyBiteSignup({
  placement,
  compact = false,
}: WeeklyBiteSignupProps) {
  const uid = useId();
  const headingId = `${uid}-heading`;
  const emailId = `${uid}-email`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;

  const inputRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTrackedFocusRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const hasBlurredRef = useRef(false);

  const [ariaInvalid, setAriaInvalid] = useState<"true" | "false">("false");
  const [useFallbackInvalidClass, setUseFallbackInvalidClass] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSuccessMsg, setLocalSuccessMsg] = useState<string | null>(null);

  const syncValidationState = (
    el: HTMLInputElement,
    shouldAnnounce: boolean
  ) => {
    const supportsUserInvalid =
      typeof CSS !== "undefined" && CSS.supports("selector(:user-invalid)");
    const isInvalid = supportsUserInvalid
      ? el.matches(":user-invalid")
      : !el.validity.valid && (hasBlurredRef.current || isSubmitting);

    if (!supportsUserInvalid) {
      setUseFallbackInvalidClass(!el.validity.valid && hasBlurredRef.current);
    }

    if (isInvalid) {
      setAriaInvalid("true");
      if (shouldAnnounce) {
        if (announceTimerRef.current) clearTimeout(announceTimerRef.current);
        setLiveAnnouncement("");
        announceTimerRef.current = setTimeout(() => {
          setLiveAnnouncement(
            "Email address: Error: Enter a valid email address in the format you@example.com."
          );
        }, 500);
      }
    } else {
      setAriaInvalid("false");
      if (announceTimerRef.current) clearTimeout(announceTimerRef.current);
      setLiveAnnouncement("");
    }
  };

  const handleFocus = () => {
    if (!hasTrackedFocusRef.current) {
      hasTrackedFocusRef.current = true;
      trackNewsletterFocus(placement);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    hasInteractedRef.current = true;
    const el = e.currentTarget;
    if (hasBlurredRef.current || ariaInvalid === "true") {
      syncValidationState(el, false);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    hasBlurredRef.current = true;
    if (hasInteractedRef.current) {
      syncValidationState(e.currentTarget, true);
    }
  };

  const handleInvalid = (e: React.FormEvent<HTMLInputElement>) => {
    hasInteractedRef.current = true;
    hasBlurredRef.current = true;
    const supportsUserInvalid =
      typeof CSS !== "undefined" && CSS.supports("selector(:user-invalid)");
    if (!supportsUserInvalid) {
      setUseFallbackInvalidClass(true);
    }
    setAriaInvalid("true");
    e.currentTarget.focus();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    if (honeypotRef.current && honeypotRef.current.value) {
      e.preventDefault();
      return;
    }

    const emailEl = inputRef.current;
    if (emailEl && !emailEl.validity.valid) {
      e.preventDefault();
      hasInteractedRef.current = true;
      hasBlurredRef.current = true;
      setAriaInvalid("true");
      setUseFallbackInvalidClass(true);
      emailEl.focus();
      return;
    }

    setIsSubmitting(true);
    trackNewsletterSignupAttempt(placement);

    // If Kit / Beehiiv endpoint is configured, let native POST proceed!
    if (NEWSLETTER_FORM_ACTION) {
      return;
    }

    // Preview fallback until the Kit form endpoint URL is pasted into socials.ts / env
    e.preventDefault();
    setIsSubmitting(false);
    setLocalSuccessMsg(
      "Thanks! Signup tracking fired — connect your free Kit form URL to start collecting live Weekly Bite subscribers."
    );
    form.reset();
    hasInteractedRef.current = false;
    hasBlurredRef.current = false;
    setAriaInvalid("false");
    setUseFallbackInvalidClass(false);
  };

  return (
    <section
      id={placement === "home_banner" ? "weekly-bite" : undefined}
      aria-labelledby={headingId}
      className={
        compact
          ? "rounded-2xl border border-[#2c2621] bg-[#211d19] p-5 space-y-3"
          : "rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-xs space-y-5"
      }
    >
      <div aria-live="polite" className="visually-hidden">
        {liveAnnouncement}
      </div>

      <div className="space-y-1.5">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest ${
            compact ? "text-[#f97316]" : "text-[var(--accent-brand)]"
          }`}
        >
          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
          Free Friday Email Digest
        </span>
        <h2
          id={headingId}
          className={
            compact
              ? "text-lg font-black text-white"
              : "text-2xl sm:text-3xl font-black text-[var(--text-primary)]"
          }
        >
          Get <span className={compact ? "text-[#f97316]" : "text-[var(--accent-brand)]"}>The Weekly Bite</span> Every Friday
        </h2>
        <p
          className={
            compact
              ? "text-xs text-[#d6cfc7] leading-relaxed"
              : "text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed"
          }
        >
          One skimmable Friday morning roundup of the week&apos;s wildest fast-food drops, weekend deals, and grocery-aisle impulse buys across {BRANDS.length} chains &amp; snack makers. Zero ads, zero calorie lectures.
        </p>
      </div>

      <form
        aria-labelledby={headingId}
        method="POST"
        action={NEWSLETTER_FORM_ACTION || undefined}
        onSubmit={handleSubmit}
        className="space-y-3"
      >
        {/* Honeypot anti-spam trap hidden from assistive tech & omitted from POST payload */}
        <input
          ref={honeypotRef}
          type="text"
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          className="visually-hidden"
        />

        <div className="space-y-1.5">
          <label
            htmlFor={emailId}
            className={`block text-xs font-extrabold uppercase tracking-wider ${
              compact ? "text-white" : "text-[var(--text-primary)]"
            }`}
          >
            Email Address <span aria-hidden="true">*</span>
          </label>

          {/* Format hint placed ABOVE input so mobile keyboards & autofill popovers never cover it */}
          <span
            id={hintId}
            className={`block text-xs ${
              compact ? "text-[#a8a096]" : "text-[var(--text-secondary)]"
            }`}
          >
            Format: you@example.com • Free forever, 1-click unsubscribe in every issue.
          </span>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5 pt-0.5">
            <div className="flex-1">
              <input
                ref={inputRef}
                id={emailId}
                name="email_address"
                type="email"
                required
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="done"
                placeholder="you@example.com"
                aria-invalid={ariaInvalid}
                aria-describedby={
                  ariaInvalid === "true" ? `${hintId} ${errorId}` : hintId
                }
                data-error={errorId}
                onFocus={handleFocus}
                onInput={handleInput}
                onBlur={handleBlur}
                onInvalid={handleInvalid}
                className={`newsletter-input w-full rounded-xl px-4 py-2.5 ${
                  useFallbackInvalidClass ? "user-invalid-fallback" : ""
                }`}
              />
              <div
                id={errorId}
                className="newsletter-error-msg items-center gap-1.5 text-xs font-bold text-red-500 mt-1.5"
              >
                <span role="img" aria-label="Error">
                  ❌
                </span>
                <span>
                  Enter a valid email address in the format you@example.com.
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="newsletter-submit-btn shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] disabled:opacity-60 px-6 py-3 text-sm font-extrabold text-white transition-colors cursor-pointer"
            >
              <span>{isSubmitting ? "Subscribing..." : "Join The Weekly Bite"}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <p
          className={`flex items-center gap-1.5 text-xs ${
            compact ? "text-[#a8a096]" : "text-[var(--text-secondary)]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
          <span>
            Zero spam. Every single Friday mailer has a 1-click{" "}
            <strong className={compact ? "text-[#d6cfc7]" : "text-[var(--text-primary)]"}>
              Unsubscribe
            </strong>{" "}
            button at the top &amp; bottom.
          </span>
        </p>
      </form>

      {localSuccessMsg && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-600 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
          <span>{localSuccessMsg}</span>
        </div>
      )}
    </section>
  );
}
