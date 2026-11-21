import { useState } from "react";
import { Folder } from "lucide-react";
import { FolderSelect, rootFolderLabel } from "@/features/folders/components/FolderSelect";
import { Dropzone } from "./Dropzone";
import { UploadQueue } from "./UploadQueue";
import { useUpload } from "../hooks/useUpload";

/**
 * Dropzone + destination folder + upload queue.
 * - Without `lockedFolder`: shows the folder dropdown with "Add Folder" (Home, Upload page).
 * - With `lockedFolder` ("" = root): uploads go to that folder (folder gallery page).
 */
export function UploadPanel({ lockedFolder, defaultFolder = "" }) {
  const [selected, setSelected] = useState(defaultFolder);
  const isLocked = typeof lockedFolder === "string";
  const folder = isLocked ? lockedFolder : selected;
  const {
    queue,
    addFiles,
    addRejectedFiles,
    removeItem,
    cancelItem,
    retryItem,
    clearAll,
    clearFinished,
    uploadAll,
    pendingCount,
  } = useUpload({ folder });
  const label = folder || rootFolderLabel();

  return (
    <section className="space-y-3">
      {isLocked ? (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Folder className="h-3.5 w-3.5" />
          Uploading to <span className="text-primary">{label}</span>
        </p>
      ) : (
        <FolderSelect value={selected} onChange={setSelected} />
      )}
      <Dropzone
        onFilesAccepted={addFiles}
        onFilesRejected={addRejectedFiles}
        destinationLabel={label}
      />
      <UploadQueue
        items={queue}
        pendingCount={pendingCount}
        onRemove={removeItem}
        onRetry={retryItem}
        onCancel={cancelItem}
        onClearAll={clearAll}
        onClearFinished={clearFinished}
        onUploadAll={() => uploadAll(folder)}
        destinationLabel={label}
      />
    </section>
  );
}
