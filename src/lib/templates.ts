import templatesData from "@/data/templates.json";
import type { Template, CategoryKey } from "./types";

export function getAllTemplates(): Template[] {
  return templatesData as Template[];
}

export function getTemplateBySlug(slug: string): Template | undefined {
  return getAllTemplates().find((t) => t.slug === slug);
}

export function getTemplatesByCategory(category: CategoryKey): Template[] {
  return getAllTemplates().filter((t) => t.category === category);
}

export function searchTemplates(query: string): Template[] {
  const q = query.toLowerCase().trim();
  if (!q) return getAllTemplates();

  return getAllTemplates().filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      t.format.toLowerCase().includes(q)
  );
}

export function getPopularTemplates(limit: number = 6): Template[] {
  return [...getAllTemplates()]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, limit);
}

export function getAllSlugs(): string[] {
  return getAllTemplates().map((t) => t.slug);
}

export function getAllCategories(): CategoryKey[] {
  return [...new Set(getAllTemplates().map((t) => t.category))];
}

export function formatDownloads(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}만`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}천`;
  }
  return count.toLocaleString("ko-KR");
}
