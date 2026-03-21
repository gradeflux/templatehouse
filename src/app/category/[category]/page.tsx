import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CategoryFilter } from "@/components/CategoryFilter";
import { TemplateCard } from "@/components/TemplateCard";
import { getTemplatesByCategory, getAllCategories } from "@/lib/templates";
import { CATEGORIES, type CategoryKey } from "@/lib/types";
import { SITE_URL } from "@/lib/constants";

interface PageProps {
  params: Promise<{ category: string }>;
}

const validCategories = ["notion", "ppt", "resume", "excel", "report", "project", "marketing", "education"];

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.key === category);
  if (!cat) return {};

  return {
    title: `${cat.label} 템플릿`,
    description: `${cat.description} - 무료로 다운로드하세요.`,
    alternates: {
      canonical: `/category/${category}`,
    },
    openGraph: {
      title: `${cat.label} 템플릿 | TemplateHouse`,
      description: `${cat.description} - 무료로 다운로드하세요.`,
      url: `${SITE_URL}/category/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;

  if (!validCategories.includes(category)) {
    notFound();
  }

  const categoryKey = category as CategoryKey;
  const templates = getTemplatesByCategory(categoryKey);
  const categoryInfo = CATEGORIES.find((c) => c.key === categoryKey);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {categoryInfo?.label} 템플릿
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categoryInfo?.description} ({templates.length}개)
          </p>
        </div>
        <CategoryFilter activeCategory={categoryKey} />
      </div>

      {templates.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <p className="text-lg font-medium text-foreground">
            아직 등록된 템플릿이 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            곧 새로운 템플릿이 추가됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
