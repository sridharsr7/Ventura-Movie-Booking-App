import { useContext } from 'react';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PartnerDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveTitle = () => {
        const path = location.pathname.split('/').pop();
        if (path === 'dashboard' || path === 'stats') return 'Dashboard';
        return path.charAt(0).toUpperCase() + path.slice(1);
    };


    const handleLogout = () => {
        logout();
        navigate('/partner/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <div className="w-64 bg-teal-900 text-white flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-200 bg-clip-text text-transparent">
                        Partner Panel
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavLink
                        to="/partner/dashboard/stats"
                        className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive || location.pathname === '/partner/dashboard' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-teal-800 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/partner/dashboard/analytics"
                        className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-teal-800 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined">analytics</span>
                        Screen Performance
                    </NavLink>
                    <NavLink
                        to="/partner/dashboard/movies"
                        className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-teal-800 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined">store</span>
                        Movies
                    </NavLink>
                    <NavLink
                        to="/partner/dashboard/screens"
                        className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-teal-800 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined">theaters</span>
                        Screens
                    </NavLink>
                    <NavLink
                        to="/partner/dashboard/report"
                        className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-teal-800 hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined">report</span>
                        Report Issue
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-teal-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-semibold">{user?.name || 'Partner'}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-teal-200 hover:bg-teal-800 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">{getActiveTitle()}</h2>
                </header>

                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PartnerDashboard;
