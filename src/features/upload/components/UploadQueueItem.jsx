import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  X,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Loader2,
  Ban,
  Square,
  Folder,
} from "lucide-react";
import { formatBytes, cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cloudinaryConfig } from "@/services/cloudinary.service";
export function UploadQueueItem({ item, onRemove, onRetry, onCancel }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isUploading = item.status === "uploading";
  const isSuccess = item.status === "success";
  const canRetry =
    item.retryable && (item.status === "error" || item.status === "cancelled");
  const confirmCopy = isUploading
    ? {
        title: "Cancel this upload?",
        description: `"${item.file.name}" is still uploading. Cancelling now will stop the upload.`,
        confirmLabel: "Cancel Upload",
      }
    : isSuccess
      ? {
          title: "Remove this file?",
          description: `"${item.file.name}" has already been uploaded to Cloudinary. This only removes it from this list.`,
          confirmLabel: "Remove",
        }
      : {
          title: "Remove from queue?",
          description: `Remove "${item.file.name}" from the upload queue?`,
          confirmLabel: "Remove",
        };
  const destination =
    item.folder === null
      ? null
      : item.folder || `${cloudinaryConfig.folder} (root)`;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 border-b border-border dark:border-slate-800 py-3 last:border-b-0"
      data-testid="upload-queue-item"
      data-status={item.status}
    >
      <img
        src={item.previewUrl}
        alt={item.file.name}
        className="h-11 w-11 shrink-0 rounded-lg object-cover"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
          {item.file.name}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400 dark:text-slate-500">
          <span>{formatBytes(item.file.size)}</span>
          {destination && (
            <span className="flex min-w-0 items-center gap-1">
              <Folder className="h-3 w-3 shrink-0" />
              <span className="truncate">{destination}</span>
            </span>
          )}
        </p>
        {item.errorMessage && item.status !== "cancelled" && (
          <p
            className="mt-0.5 text-xs font-medium text-red-500"
            role="alert"
          >
            {item.errorMessage}
          </p>
        )}
      </div>

      <div className="hidden w-40 shrink-0 sm:block">
        {item.status === "uploading" || item.status === "success" ? (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-50 dark:bg-primary-500/10">
            <motion.div
              className={cn(
                "h-full rounded-full",
                item.status === "success" ? "bg-emerald-500" : "bg-primary",
              )}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        ) : null}
      </div>

      <div className="flex w-28 shrink-0 items-center justify-end gap-2 text-xs font-semibold">
        {item.status === "pending" && (
          <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            Ready
          </span>
        )}
        {item.status === "queued" && (
          <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            Queued
          </span>
        )}
        {item.status === "uploading" && (
          <span className="flex items-center gap-1.5 text-primary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {item.progress}%
          </span>
        )}
        {item.status === "success" && (
          <span className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Done
          </span>
        )}
        {(item.status === "error" || item.status === "invalid") && (
          <span className="flex items-center gap-1.5 text-red-500">
            <AlertCircle className="h-4 w-4" />
            {item.status === "invalid" ? "Invalid" : "Failed"}
          </span>
        )}
        {item.status === "cancelled" && (
          <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <Ban className="h-4 w-4" />
            Cancelled
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {(isUploading || item.status === "queued") && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(item.id)}
            aria-label={`Cancel upload of ${item.file.name}`}
            title="Cancel upload"
            className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500"
          >
            <Square className="h-4 w-4" />
          </button>
        )}
        {canRetry && (
          <button
            type="button"
            onClick={() => onRetry(item.id)}
            aria-label="Retry upload"
            className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label="Remove from queue"
          className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={confirmCopy.confirmLabel}
        cancelLabel="Keep it"
        onConfirm={() => onRemove(item.id)}
      />
    </motion.div>
  );
}
