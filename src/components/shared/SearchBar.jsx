import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
export function SearchBar({ value, onChange, placeholder = "Search images...", className }) {
    return (<div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"/>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-14 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"/>
      <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
        ⌘K
      </kbd>
    </div>);
}
