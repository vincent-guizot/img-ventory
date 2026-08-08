import { HardDrive } from "lucide-react";
import { Link } from "react-router-dom";
import { formatBytes } from "@/lib/utils";
import { useImages } from "@/features/gallery/hooks/useImages";
export function StorageWidget() {
    const { data: images = [] } = useImages();
    const totalBytes = images.reduce((sum, image) => sum + image.bytes, 0);
    return (<Link to="/storage" className="flex items-center gap-3 rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-soft transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
        <HardDrive className="h-5 w-5 text-primary"/>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{images.length} image{images.length === 1 ? "" : "s"} uploaded</p>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatBytes(totalBytes)} total</p>
      </div>
    </Link>);
}
