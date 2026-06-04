import { useEffect, useState } from "react";

import { doctorApi } from "../../services/doctor.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Alert from "../../components/ui/Alert.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.message ||
    Object.values(error.response?.data?.errors || {}).flat().join(" ") ||
    fallback
  );
}

export default function DoctorUnavailableDaysPage() {
  const [days, setDays] = useState([]);
  const [form, setForm] = useState({
    unavailable_date_start: "",
    unavailable_date_end: "",
    reason: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadDays() {
    try {
      setLoading(true);
      const response = await doctorApi.getUnavailableDays();
      setDays(response.unavailable_days || []);
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Failed to load unavailable days."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDays();
  }, []);

  function handleChange(e) {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await doctorApi.addUnavailableDay({
        unavailable_date_start: form.unavailable_date_start,
        unavailable_date_end: form.unavailable_date_end || null,
        reason: form.reason || null,
      });

      setSuccess("Unavailable day added successfully.");
      setForm({
        unavailable_date_start: "",
        unavailable_date_end: "",
        reason: "",
      });

      await loadDays();
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Failed to add unavailable day."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(dayId) {
    try {
      setDeletingId(dayId);
      setError("");
      setSuccess("");

      await doctorApi.deleteUnavailableDay(dayId);

      setSuccess("Unavailable day deleted successfully.");
      await loadDays();
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Failed to delete unavailable day."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Unavailable Days" subtitle="Manage days where patients cannot book appointments." />

      {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}
      {success && <div className="mb-5"><Alert type="success">{success}</Alert></div>}

      <form onSubmit={handleSubmit} className="card mb-6 p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <FormField
            label="Start Date"
            name="unavailable_date_start"
            type="date"
            value={form.unavailable_date_start}
            onChange={handleChange}
            required
          />

          <FormField
            label="End Date"
            name="unavailable_date_end"
            type="date"
            value={form.unavailable_date_end}
            onChange={handleChange}
          />

          <FormField
            label="Reason"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Reason"
          />

          <div className="flex items-end">
            <Button type="submit" loading={saving} className="w-full">
              Add
            </Button>
          </div>
        </div>
      </form>

      {loading ? (
        <LoadingBlock label="Loading unavailable days..." />
      ) : days.length === 0 ? (
        <EmptyState title="No unavailable days" description="You have no blocked days yet." />
      ) : (
        <div className="grid gap-4">
          {days.map((day) => (
            <div key={day.id} className="card p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-black text-slate-950 dark:text-white">
                    {day.unavailable_date_start}
                    {day.unavailable_date_end ? ` → ${day.unavailable_date_end}` : ""}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {day.reason || "No reason"}
                  </p>
                </div>

                <Button
                  variant="danger"
                  loading={deletingId === day.id}
                  onClick={() => handleDelete(day.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}