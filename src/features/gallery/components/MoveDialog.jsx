import { useState } from "react";
import { FolderInput } from "lucide-react";
import { FormDialog } from "@/components/ui/FormDialog";
import { useFolders } from "@/features/folders/hooks/useFolders";
import { rootFolderLabel } from "@/features/folders/components/FolderSelect";

/**
 * Asks for a destination folder and confirms the move. Warns that the
 * public ID / URL may change (it does in Cloudinary's fixed folder mode;
 * in dynamic folder mode only the folder changes).
 */
export function MoveDialog({
  open,
  onOpenChange,
  count,
  currentFolder,
  isPending,
  onConfirm,
}) {
  const { data: folders = [], isLoading } = useFolders();
  const options = [
    { value: "", label: rootFolderLabel() },
    ...folders.map((folder) => ({ value: folder.name, label: folder.name })),
  ].filter((option) => option.value !== currentFolder);
  const [target, setTarget] = useState(null);
  const value = target ?? options[0]?.value ?? "";
  const noTargets = !isLoading && options.length === 0;

  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTarget(null);
        onOpenChange(next);
      }}
      icon={FolderInput}
      title={`Move ${count} image${count === 1 ? "" : "s"}?`}
      description="Depending on your Cloudinary folder mode, moving may change the public ID and delivery URL. Links that use the old URL may stop working."
      submitLabel="Move"
      submitDisabled={noTargets || isLoading}
      isPending={isPending}
      onSubmit={() => onConfirm(value)}
    >
      {noTargets ? (
        <p className="text-sm text-slate-500">
          There is no other folder to move to. Create one from Home first.
        </p>
      ) : (
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
          Destination folder
          <select
            aria-label="Move to folder"
            className="mt-1.5 h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            value={value}
            onChange={(e) => setTarget(e.target.value)}
          >
            {options.map((option) => (
              <option key={option.value || "__root"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </FormDialog>
  );
}
