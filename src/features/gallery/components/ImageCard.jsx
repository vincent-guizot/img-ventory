import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { formatRelativeDate, formatBytes } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDeleteImage } from "../hooks/useImages";
export function ImageCard({ image }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteImage = useDeleteImage();
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
  return (
    <>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="group overflow-hidden rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:shadow-hover"
      >
        <Link to={`/gallery/${image.id}`} className="block">
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
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setConfirmOpen(true);
              }}
              disabled={deleteImage.isPending}
              aria-label={`Delete ${image.fileName}`}
              className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 dark:bg-slate-900/90 text-red-500 opacity-0 shadow-soft backdrop-blur transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-100"
            >
              {deleteImage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
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
    </>
  );
}
