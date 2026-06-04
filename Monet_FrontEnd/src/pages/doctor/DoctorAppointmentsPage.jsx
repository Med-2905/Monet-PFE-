import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { doctorApi } from "../../services/doctor.js";

import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Alert from "../../components/ui/Alert.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

function patientName(rdv) {
  const user = rdv.patient?.user || {};

  return (
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    user.email ||
    "Patient"
  );
}

function getErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error.response?.data?.message ||
    Object.values(error.response?.data?.errors || {})
      .flat()
      .join(" ") ||
    fallback
  );
}

function resetOrdonnanceForm() {
  return {
    rdvId: null,
    diagnosis: "",
    medications: "",
    notes: "",
  };
}

function resetMedicalRecordForm() {
  return {
    rdvId: null,
    condition: "",
    symptoms: "",
    diagnosis: "",
    treatment_plan: "",
    doctor_notes: "",
  };
}

export default function DoctorAppointmentsPage() {
  const [filters, setFilters] = useState({
    status: "",
    date: "",
  });

  const [appointments, setAppointments] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
  });

  const [ordonnanceForm, setOrdonnanceForm] = useState(resetOrdonnanceForm);
  const [medicalRecordForm, setMedicalRecordForm] = useState(
    resetMedicalRecordForm
  );

  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [savingOrdonnance, setSavingOrdonnance] = useState(false);
  const [savingMedicalRecord, setSavingMedicalRecord] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAppointments(page = 1) {
    try {
      setLoading(true);
      setError("");

      const response = await doctorApi.getAppointments({
        status: filters.status || undefined,
        date: filters.date || undefined,
        page,
      });

      setAppointments(response.data || []);

      setMeta({
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
      });
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Failed to load appointments."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(e) {
    const { name, value } = e.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleFilterSubmit(e) {
    e.preventDefault();
    await loadAppointments(1);
  }

  async function runAppointmentAction(rdvId, action, successMessage) {
    try {
      setActionId(rdvId);
      setError("");
      setSuccess("");

      await action(rdvId);

      setSuccess(successMessage || "Appointment updated successfully.");
      await loadAppointments(meta.current_page);
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Failed to update appointment."));
    } finally {
      setActionId(null);
    }
  }

  function openOrdonnanceForm(rdvId) {
    setError("");
    setSuccess("");
    setMedicalRecordForm(resetMedicalRecordForm());

    setOrdonnanceForm({
      rdvId,
      diagnosis: "",
      medications: "",
      notes: "",
    });
  }

  function closeOrdonnanceForm() {
    setOrdonnanceForm(resetOrdonnanceForm());
  }

  function openMedicalRecordForm(rdvId) {
    setError("");
    setSuccess("");
    setOrdonnanceForm(resetOrdonnanceForm());

    setMedicalRecordForm({
      rdvId,
      condition: "",
      symptoms: "",
      diagnosis: "",
      treatment_plan: "",
      doctor_notes: "",
    });
  }

  function closeMedicalRecordForm() {
    setMedicalRecordForm(resetMedicalRecordForm());
  }

  async function handleCreateOrdonnance(e) {
    e.preventDefault();

    if (!ordonnanceForm.rdvId) {
      setError("Choose an appointment first.");
      return;
    }

    if (!ordonnanceForm.diagnosis.trim()) {
      setError("Diagnosis is required.");
      return;
    }

    try {
      setSavingOrdonnance(true);
      setError("");
      setSuccess("");

      await doctorApi.createOrdonnance(ordonnanceForm.rdvId, {
        diagnosis: ordonnanceForm.diagnosis.trim(),
        medications: ordonnanceForm.medications || null,
        notes: ordonnanceForm.notes || null,
      });

      setSuccess("Ordonnance created successfully.");
      closeOrdonnanceForm();

      await loadAppointments(meta.current_page);
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Failed to create ordonnance."));
    } finally {
      setSavingOrdonnance(false);
    }
  }

  async function handleCreateMedicalRecord(e) {
    e.preventDefault();

    if (!medicalRecordForm.rdvId) {
      setError("Choose an appointment first.");
      return;
    }

    try {
      setSavingMedicalRecord(true);
      setError("");
      setSuccess("");

      await doctorApi.createMedicalRecord(medicalRecordForm.rdvId, {
        condition: medicalRecordForm.condition || null,
        symptoms: medicalRecordForm.symptoms || null,
        diagnosis: medicalRecordForm.diagnosis || null,
        treatment_plan: medicalRecordForm.treatment_plan || null,
        doctor_notes: medicalRecordForm.doctor_notes || null,
      });

      setSuccess("Medical record created successfully.");
      closeMedicalRecordForm();

      await loadAppointments(meta.current_page);
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Failed to create medical record."));
    } finally {
      setSavingMedicalRecord(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Manage patient appointments, ordonnances, and medical records."
      />

      {error && (
        <div className="mb-5">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {success && (
        <div className="mb-5">
          <Alert type="success">{success}</Alert>
        </div>
      )}

      <form onSubmit={handleFilterSubmit} className="card mb-6 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Status
            </span>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No show</option>
            </select>
          </label>

          <FormField
            label="Date"
            name="date"
            type="date"
            value={filters.date}
            onChange={handleFilterChange}
          />

          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Filter
            </Button>
          </div>
        </div>
      </form>

      {loading ? (
        <LoadingBlock label="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments"
          description="No appointments found."
        />
      ) : (
        <div className="grid gap-4">
          {appointments.map((rdv) => (
            <div key={rdv.id} className="card p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h2 className="text-lg font-black text-slate-950 dark:text-white">
                    {patientName(rdv)}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {rdv.patient?.user?.email || "No email"} ·{" "}
                    {rdv.patient?.user?.phone || "No phone"}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
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

                <div className="flex flex-wrap gap-2">
                  {rdv.patient_id && (
                    <Link
                      to={`/doctor/patients/${rdv.patient_id}/history`}
                      className="focus-ring inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      Medical History
                    </Link>
                  )}

                  {rdv.status === "pending" && (
                    <Button
                      loading={actionId === rdv.id}
                      onClick={() =>
                        runAppointmentAction(
                          rdv.id,
                          doctorApi.confirmAppointment,
                          "Appointment confirmed successfully."
                        )
                      }
                    >
                      Confirm
                    </Button>
                  )}

                  {rdv.status === "confirmed" && (
                    <>
                      <Button
                        variant="secondary"
                        loading={actionId === rdv.id}
                        onClick={() =>
                          runAppointmentAction(
                            rdv.id,
                            doctorApi.completeAppointment,
                            "Appointment completed successfully."
                          )
                        }
                      >
                        Complete
                      </Button>

                      <Button
                        variant="danger"
                        loading={actionId === rdv.id}
                        onClick={() =>
                          runAppointmentAction(
                            rdv.id,
                            (id) =>
                              doctorApi.cancelAppointment(id, {
                                reason: "Cancelled by doctor",
                              }),
                            "Appointment cancelled successfully."
                          )
                        }
                      >
                        Cancel
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => openOrdonnanceForm(rdv.id)}
                      >
                        Ordonnance
                      </Button>
                    </>
                  )}

                  {["confirmed", "completed"].includes(rdv.status) && (
                    <Button
                      variant="secondary"
                      onClick={() => openMedicalRecordForm(rdv.id)}
                    >
                      Medical Record
                    </Button>
                  )}

                  {["pending", "confirmed"].includes(rdv.status) && (
                    <Button
                      variant="secondary"
                      loading={actionId === rdv.id}
                      onClick={() =>
                        runAppointmentAction(
                          rdv.id,
                          doctorApi.markNoShow,
                          "Appointment marked as no show."
                        )
                      }
                    >
                      No Show
                    </Button>
                  )}
                </div>
              </div>

              {ordonnanceForm.rdvId === rdv.id && (
                <form
                  onSubmit={handleCreateOrdonnance}
                  className="mt-5 grid gap-4 border-t border-slate-200 pt-5 dark:border-slate-800"
                >
                  <h3 className="text-base font-black text-slate-950 dark:text-white">
                    Create Ordonnance
                  </h3>

                  <FormField
                    label="Diagnosis"
                    name="diagnosis"
                    as="textarea"
                    value={ordonnanceForm.diagnosis}
                    onChange={(e) =>
                      setOrdonnanceForm((current) => ({
                        ...current,
                        diagnosis: e.target.value,
                      }))
                    }
                    required
                  />

                  <FormField
                    label="Medications"
                    name="medications"
                    as="textarea"
                    value={ordonnanceForm.medications}
                    onChange={(e) =>
                      setOrdonnanceForm((current) => ({
                        ...current,
                        medications: e.target.value,
                      }))
                    }
                  />

                  <FormField
                    label="Notes"
                    name="notes"
                    as="textarea"
                    value={ordonnanceForm.notes}
                    onChange={(e) =>
                      setOrdonnanceForm((current) => ({
                        ...current,
                        notes: e.target.value,
                      }))
                    }
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" loading={savingOrdonnance}>
                      Create Ordonnance
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={closeOrdonnanceForm}
                      disabled={savingOrdonnance}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {medicalRecordForm.rdvId === rdv.id && (
                <form
                  onSubmit={handleCreateMedicalRecord}
                  className="mt-5 grid gap-4 border-t border-slate-200 pt-5 dark:border-slate-800"
                >
                  <h3 className="text-base font-black text-slate-950 dark:text-white">
                    Create Medical Record
                  </h3>

                  <FormField
                    label="Condition"
                    name="condition"
                    value={medicalRecordForm.condition}
                    onChange={(e) =>
                      setMedicalRecordForm((current) => ({
                        ...current,
                        condition: e.target.value,
                      }))
                    }
                    placeholder="Patient condition"
                  />

                  <FormField
                    label="Symptoms"
                    name="symptoms"
                    as="textarea"
                    value={medicalRecordForm.symptoms}
                    onChange={(e) =>
                      setMedicalRecordForm((current) => ({
                        ...current,
                        symptoms: e.target.value,
                      }))
                    }
                    placeholder="Symptoms"
                  />

                  <FormField
                    label="Diagnosis"
                    name="diagnosis"
                    as="textarea"
                    value={medicalRecordForm.diagnosis}
                    onChange={(e) =>
                      setMedicalRecordForm((current) => ({
                        ...current,
                        diagnosis: e.target.value,
                      }))
                    }
                    placeholder="Diagnosis"
                  />

                  <FormField
                    label="Treatment Plan"
                    name="treatment_plan"
                    as="textarea"
                    value={medicalRecordForm.treatment_plan}
                    onChange={(e) =>
                      setMedicalRecordForm((current) => ({
                        ...current,
                        treatment_plan: e.target.value,
                      }))
                    }
                    placeholder="Treatment plan"
                  />

                  <FormField
                    label="Doctor Notes"
                    name="doctor_notes"
                    as="textarea"
                    value={medicalRecordForm.doctor_notes}
                    onChange={(e) =>
                      setMedicalRecordForm((current) => ({
                        ...current,
                        doctor_notes: e.target.value,
                      }))
                    }
                    placeholder="Doctor notes"
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" loading={savingMedicalRecord}>
                      Create Medical Record
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={closeMedicalRecordForm}
                      disabled={savingMedicalRecord}
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
            onPageChange={loadAppointments}
          />
        </div>
      )}
    </div>
  );
}