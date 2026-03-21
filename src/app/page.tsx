import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { TemplateCard } from "@/components/TemplateCard";
import { getAllTemplates, getPopularTemplates } from "@/lib/templates";
import { CATEGORIES } from "@/lib/types";
import Link from "next/link";

export default function HomePage() {
  const popularTemplates = getPopularTemplates(8);
  const allTemplates = getAllTemplates();

  return (
    <>
      {/* Hero - Asymmetric Split Layout (DESIGN_VARIANCE: 8) */}
      <section className="relative overflow-hidden bg-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[1.4fr_1fr] md:gap-12 md:px-6 md:py-24">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium tracking-wide text-primary">
              TemplateHouse.kr
            </p>
            <h1 className="mt-3 font-heading text-4xl font-semibold leading-[1.1] tracking-tighter text-foreground md:text-5xl lg:text-6xl">
              업무 시간을
              <br />
              되찾아주는 템플릿
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
              업무보고서, 이력서, 마케팅, 프로젝트관리까지.
              <br />
              30개 이상의 검증된 양식을 무료로 받아 바로 쓰세요.
            </p>
            <div className="mt-8 w-full max-w-md">
              <SearchBar placeholder="필요한 템플릿을 검색해보세요" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["주간보고", "OKR", "이력서", "마케팅", "간트차트", "가계부"].map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-border/80 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:grid md:grid-cols-2 md:gap-3 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                href={`/category/${cat.key}`}
                className="group flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 hover:border-border hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]"
              >
                <span className="text-lg font-heading font-semibold tracking-tight text-foreground">
                  {cat.label}
                </span>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {allTemplates.filter((t) => t.category === cat.key).length}
                    개 템플릿
                  </span>
                  <ArrowRight
                    weight="regular"
                    className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Templates */}
      <section className="border-t border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                인기 템플릿
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                가장 많이 다운로드된 템플릿
              </p>
            </div>
            <CategoryFilter />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      </section>

      {/* All Templates */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            전체 템플릿
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            모든 카테고리의 템플릿을 둘러보세요
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {allTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
