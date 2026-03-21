import Link from "next/link";
import { CATEGORIES } from "@/lib/types";
import { SearchBar } from "./SearchBar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            T
          </span>
          <span className="hidden sm:inline">TemplateHouse</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={`/category/${cat.key}`}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        <div className="w-full max-w-xs">
          <SearchBar compact />
        </div>
      </div>
    </header>
  );
}
