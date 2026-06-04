import { useEffect, useState } from "react";

import { patientApi } from "../../services/patientApi.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Alert from "../../components/ui/Alert.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

function doctorName(rdv) {
  const user = rdv.doctor?.user || {};
  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "Doctor";
}

export default function PatientHistoryPage() {
  const [history, setHistory] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [reviewForm, setReviewForm] = useState({ rdvId: null, rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadHistory(page = 1) {
    try {
      setLoading(true);
      setError("");

      const response = await patientApi.getHistory({ page });
      const paginator = response.history;

      setHistory(paginator?.data || []);
      setMeta({
        current_page: paginator?.current_page || 1,
        last_page: paginator?.last_page || 1,
      });
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory(1);
  }, []);

  async function handleReview(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await patientApi.addReview(reviewForm.rdvId, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });

      setSuccess("Review added successfully.");
      setReviewForm({ rdvId: null, rating: 5, comment: "" });
      await loadHistory(meta.current_page);
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message ||
          Object.values(error.response?.data?.errors || {}).flat().join(" ") ||
          "Failed to add review."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Appointment History" subtitle="Completed, cancelled, and old appointments." />

      {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}
      {success && <div className="mb-5"><Alert type="success">{success}</Alert></div>}

      {loading ? (
        <LoadingBlock label="Loading history..." />
      ) : history.length === 0 ? (
        <EmptyState title="No history" description="No past appointments yet." />
      ) : (
        <div className="grid gap-4">
          {history.map((rdv) => (
            <div key={rdv.id} className="card p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h2 className="text-lg font-black text-slate-950 dark:text-white">
                    Dr. {doctorName(rdv)}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {rdv.rdv_date} at {rdv.rdv_time} · {rdv.status}
                  </p>

                  {rdv.review && (
                    <p className="mt-2 text-sm font-semibold text-amber-600 dark:text-amber-300">
                      Reviewed: {rdv.review.rating}/5
                    </p>
                  )}
                </div>

                {rdv.status === "completed" && !rdv.review && (
                  <Button
                    variant="secondary"
                    onClick={() => setReviewForm({ rdvId: rdv.id, rating: 5, comment: "" })}
                  >
                    Add Review
                  </Button>
                )}
              </div>

              {reviewForm.rdvId === rdv.id && (
                <form onSubmit={handleReview} className="mt-5 grid gap-4 border-t border-slate-200 pt-5 dark:border-slate-800 md:grid-cols-3">
                  <FormField
                    label="Rating"
                    name="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm((current) => ({
                        ...current,
                        rating: e.target.value,
                      }))
                    }
                    required
                  />

                  <div className="md:col-span-2">
                    <FormField
                      label="Comment"
                      name="comment"
                      as="textarea"
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm((current) => ({
                          ...current,
                          comment: e.target.value,
                        }))
                      }
                      placeholder="Write your review"
                    />
                  </div>

                  <div className="md:col-span-3 flex gap-2">
                    <Button type="submit" loading={saving}>Submit Review</Button>
                    <Button
                      variant="secondary"
                      onClick={() => setReviewForm({ rdvId: null, rating: 5, comment: "" })}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ))}

          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={loadHistory}
          />
        </div>
      )}
    </div>
  );
}