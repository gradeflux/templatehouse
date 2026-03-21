"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  compact?: boolean;
  defaultValue?: string;
  placeholder?: string;
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function SearchBar({
  compact = false,
  defaultValue = "",
  placeholder,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const debouncedQuery = useDebounce(query, 400);
  const isAutoSearchEnabled = !compact; // Only auto-search on full-size search bars
  const hasInitialized = useRef(false);

  // Auto-navigate on debounced query change (only for non-compact / search page)
  useEffect(() => {
    if (!isAutoSearchEnabled) return;
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }
    const trimmed = debouncedQuery.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }, [debouncedQuery, isAutoSearchEnabled, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <MagnifyingGlass
        weight="regular"
        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder ?? "템플릿 검색..."}
        className={`pl-9 ${compact ? "h-8 text-sm" : "h-10"}`}
      />
    </form>
  );
}
