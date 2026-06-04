import { Outlet } from "react-router-dom";
import { useState } from "react";

import DoctorSidebar from "./DoctorSidebar.jsx";
import DoctorTopbar from "./DoctorTopbar.jsx";

export default function DoctorAppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <DoctorSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-screen lg:pl-72">
        <DoctorTopbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}