export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  as = 'input',
  rows = 4,
  ...props
}) {
  const inputClass =
    'focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white';

  const InputTag = as;

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>

      <InputTag
        name={name}
        type={as === 'input' ? type : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={as === 'textarea' ? rows : undefined}
        className={inputClass}
        {...props}
      />

      {error && <span className="mt-1.5 block text-xs font-medium text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}
