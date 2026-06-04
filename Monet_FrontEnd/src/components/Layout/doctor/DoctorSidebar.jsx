import { NavLink } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  FileText,
  LayoutDashboard,
  Star,
  UserCircle,
  X,
  Users,
} from "lucide-react";

const links = [
  { to: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/doctor/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/doctor/patients", label: "Patients", icon: Users },
  { to: "/doctor/unavailable-days", label: "Unavailable Days", icon: Clock },
  { to: "/doctor/ordonnances", label: "Ordonnances", icon: FileText },
  { to: "/doctor/reviews", label: "Reviews", icon: Star },
  { to: "/doctor/profile", label: "Profile", icon: UserCircle },
];
function DoctorSidebarContent({ onClose }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <div>
          <div className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
            Monet Doctor
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Medical workspace
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  isActive
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                ].join(" ")
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default function DoctorSidebar({ open, onClose }) {
  return (
    <>
      <div
        className={[
          "fixed inset-0 z-40 bg-slate-950/40 transition lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white transition duration-200 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <DoctorSidebarContent onClose={onClose} />
      </aside>
    </>
  );
}