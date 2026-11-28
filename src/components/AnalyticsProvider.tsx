"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { readGoogleSession } from "@/lib/google-auth";

const CF_BEACON_TOKEN =
  process.env.NEXT_PUBLIC_CF_BEACON_TOKEN || "65135ae112da4219a160fd70c7e49f83";

const TELEMETRY_URL = "https://api.eatbrandbite.com/telemetry/pageview";
const SESSION_KEY = "brandbite:pv-sid";

function getTabSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID().slice(0, 16)
          : Math.random().toString(36).slice(2, 14);
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "";
  }
}

export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const authState = readGoogleSession() ? "logged_in" : "logged_out";
    const sessionId = getTabSessionId();
    fetch(TELEMETRY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, authState, sessionId }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return (
    <>
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="brandbite-ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}

      {CF_BEACON_TOKEN && (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN })}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
