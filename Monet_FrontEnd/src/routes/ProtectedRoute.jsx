import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ allowedRole, children }) {
  const { user, isAuthenticated, isCheckingAuth } = useAuth();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        <p className="font-bold">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return children;
}

function getDashboardPath(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "doctor") return "/doctor/dashboard";
  if (role === "patient") return "/patient/dashboard";

  return "/";
}