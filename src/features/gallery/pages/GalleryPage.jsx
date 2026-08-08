import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useImages } from "../hooks/useImages";
import { GalleryGrid } from "../components/GalleryGrid";
export function GalleryPage() {
    const { search } = useOutletContext();
    const { data: images = [], isLoading, isFetching, refetch } = useImages();
    const filtered = useMemo(() => {
        if (!search.trim())
            return images;
        const term = search.trim().toLowerCase();
        return images.filter((image) => image.fileName.toLowerCase().includes(term));
    }, [images, search]);
    return (<div className="space-y-6 pt-1">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {search.trim() ? "Search Results" : "Your Images"}
        </h2>
        <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isFetching} title="Re-sync with Cloudinary (picks up renames/deletes made outside the app)">
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}/>
          Refresh
        </Button>
      </div>

      <GalleryGrid images={filtered} isLoading={isLoading} searchTerm={search}/>
    </div>);
}
