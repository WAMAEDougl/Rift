import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-28 rounded" />
        <Skeleton className="h-3 w-40 mt-2 rounded" />
      </div>
      <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap gap-3">
        <Skeleton className="flex-1 min-w-[180px] h-10 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="hidden sm:block">
          <div className="px-6 py-3 bg-muted/30 flex gap-6 border-b border-border">
            {[40, 80, 100, 36, 72, 80, 72].map((w, i) => (
              <Skeleton key={i} className={`h-3 w-${w} rounded`} />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-border last:border-0 flex items-center gap-6">
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-4 w-8 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-24 ml-auto rounded" />
            </div>
          ))}
        </div>
        <div className="sm:hidden divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
