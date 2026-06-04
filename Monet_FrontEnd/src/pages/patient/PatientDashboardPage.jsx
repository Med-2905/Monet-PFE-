import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, FileText, Search } from "lucide-react";

import { patientApi } from "../../services/patientApi.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import MetricCard from "../../components/ui/MetricCard.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";
import Alert from "../../components/ui/Alert.jsx";

export default function PatientDashboardPage() {
  const [stats, setStats] = useState({
    appointments: 0,
    ordonnances: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [appointmentsRes, ordonnancesRes] = await Promise.all([
          patientApi.getAppointments(),
          patientApi.getOrdonnances(),
        ]);

        setStats({
          appointments: appointmentsRes.appointments?.total ?? appointmentsRes.appointments?.data?.length ?? 0,
          ordonnances: ordonnancesRes.Ordonnances?.total ?? ordonnancesRes.Ordonnances?.data?.length ?? 0,
        });
      } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <LoadingBlock label="Loading patient dashboard..." />;

  return (
    <div>
      <PageHeader
        title="Patient Dashboard"
        subtitle="Overview of your appointments and prescriptions."
      />

      {error && (
        <div className="mb-5">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Appointments" value={stats.appointments} icon={CalendarDays} />
        <MetricCard label="Ordonnances" value={stats.ordonnances} icon={FileText} />
        <Link to="/patient/doctors" className="block">
            <MetricCard label="Find Doctors" value="Search" icon={Search} />
        </Link>
      </div>
    </div>
  );
}