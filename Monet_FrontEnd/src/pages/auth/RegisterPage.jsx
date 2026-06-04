import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Alert from "../../components/ui/Alert.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import ThemeToggle from "../../components/ui/ThemeToggle.jsx";

import { useAuth } from "../../context/AuthContext.jsx";

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    Object.values(error.response?.data?.errors || {})
      .flat()
      .join(" ") ||
    error.message ||
    "Register failed."
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  async function handleSubmit(e) {
    e.preventDefault();

    setGlobalError("");
    setSuccess("");
    setErrors({});

    if (form.password !== form.password_confirmation) {
      setErrors({
        password_confirmation: ["Passwords do not match."],
      });
      return;
    }

    try {
      setIsLoading(true);

      await register(form);

      setSuccess("Account created successfully. You can login now.");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 800);
    } catch (error) {
      console.error(error);

      setErrors(error.response?.data?.errors || {});
      setGlobalError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">
            Patient Register
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Create a patient account. Doctors are created by admin.
          </p>
        </div>

        {globalError && (
          <div className="mb-5">
            <Alert type="error">{globalError}</Alert>
          </div>
        )}

        {success && (
          <div className="mb-5">
            <Alert type="success">{success}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <FormField
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            error={errors.first_name?.[0]}
            required
          />

          <FormField
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            error={errors.last_name?.[0]}
            required
          />

          <FormField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            error={errors.username?.[0]}
            required
          />

          <FormField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone?.[0]}
          />

          <div className="md:col-span-2">
            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email?.[0]}
              required
            />
          </div>

          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password?.[0]}
            required
          />

          <FormField
            label="Confirm Password"
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={handleChange}
            error={errors.password_confirmation?.[0]}
            required
          />

          <div className="md:col-span-2">
            <Button type="submit" loading={isLoading} className="w-full">
              Create Account
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-300"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}