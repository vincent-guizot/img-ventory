import { Sun, Moon } from "lucide-react";
import { SearchBar } from "@/components/shared/SearchBar";
import { useTheme } from "@/hooks/useTheme";
export function Navbar({ search, onSearchChange, rightSlot }) {
    const { theme, toggleTheme } = useTheme();
    return (<header className="flex items-center gap-4 px-6 py-5 lg:px-10">
      <SearchBar value={search} onChange={onSearchChange} className="max-w-sm flex-1"/>
      <div className="ml-auto flex items-center gap-3">
        {rightSlot}
        <button onClick={toggleTheme} aria-label="Toggle theme" className="flex h-10 w-10 items-center justify-center rounded-xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
          {theme === "light" ? <Sun className="h-[18px] w-[18px]"/> : <Moon className="h-[18px] w-[18px]"/>}
        </button>
      </div>
    </header>);
}
