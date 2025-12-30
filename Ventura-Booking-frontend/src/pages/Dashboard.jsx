import { useContext } from 'react';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTitle = () => {
    if (location.pathname.includes('/add-movies')) return 'Movies Management';
    if (location.pathname.includes('/partners')) return 'Partner Management';
    if (location.pathname.includes('/analytics')) return 'Analytics Overview';
    if (location.pathname.includes('/performance')) return 'Partner Performance';
    if (location.pathname.includes('/reports')) return 'User Reports';
    if (location.pathname.includes('/partner-reports')) return 'Partner Reports';
    return 'Dashboard Overview';
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavLink
            to="/admin/dashboard/stats"
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive || location.pathname === '/admin/dashboard' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/dashboard/add-movies"
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <span className="material-symbols-outlined">movie</span>
            Add Movies/Manage
          </NavLink>

          <NavLink
            to="/admin/dashboard/partners"
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <span className="material-symbols-outlined">storefront</span>
            Partners
          </NavLink>

          <NavLink
            to="/admin/dashboard/analytics"
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <span className="material-symbols-outlined">analytics</span>
            Partner Activity
          </NavLink>

          <NavLink
            to="/admin/dashboard/performance"
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <span className="material-symbols-outlined">leaderboard</span>
            Partner Performance
          </NavLink>
          <NavLink
            to="/admin/dashboard/reports"
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <span className="material-symbols-outlined">report_problem</span>
            User Reports
          </NavLink>

          <NavLink
            to="/admin/dashboard/partner-reports"
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <span className="material-symbols-outlined">assignment_ind</span>
            Partner Reports
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 capitalize">{getActiveTitle()}</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
