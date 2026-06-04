import { useEffect, useState } from "react";

import { doctorApi } from "../../services/doctor.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Alert from "../../components/ui/Alert.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

function patientName(ordonnance) {
  const user = ordonnance.patient?.user || {};
  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Patient";
}

export default function DoctorOrdonnancesPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrdonnances(page = 1) {
    try {
      setLoading(true);
      const response = await doctorApi.getOrdonnances({ page });
      setItems(response.data || []);
      setMeta({
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
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
      <PageHeader title="Ordonnances" subtitle="Prescriptions you created." />

      {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}

      {loading ? (
        <LoadingBlock label="Loading ordonnances..." />
      ) : items.length === 0 ? (
        <EmptyState title="No ordonnances" description="No prescriptions created yet." />
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="card p-5">
              <h2 className="text-lg font-black text-slate-950 dark:text-white">
                {patientName(item)}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {item.created_at?.slice(0, 10)}
              </p>
              <p className="mt-3 text-sm font-bold">Diagnosis</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{item.diagnosis}</p>
              <p className="mt-3 text-sm font-bold">Medications</p>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                {item.medications || "No medications"}
              </p>
            </div>
          ))}

          <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={loadOrdonnances} />
        </div>
      )}
    </div>
  );
}