import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "BrandBite | Live Fast Food News, LTO Tracker & Snack Wire",
  description:
    "Live fast-food menu news, limited-time offer tracking, and packaged snack dispatches synthesized from industry and enthusiast feeds. Original taste tests coming soon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
