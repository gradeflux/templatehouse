import type { MetadataRoute } from "next";
import { getAllTemplates, getAllCategories } from "@/lib/templates";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const templates = getAllTemplates();
  const categories = getAllCategories();

  const templateUrls: MetadataRoute.Sitemap = templates.map((t) => ({
    url: `${SITE_URL}/templates/${t.slug}`,
    lastModified: new Date(t.createdAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...categoryUrls,
    ...templateUrls,
  ];
}
