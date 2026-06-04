import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import LoadingBlock from '../../components/ui/LoadingBlock.jsx';
import Alert from '../../components/ui/Alert.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { fullName } from '../../utils/format.js';
import { getErrorMessage } from '../../utils/apiErrors.js';

function normalizePaginatedResponse(data) {
  if (Array.isArray(data)) {
    return {
      items: data,
      currentPage: 1,
      lastPage: 1,
    };
  }

  const items =
    Array.isArray(data?.data) ? data.data :
    Array.isArray(data?.doctors) ? data.doctors :
    Array.isArray(data?.doctors?.data) ? data.doctors.data :
    Array.isArray(data?.users) ? data.users :
    Array.isArray(data?.users?.data) ? data.users.data :
    [];

  return {
    items,
    currentPage:
      data?.current_page ||
      data?.doctors?.current_page ||
      data?.users?.current_page ||
      data?.meta?.current_page ||
      1,
    lastPage:
      data?.last_page ||
      data?.doctors?.last_page ||
      data?.users?.last_page ||
      data?.meta?.last_page ||
      1,
  };
}

function doctorUser(doctor) {
  return doctor.user || doctor;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    city: '',
    specialty: '',
  });
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const params = useMemo(
    () => ({
      name: filters.name || undefined,
      city: filters.city || undefined,
      specialty: filters.specialty || undefined,
      page,
    }),
    [filters, page],
  );

  useEffect(() => {
    let mounted = true;

    async function loadDoctors() {
      setLoading(true);
      setError('');

      try {
        const { data } = await adminApi.doctors(params);
        const normalized = normalizePaginatedResponse(data);

        if (mounted) {
          setDoctors(normalized.items);
          setLastPage(normalized.lastPage);
        }
      } catch (err) {
        if (mounted) setError(getErrorMessage(err, 'Failed to load doctors.'));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    const timeout = setTimeout(loadDoctors, 250);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [params]);

  function updateFilter(event) {
    setPage(1);
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <>
      <PageHeader
        title="Doctors"
        subtitle="Search doctors by name, city, or specialty."
        action={
          <Link
            to="/admin/doctors/create"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
          >
            <Plus size={16} />
            Add Doctor
          </Link>
        }
      />

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="name"
            value={filters.name}
            onChange={updateFilter}
            placeholder="Name"
            className="focus-ring w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <input
          name="city"
          value={filters.city}
          onChange={updateFilter}
          placeholder="City"
          className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />

        <input
          name="specialty"
          value={filters.specialty}
          onChange={updateFilter}
          placeholder="Specialty"
          className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {error && (
        <div className="mb-5">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading doctors..." />
      ) : doctors.length === 0 ? (
        <EmptyState title="No doctors found" description="Try different filters." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/60">
                <tr>
                  <th className="table-th">Doctor name</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Phone</th>
                  <th className="table-th">City</th>
                  <th className="table-th">Specialty</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {doctors.map((doctor) => {
                  const user = doctorUser(doctor);

                  return (
                    <tr key={doctor.id || user.id}>
                      <td className="table-td font-semibold">{fullName(user)}</td>
                      <td className="table-td">{user.email || '-'}</td>
                      <td className="table-td">{user.phone || doctor.phone || '-'}</td>
                      <td className="table-td">{doctor.city?.name || doctor.city_name || '-'}</td>
                      <td className="table-td">{doctor.specialty?.name || doctor.specialty_name || '-'}</td>
                      <td className="table-td">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          View later
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
            <Pagination currentPage={page} lastPage={lastPage} onPageChange={setPage} />
          </div>
        </div>
      )}
    </>
  );
}
