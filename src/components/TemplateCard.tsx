import Link from "next/link";
import Image from "next/image";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import type { Template } from "@/lib/types";
import { CATEGORY_MAP } from "@/lib/types";
import { formatDownloads } from "@/lib/templates";

interface TemplateCardProps {
  template: Template;
  highlight?: string;
}

function HighlightInline({
  text,
  highlight,
}: {
  text: string;
  highlight?: string;
}) {
  if (!highlight?.trim()) return <>{text}</>;

  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded-sm bg-primary/15 px-0.5 text-foreground"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function TemplateCard({ template, highlight }: TemplateCardProps) {
  return (
    <Link
      href={`/templates/${template.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 ease-out hover:border-border hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={template.previewImage}
          alt={template.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-normal">
            {CATEGORY_MAP[template.category]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {template.format}
          </span>
        </div>

        <h3 className="font-heading text-base font-medium leading-snug tracking-tight text-foreground">
          <HighlightInline text={template.title} highlight={highlight} />
        </h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          <HighlightInline text={template.description} highlight={highlight} />
        </p>

        <div className="mt-auto flex items-center gap-1 pt-2 text-xs text-muted-foreground">
          <DownloadSimple weight="regular" className="size-3.5" />
          <span>{formatDownloads(template.downloads)} 다운로드</span>
        </div>
      </div>
    </Link>
  );
}
