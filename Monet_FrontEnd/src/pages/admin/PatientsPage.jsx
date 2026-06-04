import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import LoadingBlock from '../../components/ui/LoadingBlock.jsx';
import Alert from '../../components/ui/Alert.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { formatDate, fullName } from '../../utils/format.js';
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
    Array.isArray(data?.patients) ? data.patients :
    Array.isArray(data?.patients?.data) ? data.patients.data :
    Array.isArray(data?.users) ? data.users :
    Array.isArray(data?.users?.data) ? data.users.data :
    [];

  return {
    items,
    currentPage:
      data?.current_page ||
      data?.patients?.current_page ||
      data?.users?.current_page ||
      data?.meta?.current_page ||
      1,
    lastPage:
      data?.last_page ||
      data?.patients?.last_page ||
      data?.users?.last_page ||
      data?.meta?.last_page ||
      1,
  };
}

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const queryParams = useMemo(() => ({ name: search || undefined, page }), [search, page]);

  useEffect(() => {
    let mounted = true;

    async function loadPatients() {
      setLoading(true);
      setError('');

      try {
        const { data } = await adminApi.patients(queryParams);
        const normalized = normalizePaginatedResponse(data);

        if (mounted) {
          setPatients(normalized.items);
          setLastPage(normalized.lastPage);
        }
      } catch (err) {
        if (mounted) setError(getErrorMessage(err, 'Failed to load patients.'));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    const timeout = setTimeout(loadPatients, 250);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [queryParams]);

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await adminApi.deletePatient(deleteTarget.id);
      setPatients((current) => current.filter((patient) => patient.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete patient.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader title="Patients" subtitle="Search, view, and delete patient accounts." />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search by name"
            className="focus-ring w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {error && (
        <div className="mb-5">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading patients..." />
      ) : patients.length === 0 ? (
        <EmptyState title="No patients found" description="Try a different search keyword." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/60">
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">Username</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Phone</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Created</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="table-td font-semibold">{fullName(patient)}</td>
                    <td className="table-td">{patient.username || '-'}</td>
                    <td className="table-td">{patient.email || '-'}</td>
                    <td className="table-td">{patient.phone || '-'}</td>
                    <td className="table-td">{patient.role || 'patient'}</td>
                    <td className="table-td">{formatDate(patient.created_at)}</td>
                    <td className="table-td">
                      <Button variant="danger" onClick={() => setDeleteTarget(patient)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
            <Pagination currentPage={page} lastPage={lastPage} onPageChange={setPage} />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete patient"
        message={`Delete ${deleteTarget ? fullName(deleteTarget) : 'this patient'}? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
