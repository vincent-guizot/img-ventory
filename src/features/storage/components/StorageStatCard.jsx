import { Card } from "@/components/ui/Card";
export function StorageStatCard({ icon: Icon, label, value, hint }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
        <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
      </div>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-slate-100">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {hint}
        </p>
      )}
    </Card>
  );
}
