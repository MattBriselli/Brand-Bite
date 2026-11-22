import React from "react";
import Link from "next/link";
import { Utensils } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#e5dfd5] bg-[#181512] text-[#d6cfc7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#c2410c] text-white flex items-center justify-center">
              <Utensils className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              BRAND<span className="text-[#f97316]">BITE</span>
            </span>
          </div>
          <p className="text-sm text-[#a8a096] max-w-md leading-relaxed">
            Live fast-food menu news, limited-time offer tracking, and packaged snack dispatches aggregated from industry and enthusiast feeds. Original first-hand taste tests, ratings, and nutrition breakdowns coming soon.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3">
            Sections
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/#feed" className="hover:text-white transition-colors">
                Live Fast Food &amp; Snack Feed
              </Link>
            </li>
            <li>
              <Link href="/?type=News#feed" className="hover:text-white transition-colors">
                Menu Releases &amp; News
              </Link>
            </li>
            <li>
              <Link
                href="/?type=Limited-Time+Offer#feed"
                className="hover:text-white transition-colors"
              >
                Limited-Time Offers (LTOs)
              </Link>
            </li>
            <li>
              <Link href="/?type=Deal#feed" className="hover:text-white transition-colors">
                Deals &amp; Promotions
              </Link>
            </li>
            <li>
              <Link href="/?mode=editorial#feed" className="hover:text-white transition-colors">
                Original Reviews (Coming Soon)
              </Link>
            </li>
            <li>
              <Link href="/brands" className="hover:text-white transition-colors">
                Brands A–Z Directory
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3">
            Popular Chains
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/?brand=taco-bell#feed" className="hover:text-white transition-colors">
                Taco Bell
              </Link>
            </li>
            <li>
              <Link href="/?brand=burger-king#feed" className="hover:text-white transition-colors">
                Burger King
              </Link>
            </li>
            <li>
              <Link href="/?brand=trader-joes#feed" className="hover:text-white transition-colors">
                Trader Joe&apos;s
              </Link>
            </li>
            <li>
              <Link href="/?brand=mcdonalds#feed" className="hover:text-white transition-colors">
                McDonald&apos;s
              </Link>
            </li>
            <li>
              <Link href="/?brand=wendys#feed" className="hover:text-white transition-colors">
                Wendy&apos;s
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#2c2621] py-5 px-4 text-center text-xs text-[#a8a096]">
        <p>
          &copy; {new Date().getFullYear()} BrandBite. Syndicated headlines and thumbnails belong to their respective publishers and restaurant chains.
        </p>
      </div>
    </footer>
  );
}
