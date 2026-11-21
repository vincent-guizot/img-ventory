import { useState } from "react";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { cloudinaryConfig } from "@/services/cloudinary.service";
import { useFolders } from "../hooks/useFolders";
import { CreateFolderDialog } from "./CreateFolderDialog";

export function rootFolderLabel() {
  return `${cloudinaryConfig.folder} (root)`;
}

/** Destination folder dropdown with an "Add Folder" button next to it. */
export function FolderSelect({ value, onChange, disabled, className }) {
  const { data: folders = [], isLoading, isError } = useFolders();
  const [createOpen, setCreateOpen] = useState(false);
  // Keep a just-created folder selectable even before the list refetches.
  const hasValue = !value || folders.some((folder) => folder.name === value);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <label className="flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span className="shrink-0">Upload to</span>
        <select
          aria-label="Destination folder"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 min-w-0 flex-1 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:max-w-xs"
        >
          <option value="">{rootFolderLabel()}</option>
          {folders.map((folder) => (
            <option key={folder.path} value={folder.name}>
              {folder.name}
            </option>
          ))}
          {!hasValue && <option value={value}>{value}</option>}
        </select>
      </label>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setCreateOpen(true)}
        disabled={disabled}
      >
        <FolderPlus className="h-3.5 w-3.5" />
        Add Folder
      </Button>
      {isLoading && (
        <span className="text-xs text-slate-400">Loading folders…</span>
      )}
      {isError && (
        <span className="text-xs text-red-500" role="alert">
          Couldn't load folders
        </span>
      )}
      <CreateFolderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(name) => onChange(name)}
      />
    </div>
  );
}
