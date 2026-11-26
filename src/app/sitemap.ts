import type { MetadataRoute } from "next";
import { BRANDS } from "@/data/articles";

export const dynamic = "force-static";

const SITE_URL = "https://eatbrandbite.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const brandRoutes: MetadataRoute.Sitemap = BRANDS.map((brand) => ({
    url: `${SITE_URL}/brands/${brand.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/brands`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...brandRoutes,
  ];
}
