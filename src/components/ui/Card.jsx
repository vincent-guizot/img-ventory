import { cn } from "@/lib/utils";
export function Card({ className, ...props }) {
    return (<div className={cn("rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card", className)} {...props}/>);
}
export function CardHeader({ className, ...props }) {
    return <div className={cn("p-6 pb-4", className)} {...props}/>;
}
export function CardTitle({ className, ...props }) {
    return (<h3 className={cn("text-base font-bold text-slate-900 dark:text-slate-100", className)} {...props}/>);
}
export function CardDescription({ className, ...props }) {
    return <p className={cn("text-sm text-slate-500 dark:text-slate-400 mt-1", className)} {...props}/>;
}
export function CardContent({ className, ...props }) {
    return <div className={cn("px-6 pb-6", className)} {...props}/>;
}
