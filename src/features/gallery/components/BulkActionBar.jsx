import { useState } from "react";
import { Copy, Download, FolderInput, Hash, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { copyText, triggerDownload } from "@/lib/browser";
import { useBulkImageAction } from "../hooks/useImages";
import { MoveDialog } from "./MoveDialog";

export const MAX_BULK_DOWNLOADS = 20;

function summarize(action, data) {
  const verb = action === "delete" ? "deleted" : "moved";
  if (data.failed === 0) {
    toast.success(`${data.succeeded} image${data.succeeded === 1 ? "" : "s"} ${verb}`);
    return;
  }
  const firstError = data.results.find((r) => !r.ok)?.error;
  toast.error(
    `${data.succeeded} ${verb}, ${data.failed} failed${firstError ? `: ${firstError}` : ""}`,
  );
}

/** Actions for the current selection (a Map of publicId -> image). */
export function BulkActionBar({ selected, currentFolder, onClear, onDone }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const bulk = useBulkImageAction();
  const images = [...selected.values()];
  const count = images.length;
  if (count === 0) return null;

  const run = (action, payload) =>
    bulk.mutate(
      { action, publicIds: images.map((image) => image.publicId), payload },
      {
        onSuccess: (data) => {
          summarize(action, data);
          // Keep only the items that failed selected, so they can be retried.
          onDone(data.results.filter((r) => !r.ok).map((r) => r.publicId));
          if (action === "move") {
            const changed = data.results.filter((r) => r.ok && r.urlChanged).length;
            if (changed) {
              toast(`${changed} public ID/URL${changed === 1 ? "" : "s"} changed — update any links that used the old URL.`);
            }
          }
          setMoveOpen(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );

  const copy = async (values, label) => {
    try {
      await copyText(values.join("\n"));
      toast.success(`${label} copied`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const download = () => {
    const batch = images.slice(0, MAX_BULK_DOWNLOADS);
    batch.forEach((image, i) => setTimeout(() => triggerDownload(image), i * 350));
    if (count > MAX_BULK_DOWNLOADS) {
      toast(`Downloading the first ${MAX_BULK_DOWNLOADS} of ${count} images`);
    }
  };

  return (
    <div
      className="sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-primary-200 bg-primary-50/95 px-4 py-2.5 shadow-soft backdrop-blur dark:border-primary-500/30 dark:bg-slate-900/95"
      role="toolbar"
      aria-label="Bulk actions"
    >
      <span className="mr-2 text-sm font-bold text-primary">
        {count} selected
      </span>
      <Button variant="secondary" size="sm" onClick={download}>
        <Download className="h-3.5 w-3.5" />
        Download
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => copy(images.map((image) => image.secureUrl), "URLs")}
      >
        <Copy className="h-3.5 w-3.5" />
        Copy URLs
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => copy(images.map((image) => image.publicId), "Public IDs")}
      >
        <Hash className="h-3.5 w-3.5" />
        Copy public IDs
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setMoveOpen(true)}
        disabled={bulk.isPending}
      >
        <FolderInput className="h-3.5 w-3.5" />
        Move
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setConfirmDelete(true)}
        disabled={bulk.isPending}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto">
        <X className="h-3.5 w-3.5" />
        Clear
      </Button>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${count} image${count === 1 ? "" : "s"}?`}
        description="The selected images will be permanently removed from Cloudinary. This can't be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => run("delete")}
      />
      <MoveDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        count={count}
        currentFolder={currentFolder}
        isPending={bulk.isPending}
        onConfirm={(folder) => run("move", { folder })}
      />
    </div>
  );
}
