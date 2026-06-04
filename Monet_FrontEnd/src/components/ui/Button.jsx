export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary:
      'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        'focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant] || variants.primary,
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
