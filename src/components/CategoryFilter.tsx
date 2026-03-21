"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, type CategoryKey } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  activeCategory?: CategoryKey | "all";
}

export function CategoryFilter({
  activeCategory = "all",
}: CategoryFilterProps) {
  const pathname = usePathname();

  const items = [
    { key: "all" as const, label: "전체", href: "/" },
    ...CATEGORIES.map((cat) => ({
      key: cat.key,
      label: cat.label,
      href: `/category/${cat.key}`,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const isActive =
          item.key === activeCategory ||
          (item.key === "all" && pathname === "/");
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-all duration-200",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
