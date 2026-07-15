import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import CandidateLayout from './layouts/CandidateLayout';
import RecruiterLayout from './layouts/RecruiterLayout';
import HiringManagerLayout from './layouts/HiringManagerLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Candidate Pages
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import CandidateJobsPage from './pages/candidate/CandidateJobsPage';
import CandidateJobDetailPage from './pages/candidate/CandidateJobDetailPage';
import CandidateApplicationsPage from './pages/candidate/CandidateApplicationsPage';

// Recruiter Pages
import RecruiterDashboardPage from './pages/recruiter/RecruiterDashboardPage';
import RecruiterJobsPage from './pages/recruiter/RecruiterJobsPage';
import RecruiterNewJobPage from './pages/recruiter/RecruiterNewJobPage';
import RecruiterJobApplicantsPage from './pages/recruiter/RecruiterJobApplicantsPage';
import RecruiterCandidatesPage from './pages/recruiter/RecruiterCandidatesPage';

// Hiring Manager Pages
import HiringManagerShortlistPage from './pages/hiring-manager/HiringManagerShortlistPage';
import HiringManagerEvaluationsPage from './pages/hiring-manager/HiringManagerEvaluationsPage';

// Admin Pages
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrganizationsPage from './pages/admin/AdminOrganizationsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Candidate Routes */}
        <Route
          path="/candidate/*"
          element={
            <ProtectedRoute allowedRoles="Candidate">
              <CandidateLayout />
            </ProtectedRoute>
          }
        >
          <Route path="profile" element={<CandidateProfilePage />} />
          <Route path="jobs" element={<CandidateJobsPage />} />
          <Route path="jobs/:id" element={<CandidateJobDetailPage />} />
          <Route path="applications" element={<CandidateApplicationsPage />} />
          <Route index element={<Navigate to="profile" replace />} />
        </Route>

        {/* Recruiter Routes */}
        <Route
          path="/recruiter/*"
          element={
            <ProtectedRoute allowedRoles="Recruiter">
              <RecruiterLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<RecruiterDashboardPage />} />
          <Route path="jobs" element={<RecruiterJobsPage />} />
          <Route path="jobs/new" element={<RecruiterNewJobPage />} />
          <Route path="jobs/:id/applicants" element={<RecruiterJobApplicantsPage />} />
          <Route path="candidates" element={<RecruiterCandidatesPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Hiring Manager Routes */}
        <Route
          path="/hiring-manager/*"
          element={
            <ProtectedRoute allowedRoles="HiringManager">
              <HiringManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="shortlist" element={<HiringManagerShortlistPage />} />
          <Route path="evaluations" element={<HiringManagerEvaluationsPage />} />
          <Route index element={<Navigate to="shortlist" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles="Admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="organizations" element={<AdminOrganizationsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route index element={<Navigate to="users" replace />} />
        </Route>

        {/* Default Route - Redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
