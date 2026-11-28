"use client";

export const GOOGLE_CLIENT_ID =
  "499185967239-g258c625t7g4se7tsvs1nbhk3n7hlvut.apps.googleusercontent.com";
export const AUTH_STORAGE_KEY = "brandbite:pseudo-auth-v3";
export const AUTH_CHANGED_EVENT = "brandbite:google-auth-changed";

export interface GoogleUserSession {
  /** Google OAuth2 access token scoped strictly to `openid email` (no name/photo) */
  idToken: string;
  pseudoId: string;
  handle: string;
  avatarSeed: string;
  isAuthor: boolean;
  exp: number;
}

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number | string;
  error?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            include_granted_scopes?: boolean;
            callback: (res: GoogleTokenResponse) => void;
            error_callback?: (err: { type?: string }) => void;
          }) => GoogleTokenClient;
          revoke?: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

export function readGoogleSession(): GoogleUserSession | null {
  if (typeof window === "undefined") return null;
  try {
    // Clean up legacy session keys if present
    sessionStorage.removeItem("brandbite:google-comment-auth");
    sessionStorage.removeItem("brandbite:pseudo-auth-v2");
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GoogleUserSession;
    if (
      parsed.idToken &&
      parsed.pseudoId &&
      parsed.handle &&
      parsed.exp &&
      parsed.exp * 1000 > Date.now() + 60_000
    ) {
      return parsed;
    }
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

export function saveGoogleSession(session: GoogleUserSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors
  }
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: session }));
}

export function clearGoogleSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem("brandbite:pseudo-auth-v2");
    sessionStorage.removeItem("brandbite:google-comment-auth");
  } catch {
    // Ignore
  }
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: null }));
}

/**
 * Loads the Google Identity Services script (idempotent) for OAuth2 Token Client.
 */
export function loadGoogleOAuthScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.google?.accounts?.oauth2) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      if (window.google?.accounts?.oauth2) {
        resolve(true);
        return;
      }
      existing.addEventListener("load", () => resolve(Boolean(window.google?.accounts?.oauth2)), {
        once: true,
      });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(Boolean(window.google?.accounts?.oauth2));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Exchanges a Google OAuth2 access token (scoped strictly to `openid email`)
 * for a server-derived, one-way HMAC pseudonym.
 */
export async function exchangeAccessTokenForPseudonym(
  accessToken: string,
  expiresInSec = 3600
): Promise<GoogleUserSession | null> {
  if (!accessToken) return null;
  const exp = Math.floor(Date.now() / 1000) + Math.max(300, Number(expiresInSec) || 3600);

  try {
    const res = await fetch("https://api.eatbrandbite.com/auth/session", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.ok || !data?.profile?.pseudoId || !data?.profile?.handle) {
      return null;
    }
    const session: GoogleUserSession = {
      idToken: accessToken,
      pseudoId: String(data.profile.pseudoId),
      handle: String(data.profile.handle),
      avatarSeed: String(data.profile.avatarSeed || data.profile.pseudoId),
      isAuthor: Boolean(data.profile.isAuthor),
      exp,
    };
    saveGoogleSession(session);
    return session;
  } catch {
    return null;
  }
}

/**
 * Triggers a minimal-scope Google OAuth2 sign-in (`openid email` ONLY — no name or photo).
 */
export async function signInWithGoogleEmailOnly(): Promise<
  { ok: true; session: GoogleUserSession } | { ok: false; error: string }
> {
  const loaded = await loadGoogleOAuthScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!loaded || !oauth2) {
    return {
      ok: false,
      error: "Google Sign-In could not load right now. Please try again.",
    };
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (
      result: { ok: true; session: GoogleUserSession } | { ok: false; error: string }
    ) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const client = oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid email",
      include_granted_scopes: false,
      callback: async (tokenResponse) => {
        if (!tokenResponse?.access_token || tokenResponse.error) {
          finish({
            ok: false,
            error: "Sign-in was cancelled or could not be completed.",
          });
          return;
        }
        const session = await exchangeAccessTokenForPseudonym(
          tokenResponse.access_token,
          Number(tokenResponse.expires_in || 3600)
        );
        if (!session) {
          finish({
            ok: false,
            error: "Could not initialize your pseudonymized session. Please try again.",
          });
          return;
        }
        finish({ ok: true, session });
      },
      error_callback: () => {
        finish({
          ok: false,
          error: "Sign-in popup was closed before completing.",
        });
      },
    });

    client.requestAccessToken();
  });
}
