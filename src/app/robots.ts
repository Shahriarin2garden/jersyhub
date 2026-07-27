import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin panel and the API are not for crawlers. Auth still guards
      // them — this only keeps them out of search results.
      disallow: ["/admin", "/admin/", "/api/", "/account/", "/checkout", "/cart"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
