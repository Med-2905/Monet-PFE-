import { useEffect, useState } from "react";

import { patientApi } from "../../services/patientApi.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Alert from "../../components/ui/Alert.jsx";
import LoadingBlock from "../../components/ui/LoadingBlock.jsx";

export default function PatientProfilePage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    date_of_birth: "",
    gender: "",
    emergency_contact: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProfile() {
    try {
      setLoading(true);

      const patient = await patientApi.profile();
      const user = patient.user || {};

      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        address: patient.address || "",
        date_of_birth: patient.date_of_birth || "",
        gender: patient.gender || "",
        emergency_contact: patient.emergency_contact || "",
      });
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function handleChange(e) {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));

    setErrors((current) => ({
      ...current,
      [e.target.name]: null,
    }));
  }

  function handlePasswordChange(e) {
    setPasswordForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));

    setPasswordErrors((current) => ({
      ...current,
      [e.target.name]: null,
    }));
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");
      setErrors({});

      await patientApi.updateProfile(form);

      setSuccess("Profile updated successfully.");
      await loadProfile();
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data?.errors || {});
      setError(
        error.response?.data?.message ||
          Object.values(error.response?.data?.errors || {}).flat().join(" ") ||
          "Failed to update profile."
      );
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

      await patientApi.updatePassword(passwordForm);

      setSuccess("Password updated successfully.");
      setPasswordForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    } catch (error) {
      console.error(error);
      setPasswordErrors(error.response?.data?.errors || {});
      setError(
        error.response?.data?.message ||
          Object.values(error.response?.data?.errors || {}).flat().join(" ") ||
          "Failed to update password."
      );
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) return <LoadingBlock label="Loading profile..." />;

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account and patient information." />

      {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}
      {success && <div className="mb-5"><Alert type="success">{success}</Alert></div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleUpdateProfile} className="card p-5">
          <h2 className="mb-5 text-lg font-black text-slate-950 dark:text-white">
            Personal Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} error={errors.first_name?.[0]} />
            <FormField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} error={errors.last_name?.[0]} />
            <FormField label="Username" name="username" value={form.username} onChange={handleChange} error={errors.username?.[0]} />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email?.[0]} />
            <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} error={errors.phone?.[0]} />
            <FormField label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} error={errors.date_of_birth?.[0]} />
            <FormField label="Gender" name="gender" value={form.gender} onChange={handleChange} error={errors.gender?.[0]} />
            <FormField label="Emergency Contact" name="emergency_contact" value={form.emergency_contact} onChange={handleChange} error={errors.emergency_contact?.[0]} />

            <div className="md:col-span-2">
              <FormField label="Address" name="address" value={form.address} onChange={handleChange} error={errors.address?.[0]} />
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