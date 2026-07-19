import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users,
  Building2, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useState } from 'react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/organizations', icon: Building2, label: 'Organizations' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>
      {/* Mobile Header */}
      <div className="lg:hidden border-b px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--surface-alt)', borderColor: 'var(--border)' }}>
        <h1 className="text-xl font-bold" style={{ color: 'var(--danger)' }}>TalentSync</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 border-r
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `} style={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="hidden lg:block px-6 py-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>TalentSync</h1>
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Admin Portal</p>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(179, 38, 30, 0.2)' }}>
                  <Shield size={20} style={{ color: 'var(--danger)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--surface-alt)' }}>
                    {user?.fullName}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Administrator</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg
                    transition-colors duration-150 relative
                    ${isActive(item.path)
                      ? ''
                      : ''
                    }
                  `}
                  style={{
                    backgroundColor: isActive(item.path) ? 'rgba(227, 168, 87, 0.1)' : 'transparent',
                    color: isActive(item.path) ? 'var(--accent)' : 'rgba(255, 255, 255, 0.8)',
                    borderLeft: isActive(item.path) ? '3px solid var(--accent)' : '3px solid transparent',
                    paddingLeft: isActive(item.path) ? 'calc(1rem - 3px)' : '1rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <item.icon size={20} className="mr-3" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150"
                style={{ color: 'var(--danger)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(179, 38, 30, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={20} className="mr-3" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 min-h-screen overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
