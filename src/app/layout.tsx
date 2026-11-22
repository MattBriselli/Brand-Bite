import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "BrandBite | Fast Food News, Packaged Snack Reviews & LTO Tracker",
  description:
    "Independent fast-food menu news, limited-time offer tracking, and packaged snack reviews with full nutrition facts, retail pricing, and taste-test verdicts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div role="status" className="bg-amber-400 text-amber-950 text-center text-xs sm:text-sm font-extrabold py-2 px-4 tracking-wide">
          ⚠️ DEMO SITE — All editorial reviews, scores, nutrition facts, prices, and author bylines below are <u>fabricated placeholder content</u> for layout purposes only. They do not reflect real products, real taste tests, or real opinions. Only the "Live Wire" items link to real external articles.
        </div>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
