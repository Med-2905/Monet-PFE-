import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

import { doctorApi } from "../../services/doctor.js";

import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Alert from "../../components/ui/Alert.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

function patientName(patient) {
  const user = patient.user || {};

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

export default function DoctorPatientsPage() {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPatients(page = 1) {
    try {
      setLoading(true);
      setError("");

      const response = await doctorApi.getPatients({
        search: search || undefined,
        page,
      });

      const paginator = response.patients;

      setPatients(paginator?.data || []);
      setMeta({
        current_page: paginator?.current_page || 1,
        last_page: paginator?.last_page || 1,
      });
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Failed to load patients."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadPatients(1);
  }

  return (
    <div>
      <PageHeader
        title="My Patients"
        subtitle="Patients who have appointments with you."
      />

      {error && (
        <div className="mb-5">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSearchSubmit} className="card mb-6 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <FormField
              label="Search"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone"
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" className="w-full">
              <Search size={16} />
              Search
            </Button>
          </div>
        </div>
      </form>

      {loading ? (
        <LoadingBlock label="Loading patients..." />
      ) : patients.length === 0 ? (
        <EmptyState
          title="No patients"
          description="You do not have patients yet."
        />
      ) : (
        <div className="grid gap-4">
          {patients.map((patient) => (
            <div key={patient.id} className="card p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-950 dark:text-white">
                    {patientName(patient)}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {patient.user?.email || "No email"} ·{" "}
                    {patient.user?.phone || "No phone"}
                  </p>

                  {patient.address && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Address: {patient.address}
                    </p>
                  )}
                </div>

                <Link
                  to={`/doctor/patients/${patient.id}/history`}
                  className="focus-ring inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Medical History
                </Link>
              </div>
            </div>
          ))}

          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={loadPatients}
          />
        </div>
      )}
    </div>
  );
}