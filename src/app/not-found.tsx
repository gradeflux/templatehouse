import Link from "next/link";
import { House, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-24 text-center md:py-32">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-muted">
        <span className="text-4xl font-bold text-muted-foreground">404</span>
      </div>

      <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        페이지를 찾을 수 없습니다
      </h1>

      <p className="mt-3 text-base text-muted-foreground">
        요청하신 페이지가 존재하지 않거나, 이동되었을 수 있습니다.
        <br />
        아래 링크를 통해 원하는 콘텐츠를 찾아보세요.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
        >
          <House weight="bold" className="size-4" />
          홈으로 돌아가기
        </Link>
        <Link
          href="/search"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted hover:text-foreground"
        >
          <MagnifyingGlass weight="bold" className="size-4" />
          템플릿 검색
        </Link>
      </div>
    </div>
  );
}
