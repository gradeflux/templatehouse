function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-4 w-24" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
