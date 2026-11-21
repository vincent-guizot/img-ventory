import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { UPLOAD_ACCEPT, UPLOAD_MAX_BYTES } from "@/lib/folderRules";
export function Dropzone({ onFilesAccepted, onFilesRejected, destinationLabel }) {
  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      if (acceptedFiles.length) onFilesAccepted(acceptedFiles);
      // Rejected files (wrong type / too large) are surfaced with a reason
      // instead of silently disappearing.
      if (fileRejections?.length && onFilesRejected) {
        onFilesRejected(fileRejections);
      }
    },
    [onFilesAccepted, onFilesRejected],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: UPLOAD_ACCEPT,
    maxSize: UPLOAD_MAX_BYTES,
  });
  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative flex cursor-pointer items-center gap-5 overflow-hidden rounded-2xl border-2 border-dashed border-primary-200 bg-gradient-to-br from-primary-50 via-white to-secondary-50/60 px-6 py-6 transition-colors dark:border-primary-500/30 dark:from-primary-500/10 dark:via-slate-900 dark:to-secondary-500/10",
        isDragActive && "border-primary bg-primary-50 dark:bg-primary-500/10",
      )}
    >
      <input {...getInputProps()} data-testid="upload-input" />

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
        {destinationLabel && (
          <p className="mt-1 truncate text-xs font-semibold text-primary">
            Destination: {destinationLabel}
          </p>
        )}
      </div>
    </div>
  );
}
