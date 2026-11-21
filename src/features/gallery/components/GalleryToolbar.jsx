import { ArrowDownWideNarrow, ArrowUpNarrowWide, LayoutGrid, List, Star, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const SELECT_CLASS =
  "h-8 rounded-xl border border-border bg-white px-2.5 text-xs font-semibold text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300";

export const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "name", label: "Name" },
  { value: "size", label: "Size" },
  { value: "format", label: "Format" },
];
const FORMAT_OPTIONS = ["jpg", "png", "webp", "gif"];

/** Filters, sorting and view switch for the folder gallery. */
export function GalleryToolbar({ filters, onChange, view, onViewChange }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const hasFilters = filters.format || filters.tag || filters.favorite;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Filter by format"
        className={SELECT_CLASS}
        value={filters.format}
        onChange={(e) => set({ format: e.target.value })}
      >
        <option value="">All formats</option>
        {FORMAT_OPTIONS.map((format) => (
          <option key={format} value={format}>
            {format.toUpperCase()}
          </option>
        ))}
      </select>
      <input
        aria-label="Filter by tag"
        placeholder="Tag…"
        className={cn(SELECT_CLASS, "w-28 font-medium")}
        value={filters.tag}
        onChange={(e) => set({ tag: e.target.value })}
      />
      <Button
        variant={filters.favorite ? "primary" : "secondary"}
        size="sm"
        aria-pressed={filters.favorite}
        onClick={() => set({ favorite: !filters.favorite })}
      >
        <Star className={cn("h-3.5 w-3.5", filters.favorite && "fill-current")} />
        Favorites
      </Button>
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => set({ format: "", tag: "", favorite: false })}
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}

      <div className="ml-auto flex items-center gap-2">
        <select
          aria-label="Sort by"
          className={SELECT_CLASS}
          value={filters.sort}
          onChange={(e) =>
            set({
              sort: e.target.value,
              order: e.target.value === "date" ? "desc" : "asc",
            })
          }
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          size="sm"
          aria-label={filters.order === "asc" ? "Ascending" : "Descending"}
          title={filters.order === "asc" ? "Ascending" : "Descending"}
          onClick={() => set({ order: filters.order === "asc" ? "desc" : "asc" })}
        >
          {filters.order === "asc" ? (
            <ArrowUpNarrowWide className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownWideNarrow className="h-3.5 w-3.5" />
          )}
        </Button>
        <div className="flex rounded-xl border border-border p-0.5 dark:border-slate-800">
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => onViewChange("grid")}
            className={cn(
              "rounded-lg p-1.5 text-slate-400",
              view === "grid" && "bg-primary-50 text-primary dark:bg-primary-500/10",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Compact view"
            aria-pressed={view === "compact"}
            onClick={() => onViewChange("compact")}
            className={cn(
              "rounded-lg p-1.5 text-slate-400",
              view === "compact" && "bg-primary-50 text-primary dark:bg-primary-500/10",
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
