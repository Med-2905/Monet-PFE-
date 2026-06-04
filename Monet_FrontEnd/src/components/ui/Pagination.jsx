import Button from './Button.jsx';

export default function Pagination({ currentPage, lastPage, onPageChange }) {
  if (!lastPage || lastPage <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Page {currentPage} of {lastPage}
      </p>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
