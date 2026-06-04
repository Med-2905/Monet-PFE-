import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { getErrorMessage } from '../../utils/apiErrors.js';

const initialForm = {
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: '',
  city_id: '',
  specialty_id: '',
  address: '',
  license_number: '',
  bio: '',
};

export default function AddDoctorPage() {
  const [form, setForm] = useState(initialForm);
  const [cities, setCities] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      setError('');

      try {
        const [citiesResponse, specialtiesResponse] = await Promise.all([
          adminApi.getCities(),
          adminApi.getSpecialties(),
        ]);

        setCities(citiesResponse.data.cities || []);
        setSpecialties(specialtiesResponse.data.specialties || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load cities and specialties.'));
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setSuccess('');
    setError('');

    try {
      await adminApi.createDoctor({
        ...form,
        city_id: Number(form.city_id),
        specialty_id: Number(form.specialty_id),
      });

      setSuccess('Doctor created successfully.');
      setForm(initialForm);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create doctor.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Add Doctor"
        subtitle="Create a doctor account and assign city and specialty."
      />

      <form onSubmit={handleSubmit} className="card space-y-8 p-6">
        {success && <Alert type="success">{success}</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <section>
          <h2 className="mb-4 text-lg font-bold">Personal information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="First name"
              name="first_name"
              value={form.first_name}
              onChange={updateField}
              required
            />

            <Input
              label="Last name"
              name="last_name"
              value={form.last_name}
              onChange={updateField}
              required
            />

            <Input
              label="Username"
              name="username"
              value={form.username}
              onChange={updateField}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
            />

            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={updateField}
            />

            <Input
              label="License number"
              name="license_number"
              value={form.license_number}
              onChange={updateField}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              required
            />

            <Input
              label="Confirm password"
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={updateField}
              required
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Professional information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="City"
              name="city_id"
              value={form.city_id}
              onChange={updateField}
              required
              disabled={loadingOptions}
            >
              <option value="">
                {loadingOptions ? 'Loading cities...' : 'Choose city'}
              </option>

              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>

            <Select
              label="Specialty"
              name="specialty_id"
              value={form.specialty_id}
              onChange={updateField}
              required
              disabled={loadingOptions}
            >
              <option value="">
                {loadingOptions ? 'Loading specialties...' : 'Choose specialty'}
              </option>

              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </Select>

            <div className="md:col-span-2">
              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={updateField}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">
                Bio
              </label>

              <textarea
                name="bio"
                value={form.bio}
                onChange={updateField}
                rows={4}
                className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting || loadingOptions}>
            {submitting ? 'Creating...' : 'Create doctor'}
          </Button>
        </div>
      </form>
    </>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>

      <input
        {...props}
        className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>

      <select
        {...props}
        className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {children}
      </select>
    </div>
  );
}