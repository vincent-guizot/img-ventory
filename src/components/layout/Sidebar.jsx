import { NavLink } from "react-router-dom";
import {
  CloudUpload,
  Image as ImageIcon,
  UploadCloud,
  HardDrive,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StorageWidget } from "./StorageWidget";
import { UserProfile } from "./UserProfile";
const NAV_ITEMS = [
  { to: "/", label: "Home", icon: ImageIcon, end: true },
  { to: "/upload", label: "Upload", icon: UploadCloud },
  { to: "/storage", label: "Storage", icon: HardDrive },
  { to: "/settings", label: "Settings", icon: Settings },
];
export function Sidebar() {
  return (
    <aside className="hidden w-[270px] shrink-0 flex-col border-r border-border dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-6 lg:flex h-full overflow-y-auto">
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
          <CloudUpload className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div>
          <p className="text-base font-extrabold leading-none text-slate-900 dark:text-slate-100">
            img-ventory
          </p>
          <p className="mt-1 text-[11px] font-medium leading-none text-slate-400 dark:text-slate-500">
            Store. Upload. Manage.
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors",
                "hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200",
                isActive &&
                  "bg-primary-50 dark:bg-primary-500/10 text-primary hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:text-primary",
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4 pt-6">
        <StorageWidget />
        <UserProfile />
      </div>
    </aside>
  );
}
