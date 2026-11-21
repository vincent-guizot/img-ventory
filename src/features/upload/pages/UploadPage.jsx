import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { UploadPanel } from "../components/UploadPanel";
export function UploadPage() {
  return (
    <div className="space-y-6 pt-1">
      <PageHeader
        title="Upload Images"
        description="Drag & drop images here, or browse to select files."
      />

      <UploadPanel />

      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-400 dark:text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5" />
        Your files are private and secure. Only you can access them.
      </div>
    </div>
  );
}
