import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]", {
    variants: {
        variant: {
            primary: "bg-primary text-white shadow-soft hover:bg-primary-600 hover:shadow-hover",
            secondary: "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-border dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-soft",
            ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
            outline: "border border-border dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
            danger: "border border-red-200 text-red-600 hover:bg-red-50",
        },
        size: {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10 shrink-0",
        },
    },
    defaultVariants: {
        variant: "primary",
        size: "md",
    },
});
export const Button = forwardRef(({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (<Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}/>);
});
Button.displayName = "Button";
