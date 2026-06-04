export default function MetricCard({ label, value, icon: Icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value ?? 0}</p>
        </div>

        {Icon && (
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-brand-100">
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
