import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const PartnerStats = () => {
    const { token } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalScreens: 0,
        approvedMovies: 0,
        totalBookings: 0,
        totalRevenue: '₹0'
    });

    const [period, setPeriod] = useState('all'); 
    const [customStart, setCustomStart] = useState(new Date().toISOString().split('T')[0]);
    const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const moviesRes = await axios.get('http://localhost:5000/api/partner/my-movies', config);
                const screensRes = await axios.get('http://localhost:5000/api/partner/screens', config);

                let statsUrl = `http://localhost:5000/api/partner/stats?period=${period}`;
                if (period === 'custom') {
                    statsUrl += `&startDate=${customStart}&endDate=${customEnd}`;
                }
                const statsRes = await axios.get(statsUrl, config);

                const revenue = statsRes.data.totalRevenue.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0
                });

                setStats({
                    totalScreens: screensRes.data.length,
                    approvedMovies: moviesRes.data.length,
                    totalRevenue: revenue,
                    totalBookings: statsRes.data.totalBookings,
                    screenStats: statsRes.data.screenStats || []
                });

            } catch (err) {
                console.error('Error fetching partner stats:', err);
            }
        };
        fetchStats();
    }, [token, period, customStart, customEnd]);

    return (
        <div className="space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800">Overview</h2>

                <div className="flex items-center gap-2 flex-wrap mt-4 md:mt-0">
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

            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold">Total Screens</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalScreens}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold">Approved Movies</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approvedMovies}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold">Total Bookings</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-semibold">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRevenue || '₹0'}</p>
                </div>
            </div>
        </div>
    );
};

export default PartnerStats;
