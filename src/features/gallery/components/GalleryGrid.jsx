import { Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ImageCard } from "./ImageCard";
export function GalleryGrid({ images, isLoading, searchTerm }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-3.5 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (images.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title={searchTerm ? "No images match your search" : "No images yet"}
        description={
          searchTerm
            ? `We couldn't find anything for "${searchTerm}". Try a different keyword.`
            : "Upload your first image to see it appear here."
        }
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {images.map((image) => (
        <ImageCard key={image.id} image={image} />
      ))}
    </div>
  );
}
