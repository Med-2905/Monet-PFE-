import { useEffect, useState } from "react";

import { doctorApi } from "../../services/doctor.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Alert from "../../components/ui/Alert.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.message ||
    Object.values(error.response?.data?.errors || {}).flat().join(" ") ||
    fallback
  );
}

export default function DoctorProfilePage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    city_id: "",
    specialty_id: "",
    address: "",
    license_number: "",
    bio: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [cities, setCities] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadFilters() {
    const [citiesRes, specialtiesRes] = await Promise.all([
      doctorApi.getCities(),
      doctorApi.getSpecialties(),
    ]);

    setCities(citiesRes.cities || []);
    setSpecialties(specialtiesRes.specialties || []);
  }

  async function loadProfile() {
    const response = await doctorApi.me();

    const doctor = response.doctor;
    const user = doctor.user || {};

    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      city_id: doctor.city_id || doctor.city?.id || "",
      specialty_id: doctor.specialty_id || doctor.specialty?.id || "",
      address: doctor.address || "",
      license_number: doctor.license_number || "",
      bio: doctor.bio || "",
    });
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError("");

        await Promise.all([loadFilters(), loadProfile()]);
      } catch (error) {
        console.error(error);
        setError(getErrorMessage(error, "Failed to load doctor profile."));
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: null,
    }));

    setError("");
    setSuccess("");
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));

    setPasswordErrors((current) => ({
      ...current,
      [name]: null,
    }));

    setError("");
    setSuccess("");
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");
      setErrors({});

      await doctorApi.updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        email: form.email,
        phone: form.phone || null,
        city_id: form.city_id || null,
        specialty_id: form.specialty_id || null,
        address: form.address || null,
        license_number: form.license_number || null,
        bio: form.bio || null,
      });

      setSuccess("Profile updated successfully.");
      await loadProfile();
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data?.errors || {});
      setError(getErrorMessage(error, "Failed to update profile."));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();

    try {
      setSavingPassword(true);
      setError("");
      setSuccess("");
      setPasswordErrors({});

      await doctorApi.updatePassword(passwordForm);

      setSuccess("Password updated successfully.");
      setPasswordForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    } catch (error) {
      console.error(error);
      setPasswordErrors(error.response?.data?.errors || {});
      setError(getErrorMessage(error, "Failed to update password."));
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading doctor profile..." />;
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Manage your doctor account, specialty, city, and password."
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

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleUpdateProfile} className="card p-5">
          <h2 className="mb-5 text-lg font-black text-slate-950 dark:text-white">
            Doctor Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="First Name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              error={errors.first_name?.[0]}
            />

            <FormField
              label="Last Name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              error={errors.last_name?.[0]}
            />

            <FormField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              error={errors.username?.[0]}
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email?.[0]}
            />

            <FormField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone?.[0]}
            />

            <FormField
              label="License Number"
              name="license_number"
              value={form.license_number}
              onChange={handleChange}
              error={errors.license_number?.[0]}
            />

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                City
              </span>

              <select
                name="city_id"
                value={form.city_id}
                onChange={handleChange}
                className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="">Select city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>

              {errors.city_id?.[0] && (
                <span className="mt-1.5 block text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.city_id[0]}
                </span>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Specialty
              </span>

              <select
                name="specialty_id"
                value={form.specialty_id}
                onChange={handleChange}
                className="focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="">Select specialty</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>

              {errors.specialty_id?.[0] && (
                <span className="mt-1.5 block text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.specialty_id[0]}
                </span>
              )}
            </label>

            <div className="md:col-span-2">
              <FormField
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                error={errors.address?.[0]}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                label="Bio"
                name="bio"
                as="textarea"
                value={form.bio}
                onChange={handleChange}
                error={errors.bio?.[0]}
              />
            </div>
          </div>

          <div className="mt-5">
            <Button type="submit" loading={savingProfile}>
              Save Profile
            </Button>
          </div>
        </form>

        <form onSubmit={handleUpdatePassword} className="card p-5">
          <h2 className="mb-5 text-lg font-black text-slate-950 dark:text-white">
            Change Password
          </h2>

          <div className="space-y-4">
            <FormField
              label="Current Password"
              name="current_password"
              type="password"
              value={passwordForm.current_password}
              onChange={handlePasswordChange}
              error={passwordErrors.current_password?.[0]}
              required
            />

            <FormField
              label="New Password"
              name="password"
              type="password"
              value={passwordForm.password}
              onChange={handlePasswordChange}
              error={passwordErrors.password?.[0]}
              required
            />

            <FormField
              label="Confirm New Password"
              name="password_confirmation"
              type="password"
              value={passwordForm.password_confirmation}
              onChange={handlePasswordChange}
              error={passwordErrors.password_confirmation?.[0]}
              required
            />

            <Button type="submit" loading={savingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}