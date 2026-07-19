/**
 * Examples of how to use the AuthContext in your components
 */

import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

// Example 1: Login Component
export const LoginExample = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      // User is now logged in, AuthContext has updated
      // Navigation will happen automatically or you can use:
      // navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

// Example 2: Register Component
export const RegisterExample = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Candidate',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      // User is now registered and logged in
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        placeholder="Full Name"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
      />
      <select
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
      >
        <option value="Candidate">Candidate</option>
        <option value="Recruiter">Recruiter</option>
        <option value="HiringManager">Hiring Manager</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

// Example 3: User Profile Display
export const UserProfileExample = () => {
  const { user, logout } = useAuth();

  return (
    <div className="user-profile">
      <h2>Welcome, {user?.fullName}!</h2>
      <p>Role: {user?.role}</p>
      <p>User ID: {user?.userId}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// Example 4: Conditional Rendering Based on Role
export const RoleBasedContentExample = () => {
  const { user, hasRole } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      
      {hasRole('Candidate') && (
        <div>
          <h2>Candidate Features</h2>
          <p>Apply for jobs, view applications</p>
        </div>
      )}

      {hasRole('Recruiter') && (
        <div>
          <h2>Recruiter Features</h2>
          <p>Post jobs, review applications</p>
        </div>
      )}

      {hasRole(['Admin', 'HiringManager']) && (
        <div>
          <h2>Management Features</h2>
          <p>Advanced controls</p>
        </div>
      )}
    </div>
  );
};

// Example 5: Navigation with Auth Check
export const NavigationExample = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav>
      {isAuthenticated() ? (
        <>
          <span>Hello, {user?.fullName}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </>
      )}
    </nav>
  );
};

// Example 6: Protected API Call
export const ProtectedAPICallExample = () => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProtectedData = async () => {
    if (!isAuthenticated()) {
      alert('Please login first');
      return;
    }

    setLoading(true);
    try {
      // The API will automatically include the token from localStorage
      const response = await candidateService.getProfile();
      setData(response);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // If 401, user will be automatically logged out by api interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchProtectedData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Protected Data'}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};
