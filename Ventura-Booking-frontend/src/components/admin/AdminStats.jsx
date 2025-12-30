import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const AdminStats = () => {
    const { token } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalMovies: 0,
        totalApproved: 0,
        totalUpcoming: 0,
        totalPartners: 0,
        totalBookings: 0,
        totalRevenue: '₹0',
        totalRevenueChange: '',
        userPending: 0,
        userResolved: 0,
        partnerPending: 0,
        partnerResolved: 0
    });
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(localStorage.getItem('adminSelectedCity') || 'All');

    const [period, setPeriod] = useState('all');
    const [customStart, setCustomStart] = useState(new Date().toISOString().split('T')[0]);
    const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        localStorage.setItem('adminSelectedCity', selectedCity);
        const fetchStats = async () => {
            try {
                let url = `/api/admin/stats?city=${selectedCity}&period=${period}`;
                if (period === 'custom') {
                    url += `&startDate=${customStart}&endDate=${customEnd}`;
                }

                const statsRes = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = statsRes.data;

                const revenue = data.totalRevenue.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0
                });

                setStats({
                    totalMovies: data.totalMovies,
                    totalApproved: data.totalApproved,
                    totalUpcoming: data.totalUpcoming,
                    totalPartners: data.totalPartners,
                    totalBookings: data.totalBookings,
                    totalRevenue: revenue,
                    totalRevenueChange: '',
                    userPending: data.userPending || 0,
                    userResolved: data.userResolved || 0,
                    partnerPending: data.partnerPending || 0,
                    partnerResolved: data.partnerResolved || 0
                });

                if (cities.length === 0 && data.cities) {
                    setCities(['All', ...data.cities]);
                }

            } catch (err) {
                console.error(err);
            }
        };

        fetchStats();

        const interval = setInterval(fetchStats, 5000);

        return () => clearInterval(interval);
    }, [token, selectedCity, period, customStart, customEnd]);

    return (
        <div>

            <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Overview</h2>
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none shadow-sm"
                    >
                        {cities.map((city, index) => (
                            <option key={index} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {['today', 'week', 'month', 'all', 'custom'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${period === p ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {period === 'custom' && (
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200 animate-fade-in">
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-1.5 outline-none"
                            />
                            <span className="text-gray-400 font-medium">to</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-1.5 outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRevenue}</p>
                    <span className="text-xs text-gray-400 mt-1 block">{selectedCity === 'All' ? 'All Locations' : selectedCity}</span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold">Approved Movies</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalApproved}</p>
                    <span className="text-green-500 text-sm font-medium">Running Now</span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold">Upcoming Movies</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUpcoming}</p>
                    <span className="text-blue-500 text-sm font-medium">Coming Soon</span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold">Partners</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPartners}</p>
                    <span className="text-gray-400 text-sm font-medium">Across Different Locations</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold">Total Bookings</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
                    <span className="text-green-500 text-sm font-medium">{stats.totalBookings}</span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-2 -mt-2"></div>
                    <h3 className="text-gray-500 text-sm font-semibold relative z-10">User Reports</h3>
                    <div className="flex gap-4 mt-2">
                        <div>
                            <p className="text-2xl font-bold text-red-600">{stats.userPending}</p>
                            <span className="text-xs text-gray-400">Pending</span>
                        </div>
                        <div className="w-[1px] bg-gray-200"></div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{stats.userResolved}</p>
                            <span className="text-xs text-gray-400">Resolved</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-2 -mt-2"></div>
                    <h3 className="text-gray-500 text-sm font-semibold relative z-10">Partner Reports</h3>
                    <div className="flex gap-4 mt-2">
                        <div>
                            <p className="text-2xl font-bold text-red-600">{stats.partnerPending}</p>
                            <span className="text-xs text-gray-400">Pending</span>
                        </div>
                        <div className="w-[1px] bg-gray-200"></div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{stats.partnerResolved}</p>
                            <span className="text-xs text-gray-400">Resolved</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminStats;
