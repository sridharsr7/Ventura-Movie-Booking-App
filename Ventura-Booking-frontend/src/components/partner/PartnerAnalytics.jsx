import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const PartnerAnalytics = () => {
    const { token } = useContext(AuthContext);

    const [chartData, setChartData] = useState([]);
    const [screens, setScreens] = useState([]);
    const [screenStats, setScreenStats] = useState([]);

    const [period, setPeriod] = useState(() => localStorage.getItem('analytics_period') || 'month');
    const [metric, setMetric] = useState(() => localStorage.getItem('analytics_metric') || 'Revenue');
    const [showCombined, setShowCombined] = useState(() => {
        const saved = localStorage.getItem('analytics_showCombined');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('analytics_period', period);
    }, [period]);

    useEffect(() => {
        localStorage.setItem('analytics_metric', metric);
    }, [metric]);

    useEffect(() => {
        localStorage.setItem('analytics_showCombined', JSON.stringify(showCombined));
    }, [showCombined]);

    const [visibleScreenIds, setVisibleScreenIds] = useState([]);
    const [customStart, setCustomStart] = useState(new Date().toISOString().split('T')[0]);
    const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const statsRes = await axios.get('http://localhost:5000/api/partner/stats', config);
                setScreenStats(statsRes.data?.screenStats || []);

                let url = `http://localhost:5000/api/partner/analytics?period=${period}`;
                if (period === 'custom') {
                    url += `&startDate=${customStart}&endDate=${customEnd}`;
                }
                const res = await axios.get(url, config);

                const data = res.data || {};
                setChartData(data.chartData || []);
                const fetchedScreens = data.screens || [];
                setScreens(fetchedScreens);

                if (visibleScreenIds.length === 0 && fetchedScreens.length > 0) {
                    setVisibleScreenIds(fetchedScreens.map(s => s.id));
                } else if (fetchedScreens.length > 0) {
                    const currentIds = fetchedScreens.map(s => s.id);
                    setVisibleScreenIds(prev => prev.filter(id => currentIds.includes(id)));
                }

            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [token, period, customStart, customEnd]);

    const toggleScreenVisibility = (screenId) => {
        setVisibleScreenIds(prev =>
            prev.includes(screenId)
                ? prev.filter(id => id !== screenId)
                : [...prev, screenId]
        );
    };

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    const getMaxValue = () => {
        if (!chartData || chartData.length === 0) return 100;
        let max = 0;
        chartData.forEach(d => {
            if (showCombined) {
                const val = d[`Total${metric}`] || 0;
                if (val > max) max = val;
            } else {
                screens.forEach(s => {
                    if (visibleScreenIds.includes(s.id)) {
                        const val = d[`${metric}_${s.id}`] || 0;
                        if (val > max) max = val;
                    }
                });
            }
        });
        return max || 100;
    };

    const maxValue = getMaxValue();

    const formatValue = (val) => {
        if (metric === 'Revenue') {
            return val >= 1000 ? `₹${(val / 1000).toFixed(1)}k` : `₹${val}`;
        }
        return val;
    };

    if (loading) {
        return (
            <div className="flex h-[500px] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col xl:flex-row justify-between xl:items-start gap-6 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Performance Analytics</h3>
                        <p className="text-sm text-gray-500">Analyze performance by time and screen.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">

                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {['today', 'week', 'month', 'custom'].map((p) => (
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

                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {['Revenue', 'Bookings'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMetric(m)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${metric === m ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    <div className="flex-1 h-[400px] flex flex-col">
                        {chartData && chartData.length > 0 ? (
                            <div className="flex-1 flex items-end gap-2 relative border-b border-l border-gray-100 pl-12 pb-2">
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                                    {[1, 0.75, 0.5, 0.25, 0].map(p => (
                                        <div key={p} className="border-b border-gray-100 w-full h-[1px] relative">
                                            <span className="absolute left-0 -top-2.5 text-xs font-bold text-gray-700 w-auto text-left bg-white px-1 ml-1 rounded-sm z-10">
                                                {formatValue(Math.round(maxValue * p))}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {chartData.map((data, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end z-10">

                                        <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                                            {showCombined ? (
                                                <div
                                                    className="w-full max-w-[40px] relative flex flex-col-reverse justify-start overflow-hidden rounded-t-sm"
                                                    style={{
                                                        height: `${((data[`Total${metric}`] || 0) / maxValue) * 100}%`,
                                                    }}
                                                >
                                                    {(() => {
                                                        const activeScreens = screens.filter(s => (data[`${metric}_${s.id}`] || 0) > 0);
                                                        const lastActiveId = activeScreens.length > 0 ? activeScreens[activeScreens.length - 1].id : null;

                                                        return screens.map((screen, idx) => {
                                                            const val = data[`${metric}_${screen.id}`] || 0;
                                                            const total = data[`Total${metric}`] || 1;
                                                            const heightPct = (val / total) * 100;

                                                            if (val <= 0) return null;

                                                         

                                                            return (
                                                                <div
                                                                    key={screen.id}
                                                                    className="w-full relative group/segment transition-all duration-300 hover:opacity-90"
                                                                    style={{
                                                                        height: `${heightPct}%`,
                                                                        backgroundColor: colors[idx % colors.length]
                                                                    }}
                                                                >
                                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-1.5 rounded opacity-0 group-hover/segment:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none drop-shadow-lg text-center">
                                                                        <div className="font-semibold mb-0.5">{screen.name}</div>
                                                                        <div className="font-bold">{formatValue(val)}</div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            ) : (
                                                screens.map((screen, idx) => {
                                                    if (!visibleScreenIds.includes(screen.id)) return null;
                                                    const val = data[`${metric}_${screen.id}`] || 0;

                                                    return (
                                                        <div
                                                            key={screen.id}
                                                            className="flex-1 max-w-[20px] rounded-t-sm transition-all duration-300 group/bar hover:opacity-90 relative flex flex-col justify-end"
                                                            style={{
                                                                height: '100%'
                                                            }}
                                                        >
                                                            <div
                                                                className="w-full rounded-t-sm transition-all duration-300 relative"
                                                                style={{
                                                                    height: `${(val / maxValue) * 100}%`,
                                                                    backgroundColor: colors[idx % colors.length]
                                                                }}
                                                            >
                                                                {val > 0 && (
                                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-1.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none drop-shadow-lg text-center">
                                                                        <div className="font-semibold">{screen.name}: <span className="font-bold">{formatValue(val)}</span></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>

                                        <div className="mt-2 text-xs font-bold text-gray-700 truncate w-full text-center group-hover:text-gray-900">
                                            {data.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400 flex-col gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <span className="material-symbols-outlined text-4xl">bar_chart_off</span>
                                <p>No analytics data available for this period.</p>
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-64 space-y-6">

                        <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">View Mode</h4>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${showCombined ? 'border-blue-600' : 'border-gray-300'}`}>
                                        {showCombined && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                    </div>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        checked={showCombined}
                                        onChange={() => setShowCombined(true)}
                                    />
                                    <span className={`text-sm font-medium ${showCombined ? 'text-blue-700' : 'text-gray-600'}`}>Combined Overview</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!showCombined ? 'border-blue-600' : 'border-gray-300'}`}>
                                        {!showCombined && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                    </div>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        checked={!showCombined}
                                        onChange={() => setShowCombined(false)}
                                    />
                                    <span className={`text-sm font-medium ${!showCombined ? 'text-blue-700' : 'text-gray-600'}`}>Compare Screens</span>
                                </label>
                            </div>
                        </div>


                        {!showCombined && (
                            <div className="bg-gray-50 rounded-xl p-4 animate-fade-in">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Select Screens</h4>
                                <div className="max-h-[200px] overflow-y-auto space-y-2 custom-scrollbar">
                                    {screens.map((screen, index) => (
                                        <label key={screen.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg transition">
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${visibleScreenIds.includes(screen.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'}`}>
                                                {visibleScreenIds.includes(screen.id) && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={visibleScreenIds.includes(screen.id)}
                                                onChange={() => toggleScreenVisibility(screen.id)}
                                            />
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: colors[index % colors.length] }}
                                                />
                                                <span className="text-sm text-gray-700 font-medium">{screen.name}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            <div className="md:col-span-2 lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-gray-800 text-lg font-bold mb-4">Screens Overview</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="py-3 font-semibold">Screen Name</th>
                                <th className="py-3 font-semibold text-center">Bookings</th>
                                <th className="py-3 font-semibold text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {screenStats && screenStats.length > 0 ? (
                                screenStats.map(screen => (
                                    <tr key={screen.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-medium text-gray-800">{screen.name}</td>
                                        <td className="py-4 text-center text-blue-600 font-bold">{screen.bookings}</td>
                                        <td className="py-4 text-right font-mono text-green-600 font-bold">
                                            {screen.revenue.toLocaleString('en-IN', {
                                                style: 'currency',
                                                currency: 'INR',
                                                maximumFractionDigits: 0
                                            })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="py-8 text-center text-gray-400 text-sm">No screens found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PartnerAnalytics;
