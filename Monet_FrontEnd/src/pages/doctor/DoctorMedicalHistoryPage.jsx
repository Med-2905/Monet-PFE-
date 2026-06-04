import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { doctorApi } from "../../services/doctor.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Alert from "../../components/ui/Alert.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";

function patientName(rdv) {
  const user = rdv.patient?.user || {};

  return (
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    user.email ||
    "Patient"
  );
}

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.message ||
    Object.values(error.response?.data?.errors || {})
      .flat()
      .join(" ") ||
    fallback
  );
}

export default function DoctorMedicalHistoryPage() {
  const { patientId } = useParams();

  const [history, setHistory] = useState([]);
  const [patientLabel, setPatientLabel] = useState("");
  const [editForm, setEditForm] = useState({
    recordId: null,
    condition: "",
    symptoms: "",
    diagnosis: "",
    treatment_plan: "",
    doctor_notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const response = await doctorApi.getPatientMedicalHistory(patientId);
      const items = response.history || [];

      setHistory(items);

      if (items[0]) {
        setPatientLabel(patientName(items[0]));
      }
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Failed to load patient medical history."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  function openEdit(record) {
    setError("");
    setSuccess("");

    setEditForm({
      recordId: record.id,
      condition: record.condition || "",
      symptoms: record.symptoms || "",
      diagnosis: record.diagnosis || "",
      treatment_plan: record.treatment_plan || "",
      doctor_notes: record.doctor_notes || "",
    });
  }

  function closeEdit() {
    setEditForm({
      recordId: null,
      condition: "",
      symptoms: "",
      diagnosis: "",
      treatment_plan: "",
      doctor_notes: "",
    });
  }

  async function handleUpdate(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await doctorApi.updateMedicalRecord(editForm.recordId, {
        condition: editForm.condition || null,
        symptoms: editForm.symptoms || null,
        diagnosis: editForm.diagnosis || null,
        treatment_plan: editForm.treatment_plan || null,
        doctor_notes: editForm.doctor_notes || null,
      });

      setSuccess("Medical record updated successfully.");
      closeEdit();
      await loadHistory();
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Failed to update medical record."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading medical history..." />;
  }

  return (
    <div>
      <PageHeader
        title="Medical History"
        subtitle={
          patientLabel
            ? `Medical history for ${patientLabel}`
            : `Patient ID: ${patientId}`
        }
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

      {history.length === 0 ? (
        <EmptyState
          title="No medical history"
          description="No appointment history found for this patient."
        />
      ) : (
        <div className="grid gap-4">
          {history.map((rdv) => {
            const record = rdv.medical_record || rdv.medicalRecord;
            const ordonnance = rdv.ordonnance;

            return (
              <div key={rdv.id} className="card p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">
                      Appointment #{rdv.id}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {rdv.rdv_date} at {rdv.rdv_time} · {rdv.status}
                    </p>
                  </div>

                  {record && (
                    <Button variant="secondary" onClick={() => openEdit(record)}>
                      Edit Record
                    </Button>
                  )}
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <h3 className="font-black text-slate-950 dark:text-white">
                      Medical Record
                    </h3>

                    {!record ? (
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        No medical record for this appointment.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3 text-sm">
                        <div>
                          <p className="font-bold">Condition</p>
                          <p className="text-slate-600 dark:text-slate-300">
                            {record.condition || "Not specified"}
                          </p>
                        </div>

                        <div>
                          <p className="font-bold">Symptoms</p>
                          <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                            {record.symptoms || "Not specified"}
                          </p>
                        </div>

                        <div>
                          <p className="font-bold">Diagnosis</p>
                          <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                            {record.diagnosis || "Not specified"}
                          </p>
                        </div>

                        <div>
                          <p className="font-bold">Treatment Plan</p>
                          <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                            {record.treatment_plan || "Not specified"}
                          </p>
                        </div>

                        <div>
                          <p className="font-bold">Doctor Notes</p>
                          <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                            {record.doctor_notes || "No notes"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <h3 className="font-black text-slate-950 dark:text-white">
                      Ordonnance
                    </h3>

                    {!ordonnance ? (
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        No ordonnance for this appointment.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3 text-sm">
                        <div>
                          <p className="font-bold">Diagnosis</p>
                          <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                            {ordonnance.diagnosis || "No diagnosis"}
                          </p>
                        </div>

                        <div>
                          <p className="font-bold">Medications</p>
                          <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                            {ordonnance.medications || "No medications"}
                          </p>
                        </div>

                        {ordonnance.notes && (
                          <div>
                            <p className="font-bold">Notes</p>
                            <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                              {ordonnance.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {editForm.recordId && record?.id === editForm.recordId && (
                  <form
                    onSubmit={handleUpdate}
                    className="mt-5 grid gap-4 border-t border-slate-200 pt-5 dark:border-slate-800"
                  >
                    <FormField
                      label="Condition"
                      name="condition"
                      value={editForm.condition}
                      onChange={(e) =>
                        setEditForm((current) => ({
                          ...current,
                          condition: e.target.value,
                        }))
                      }
                    />

                    <FormField
                      label="Symptoms"
                      name="symptoms"
                      as="textarea"
                      value={editForm.symptoms}
                      onChange={(e) =>
                        setEditForm((current) => ({
                          ...current,
                          symptoms: e.target.value,
                        }))
                      }
                    />

                    <FormField
                      label="Diagnosis"
                      name="diagnosis"
                      as="textarea"
                      value={editForm.diagnosis}
                      onChange={(e) =>
                        setEditForm((current) => ({
                          ...current,
                          diagnosis: e.target.value,
                        }))
                      }
                    />

                    <FormField
                      label="Treatment Plan"
                      name="treatment_plan"
                      as="textarea"
                      value={editForm.treatment_plan}
                      onChange={(e) =>
                        setEditForm((current) => ({
                          ...current,
                          treatment_plan: e.target.value,
                        }))
                      }
                    />

                    <FormField
                      label="Doctor Notes"
                      name="doctor_notes"
                      as="textarea"
                      value={editForm.doctor_notes}
                      onChange={(e) =>
                        setEditForm((current) => ({
                          ...current,
                          doctor_notes: e.target.value,
                        }))
                      }
                    />

                    <div className="flex gap-2">
                      <Button type="submit" loading={saving}>
                        Save Changes
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={closeEdit}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}