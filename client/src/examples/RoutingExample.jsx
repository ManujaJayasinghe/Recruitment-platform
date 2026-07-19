/**
 * Example of how to use ProtectedRoute with React Router
 * This file shows the routing setup pattern - not to be imported directly
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import UnauthorizedPage from '../pages/UnauthorizedPage';

// Example page components (you'll create these)
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import CandidateDashboard from '../pages/CandidateDashboard';
import RecruiterDashboard from '../pages/RecruiterDashboard';
import HiringManagerDashboard from '../pages/HiringManagerDashboard';
import AdminDashboard from '../pages/AdminDashboard';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Public Home */}
        <Route path="/" element={<HomePage />} />

        {/* Protected Route - Candidate Only */}
        <Route
          path="/candidate/*"
          element={
            <ProtectedRoute allowedRoles="Candidate">
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Route - Recruiter Only */}
        <Route
          path="/recruiter/*"
          element={
            <ProtectedRoute allowedRoles="Recruiter">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Route - Hiring Manager Only */}
        <Route
          path="/hiring-manager/*"
          element={
            <ProtectedRoute allowedRoles="HiringManager">
              <HiringManagerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Route - Admin Only */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Route - Multiple Roles */}
        <Route
          path="/messages/*"
          element={
            <ProtectedRoute allowedRoles={['Candidate', 'Recruiter', 'HiringManager']}>
              <MessagingPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Route - Any Authenticated User */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['Candidate', 'Recruiter', 'HiringManager', 'Admin']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
