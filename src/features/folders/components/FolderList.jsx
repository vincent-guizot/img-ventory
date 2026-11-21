import { Link } from "react-router-dom";
import { AlertCircle, Folder, FolderOpen, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatBytes } from "@/lib/utils";
import { folderRoute } from "@/lib/routes";
import { rootFolderLabel } from "./FolderSelect";

function FolderCard({ name, label, stats, statsLoading }) {
  return (
    <Link
      to={folderRoute(name)}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary dark:bg-primary-500/10">
        <Folder className="h-5 w-5 group-hover:hidden" />
        <FolderOpen className="hidden h-5 w-5 group-hover:block" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
          {label ?? name}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {statsLoading ? (
            "Counting…"
          ) : stats ? (
            <>
              {stats.count} image{stats.count === 1 ? "" : "s"} ·{" "}
              {formatBytes(stats.bytes)}
            </>
          ) : (
            "—"
          )}
        </p>
      </div>
    </Link>
  );
}

/**
 * Folder grid for Home. The root folder is listed only when it still holds
 * images (e.g. uploads made before folders existed), so nothing is hidden.
 */
export function FolderList({
  folders,
  isLoading,
  error,
  onRetry,
  stats,
  statsLoading,
  searchTerm = "",
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] rounded-2xl" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Couldn't load folders"
        description={error.message}
        action={
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </Button>
        }
      />
    );
  }

  const term = searchTerm.trim().toLowerCase();
  const rootCount = stats?.folders?.[""]?.count ?? 0;
  const entries = [
    ...(rootCount > 0
      ? [{ name: "", label: rootFolderLabel() }]
      : []),
    ...folders.map((folder) => ({ name: folder.name })),
  ].filter((entry) =>
    term ? (entry.label ?? entry.name).toLowerCase().includes(term) : true,
  );

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Folder}
        title={term ? "No folders match your search" : "No folders yet"}
        description={
          term
            ? `Nothing found for "${searchTerm}".`
            : "Use “Add Folder” next to the upload area to create one, e.g. “Aplikasi A”."
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {entries.map((entry) => (
        <FolderCard
          key={entry.name || "__root"}
          name={entry.name}
          label={entry.label}
          stats={stats?.folders?.[entry.name]}
          statsLoading={statsLoading}
        />
      ))}
    </div>
  );
}
