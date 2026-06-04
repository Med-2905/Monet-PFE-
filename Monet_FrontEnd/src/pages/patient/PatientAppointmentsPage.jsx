import { useEffect, useState } from "react";

import { patientApi } from "../../services/patientApi.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import Alert from "../../components/ui/Alert.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

function doctorName(rdv) {
  const user = rdv.doctor?.user || {};
  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "Doctor";
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAppointments(page = 1) {
    try {
      setLoading(true);
      setError("");

      const response = await patientApi.getAppointments({ page });
      const paginator = response.appointments;

      setAppointments(paginator?.data || []);
      setMeta({
        current_page: paginator?.current_page || 1,
        last_page: paginator?.last_page || 1,
      });
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments(1);
  }, []);

  async function handleCancel(rdvId) {
    try {
      setCancelingId(rdvId);
      setError("");
      setSuccess("");

      await patientApi.cancelAppointment(rdvId, {
        reason: "Cancelled by patient",
      });

      setSuccess("Appointment cancelled successfully.");
      await loadAppointments(meta.current_page);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to cancel appointment.");
    } finally {
      setCancelingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Track your current appointment requests and statuses."
      />

      {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}
      {success && <div className="mb-5"><Alert type="success">{success}</Alert></div>}

      {loading ? (
        <LoadingBlock label="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <EmptyState title="No appointments" description="You have no appointments yet." />
      ) : (
        <div className="grid gap-4">
          {appointments.map((rdv) => (
            <div key={rdv.id} className="card p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-950 dark:text-white">
                    Dr. {doctorName(rdv)}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {rdv.doctor?.specialty?.name || "No specialty"} · {rdv.doctor?.city?.name || "No city"}
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {rdv.rdv_date} at {rdv.rdv_time}
                  </p>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Status: <span className="font-bold">{rdv.status}</span>
                  </p>

                  {rdv.reason && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Reason: {rdv.reason}
                    </p>
                  )}
                </div>

                {["pending", "confirmed"].includes(rdv.status) && (
                  <Button
                    variant="danger"
                    loading={cancelingId === rdv.id}
                    onClick={() => handleCancel(rdv.id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={loadAppointments}
          />
        </div>
      )}
    </div>
  );
}