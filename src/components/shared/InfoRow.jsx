export function InfoRow({ icon: Icon, title, description, action }) {
    return (<div className="flex flex-col gap-4 border-b border-border dark:border-slate-800 px-6 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
          <Icon className="h-[18px] w-[18px] text-primary"/>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <div className="shrink-0 sm:w-64">{action}</div>
    </div>);
}
