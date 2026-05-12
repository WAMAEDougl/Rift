import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32 rounded" />
        <Skeleton className="h-3 w-28 mt-2 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
            <Skeleton className="h-7 w-20 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-card rounded-2xl border border-border p-4">
        <Skeleton className="h-10 rounded-xl" />
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="hidden sm:block">
          <div className="px-6 py-3 bg-muted/30 border-b border-border flex gap-6">
            {[80, 80, 64, 48, 72, 64].map((w, i) => (
              <Skeleton key={i} className="h-3 rounded" style={{ width: w }} />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-border last:border-0 flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-10 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-24 ml-auto rounded" />
            </div>
          ))}
        </div>
        <div className="sm:hidden divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-16 rounded ml-auto" />
                <Skeleton className="h-3 w-20 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
