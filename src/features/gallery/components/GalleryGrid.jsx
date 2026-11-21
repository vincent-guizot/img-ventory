import { AlertCircle, Image as ImageIcon, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ImageCard } from "./ImageCard";
export function GalleryGrid({
  images,
  isLoading,
  searchTerm,
  error,
  onRetry,
  view = "grid",
  folderName,
  selectedIds,
  onToggleSelect,
  emptyTitle,
  emptyDescription,
}) {
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
  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Couldn't load images"
        description={error.message}
        action={
          onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </Button>
          )
        }
      />
    );
  }
  if (images.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title={
          emptyTitle ??
          (searchTerm ? "No images match your search" : "No images yet")
        }
        description={
          emptyDescription ??
          (searchTerm
            ? `We couldn't find anything for "${searchTerm}". Try a different keyword.`
            : "Upload your first image to see it appear here.")
        }
      />
    );
  }
  const selectable = Boolean(onToggleSelect);
  if (view === "compact") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            view="compact"
            folderName={folderName}
            selectable={selectable}
            selected={selectedIds?.has(image.publicId) ?? false}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          folderName={folderName}
          selectable={selectable}
          selected={selectedIds?.has(image.publicId) ?? false}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
