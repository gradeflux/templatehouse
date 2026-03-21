function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Skeleton className="h-4 w-24" />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="my-4 h-px w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-4 w-10" />
            <div className="mt-2 flex gap-1.5">
              <Skeleton className="h-7 w-14 rounded-full" />
              <Skeleton className="h-7 w-10 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          </div>
          <Skeleton className="mt-6 h-10 w-36" />
        </div>
      </div>
    </div>
  );
}
