import { useEffect, useState } from "react";
import { Star } from "lucide-react";

import { doctorApi } from "../../services/doctor.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Alert from "../../components/ui/Alert.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

function patientName(review) {
  const user = review.patient?.user || {};
  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Patient";
}

export default function DoctorReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReviews(page = 1) {
    try {
      setLoading(true);
      const response = await doctorApi.getReviews({ page });
      setReviews(response.data || []);
      setMeta({
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
      });
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews(1);
  }, []);

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Reviews received from patients." />

      {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}

      {loading ? (
        <LoadingBlock label="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews" description="No patient reviews yet." />
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-black text-slate-950 dark:text-white">
                    {patientName(review)}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {review.comment || "No comment"}
                  </p>
                </div>

                <p className="flex items-center gap-1 font-black text-amber-600 dark:text-amber-300">
                  <Star size={16} />
                  {review.rating}/5
                </p>
              </div>
            </div>
          ))}

          <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={loadReviews} />
        </div>
      )}
    </div>
  );
}