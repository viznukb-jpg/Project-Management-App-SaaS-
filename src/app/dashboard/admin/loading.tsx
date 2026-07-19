import { Skeleton } from '@/shared/ui/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      <Skeleton className="h-9 w-64 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full mt-8 rounded-xl" />
    </div>
  );
}
