"use client";

export const GOOGLE_CLIENT_ID =
  "499185967239-g258c625t7g4se7tsvs1nbhk3n7hlvut.apps.googleusercontent.com";
export const AUTH_STORAGE_KEY = "brandbite:google-comment-auth";
export const AUTH_CHANGED_EVENT = "brandbite:google-auth-changed";

export interface GoogleUserSession {
  idToken: string;
  name: string;
  picture: string | null;
  email: string;
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
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GoogleUserSession;
    if (parsed.exp && parsed.exp * 1000 > Date.now() + 60_000) {
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
  // Notify BrandBite API of login for new vs. returning user analytics (non-blocking)
  if (session?.idToken) {
    fetch("https://api.eatbrandbite.com/auth/session", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.idToken}` },
      keepalive: true,
    }).catch(() => {});
  }
}

export function clearGoogleSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    window.google?.accounts?.id?.disableAutoSelect?.();
  } catch {
    // Ignore
  }
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: null }));
}

export function createSessionFromCredential(credential: string): GoogleUserSession | null {
  const payload = decodeJwtPayload(credential);
  if (!payload) return null;
  return {
    idToken: credential,
    name: String(payload.name || payload.given_name || "Reader"),
    picture: typeof payload.picture === "string" ? payload.picture : null,
    email: String(payload.email || "").toLowerCase(),
    exp: Number(payload.exp || 0),
  };
}
