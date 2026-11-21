import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Trash2, UploadCloud } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UploadQueueItem } from "./UploadQueueItem";
export function UploadQueue({
  items,
  pendingCount,
  onRemove,
  onRetry,
  onCancel,
  onClearAll,
  onClearFinished,
  onUploadAll,
  destinationLabel,
}) {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  if (items.length === 0) return null;
  // Nothing left to cancel once every file has finished uploading successfully.
  const hasCancellableItems = items.some((item) => item.status !== "success");
  const hasFinishedItems = items.some((item) => item.status === "success");
  return (
    <Card className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {items.length} file{items.length === 1 ? "" : "s"} selected
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {hasFinishedItems && onClearFinished && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFinished}
              className="text-slate-500 dark:text-slate-400"
            >
              Clear finished
            </Button>
          )}
          {hasCancellableItems && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmClearOpen(true)}
              className="text-slate-500 dark:text-slate-400 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Cancel All
            </Button>
          )}
          {pendingCount > 0 && (
            <Button size="sm" onClick={onUploadAll}>
              <UploadCloud className="h-3.5 w-3.5" />
              Upload {pendingCount} file{pendingCount === 1 ? "" : "s"}
              {destinationLabel ? ` to ${destinationLabel}` : ""}
            </Button>
          )}
        </div>
      </div>
      <div className="px-6 pb-2 pt-3">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <UploadQueueItem
              key={item.id}
              item={item}
              onRemove={onRemove}
              onRetry={onRetry}
              onCancel={onCancel}
            />
          ))}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        title="Cancel all uploads?"
        description="This removes every file from the queue, including any still uploading. Files already uploaded to Cloudinary won't be deleted."
        confirmLabel="Cancel All"
        cancelLabel="Keep queue"
        onConfirm={onClearAll}
      />
    </Card>
  );
}
