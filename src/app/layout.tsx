import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { ScrollPositionRestorer } from "@/components/ScrollPositionRestorer";

export const metadata: Metadata = {
  metadataBase: new URL("https://eatbrandbite.com"),
  title: "BrandBite | Fast Food Menu Drops, LTO Tracker & Snack Feed",
  description:
    "Live fast-food menu news, limited-time offer tracking, and packaged snack drops across 101 chains and brands. Original taste tests coming soon.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BrandBite | Fast Food Menu Drops, LTO Tracker & Snack Feed",
    description:
      "Live fast-food menu news, burger & taco LTOs, and packaged snack drops updated every 3 hours.",
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
    title: "BrandBite | Fast Food Menu Drops, LTO Tracker & Snack Feed",
    description:
      "Live fast-food menu news, burger & taco LTOs, and packaged snack drops updated every 3 hours.",
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
      </body>
    </html>
  );
}
