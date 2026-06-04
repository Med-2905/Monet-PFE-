import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "./pages/public/LandingPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import RoleRoute from "./routes/RoleRoute.jsx";

import AdminAppLayout from "./components/Layout/admin/appLayout.jsx";

import DashboardPage from "./pages/admin/DashboardPage.jsx";
import PatientsPage from "./pages/admin/PatientsPage.jsx";
import DoctorsPage from "./pages/admin/DoctorsPage.jsx";
import AddDoctorPage from "./pages/admin/AddDoctorPage.jsx";
import AddAdminPage from "./pages/admin/AddAdminPage.jsx";
import CitiesPage from "./pages/admin/CitiesPage.jsx";
import SpecialtiesPage from "./pages/admin/SpecialtiesPage.jsx";
import ProfilePage from "./pages/admin/ProfilePage.jsx";
import ReviewsPage from "./pages/admin/ReviewsPage.jsx";
import PatientAppLayout from "./components/Layout/patient/PatientAppLayout.jsx";
import PatientDashboardPage from "./pages/patient/PatientDashboardPage.jsx";
import PatientDoctorsPage from "./pages/patient/PatientDoctorsPage.jsx";
import PatientAppointmentsPage from "./pages/patient/PatientAppointmentsPage.jsx";
import PatientHistoryPage from "./pages/patient/PatientHistoryPage.jsx";
import PatientOrdonnancesPage from "./pages/patient/PatientOrdonnancesPage.jsx";
import PatientProfilePage from "./pages/patient/PatientProfilePage.jsx";


import DoctorAppLayout from "./components/Layout/doctor/DoctorAppLayout.jsx";

import DoctorDashboardPage from "./pages/doctor/DoctorDashboardPage.jsx";
import DoctorAppointmentsPage from "./pages/doctor/DoctorAppointmentsPage.jsx";
import DoctorUnavailableDaysPage from "./pages/doctor/DoctorUnavailableDaysPage.jsx";
import DoctorOrdonnancesPage from "./pages/doctor/DoctorOrdonnancesPage.jsx";
import DoctorReviewPage from "./pages/doctor/DoctorReviewPage.jsx";
import DoctorProfilePage from "./pages/doctor/DoctorProfilePage.jsx";
import DoctorMedicalHistoryPage from "./pages/doctor/DoctorMedicalHistoryPage.jsx";
import DoctorPatientsPage from "./pages/doctor/DoctorPatientsPage.jsx";




function App() {
  return (
    <BrowserRouter>
      <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/admin"
              element={
               <ProtectedRoute allowedRole="admin">
                  <AdminAppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="doctors" element={<DoctorsPage />} />
              <Route path="doctors/create" element={<AddDoctorPage />} />
              <Route path="admins/create" element={<AddAdminPage />} />
              <Route path="cities" element={<CitiesPage />} />
              <Route path="specialties" element={<SpecialtiesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="reviews" element={<ReviewsPage />} />
            </Route>


                          <Route
                path="/patient"
                element={
                  <ProtectedRoute allowedRole="patient">
                    <PatientAppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/patient/dashboard" replace />} />
                <Route path="dashboard" element={<PatientDashboardPage />} />
                <Route path="doctors" element={<PatientDoctorsPage />} />
                <Route path="appointments" element={<PatientAppointmentsPage />} />
                <Route path="history" element={<PatientHistoryPage />} />
                <Route path="ordonnances" element={<PatientOrdonnancesPage />} />
                <Route path="profile" element={<PatientProfilePage />} />
              </Route>


              <Route
                  path="/doctor"
                  element={
                    <ProtectedRoute allowedRole=" doctor">
                      <DoctorAppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/doctor/dashboard" replace />} />
                  <Route path="dashboard" element={<DoctorDashboardPage />} />
                  <Route path="appointments" element={<DoctorAppointmentsPage />} />
                  <Route path="patients" element={<DoctorPatientsPage />} />
                  <Route path="patients/:patientId/history" element={<DoctorMedicalHistoryPage />} />
                  <Route path="unavailable-days" element={<DoctorUnavailableDaysPage />} />
                  <Route path="ordonnances" element={<DoctorOrdonnancesPage />} />
                  <Route path="reviews" element={<DoctorReviewPage />} />
                  <Route path="profile" element={<DoctorProfilePage />} />
                </Route>

            {/* later when doctor pages are ready */}
            {/* 
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRole="doctor">
                  <DoctorLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/doctor/dashboard" replace />} />
              <Route path="dashboard" element={<DoctorDashboardPage />} />
            </Route>
            */}

            {/* later when patient pages are ready */}
            {/* 
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRole="patient">
                  <PatientLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/patient/dashboard" replace />} />
              <Route path="dashboard" element={<PatientDashboardPage />} />
            </Route>
            */}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
    </BrowserRouter>
  );
}

export default App;