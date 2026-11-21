import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FolderPlus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { validateFolderName } from "@/lib/folderRules";
import { cloudinaryConfig } from "@/services/cloudinary.service";
import { useCreateFolder } from "../hooks/useFolders";

/**
 * Creates "<root>/<name>" in Cloudinary through /api/folders without leaving
 * the current page, then reports the new folder name via onCreated.
 */
export function CreateFolderDialog({ open, onOpenChange, onCreated }) {
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const createFolder = useCreateFolder();
  const validation = validateFolderName(name);
  const showError = touched && !validation.ok;

  const close = (next) => {
    if (!next) {
      setName("");
      setTouched(false);
      createFolder.reset();
    }
    onOpenChange(next);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched(true);
    if (!validation.ok || createFolder.isPending) return;
    createFolder.mutate(validation.value, {
      onSuccess: (folder) => {
        toast.success(`Folder "${folder.name}" created`);
        onCreated?.(folder.name);
        close(false);
      },
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={close}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-6 shadow-hover dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary dark:bg-primary-500/10">
                <FolderPlus className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <Dialog.Title className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  New folder
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Created in Cloudinary under{" "}
                  <span className="font-semibold">{cloudinaryConfig.folder}/</span>
                </Dialog.Description>
              </div>
            </div>
            <label className="mt-4 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Folder name
              <Input
                autoFocus
                className="mt-1.5"
                value={name}
                placeholder="e.g. Aplikasi A"
                maxLength={64}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={showError}
              />
            </label>
            {showError && (
              <p className="mt-1.5 text-xs text-red-500" role="alert">
                {validation.error}
              </p>
            )}
            {createFolder.isError && (
              <p className="mt-1.5 text-xs text-red-500" role="alert">
                {createFolder.error.message}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" size="sm">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                size="sm"
                disabled={createFolder.isPending || (touched && !validation.ok)}
              >
                {createFolder.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                Create folder
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
