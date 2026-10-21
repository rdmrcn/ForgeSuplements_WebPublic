import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: isProd
      ? [{ userAgent: "*", allow: "/", disallow: ["/api/", "/cart", "/checkout", "/order/", "/search"] }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: isProd ? `${brand.siteUrl.replace(/\/$/, "")}/sitemap.xml` : undefined,
  };
}
