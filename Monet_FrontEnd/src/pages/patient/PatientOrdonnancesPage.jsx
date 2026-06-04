import { useEffect, useState } from "react";

import { patientApi } from "../../services/patientApi.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Alert from "../../components/ui/Alert.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

function doctorName(ordonnance) {
  const user = ordonnance.doctor?.user || {};
  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "Doctor";
}

export default function PatientOrdonnancesPage() {
  const [ordonnances, setOrdonnances] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrdonnances(page = 1) {
    try {
      setLoading(true);
      setError("");

      const response = await patientApi.getOrdonnances({ page });
      const paginator = response.Ordonnances;

      setOrdonnances(paginator?.data || []);
      setMeta({
        current_page: paginator?.current_page || 1,
        last_page: paginator?.last_page || 1,
      });
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to load ordonnances.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrdonnances(1);
  }, []);

  return (
    <div>
      <PageHeader title="Ordonnances" subtitle="View your medical prescriptions." />

      {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}

      {loading ? (
        <LoadingBlock label="Loading ordonnances..." />
      ) : ordonnances.length === 0 ? (
        <EmptyState title="No ordonnances" description="No prescriptions available yet." />
      ) : (
        <div className="grid gap-4">
          {ordonnances.map((ordonnance) => (
            <div key={ordonnance.id} className="card p-5">
              <h2 className="text-lg font-black text-slate-950 dark:text-white">
                Dr. {doctorName(ordonnance)}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {ordonnance.created_at?.slice(0, 10)}
              </p>

              <div className="mt-4 grid gap-3">
                <div>
                  <p className="text-sm font-bold">Diagnosis</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {ordonnance.diagnosis || "No diagnosis"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold">Medications</p>
                  <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                    {ordonnance.medications || "No medications"}
                  </p>
                </div>

                {ordonnance.notes && (
                  <div>
                    <p className="text-sm font-bold">Notes</p>
                    <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                      {ordonnance.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={loadOrdonnances}
          />
        </div>
      )}
    </div>
  );
}