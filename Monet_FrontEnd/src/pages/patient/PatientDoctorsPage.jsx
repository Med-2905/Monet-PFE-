import { useEffect, useState } from "react";
import { Search, Star } from "lucide-react";

import { patientApi } from "../../services/patientApi.js";

import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Alert from "../../components/ui/Alert.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

function doctorName(doctor) {
  const user = doctor.user || {};

  return (
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    user.username ||
    "Doctor"
  );
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
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

export default function PatientDoctorsPage() {
  const [filters, setFilters] = useState({
    name: "",
    city_id: "",
    specialty_id: "",
  });

  const [cities, setCities] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [doctors, setDoctors] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
  });

  const [reservation, setReservation] = useState({
    doctorId: null,
    rdv_date: "",
    rdv_time: "",
    reason: "",
  });

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadFilters() {
    try {
      setLoadingFilters(true);

      const [citiesRes, specialtiesRes] = await Promise.all([
        patientApi.getCities(),
        patientApi.getSpecialties(),
      ]);

      setCities(citiesRes.cities || []);
      setSpecialties(specialtiesRes.specialties || []);
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Failed to load filters."));
    } finally {
      setLoadingFilters(false);
    }
  }

  async function loadDoctors(page = 1) {
    try {
      setLoadingDoctors(true);
      setError("");

      const response = await patientApi.getDoctors({
        name: filters.name || undefined,
        city_id: filters.city_id || undefined,
        specialty_id: filters.specialty_id || undefined,
        page,
      });

      const paginator = response.doctors;

      setDoctors(paginator?.data || []);
      setMeta({
        current_page: paginator?.current_page || 1,
        last_page: paginator?.last_page || 1,
      });
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Failed to load doctors."));
    } finally {
      setLoadingDoctors(false);
    }
  }

  useEffect(() => {
    loadFilters();
    loadDoctors(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(e) {
    const { name, value } = e.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleReservationChange(e) {
    const { name, value } = e.target;

    setReservation((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openReservationForm(doctorId) {
    setSuccess("");
    setError("");

    setReservation({
      doctorId,
      rdv_date: "",
      rdv_time: "",
      reason: "",
    });
  }

  function closeReservationForm() {
    setReservation({
      doctorId: null,
      rdv_date: "",
      rdv_time: "",
      reason: "",
    });
  }

  async function handleSearch(e) {
    e.preventDefault();
    await loadDoctors(1);
  }

  async function handleReserve(e) {
    e.preventDefault();

    if (!reservation.doctorId) {
      setError("Choose a doctor first.");
      return;
    }

    if (!reservation.rdv_date || !reservation.rdv_time) {
      setError("Date and time are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await patientApi.reserveAppointment(reservation.doctorId, {
        rdv_date: reservation.rdv_date,
        rdv_time: reservation.rdv_time,
        reason: reservation.reason || null,
      });

      setSuccess("Appointment request created successfully.");
      closeReservationForm();
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Failed to reserve appointment."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Find Doctors"
        subtitle="Search doctors by name, city, or specialty and reserve an appointment."
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

      <form onSubmit={handleSearch} className="card mb-6 p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <FormField
            label="Doctor Name"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            placeholder="Search by name"
          />

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              City
            </span>

            <select
              name="city_id"
              value={filters.city_id}
              onChange={handleFilterChange}
              disabled={loadingFilters}
              className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Specialty
            </span>

            <select
              name="specialty_id"
              value={filters.specialty_id}
              onChange={handleFilterChange}
              disabled={loadingFilters}
              className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All specialties</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <Button type="submit" className="w-full">
              <Search size={16} />
              Search
            </Button>
          </div>
        </div>
      </form>

      {loadingDoctors ? (
        <LoadingBlock label="Loading doctors..." />
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No doctors found"
          description="Try changing the filters."
        />
      ) : (
        <div className="grid gap-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="card p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h2 className="text-lg font-black text-slate-950 dark:text-white">
                    Dr. {doctorName(doctor)}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {doctor.specialty?.name || "No specialty"} ·{" "}
                    {doctor.city?.name || "No city"}
                  </p>

                  {doctor.address && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Address: {doctor.address}
                    </p>
                  )}

                  {doctor.bio && (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {doctor.bio}
                    </p>
                  )}

                  <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-300">
                    <Star size={16} />
                    {Number(doctor.reviews_avg_rating || 0).toFixed(1)}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => openReservationForm(doctor.id)}
                >
                  Reserve
                </Button>
              </div>

              {reservation.doctorId === doctor.id && (
                <form
                  onSubmit={handleReserve}
                  className="mt-5 grid gap-4 border-t border-slate-200 pt-5 dark:border-slate-800 md:grid-cols-4"
                >
                  <FormField
                    label="Date"
                    name="rdv_date"
                    type="date"
                    min={getTodayDate()}
                    value={reservation.rdv_date}
                    onChange={handleReservationChange}
                    required
                  />

                  <FormField
                    label="Time"
                    name="rdv_time"
                    type="time"
                    value={reservation.rdv_time}
                    onChange={handleReservationChange}
                    required
                  />

                  <FormField
                    label="Reason"
                    name="reason"
                    value={reservation.reason}
                    onChange={handleReservationChange}
                    placeholder="Reason of appointment"
                  />

                  <div className="flex items-end gap-2">
                    <Button type="submit" loading={saving}>
                      Confirm
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={closeReservationForm}
                      disabled={saving}
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
            onPageChange={loadDoctors}
          />
        </div>
      )}
    </div>
  );
}