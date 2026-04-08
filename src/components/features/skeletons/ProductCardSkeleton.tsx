import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl overflow-hidden border border-[#282f39] bg-[#1a1a1a]",
        className
      )}
    >
      {/* Image Skeleton */}
      <div className="relative w-full aspect-[4/5] bg-[#1a1f26] p-4 flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-md" />
      </div>

      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-1 gap-2">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" /> {/* Title */}
          <Skeleton className="h-4 w-1/2" /> {/* Category */}
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-16" /> {/* Original Price */}
            <Skeleton className="h-6 w-24" /> {/* Current Price */}
          </div>

          <Skeleton className="size-10 rounded-full" /> {/* Add to Cart Button */}
        </div>
      </div>
    </div>
  );
}
