import { useState } from "react";
import { Pencil } from "lucide-react";
import { FormDialog } from "@/components/ui/FormDialog";
import { Input } from "@/components/ui/Input";
import { validateDisplayName } from "@/lib/folderRules";

/**
 * Rename confirmation. In Cloudinary's dynamic folder mode only the display
 * name changes; in fixed folder mode the public ID (and URL) is renamed.
 */
export function RenameDialog({ open, onOpenChange, image, isPending, onConfirm }) {
  const [name, setName] = useState(null);
  const value = name ?? image.fileName;
  const check = validateDisplayName(value);
  const unchanged = check.ok && check.value === image.fileName;
  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setName(null);
        onOpenChange(next);
      }}
      icon={Pencil}
      title="Rename image"
      description="If your Cloudinary account uses fixed folders, renaming also changes the public ID and the delivery URL; old links will stop working."
      submitLabel="Rename"
      submitDisabled={!check.ok || unchanged}
      isPending={isPending}
      onSubmit={() => onConfirm(check.value)}
    >
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
        New name
        <Input
          autoFocus
          className="mt-1.5"
          value={value}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!check.ok}
        />
      </label>
      {!check.ok && (
        <p className="text-xs text-red-500" role="alert">
          {check.error}
        </p>
      )}
    </FormDialog>
  );
}
