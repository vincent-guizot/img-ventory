import * as Dialog from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { Button } from "./Button";

/** Small modal form in the same visual style as ConfirmDialog. */
export function FormDialog({
  open,
  onOpenChange,
  icon: Icon,
  title,
  description,
  children,
  submitLabel = "Save",
  submitDisabled,
  isPending,
  onSubmit,
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-6 shadow-hover dark:border-slate-800 dark:bg-slate-900">
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (!submitDisabled && !isPending) onSubmit();
            }}
          >
            <div className="flex items-start gap-3">
              {Icon && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary dark:bg-primary-500/10">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1 pt-1">
                <Dialog.Title className="break-words text-sm font-bold text-slate-900 dark:text-slate-100">
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
                    {description}
                  </Dialog.Description>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-3">{children}</div>
            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" size="sm">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                size="sm"
                disabled={submitDisabled || isPending}
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {submitLabel}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
