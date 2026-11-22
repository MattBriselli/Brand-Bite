"use client";

import { useEffect } from "react";
import Script from "next/script";
import { initBrandBiteAnalytics } from "@/lib/analytics";

const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export function AnalyticsProvider() {
  useEffect(() => {
    void initBrandBiteAnalytics();
  }, []);

  if (!CF_BEACON_TOKEN) {
    return null;
  }

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN })}
      strategy="afterInteractive"
    />
  );
}
