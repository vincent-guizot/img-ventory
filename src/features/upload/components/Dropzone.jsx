import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
const MAX_SIZE_BYTES = 20 * 1024 * 1024;
export function Dropzone({ onFilesAccepted }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length) onFilesAccepted(acceptedFiles);
    },
    [onFilesAccepted],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
    },
    maxSize: MAX_SIZE_BYTES,
  });
  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative flex cursor-pointer items-center gap-5 overflow-hidden rounded-2xl border-2 border-dashed border-primary-200 bg-gradient-to-br from-primary-50 via-white to-secondary-50/60 px-6 py-6 transition-colors dark:border-primary-500/30 dark:from-primary-500/10 dark:via-slate-900 dark:to-secondary-500/10",
        isDragActive && "border-primary bg-primary-50 dark:bg-primary-500/10",
      )}
    >
      <input {...getInputProps()} />

      <ImagePlus className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-primary-100 opacity-70 dark:text-primary-500/10" />

      {/* Left: icon */}
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-soft transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-hover">
        <UploadCloud className="h-7 w-7" />
      </div>

      {/* Right: text */}
      <div className="relative min-w-0 flex-1">
        <p className="text-base font-bold text-slate-900 dark:text-slate-100">
          {isDragActive ? "Drop your images here" : "Drag & drop images here"}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          or <span className="font-semibold text-primary">click to browse</span>{" "}
          from your device
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Supports: JPG, PNG, WEBP, GIF (Max 20MB each)
        </p>
      </div>
    </div>
  );
}
