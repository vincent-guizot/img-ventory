import { forwardRef } from "react";
import { cn } from "@/lib/utils";
export const Input = forwardRef(({ className, ...props }, ref) => {
    return (<input ref={ref} className={cn("h-10 w-full rounded-xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-700 dark:text-slate-300", "placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors", "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary", className)} {...props}/>);
});
Input.displayName = "Input";
