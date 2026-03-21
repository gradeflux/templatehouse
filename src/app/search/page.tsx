import type { Metadata } from "next";
import { SearchBar } from "@/components/SearchBar";
import { TemplateCard } from "@/components/TemplateCard";
import { searchTemplates, getPopularTemplates } from "@/lib/templates";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `"${q}" 검색 결과` : "템플릿 검색",
    description: "TemplateHouse에서 필요한 템플릿을 검색하세요.",
    alternates: {
      canonical: "/search",
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q ?? "";
  const results = query ? searchTemplates(query) : [];
  const popularTemplates = getPopularTemplates(6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        템플릿 검색
      </h1>
      <div className="mt-4 max-w-lg">
        <SearchBar defaultValue={query} placeholder="검색어를 입력하세요" />
      </div>

      {query && (
        <p className="mt-6 text-sm text-muted-foreground">
          &ldquo;{query}&rdquo; 검색 결과 {results.length}건
        </p>
      )}

      {query && results.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((template) => (
            <TemplateCard key={template.id} template={template} highlight={query} />
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <p className="text-lg font-medium text-foreground">
            검색 결과가 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            다른 키워드로 검색해보세요.
          </p>
        </div>
      )}

      {!query && (
        <div className="mt-12">
          <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            인기 템플릿
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            가장 많이 다운로드된 템플릿을 확인해보세요
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
