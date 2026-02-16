import { ProductGridSkeleton } from "@/components/features/skeletons/ProductGridSkeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse mb-8">
        <div className="h-8 w-48 bg-muted rounded mb-4" /> {/* Filter Title Skeleton */}
        <div className="h-10 w-full bg-muted rounded" /> {/* Filter Bar Skeleton */}
      </div>
      <div className="flex gap-8">
        <div className="hidden md:block w-64 space-y-4">
          <div className="h-6 w-32 bg-muted rounded mb-4" /> {/* Sidebar Title Skeleton */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-full bg-muted rounded" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
