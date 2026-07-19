import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = authService.getCurrentUser();

        if (storedToken && storedUser) {
          // Check if token is expired
          if (storedUser.expiresAt) {
            const expiryDate = new Date(storedUser.expiresAt);
            if (expiryDate < new Date()) {
              // Token expired, clear everything
              logout();
              return;
            }
          }

          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise} Login response
   */
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      setToken(response.token);
      setUser({
        userId: response.userId,
        fullName: response.fullName,
        role: response.role,
        expiresAt: response.expiresAt,
      });

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Register new user
   * @param {Object} data - Registration data
   * @returns {Promise} Registration response
   */
  const register = async (data) => {
    try {
      const response = await authService.register(data);
      
      setToken(response.token);
      setUser({
        userId: response.userId,
        fullName: response.fullName,
        role: response.role,
        expiresAt: response.expiresAt,
      });

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  const isAuthenticated = () => {
    if (!token || !user) {
      return false;
    }

    // Check token expiration
    if (user.expiresAt) {
      const expiryDate = new Date(user.expiresAt);
      if (expiryDate < new Date()) {
        logout();
        return false;
      }
    }

    return true;
  };

  /**
   * Check if user has a specific role
   * @param {string|string[]} allowedRoles - Role or array of roles
   * @returns {boolean} True if user has one of the allowed roles
   */
  const hasRole = (allowedRoles) => {
    if (!user || !user.role) {
      return false;
    }

    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }

    return user.role === allowedRoles;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
