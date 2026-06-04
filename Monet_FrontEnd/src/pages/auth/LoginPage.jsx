import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Alert from "../../components/ui/Alert.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import ThemeToggle from "../../components/ui/ThemeToggle.jsx";

import { useAuth } from "../../context/AuthContext.jsx";

function getDashboardPath(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "doctor") return "/doctor/dashboard";
  if (role === "patient") return "/patient/dashboard";

  return "/";
}

function getErrorMessage(error) {
  const backendErrors = error.response?.data?.errors;

  if (backendErrors) {
    const firstError = Object.values(backendErrors).flat()[0];
    if (firstError) return firstError;
  }

  return (
    error.response?.data?.message ||
    error.message ||
    "Login failed. Check your credentials."
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    login: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    setGlobalError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setGlobalError("");
    setErrors({});

    const payload = {
      login: form.login.trim(),
      password: form.password,
    };

    if (!payload.login || !payload.password) {
      setGlobalError("Username/email and password are required.");
      return;
    }

    try {
      setIsLoading(true);

      const result = await login(payload);

      const user = result?.user || result;
      const redirectTo = result?.redirectTo || getDashboardPath(user?.role);

      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setErrors(error.response?.data?.errors || {});
      setGlobalError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="absolute left-6 top-6">
  <Link
    to="/"
    className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
  >
    ← Back to Home
  </Link>
</div>
      

      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">
            Login to Monet
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Access your healthcare dashboard and manage your appointments
          </p>

          
        </div>

        {globalError && (
          <div className="mb-5">
            <Alert type="error">{globalError}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Username or Email"
            name="login"
            value={form.login}
            onChange={handleChange}
            error={errors.login?.[0]}
            placeholder="Enter your username or email"
            autoComplete="username"
            required
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password?.[0]}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <Button type="submit" loading={isLoading} className="w-full">
            Login
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          New patient?{" "}
          <Link
            to="/register"
            className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-300"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}