import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const UserReports = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('userReports_activeTab') || 'new');
    const [dateFilter, setDateFilter] = useState(() => localStorage.getItem('userReports_dateFilter') || 'all');
    const [customDate, setCustomDate] = useState(() => JSON.parse(localStorage.getItem('userReports_customDate')) || { start: '', end: '' });

    useEffect(() => {
        localStorage.setItem('userReports_activeTab', activeTab);
        localStorage.setItem('userReports_dateFilter', dateFilter);
        localStorage.setItem('userReports_customDate', JSON.stringify(customDate));
    }, [activeTab, dateFilter, customDate]);

    useEffect(() => {
        fetchReports();
    }, [token]);

    const fetchReports = async () => {
        try {
            const res = await axios.get('/api/admin/reports', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching reports:", err);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axios.put(`/api/admin/reports/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchReports();
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status");
        }
    };

    const markAsViewed = (report) => {
        if (report.status === 'new') {
            handleStatusUpdate(report._id, 'viewed');
        }
    };

    const isSameDay = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const isThisWeek = (date) => {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        return date >= startOfWeek;
    };

    const isThisMonth = (date) => {
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    };

    const getFilteredReports = () => {
        let filtered = reports.filter(r => r.status === activeTab);

        if (dateFilter !== 'all') {
            filtered = filtered.filter(r => {
                const reportDate = new Date(r.createdAt);
                const today = new Date();

                if (dateFilter === 'today') return isSameDay(reportDate, today);
                if (dateFilter === 'week') return isThisWeek(reportDate);
                if (dateFilter === 'month') return isThisMonth(reportDate);
                if (dateFilter === 'custom') {
                    if (!customDate.start || !customDate.end) return true;
                    const start = new Date(customDate.start);
                    const end = new Date(customDate.end);
                    end.setHours(23, 59, 59, 999);
                    return reportDate >= start && reportDate <= end;
                }
                return true;
            });
        }
        return filtered;
    };

    const filteredReports = getFilteredReports();

    return (
        <div className="animate-fade-in p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">User Reports</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['new', 'viewed', 'completed'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all capitalization ${activeTab === tab
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab} ({reports.filter(r => r.status === tab).length})
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 outline-none"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="custom">Custom Range</option>
                        </select>

                        {dateFilter === 'custom' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={customDate.start}
                                    onChange={(e) => setCustomDate({ ...customDate, start: e.target.value })}
                                    className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="date"
                                    value={customDate.end}
                                    onChange={(e) => setCustomDate({ ...customDate, end: e.target.value })}
                                    className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredReports.length > 0 ? (
                        filteredReports.map((report) => (
                            <div
                                key={report._id}
                                className={`bg-white rounded-xl shadow-sm border p-6 transition-all border-l-4 ${report.status === 'new' ? 'border-l-red-500 hover:shadow-md' :
                                    report.status === 'viewed' ? 'border-l-blue-500' :
                                        'border-l-green-500'
                                    }`}
                                onClick={() => markAsViewed(report)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-gray-800">{report.name}</h3>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">ID: {report._id.slice(-6)}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">{report.email}</p>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                            {new Date(report.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {report.status === 'new' && (
                                            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">New</span>
                                        )}
                                        {report.status === 'viewed' && (
                                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Viewed</span>
                                        )}
                                        {report.status === 'completed' && (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Completed</span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100 mb-4">
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {report.message}
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/admin/dashboard/reports/${report._id}`);
                                        }}
                                        className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">visibility</span>
                                        View Details
                                    </button>

                                    {report.status !== 'completed' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStatusUpdate(report._id, 'completed');
                                            }}
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            Mark as Completed
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 border-dashed">
                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">inbox</span>
                            <p className="text-gray-500">No {activeTab} reports found {dateFilter !== 'all' ? `for ${dateFilter}` : ''}.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserReports;
