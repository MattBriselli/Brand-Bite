"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { BrandBiteMark } from "@/components/BrandBiteMark";
import { SOCIAL_PROFILES } from "@/data/socials";
import { trackSocialClick } from "@/lib/analytics";
import { WeeklyBiteSignup } from "@/components/WeeklyBiteSignup";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#e5dfd5] bg-[#181512] text-[#d6cfc7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 space-y-10">
        {/* Compact Footer Newsletter Signup */}
        <WeeklyBiteSignup placement="footer" compact />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BrandBiteMark className="w-10 h-10 shrink-0" />
              <span className="text-xl font-black tracking-tight text-white">
                BRAND<span className="text-[#f97316]">BITE</span>
              </span>
            </div>
            <p className="text-sm text-[#a8a096] leading-relaxed">
              Live fast-food menu news, limited-time offer tracking, and packaged snack dispatches across 87 chains &amp; brands. Original first-hand taste tests coming soon.
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
                <Link href="/#weekly-bite" className="hover:text-white transition-colors">
                  The Weekly Bite Newsletter
                </Link>
              </li>
              <li>
                <Link href="/?type=Limited-Time+Offer#feed" className="hover:text-white transition-colors">
                  Limited-Time Offers (LTOs)
                </Link>
              </li>
              <li>
                <Link href="/?type=Deal#feed" className="hover:text-white transition-colors">
                  Deals &amp; Promotions
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-white transition-colors">
                  Original Reviews &amp; Rubric
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-white transition-colors">
                  Brands A–Z Directory (87)
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
                <Link href="/brands/ihop" className="hover:text-white transition-colors">
                  IHOP
                </Link>
              </li>
              <li>
                <Link href="/brands/taco-bell" className="hover:text-white transition-colors">
                  Taco Bell
                </Link>
              </li>
              <li>
                <Link href="/brands/crumbl" className="hover:text-white transition-colors">
                  Crumbl
                </Link>
              </li>
              <li>
                <Link href="/brands/burger-king" className="hover:text-white transition-colors">
                  Burger King
                </Link>
              </li>
              <li>
                <Link href="/brands/mcdonalds" className="hover:text-white transition-colors">
                  McDonald&apos;s
                </Link>
              </li>
              <li>
                <Link href="/brands/dunkin" className="hover:text-white transition-colors">
                  Dunkin&apos;
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3">
              Follow BrandBite
            </h2>
            <ul className="space-y-2.5 text-sm">
              {SOCIAL_PROFILES.map((profile) => (
                <li key={profile.id}>
                  {profile.url ? (
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackSocialClick(profile.id)}
                      className="inline-flex items-center gap-1.5 text-white hover:text-[#f97316] font-semibold transition-colors"
                    >
                      <span>{profile.label}</span>
                      <span className="text-xs text-[#a8a096]">({profile.handle})</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="block">
                      <strong className="text-white">{profile.label}:</strong>{" "}
                      <span className="text-xs text-[#a8a096]">{profile.handle}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2c2621] py-5 px-4 text-center text-xs text-[#a8a096] space-y-1.5">
        <p>
          &copy; {new Date().getFullYear()} BrandBite. Syndicated headlines and thumbnails belong to their respective publishers and restaurant chains.
        </p>
        <p className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/privacy" className="hover:text-white underline underline-offset-4 transition-colors">
            Privacy &amp; Advertising Disclosure
          </Link>
          <span aria-hidden="true">•</span>
          <a href="mailto:hello@eatbrandbite.com" className="hover:text-white underline underline-offset-4 transition-colors">
            hello@eatbrandbite.com
          </a>
        </p>
      </div>
    </footer>
  );
}
