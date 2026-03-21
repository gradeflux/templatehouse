"use client";

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
}

export function HighlightText({
  text,
  highlight,
  className = "",
}: HighlightTextProps) {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <span className={className}>
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
    </span>
  );
}
