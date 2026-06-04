export default function EmptyState({ title = 'No data found', description = 'There is nothing to show here yet.' }) {
  return (
    <div className="card p-8 text-center">
      <p className="text-base font-bold text-slate-950 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
