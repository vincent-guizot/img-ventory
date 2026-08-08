import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
export function EmptyState({ icon: Icon, title, description, action, className }) {
    return (<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-border dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 px-6 py-16 text-center", className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10">
        <Icon className="h-7 w-7 text-primary" strokeWidth={1.75}/>
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>);
}
