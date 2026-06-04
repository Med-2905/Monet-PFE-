import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Stethoscope, UserPlus, Users } from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import MetricCard from '../../components/ui/MetricCard.jsx';
import LoadingBlock from '../../components/ui/LoadingBlock.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { getErrorMessage } from '../../utils/apiErrors.js';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    admins: 0,
    doctors: 0,
    patients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const { data } = await adminApi.dashboard();

        if (mounted) {
          setStats({
            admins: data.admins ?? 0,
            doctors: data.doctors ?? 0,
            patients: data.patients ?? 0,
          });
        }
      } catch (err) {
        if (mounted) setError(getErrorMessage(err, 'Failed to load dashboard.'));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingBlock label="Loading dashboard..." />;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Quick overview of the platform users." />

      {error && (
        <div className="mb-6">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-3">
        <MetricCard label="Admins" value={stats.admins} icon={ShieldCheck} />
        <MetricCard label="Doctors" value={stats.doctors} icon={Stethoscope} />
        <MetricCard label="Patients" value={stats.patients} icon={Users} />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="text-base font-black text-slate-950 dark:text-white">Add Doctor</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Create a user account and professional doctor profile.
          </p>
          <Link to="/admin/doctors/create" className="mt-5 inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
            Add Doctor
          </Link>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-black text-slate-950 dark:text-white">Add Admin</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Create another administrator account for website management.
          </p>
          <Link to="/admin/admins/create" className="mt-5 inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
            Add Admin
          </Link>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-black text-slate-950 dark:text-white">Manage Patients</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Search patient accounts and delete broken or fake profiles.
          </p>
          <Link to="/admin/patients" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
            <UserPlus size={16} />
            Patients
          </Link>
        </div>
      </section>
    </>
  );
}
