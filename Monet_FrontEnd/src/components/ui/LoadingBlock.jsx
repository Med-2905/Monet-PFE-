export default function LoadingBlock({ label = 'Loading...' }) {
  return (
    <div className="card flex min-h-40 items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-400" />
        <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}
