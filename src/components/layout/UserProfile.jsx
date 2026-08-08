import { ChevronDown } from "lucide-react";
export function UserProfile() {
    return (<button className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
        V
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">vincent</p>
        <p className="truncate text-xs text-slate-400 dark:text-slate-500">vincent@example.com</p>
      </div>
      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"/>
    </button>);
}
