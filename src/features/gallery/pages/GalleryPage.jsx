import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  ChevronRight,
  Folder,
  Home,
  Loader2,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { readPreference, writePreference } from "@/lib/browser";
import { validateFolderSelector } from "@/lib/folderRules";
import { useFolders } from "@/features/folders/hooks/useFolders";
import { rootFolderLabel } from "@/features/folders/components/FolderSelect";
import { UploadPanel } from "@/features/upload/components/UploadPanel";
import { useFolderImages } from "../hooks/useImages";
import { GalleryGrid } from "../components/GalleryGrid";
import { GalleryToolbar } from "../components/GalleryToolbar";
import { BulkActionBar } from "../components/BulkActionBar";

const VIEW_KEY = "img-ventory-view";
const DEFAULT_FILTERS = {
  format: "",
  tag: "",
  favorite: false,
  sort: "date",
  order: "desc",
};

/**
 * Gallery for ONE folder: /folders (root) or /folders/:folderName.
 * Search (navbar), filters and sorting run server-side in Cloudinary; pages
 * are loaded with Cloudinary's next_cursor (infinite scroll + "Load more").
 */
export function GalleryPage() {
  const { folderName: rawFolder = "" } = useParams();
  const folderCheck = validateFolderSelector(rawFolder);
  const folderName = folderCheck.ok ? folderCheck.value : null;

  const folders = useFolders();
  const folderExists =
    folderName === "" ||
    (folderName !== null &&
      (folders.data ?? []).some((folder) => folder.name === folderName));

  if (folderName === null || (!folders.isLoading && !folders.isError && !folderExists)) {
    return (
      <EmptyState
        icon={Folder}
        title="Folder not found"
        description={`"${rawFolder}" doesn't exist in Cloudinary (or the name is invalid).`}
        action={
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        }
      />
    );
  }
  if (folders.isLoading && folderName !== "") {
    return (
      <div className="space-y-4 pt-1">
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }
  return <FolderGallery key={folderName} folderName={folderName} />;
}

function FolderGallery({ folderName }) {
  const { search = "" } = useOutletContext() ?? {};
  const debouncedSearch = useDebounce(search.trim(), 300);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const debouncedTag = useDebounce(filters.tag.trim(), 300);
  const [view, setView] = useState(() =>
    readPreference(VIEW_KEY, "grid") === "compact" ? "compact" : "grid",
  );
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected] = useState(() => new Map());

  const params = useMemo(
    () => ({
      q: debouncedSearch,
      format: filters.format,
      tag: debouncedTag,
      favorite: filters.favorite ? "1" : "",
      sort: filters.sort,
      order: filters.order,
    }),
    [debouncedSearch, debouncedTag, filters.format, filters.favorite, filters.sort, filters.order],
  );
  const query = useFolderImages(folderName, params);
  const images = useMemo(
    () => query.data?.pages.flatMap((page) => page.images) ?? [],
    [query.data],
  );
  const totalCount = query.data?.pages[0]?.totalCount;
  const label = folderName || rootFolderLabel();
  const isFiltered = Boolean(
    debouncedSearch || filters.format || debouncedTag || filters.favorite,
  );

  // Infinite scroll: load the next cursor page when the sentinel is visible.
  const sentinelRef = useRef(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || typeof IntersectionObserver === "undefined") {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const toggleSelect = useCallback((image) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(image.publicId)) next.delete(image.publicId);
      else next.set(image.publicId, image);
      return next;
    });
  }, []);
  const allLoadedSelected =
    images.length > 0 && images.every((image) => selected.has(image.publicId));
  const toggleSelectAll = () => {
    setSelected(
      allLoadedSelected
        ? new Map()
        : new Map(images.map((image) => [image.publicId, image])),
    );
  };

  return (
    <div className="space-y-5 pt-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500"
        >
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-400"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="flex min-w-0 items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <Folder className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </span>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant={showUpload ? "primary" : "secondary"}
            size="sm"
            onClick={() => setShowUpload((v) => !v)}
            aria-expanded={showUpload}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload here
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
            title="Re-sync with Cloudinary (picks up renames/deletes made outside the app)"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          {label}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {typeof totalCount === "number"
            ? `${totalCount} image${totalCount === 1 ? "" : "s"}${isFiltered ? " match" : ""}`
            : " "}
          {debouncedSearch && ` for "${debouncedSearch}"`}
        </p>
      </div>

      {showUpload && <UploadPanel lockedFolder={folderName} />}

      <GalleryToolbar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
        }}
        view={view}
        onViewChange={(next) => {
          setView(next);
          writePreference(VIEW_KEY, next);
        }}
      />

      {images.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <label className="flex cursor-pointer items-center gap-2 font-semibold">
            <input
              type="checkbox"
              checked={allLoadedSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 accent-primary"
            />
            Select all loaded ({images.length})
          </label>
        </div>
      )}

      <BulkActionBar
        selected={selected}
        currentFolder={folderName}
        onClear={() => setSelected(new Map())}
        onDone={(failedIds) =>
          setSelected((prev) => {
            const next = new Map();
            for (const id of failedIds) if (prev.has(id)) next.set(id, prev.get(id));
            return next;
          })
        }
      />

      <GalleryGrid
        images={images}
        isLoading={query.isLoading}
        error={query.isError ? query.error : null}
        onRetry={() => query.refetch()}
        searchTerm={debouncedSearch}
        view={view}
        folderName={folderName}
        selectedIds={selected}
        onToggleSelect={toggleSelect}
        emptyTitle={
          isFiltered ? "No images match your filters" : "This folder is empty"
        }
        emptyDescription={
          isFiltered
            ? "Try a different keyword or clear the filters."
            : "Use “Upload here” to add images to this folder."
        }
      />

      {query.hasNextPage && (
        <div ref={sentinelRef} className="flex justify-center pt-2">
          <Button
            variant="secondary"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
          >
            {query.isFetchingNextPage && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {query.isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
      {query.isFetchNextPageError && (
        <p className="text-center text-xs text-red-500" role="alert">
          Couldn't load more images: {query.error?.message}
        </p>
      )}
    </div>
  );
}
