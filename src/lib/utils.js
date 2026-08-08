import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
/** Format raw bytes into a human readable size string, e.g. 2517856 -> "2.4 MB". */
export function formatBytes(bytes, decimals = 1) {
    if (bytes === 0)
        return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
/** Format an ISO date string into a short readable form, e.g. "12 May 2024, 14:32". */
export function formatDate(iso) {
    const date = new Date(iso);
    const datePart = date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    return `${datePart}, ${timePart}`;
}
export function formatRelativeDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
