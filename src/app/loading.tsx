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
    <>
      {/* Hero skeleton */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:gap-12">
            <div className="flex flex-col justify-center gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-72" />
              <Skeleton className="h-12 w-60" />
              <Skeleton className="h-5 w-80" />
              <Skeleton className="mt-4 h-10 w-full max-w-md" />
              <div className="mt-2 flex gap-2">
                <Skeleton className="h-7 w-16 rounded-full" />
                <Skeleton className="h-7 w-12 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-14 rounded-full" />
              </div>
            </div>
            <div className="hidden md:grid md:grid-cols-2 md:gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular templates skeleton */}
      <section className="border-t border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="flex items-end justify-between">
            <div>
              <Skeleton className="h-8 w-36" />
              <Skeleton className="mt-2 h-4 w-48" />
            </div>
            <div className="hidden gap-2 md:flex">
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
      </section>
    </>
  );
}
