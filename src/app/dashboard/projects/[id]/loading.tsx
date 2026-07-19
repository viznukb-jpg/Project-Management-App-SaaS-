import { Skeleton } from '@/shared/ui/Skeleton';

export default function Loading() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-6 lg:p-8">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="flex-1 flex gap-6 overflow-x-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-80 flex-shrink-0 flex flex-col gap-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
