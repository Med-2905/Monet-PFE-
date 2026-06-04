import { LogOut, Menu, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../../hooks/useAuth.js";
import ThemeToggle from "../../ui/ThemeToggle.jsx";
import { fullName } from "../../../utils/format.js";

export default function PatientTopbar({ onOpenSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="hidden sm:block">
          <p className="text-sm font-bold text-slate-950 dark:text-white">
            Patient Space
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Find doctors, manage appointments, prescriptions, and profile.
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-800 md:flex">
            <UserCircle size={18} className="text-slate-500" />
            <span className="max-w-40 truncate text-sm font-semibold">
              {fullName(user)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}