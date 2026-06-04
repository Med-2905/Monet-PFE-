import { useEffect, useMemo, useState } from 'react';
import { Search, Star } from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import LoadingBlock from '../../components/ui/LoadingBlock.jsx';
import Alert from '../../components/ui/Alert.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { formatDate, fullName } from '../../utils/format.js';
import { getErrorMessage } from '../../utils/apiErrors.js';

function normalizeReviewsResponse(data) {
  const paginator = data?.reviews || data;

  return {
    items: paginator?.data || [],
    currentPage: paginator?.current_page || 1,
    lastPage: paginator?.last_page || 1,
    total: paginator?.total || 0,
  };
}

function getDoctorName(review) {
  return fullName(review?.doctor?.user || {});
}

function getPatientName(review) {
  return fullName(review?.patient?.user || {});
}

function getReviewText(review) {
  return review?.comment || review?.content || review?.message || review?.review || '-';
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState('');
  const [patient, setPatient] = useState('');
  const [doctor, setDoctor] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const queryParams = useMemo(
    () => ({
      rating: rating || undefined,
      patient: patient || undefined,
      doctor: doctor || undefined,
      page,
    }),
    [rating, patient, doctor, page],
  );

  useEffect(() => {
    let mounted = true;

    async function loadReviews() {
      setLoading(true);
      setError('');

      try {
        const { data } = await adminApi.reviews(queryParams);
        const normalized = normalizeReviewsResponse(data);

        if (mounted) {
          setReviews(normalized.items);
          setLastPage(normalized.lastPage);
          setTotal(normalized.total);
        }
      } catch (err) {
        if (mounted) {
          setError(getErrorMessage(err, 'Failed to load reviews.'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    const timeout = setTimeout(loadReviews, 250);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [queryParams]);

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setError('');

    try {
      await adminApi.deleteReview(deleteTarget.id);

      setReviews((current) => current.filter((review) => review.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete review.'));
    } finally {
      setDeleting(false);
    }
  }

  function resetFilters() {
    setRating('');
    setPatient('');
    setDoctor('');
    setPage(1);
  }

  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle="Moderate patient reviews and filter by rating, patient, or doctor."
      />

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_1fr_180px_auto]">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={patient}
            onChange={(event) => {
              setPage(1);
              setPatient(event.target.value);
            }}
            placeholder="Search patient"
            className="focus-ring w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={doctor}
            onChange={(event) => {
              setPage(1);
              setDoctor(event.target.value);
            }}
            placeholder="Search doctor"
            className="focus-ring w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <select
          value={rating}
          onChange={(event) => {
            setPage(1);
            setRating(event.target.value);
          }}
          className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        >
          <option value="">All ratings</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>

        <Button variant="secondary" onClick={resetFilters}>
          Reset
        </Button>
      </div>

      {error && (
        <div className="mb-5">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews found" description="Try changing the filters." />
      ) : (
        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Total reviews: {total}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/60">
                <tr>
                  <th className="table-th">Patient</th>
                  <th className="table-th">Doctor</th>
                  <th className="table-th">City</th>
                  <th className="table-th">Specialty</th>
                  <th className="table-th">Rating</th>
                  <th className="table-th">Review</th>
                  <th className="table-th">Created</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td className="table-td">
                      <div className="font-semibold">{getPatientName(review)}</div>
                      <div className="text-xs text-slate-500">{review?.patient?.email || '-'}</div>
                    </td>

                    <td className="table-td">
                      <div className="font-semibold">{getDoctorName(review)}</div>
                      <div className="text-xs text-slate-500">
  {review?.patient?.user?.email || '-'}
</div>
                    </td>

                    <td className="table-td">{review?.doctor?.city?.name || '-'}</td>

                    <td className="table-td">{review?.doctor?.specialty?.name || '-'}</td>

                    <td className="table-td">
                      <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                        <Star size={15} fill="currentColor" />
                        {review.rating || '-'}
                      </div>
                    </td>

                    <td className="table-td max-w-md">
                      <p className="line-clamp-2">{getReviewText(review)}</p>
                    </td>

                    <td className="table-td">{formatDate(review.created_at)}</td>

                    <td className="table-td">
                      <Button variant="danger" onClick={() => setDeleteTarget(review)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
            <Pagination currentPage={page} lastPage={lastPage} onPageChange={setPage} />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete review"
        message={`Delete this review from ${deleteTarget ? getPatientName(deleteTarget) : 'this patient'}? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}