import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, CalendarBlank, DownloadSimple, Tag } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DownloadButton } from "@/components/DownloadButton";
import { TemplateCard } from "@/components/TemplateCard";
import { JsonLd } from "@/components/JsonLd";
import {
  getTemplateBySlug,
  getAllSlugs,
  getTemplatesByCategory,
  formatDownloads,
} from "@/lib/templates";
import { CATEGORY_MAP } from "@/lib/types";
import { SITE_URL, SITE_NAME } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) return {};

  return {
    title: template.title,
    description: template.description,
    alternates: {
      canonical: `/templates/${template.slug}`,
    },
    openGraph: {
      title: `${template.title} | ${SITE_NAME}`,
      description: template.description,
      images: [{ url: template.previewImage }],
      url: `${SITE_URL}/templates/${template.slug}`,
    },
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  const relatedTemplates = getTemplatesByCategory(template.category)
    .filter((t) => t.id !== template.id)
    .slice(0, 3);

  const formattedDate = new Date(template.createdAt).toLocaleDateString(
    "ko-KR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <>
      <JsonLd type="template" template={template} />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft weight="regular" className="size-3.5" />
          전체 템플릿
        </Link>

        {/* Detail Layout - Asymmetric */}
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
          {/* Preview Image */}
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted">
            <div className="relative aspect-[4/3]">
              <Image
                src={template.previewImage}
                alt={template.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            </div>
          </div>

          {/* Info Panel */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{CATEGORY_MAP[template.category]}</Badge>
              <span className="text-sm text-muted-foreground">
                {template.format}
              </span>
            </div>

            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {template.title}
            </h1>

            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              {template.description}
            </p>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DownloadSimple weight="regular" className="size-4" />
                <span>{formatDownloads(template.downloads)} 다운로드</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarBlank weight="regular" className="size-4" />
                <span>{formattedDate}</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag weight="regular" className="size-4" />
                <span>태그</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {template.tags.map((tag) => (
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

            <div className="mt-8">
              <DownloadButton
                templateId={template.id}
                downloadUrl={template.downloadUrl}
                label="무료 다운로드"
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Related Templates */}
      {relatedTemplates.length > 0 && (
        <section className="border-t border-border/40 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
              관련 템플릿
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTemplates.map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
