import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Trash2,
  Loader2,
  Image as ImageIcon,
  Star,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatRelativeDate, formatBytes, cn } from "@/lib/utils";
import { imageRoute } from "@/lib/routes";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDeleteImage, useUpdateImage } from "../hooks/useImages";

function useCardActions(image) {
  const deleteImage = useDeleteImage();
  const updateImage = useUpdateImage();
  const handleConfirmDelete = () => {
    deleteImage.mutate(image, {
      onSuccess: () => {
        toast.success(`${image.fileName} deleted`);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to delete ${image.fileName}`,
        );
      },
    });
  };
  const toggleFavorite = () => {
    updateImage.mutate(
      { image, action: "favorite", payload: { favorite: !image.favorite } },
      {
        onSuccess: () =>
          toast.success(
            image.favorite ? "Removed from favorites" : "Added to favorites",
          ),
        onError: (error) => toast.error(error.message),
      },
    );
  };
  return { deleteImage, updateImage, handleConfirmDelete, toggleFavorite };
}

function SelectBox({ selected, onToggle, label, className }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors",
        selected
          ? "border-primary bg-primary text-white"
          : "border-white/90 bg-white/70 text-transparent dark:border-slate-600 dark:bg-slate-900/70",
        className,
      )}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </button>
  );
}

function FavoriteButton({ image, onClick, pending, className }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      disabled={pending}
      aria-pressed={image.favorite}
      aria-label={
        image.favorite
          ? `Remove ${image.fileName} from favorites`
          : `Add ${image.fileName} to favorites`
      }
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-opacity disabled:cursor-not-allowed",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Star
          className={cn(
            "h-4 w-4",
            image.favorite ? "fill-amber-400 text-amber-400" : "",
          )}
        />
      )}
    </button>
  );
}

export function ImageCard({
  image,
  folderName,
  selectable = false,
  selected = false,
  onToggleSelect,
  view = "grid",
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { deleteImage, updateImage, handleConfirmDelete, toggleFavorite } =
    useCardActions(image);
  const to = imageRoute(image.id, folderName);
  const dialog = (
    <ConfirmDialog
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      title="Delete this image?"
      description={`"${image.fileName}" will be permanently removed from Cloudinary. This can't be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="danger"
      onConfirm={handleConfirmDelete}
    />
  );
  const deleteButton = (className) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmOpen(true);
      }}
      disabled={deleteImage.isPending}
      aria-label={`Delete ${image.fileName}`}
      className={className}
    >
      {deleteImage.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );

  if (view === "compact") {
    return (
      <>
        <div
          className={cn(
            "group flex items-center gap-3 border-b border-border px-3 py-2 last:border-b-0 dark:border-slate-800",
            selected && "bg-primary-50/60 dark:bg-primary-500/10",
          )}
          data-testid="image-row"
        >
          {selectable && (
            <SelectBox
              selected={selected}
              onToggle={() => onToggleSelect?.(image)}
              label={`Select ${image.fileName}`}
              className={selected ? "" : "border-slate-300 dark:border-slate-600"}
            />
          )}
          <Link to={to} className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src={image.thumbnailUrl}
              alt={image.fileName}
              loading="lazy"
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
              {image.fileName}
            </span>
            <span className="hidden w-16 shrink-0 text-xs uppercase text-slate-400 sm:block">
              {image.format}
            </span>
            <span className="hidden w-24 shrink-0 text-xs text-slate-400 md:block">
              {image.width} × {image.height}
            </span>
            <span className="w-20 shrink-0 text-right text-xs text-slate-400">
              {formatBytes(image.bytes)}
            </span>
            <span className="hidden w-28 shrink-0 text-right text-xs text-slate-400 lg:block">
              {formatRelativeDate(image.createdAt)}
            </span>
          </Link>
          <FavoriteButton
            image={image}
            onClick={toggleFavorite}
            pending={updateImage.isPending}
            className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          />
          {deleteButton(
            "flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:cursor-not-allowed",
          )}
        </div>
        {dialog}
      </>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={cn(
          "group overflow-hidden rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:shadow-hover",
          selected && "ring-2 ring-primary",
        )}
        data-testid="image-card"
      >
        <Link to={to} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={image.thumbnailUrl}
              alt={image.fileName}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="p-3 text-xs font-medium text-white">
                {image.width} × {image.height}
              </div>
            </div>
            {selectable && (
              <SelectBox
                selected={selected}
                onToggle={() => onToggleSelect?.(image)}
                label={`Select ${image.fileName}`}
                className={cn(
                  "absolute left-2.5 top-2.5",
                  !selected && "opacity-0 group-hover:opacity-100 focus:opacity-100",
                )}
              />
            )}
            <FavoriteButton
              image={image}
              onClick={toggleFavorite}
              pending={updateImage.isPending}
              className={cn(
                "absolute right-12 top-2.5 bg-white/90 text-slate-500 shadow-soft backdrop-blur dark:bg-slate-900/90",
                !image.favorite && "opacity-0 group-hover:opacity-100",
              )}
            />
            {deleteButton(
              "absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 dark:bg-slate-900/90 text-red-500 opacity-0 shadow-soft backdrop-blur transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-100",
            )}
          </div>
          <div className="flex items-center gap-2 p-3">
            <ImageIcon className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                {image.fileName}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {formatBytes(image.bytes)} ·{" "}
                {formatRelativeDate(image.createdAt)}
              </p>
            </div>
          </div>
        </Link>
      </motion.div>
      {dialog}
    </>
  );
}
