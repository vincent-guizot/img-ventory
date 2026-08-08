import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", cancelLabel = "Keep it", variant = "danger", onConfirm, }) {
    return (<Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (<Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}/>
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount onOpenAutoFocus={(e) => e.preventDefault()}>
              <motion.div className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-6 shadow-hover dark:border-slate-800 dark:bg-slate-900" initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.16, ease: "easeOut" }}>
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", variant === "danger"
                ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                : "bg-primary-50 text-primary dark:bg-primary-500/10")}>
                    <AlertTriangle className="h-5 w-5"/>
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <Dialog.Title className="break-words text-sm font-bold text-slate-900 dark:text-slate-100">
                      {title}
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
                      {description}
                    </Dialog.Description>
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <Dialog.Close asChild>
                    <Button variant="secondary" size="sm">
                      {cancelLabel}
                    </Button>
                  </Dialog.Close>
                  <Button variant={variant === "danger" ? "danger" : "primary"} size="sm" onClick={() => {
                onConfirm();
                onOpenChange(false);
            }}>
                    {confirmLabel}
                  </Button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>)}
      </AnimatePresence>
    </Dialog.Root>);
}
