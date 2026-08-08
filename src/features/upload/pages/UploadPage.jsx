import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Dropzone } from "../components/Dropzone";
import { UploadQueue } from "../components/UploadQueue";
import { useUpload } from "../hooks/useUpload";
export function UploadPage() {
  const {
    queue,
    addFiles,
    removeItem,
    retryItem,
    clearAll,
    uploadAll,
    pendingCount,
  } = useUpload();
  return (
    <div className="space-y-6 pt-1">
      <PageHeader
        title="Upload Images"
        description="Drag & drop images here, or browse to select files."
      />

      <Dropzone onFilesAccepted={addFiles} />

      <UploadQueue
        items={queue}
        pendingCount={pendingCount}
        onRemove={removeItem}
        onRetry={retryItem}
        onClearAll={clearAll}
        onUploadAll={uploadAll}
      />

      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-400 dark:text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5" />
        Your files are private and secure. Only you can access them.
      </div>
    </div>
  );
}
