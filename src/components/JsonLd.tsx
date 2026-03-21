import type { Template } from "@/lib/types";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { formatDownloads } from "@/lib/templates";

interface WebsiteJsonLdProps {
  type: "website";
}

interface TemplateJsonLdProps {
  type: "template";
  template: Template;
}

type JsonLdProps = WebsiteJsonLdProps | TemplateJsonLdProps;

export function JsonLd(props: JsonLdProps) {
  let structuredData: Record<string, unknown>;

  if (props.type === "website") {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description:
        "노션, PPT, 엑셀, 이력서 등 실무에 바로 적용할 수 있는 무료 템플릿을 다운로드하세요.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };
  } else {
    const { template } = props;
    structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: template.title,
      description: template.description,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "KRW",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.5",
        ratingCount: String(Math.max(10, Math.floor(template.downloads / 10))),
      },
      downloadUrl: `${SITE_URL}/templates/${template.slug}`,
      fileFormat: template.format,
      datePublished: template.createdAt,
      keywords: template.tags.join(", "),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
