import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Folder,
  Image as ImageIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useFolderImages,
  useImageDetails,
} from "@/features/gallery/hooks/useImages";
import { rootFolderLabel } from "@/features/folders/components/FolderSelect";
import { validateFolderSelector } from "@/lib/folderRules";
import { folderRoute, imageRoute } from "@/lib/routes";
import { TransformationCard } from "../components/TransformationCard";

/** Same params as the folder gallery's default view, so its cache is reused. */
const DEFAULT_LIST_PARAMS = {
  q: "",
  format: "",
  tag: "",
  favorite: "",
  sort: "date",
  order: "desc",
};
import { ImagePreview } from "../components/ImagePreview";
import { Thumbnails } from "../components/Thumbnails";
import { MetadataCard } from "../components/MetadataCard";
export function ImageDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: image, isLoading, error } = useImageDetails(id);
  // Folder context for prev/next/thumbnails: ?folder= from the gallery link,
  // otherwise the folder the image lives in.
  const folderParam = searchParams.get("folder");
  const folderFromParam =
    folderParam !== null && validateFolderSelector(folderParam).ok
      ? folderParam
      : null;
  const folderName = folderFromParam ?? image?.folderName ?? null;
  const siblings = useFolderImages(folderName ?? "", DEFAULT_LIST_PARAMS, {
    enabled: folderName !== null,
  });
  const images = siblings.data?.pages.flatMap((page) => page.images) ?? [];
  const index = images.findIndex((item) => item.id === id);
  const prev = index >= 0 ? images[index - 1] : undefined;
  const next = index >= 0 ? images[index + 1] : undefined;
  const folderLabel =
    folderName === "" ? rootFolderLabel() : (folderName ?? "Folder");
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 pt-1 lg:grid-cols-[1fr_360px]">
        <Skeleton className="aspect-[16/10] rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }
  if (!image) {
    const notFound = !error || error.status === 404 || error.status === 400;
    return (
      <EmptyState
        icon={ImageIcon}
        title={notFound ? "Image not found" : "Couldn't load image"}
        description={
          notFound
            ? "This image may have been removed or the link is incorrect."
            : error.message
        }
        action={
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        }
      />
    );
  }
  return (
    <div className="space-y-6 pt-1">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500">
          <Link
            to="/"
            aria-label="Home"
            className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-400"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {folderName !== null ? (
            <Link
              to={folderRoute(folderName)}
              className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-400"
            >
              <Folder className="h-3.5 w-3.5" />
              {folderLabel}
            </Link>
          ) : (
            <span>Folder</span>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Image Details
          </span>
        </nav>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={!prev}
            onClick={() => prev && navigate(imageRoute(prev.id, folderName ?? undefined))}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!next}
            onClick={() => next && navigate(imageRoute(next.id, folderName ?? undefined))}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <ImagePreview image={image} />
          {images.length > 0 && (
            <Thumbnails
              images={images.slice(0, 10)}
              activeId={image.id}
              folderName={folderName ?? undefined}
            />
          )}
          <div className="mt-6">
            <TransformationCard image={image} />
          </div>
        </div>
        <MetadataCard
          image={image}
          onMoved={(moved) =>
            navigate(imageRoute(moved.id, moved.folderName ?? undefined), {
              replace: true,
            })
          }
        />
      </div>
    </div>
  );
}
