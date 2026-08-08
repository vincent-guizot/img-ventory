import { cn } from "@/lib/utils";
export function Badge({ className, ...props }) {
    return (<span className={cn("inline-flex items-center rounded-md bg-primary-50 dark:bg-primary-500/10 px-2 py-1 text-xs font-semibold text-primary-600", className)} {...props}/>);
}
