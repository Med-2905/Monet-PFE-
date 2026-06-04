import { Outlet } from "react-router-dom";
import { useState } from "react";

import PatientSidebar from "./PatientSidebar.jsx";
import PatientTopbar from "./PatientTopbar.jsx";

export default function PatientAppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <PatientSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-screen lg:pl-72">
        <PatientTopbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}