import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ulinails.pl";
  const now = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: {
          pl: `${siteUrl}/`,
          uk: `${siteUrl}/`,
          "x-default": `${siteUrl}/`,
        },
      },
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: {
        languages: {
          pl: `${siteUrl}/privacy`,
          uk: `${siteUrl}/privacy`,
          "x-default": `${siteUrl}/privacy`,
        },
      },
    },
  ];
}
