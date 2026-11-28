"use client";

export const GOOGLE_CLIENT_ID =
  "499185967239-g258c625t7g4se7tsvs1nbhk3n7hlvut.apps.googleusercontent.com";
export const AUTH_STORAGE_KEY = "brandbite:pseudo-auth-v2";
export const AUTH_CHANGED_EVENT = "brandbite:google-auth-changed";

export interface GoogleUserSession {
  idToken: string;
  pseudoId: string;
  handle: string;
  avatarSeed: string;
  isAuthor: boolean;
  exp: number;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (opts: {
            client_id: string;
            callback: (res: { credential?: string }) => void;
          }) => void;
          renderButton: (
            el: HTMLElement,
            opts: Record<string, string | number>
          ) => void;
          disableAutoSelect?: () => void;
        };
      };
    };
  }
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function readGoogleSession(): GoogleUserSession | null {
  if (typeof window === "undefined") return null;
  try {
    // Clean up legacy v1 session key if present
    sessionStorage.removeItem("brandbite:google-comment-auth");
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
    sessionStorage.removeItem("brandbite:google-comment-auth");
    window.google?.accounts?.id?.disableAutoSelect?.();
  } catch {
    // Ignore
  }
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: null }));
}

/**
 * Exchanges a Google Sign-In credential for a server-derived, one-way HMAC pseudonym.
 * Never stores or exposes the user's real Google name, photo, or email.
 */
export async function exchangeCredentialForPseudonym(
  credential: string
): Promise<GoogleUserSession | null> {
  const payload = decodeJwtPayload(credential);
  if (!payload) return null;
  const exp = Number(payload.exp || 0);
  if (!exp || exp * 1000 <= Date.now()) return null;

  try {
    const res = await fetch("https://api.eatbrandbite.com/auth/session", {
      method: "POST",
      headers: { Authorization: `Bearer ${credential}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.ok || !data?.profile?.pseudoId || !data?.profile?.handle) {
      return null;
    }
    const session: GoogleUserSession = {
      idToken: credential,
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
