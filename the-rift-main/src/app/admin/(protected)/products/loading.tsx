import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-28 rounded" />
          <Skeleton className="h-3 w-24 mt-2 rounded" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap gap-3">
        <Skeleton className="flex-1 min-w-[180px] h-10 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="hidden sm:block">
          <div className="px-6 py-3 bg-muted/30 border-b border-border flex gap-6">
            {[120, 64, 64, 48, 48, 56].map((w, i) => (
              <Skeleton key={i} className={`h-3 rounded`} style={{ width: w }} />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-border last:border-0 flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-6 w-11 rounded-full mx-auto" />
              <Skeleton className="h-6 w-11 rounded-full mx-auto" />
              <Skeleton className="h-8 w-20 ml-auto rounded-xl" />
            </div>
          ))}
        </div>
        <div className="sm:hidden divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
