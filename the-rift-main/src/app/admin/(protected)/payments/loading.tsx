import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-28 rounded" />
        <Skeleton className="h-3 w-36 mt-2 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
            <Skeleton className="h-7 w-20 rounded" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="hidden sm:block">
          <div className="px-5 py-3 bg-muted/30 border-b border-border flex gap-4">
            {[56, 80, 56, 48, 48, 56, 64, 80, 56].map((w, i) => (
              <Skeleton key={i} className="h-3 rounded" style={{ width: w }} />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-border last:border-0 flex items-center gap-4">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-4 w-20 ml-auto rounded" />
            </div>
          ))}
        </div>
        <div className="sm:hidden divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32 rounded" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
