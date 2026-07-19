import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component - Protects routes based on authentication and role
 * @param {Object} props
 * @param {string|string[]} props.allowedRoles - Single role or array of allowed roles
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @returns {React.ReactNode} Protected route content or redirect
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, hasRole, loading, user } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login page, saving the attempted location
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  // Check if user has required role(s)
  if (allowedRoles && !hasRole(allowedRoles)) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized - render the protected content
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
