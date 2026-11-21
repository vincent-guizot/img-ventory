import { useOutletContext } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BannerGrid } from "@/features/gallery/components/BannerGrid";
import { UploadPanel } from "@/features/upload/components/UploadPanel";
import { FolderList } from "@/features/folders/components/FolderList";
import { useFolders } from "@/features/folders/hooks/useFolders";
import { useStorageStats } from "@/features/storage/hooks/useStorageStats";

/** Home: upload area (with destination folder) + folder list. No image gallery here. */
export function HomePage() {
  const { search = "" } = useOutletContext() ?? {};
  const folders = useFolders();
  const stats = useStorageStats();

  return (
    <div className="space-y-6 pt-1">
      <BannerGrid />

      <UploadPanel />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {search.trim() ? "Matching Folders" : "Folders"}
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            void folders.refetch();
            void stats.refetch();
          }}
          disabled={folders.isFetching || stats.isFetching}
          title="Re-sync folders with Cloudinary"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${folders.isFetching || stats.isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
      <FolderList
        folders={folders.data ?? []}
        isLoading={folders.isLoading}
        error={folders.error}
        onRetry={() => folders.refetch()}
        stats={stats.data}
        statsLoading={stats.isLoading}
        searchTerm={search}
      />
      {stats.isError && (
        <p className="text-xs text-red-500" role="alert">
          Folder statistics unavailable: {stats.error.message}
        </p>
      )}
    </div>
  );
}
