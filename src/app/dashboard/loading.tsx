import { Skeleton } from '@/shared/ui/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
      <Skeleton className="h-9 w-64 mb-8" />
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 w-full max-w-sm rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
