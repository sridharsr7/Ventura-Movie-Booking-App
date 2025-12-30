import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const PartnerPerformance = () => {
    const { token } = useContext(AuthContext);
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('All');
    const [period, setPeriod] = useState('today');
    const [sortBy, setSortBy] = useState('revenue');
    const [customStart, setCustomStart] = useState(new Date().toISOString().split('T')[0]);
    const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchPerformance = async () => {
            setLoading(true);
            try {
                let url = `http://localhost:5000/api/admin/performance?period=${period}&sortBy=${sortBy}&city=${selectedCity}`;
                if (period === 'custom') {
                    url += `&startDate=${customStart}&endDate=${customEnd}`;
                }

                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.cities) {
                    setPerformanceData(res.data.data);
                    if (cities.length === 0) {
                        setCities(['All', ...res.data.cities]);
                    }
                } else {
                    setPerformanceData(Array.isArray(res.data) ? res.data : []);
                }

            } catch (err) {
                console.error("Error fetching performance:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformance();
    }, [token, period, sortBy, selectedCity, customStart, customEnd]);


    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Partner Performance</h2>
                    <p className="text-gray-500 text-sm mt-1">Live ranking based on booking revenue</p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">Location:</span>
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2 outline-none shadow-sm cursor-pointer min-w-[120px]"
                        >
                            {cities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">Sort By:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2 outline-none shadow-sm cursor-pointer"
                        >
                            <option value="revenue">Total Revenue</option>
                            <option value="tickets">Total Tickets Sold</option>
                        </select>
                    </div>

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

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {performanceData.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-4 font-semibold text-center w-20">Rank</th>
                                    <th className="px-6 py-4 font-semibold">Partner</th>
                                    <th className="px-6 py-4 font-semibold text-right">Total Tickets</th>
                                    <th className="px-6 py-4 font-semibold text-right">Total Bookings</th>
                                    <th className="px-6 py-4 font-semibold text-right">Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {performanceData.map((partner, index) => (
                                    <tr key={partner._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-gray-200 text-gray-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-gray-50 text-gray-500'
                                                }`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{partner.name}</span>
                                                <span className="text-xs text-gray-400">{partner.location} • {partner.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-mono font-bold ${sortBy === 'tickets' ? 'text-blue-600' : 'text-gray-700'}`}>
                                                {partner.totalTickets || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-mono font-medium text-gray-700">{partner.totalBookings}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-mono font-bold ${sortBy === 'revenue' ? 'text-green-600' : 'text-gray-700'}`}>
                                                {partner.totalRevenue.toLocaleString('en-IN', {
                                                    style: 'currency',
                                                    currency: 'INR',
                                                    maximumFractionDigits: 0
                                                })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            <span className="material-symbols-outlined text-4xl mb-2">sentiment_dissatisfied</span>
                            <p>No performance data found for this period.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PartnerPerformance;
