import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';
import AdminWalkinBookingPage from './pages/AdminWalkinBookingPage';
import AIChatbotPage from './pages/AIChatbotPage';
import AdminHospitalsPage from './pages/AdminHospitalsPage';
import AdminDoctorsPage from './pages/AdminDoctorsPage';
import AdminPatientsPage from './pages/AdminPatientsPage';
import PatientHospitalsPage from './pages/PatientHospitalsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />
          <Route path="/dashboard/book" element={
            <PrivateRoute><BookAppointmentPage /></PrivateRoute>
          } />
          <Route path="/dashboard/appointments" element={
            <PrivateRoute><MyAppointmentsPage /></PrivateRoute>
          } />
          <Route path="/dashboard/hospitals" element={
            <PrivateRoute><PatientHospitalsPage /></PrivateRoute>
          } />
          <Route path="/dashboard/chatbot" element={
            <PrivateRoute><AIChatbotPage /></PrivateRoute>
          } />
          <Route path="/dashboard/admin/appointments" element={
            <PrivateRoute role="admin"><AdminAppointmentsPage /></PrivateRoute>
          } />
          <Route path="/dashboard/admin/walkin" element={
            <PrivateRoute role="admin"><AdminWalkinBookingPage /></PrivateRoute>
          } />
          <Route path="/dashboard/admin/hospitals" element={
            <PrivateRoute role="admin"><AdminHospitalsPage /></PrivateRoute>
          } />
          <Route path="/dashboard/admin/doctors" element={
            <PrivateRoute role="admin"><AdminDoctorsPage /></PrivateRoute>
          } />
          <Route path="/dashboard/admin/patients" element={
            <PrivateRoute role="admin"><AdminPatientsPage /></PrivateRoute>
          } />

          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
