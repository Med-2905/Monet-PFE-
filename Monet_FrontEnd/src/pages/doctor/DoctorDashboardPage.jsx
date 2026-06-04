import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle, Clock, Star, FileText } from "lucide-react";

import { doctorApi } from "../../services/doctor.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import MetricCard from "../../components/ui/MetricCard.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";
import Alert from "../../components/ui/Alert.jsx";

export default function DoctorDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const response = await doctorApi.dashboard();
        setData(response);
      } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <LoadingBlock label="Loading doctor dashboard..." />;

  return (
    <div>
      <PageHeader
        title="Doctor Dashboard"
        subtitle="Overview of your appointments, reviews, and prescriptions."
      />

      {error && (
        <div className="mb-5">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Appointments" value={data?.appointments?.total} icon={CalendarDays} />
        <MetricCard label="Pending" value={data?.appointments?.pending} icon={Clock} />
        <MetricCard label="Confirmed" value={data?.appointments?.confirmed} icon={CheckCircle} />
        <MetricCard label="Completed" value={data?.appointments?.completed} icon={CheckCircle} />
        <MetricCard label="Ordonnances" value={data?.ordonnances?.total} icon={FileText} />
        <MetricCard label="Average Rating" value={data?.reviews?.average_rating ?? 0} icon={Star} />
      </div>
    </div>
  );
}