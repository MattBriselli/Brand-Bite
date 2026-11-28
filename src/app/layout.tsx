import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { ScrollPositionRestorer } from "@/components/ScrollPositionRestorer";
import { CopyToastHost } from "@/components/CopyToastHost";

export const metadata: Metadata = {
  metadataBase: new URL("https://eatbrandbite.com"),
  title: "BrandBite | Fast Food Menu Drops, Weekly Specials & Snack Feed",
  description:
    "Live fast-food menu news, weekly rotating Specials On Now (Crumbl, PopUp Bagels, Trader Joe's, Insomnia Cookies, Salt & Straw), verified promo codes, and snack drops across hundreds of chains and brands.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BrandBite | Fast Food Menu Drops, Weekly Specials & Snack Feed",
    description:
      "Live fast-food menu news, limited-time offers, and packaged snack drops tracked across hundreds of chains.",
    url: "https://eatbrandbite.com",
    siteName: "BrandBite",
    type: "website",
    images: [
      {
        url: "/brandbite-avatar.png",
        width: 1024,
        height: 1024,
        alt: "BrandBite — Fast Food Menu Drops & Packaged Snack Feed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandBite | Fast Food Menu Drops, Weekly Specials & Snack Feed",
    description:
      "Live fast-food menu news, limited-time offers, and packaged snack drops tracked across hundreds of chains.",
    images: ["/brandbite-avatar.png"],
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <link
          rel="alternate"
          type="text/markdown"
          title="BrandBite — LLM & AI Agent Feed (llms.txt)"
          href="/llms.txt"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="BrandBite Originals RSS"
          href="/rss.xml"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="BrandBite Live Wire RSS"
          href="/live.xml"
        />
        <link
          rel="alternate"
          type="application/feed+json"
          title="BrandBite JSON Feed"
          href="/feed.json"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://eatbrandbite.com/#organization",
                  name: "BrandBite",
                  url: "https://eatbrandbite.com",
                  logo: "https://eatbrandbite.com/brandbite-avatar.png",
                  email: "hello@eatbrandbite.com",
                  sameAs: [
                    "https://www.instagram.com/eat.brand.bite/",
                    "https://www.threads.com/@eat.brand.bite",
                    "https://bsky.app/profile/eatbrandbite.com",
                  ],
                  contactPoint: {
                    "@type": "ContactPoint",
                    contactType: "press",
                    email: "hello@eatbrandbite.com",
                    url: "https://eatbrandbite.com/press",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://eatbrandbite.com/#website",
                  url: "https://eatbrandbite.com",
                  name: "BrandBite",
                  description:
                    "Live fast-food menu news, limited-time offer tracking, verified promo codes, and packaged snack drops across hundreds of chains and brands.",
                  publisher: { "@id": "https://eatbrandbite.com/#organization" },
                },
              ],
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem("color-scheme");if(s==="light"||s==="dark"){var m=document.querySelector('meta[name="color-scheme"]');if(m)m.setAttribute("content",s);document.documentElement.dataset.theme=s;}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <AnalyticsProvider />
        <ScrollPositionRestorer />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CopyToastHost />
      </body>
    </html>
  );
}
