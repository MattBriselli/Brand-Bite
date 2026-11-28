export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.eatbrandbite.com") {
      url.hostname = "eatbrandbite.com";
      return Response.redirect(url.toString(), 301);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);

    // Baseline security headers for all responses
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    // Smart edge caching: immutable static chunks vs fresh machine-readable feeds
    if (url.pathname.startsWith("/_next/static/")) {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    } else if (
      url.pathname === "/llms.txt" ||
      url.pathname === "/feed.json" ||
      url.pathname === "/rss.xml" ||
      url.pathname === "/live.xml" ||
      url.pathname === "/sitemap.xml"
    ) {
      headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    }

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  },
};
