import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://eatbrandbite.com"),
  title: "BrandBite | Live Fast Food News, LTO Tracker & Snack Wire",
  description:
    "Live fast-food menu news, limited-time offer tracking, and packaged snack dispatches synthesized from industry and enthusiast feeds. Original taste tests coming soon.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BrandBite | Live Fast Food News, LTO Tracker & Snack Wire",
    description:
      "Live fast-food menu news, pancake & burger LTOs, and packaged snack dispatches updated every 6 hours.",
    url: "https://eatbrandbite.com",
    siteName: "BrandBite",
    type: "website",
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
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
