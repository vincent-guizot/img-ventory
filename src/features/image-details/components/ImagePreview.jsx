import { ZoomIn, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
export function ImagePreview({ image }) {
    return (<motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: "easeOut" }} className="relative overflow-hidden rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
      <img src={image.secureUrl} alt={image.fileName} className="max-h-[560px] w-full object-cover"/>
      <div className="absolute right-4 top-4 flex gap-2">
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 shadow-soft backdrop-blur hover:bg-white dark:hover:bg-slate-800">
          <ZoomIn className="h-4 w-4"/>
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 shadow-soft backdrop-blur hover:bg-white dark:hover:bg-slate-800">
          <Maximize2 className="h-4 w-4"/>
        </button>
      </div>
    </motion.div>);
}
