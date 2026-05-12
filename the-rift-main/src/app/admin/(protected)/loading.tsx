import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 pb-4">
      <div>
        <Skeleton className="h-3 w-28 mb-2 rounded" />
        <Skeleton className="h-8 w-44 rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="w-4 h-4 rounded" />
            </div>
            <div>
              <Skeleton className="h-7 w-20 mb-2 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-28 mt-1 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div>
        <Skeleton className="h-5 w-20 mb-1 rounded" />
        <Skeleton className="h-3 w-52 mb-4 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-5 space-y-2">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
              <Skeleton className="h-5 w-16 mt-1 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-5 w-32 mb-4 rounded" />
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-border last:border-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-full hidden sm:block" />
              <Skeleton className="h-5 w-16 rounded hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
