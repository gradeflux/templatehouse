import Link from "next/link";
import { CATEGORIES } from "@/lib/types";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[2fr_1fr_1fr] md:px-6">
        <div className="max-w-sm">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              T
            </span>
            TemplateHouse
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            실무에 바로 적용할 수 있는 무료 템플릿 모음.
            <br />
            노션, PPT, 엑셀, 이력서 템플릿을 무료로 다운로드하세요.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground">카테고리</h3>
          <ul className="mt-3 space-y-2">
            {CATEGORIES.map((cat) => (
              <li key={cat.key}>
                <Link
                  href={`/category/${cat.key}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {cat.label} 템플릿
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground">안내</h3>
          <ul className="mt-3 space-y-2">
            <li>
              <Link
                href="/search"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                템플릿 검색
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <p className="text-xs text-muted-foreground">
            2026 TemplateHouse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
