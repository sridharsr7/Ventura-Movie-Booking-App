import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const PartnerScreens = () => {
    const { token } = useContext(AuthContext);
    const [screens, setScreens] = useState([]);
    const [myMovies, setMyMovies] = useState([]);

    const [screenData, setScreenData] = useState({
        name: '',
        screenType: '2D',
        seatCapacity: '',
        rows: '',
        columns: ''
    });
    const [showScreenForm, setShowScreenForm] = useState(false);
    const [editingScreenId, setEditingScreenId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [managingScreen, setManagingScreen] = useState(null);
    const [specialSeats, setSpecialSeats] = useState([]);
    const [rowPrices, setRowPrices] = useState({});
    const [rowNames, setRowNames] = useState({});
    const [showSeatModal, setShowSeatModal] = useState(false);

    const [showtimeData, setShowtimeData] = useState({ movieId: '', time: '', date: '' });
    const [showShowtimeModal, setShowShowtimeModal] = useState(false);
    const [targetScreenId, setTargetScreenId] = useState(null);
    const [editingShowtimeId, setEditingShowtimeId] = useState(null);

    const [expandedScreens, setExpandedScreens] = useState({});

    const toggleExpanded = (screenId) => {
        setExpandedScreens(prev => ({
            ...prev,
            [screenId]: !prev[screenId]
        }));
    };

    useEffect(() => {
        fetchScreens();
        fetchMyMovies();

        const interval = setInterval(() => {
            fetchScreens();
            fetchMyMovies();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchScreens = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get('http://localhost:5000/api/partner/screens', config);

            const sortedScreens = res.data.map(screen => {
                if (screen.showtimes && screen.showtimes.length > 0) {
                    screen.showtimes.sort((a, b) => {
                        const dateA = new Date(a.date);
                        const dateB = new Date(b.date);
                        if (dateA.getTime() !== dateB.getTime()) {
                            return dateB - dateA; 
                        }
                        return b.time.localeCompare(a.time); 
                    });
                }
                return screen;
            });

            setScreens(sortedScreens);
        } catch (err) {
            console.error('Error fetching screens:', err);
        }
    };

    const fetchMyMovies = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get('http://localhost:5000/api/partner/my-movies', config);
            setMyMovies(res.data);
        } catch (err) {
            console.error('Error fetching my movies:', err);
        }
    };

    const handleScreenChange = (e) => {
        setScreenData({ ...screenData, [e.target.name]: e.target.value });
    };

    const handleCreateScreen = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (editingScreenId) {
                await axios.put(`http://localhost:5000/api/partner/screens/${editingScreenId}`, screenData, config);
                alert('Screen Updated Successfully');
            } else {
                await axios.post('http://localhost:5000/api/partner/screens', screenData, config);
                alert('Screen Added Successfully');
            }

            setScreenData({ name: '', screenType: '2D', seatCapacity: '', rows: '', columns: '' });
            setShowScreenForm(false);
            setEditingScreenId(null);
            fetchScreens();
        } catch (err) {
            console.error(err);
            alert('Failed to save screen');
        } finally {
            setLoading(false);
        }
    };

    const handleEditScreen = (screen) => {
        setScreenData({
            name: screen.name,
            screenType: screen.screenType,
            seatCapacity: screen.seatCapacity,
            rows: screen.rows,
            columns: screen.columns
        });
        setEditingScreenId(screen._id);
        setShowScreenForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteScreen = async (id) => {
        if (window.confirm('Are you sure you want to delete this screen?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/partner/screens/${id}`, config);
                fetchScreens();
            } catch (err) {
                console.error(err);
                alert('Failed to delete screen');
            }
        }
    };

    const openSeatManager = (screen) => {
        setManagingScreen(screen);
        setSpecialSeats(screen.specialSeats || []);
        const initialPrices = {};
        const initialNames = {};
        for (let i = 0; i < screen.rows; i++) {
            const rowLabel = String.fromCharCode(65 + i);
            initialPrices[rowLabel] = screen.rowPrices && screen.rowPrices[rowLabel] ? screen.rowPrices[rowLabel] : 150; // Default 150
            initialNames[rowLabel] = screen.rowNames && screen.rowNames[rowLabel] ? screen.rowNames[rowLabel] : '';
        }
        setRowPrices(initialPrices);
        setRowNames(initialNames);
        setShowSeatModal(true);
    };

    const toggleSeatStatus = (row, col) => {
        const existingIndex = specialSeats.findIndex(s => s.row === row && s.col === col);
        let newSeats = [...specialSeats];

        if (existingIndex >= 0) {
            const currentStatus = newSeats[existingIndex].status;
            if (currentStatus === 'damaged') {
                newSeats[existingIndex].status = 'gap';
            } else if (currentStatus === 'gap') {
                newSeats[existingIndex].status = 'disabled';
            } else if (currentStatus === 'disabled') {
                newSeats.splice(existingIndex, 1);
            }
        } else {
            newSeats.push({ row, col, status: 'damaged' });
        }
        setSpecialSeats(newSeats);
    };

    const saveSeatConfig = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const totalSlots = managingScreen.rows * managingScreen.columns;
            const gapSeatsCount = specialSeats.filter(s => s.status === 'gap').length;
            const newSeatCapacity = totalSlots - gapSeatsCount;

            await axios.put(`http://localhost:5000/api/partner/screens/${managingScreen._id}`, {
                specialSeats: specialSeats,
                rowPrices: rowPrices,
                rowNames: rowNames,
                seatCapacity: newSeatCapacity
            }, config);

            alert('Seat layout, prices, and categories saved successfully!');
            setShowSeatModal(false);
            fetchScreens();
        } catch (err) {
            console.error(err);
            alert('Failed to save layout');
        }
    };

    const getSeatStatus = (row, col) => {
        const seat = specialSeats.find(s => s.row === row && s.col === col);
        return seat ? seat.status : 'standard';
    };

    const isRowFullGap = (row) => {
        if (!managingScreen) return false;
        for (let c = 0; c < managingScreen.columns; c++) {
            if (getSeatStatus(row, c) !== 'gap') return false;
        }
        return true;
    };

    const getRowLabel = (targetRow) => {
        let visualRowIndex = 0;
        let isTargetGap = isRowFullGap(targetRow);

        if (isTargetGap) return "";

        for (let r = 0; r < targetRow; r++) {
            if (!isRowFullGap(r)) {
                visualRowIndex++;
            }
        }
        return String.fromCharCode(65 + visualRowIndex);
    };

    const handleAddShowtime = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (editingShowtimeId) {
                await axios.put(`http://localhost:5000/api/partner/screens/${targetScreenId}/showtimes/${editingShowtimeId}`, showtimeData, config);
                alert('Showtime updated!');
            } else {
                await axios.post(`http://localhost:5000/api/partner/screens/${targetScreenId}/showtimes`, showtimeData, config);
                alert('Showtime added!');
            }

            setShowShowtimeModal(false);
            setEditingShowtimeId(null);
            fetchScreens();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || err.response?.data?.message || 'Failed to save showtime');
        }
    };

    const handleEditShowtime = (screenId, showtime) => {
        setTargetScreenId(screenId);
        setEditingShowtimeId(showtime._id);
        setShowtimeData({
            movieId: showtime.movie?._id || showtime.movie,
            time: showtime.time,
            date: showtime.date ? showtime.date.split('T')[0] : ''
        });
        setShowShowtimeModal(true);
    };

    const handleDeleteShowtime = async (screenId, showtimeId) => {
        if (window.confirm('Delete this showtime?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/partner/screens/${screenId}/showtimes/${showtimeId}`, config);
                fetchScreens();
            } catch (err) {
                console.error(err);
                alert('Failed to delete showtime');
            }
        }
    };

    const formatTime = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m < 10 ? '0' + m : m} ${ampm}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold">Theater Screens & Schedules</h2>
                    <p className="text-sm text-gray-500">Manage your screens and showtimes.</p>
                </div>
                <button onClick={() => {
                    setScreenData({ name: '', screenType: '2D', seatCapacity: '', rows: '', columns: '' });
                    setEditingScreenId(null);
                    setShowScreenForm(!showScreenForm);
                }} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-semibold shadow-md">
                    {showScreenForm ? 'Cancel' : 'Add New Screen'}
                </button>
            </div>

            {showScreenForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
                    <h3 className="font-bold mb-4 text-lg border-b pb-2">{editingScreenId ? 'Edit Screen Details' : 'Add New Screen Details'}</h3>
                    <form onSubmit={handleCreateScreen} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Screen Name</label>
                            <input type="text" name="name" value={screenData.name} onChange={handleScreenChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Screen 1" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Type</label>
                            <select name="screenType" value={screenData.screenType} onChange={handleScreenChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-teal-500 outline-none">
                                <option value="2D">2D</option>
                                <option value="IMAX">IMAX</option>
                                <option value="3D">3D</option>
                                <option value="4DX">4DX</option>
                                <option value="SCREEN X">SCREEN X</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Seat Capacity</label>
                            <input type="number" name="seatCapacity" value={screenData.seatCapacity} onChange={handleScreenChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-teal-500 outline-none" required />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-bold mb-1">Rows</label>
                                <input type="number" name="rows" value={screenData.rows} onChange={handleScreenChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-teal-500 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Cols</label>
                                <input type="number" name="columns" value={screenData.columns} onChange={handleScreenChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-teal-500 outline-none" required />
                            </div>
                        </div>
                        <div className="col-span-2 mt-2">
                            <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 disabled:opacity-50">
                                {loading ? 'Processing...' : (editingScreenId ? 'Update Screen' : 'Create Screen')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {screens.length > 0 ? (
                    screens.map(screen => (
                        <div key={screen._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full bg-gradient-to-br from-white to-gray-50">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{screen.name}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded font-semibold">{screen.screenType}</span>
                                        <button onClick={() => openSeatManager(screen)} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded hover:bg-purple-200 font-semibold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">event_seat</span>
                                            Manage Seats
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Capacity</p>
                                    <p className="font-bold text-xl text-teal-700">{screen.seatCapacity}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex-1">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-sm text-gray-700 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                                        Showtimes
                                    </h4>
                                    <button
                                        onClick={() => {
                                            setTargetScreenId(screen._id);
                                            setEditingShowtimeId(null);
                                            setShowtimeData({ movieId: '', time: '', date: '' });
                                            setShowShowtimeModal(true);
                                        }}
                                        className="text-teal-600 text-sm font-bold hover:underline"
                                    >
                                        + Add Showtime
                                    </button>
                                </div>

                                {screen.showtimes && screen.showtimes.length > 0 ? (
                                    <>
                                        <div className={`space-y-2 mb-4 bg-white rounded-lg border border-gray-100 p-2 ${expandedScreens[screen._id] ? '' : 'max-h-[150px] overflow-y-auto'}`}>
                                            {(expandedScreens[screen._id] ? screen.showtimes : screen.showtimes.slice(0, 3)).map(st => (
                                                <div key={st._id} className="flex justify-between items-center hover:bg-gray-50 p-1.5 rounded text-sm group">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold bg-gray-100 px-2 rounded text-gray-800">
                                                            {st.date ? new Date(st.date).toLocaleDateString() : ''} {formatTime(st.time)}
                                                        </span>
                                                        <span className="text-gray-800 truncate max-w-[120px]" title={st.movie?.title}>{st.movie?.title || 'Unknown Movie'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleEditShowtime(screen._id, st)} className="text-blue-500 hover:text-blue-700 p-1">
                                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                                        </button>
                                                        <button onClick={() => handleDeleteShowtime(screen._id, st._id)} className="text-red-500 hover:text-red-700 p-1">
                                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {screen.showtimes.length > 3 && (
                                            <button
                                                onClick={() => toggleExpanded(screen._id)}
                                                className="w-full text-center text-xs font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 py-1 rounded transition mb-2"
                                            >
                                                {expandedScreens[screen._id] ? 'See Less' : `See More (${screen.showtimes.length - 3} more)`}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 mb-4">
                                        <p className="text-xs text-gray-400">No shows scheduled.</p>
                                    </div>
                                )}

                            </div>

                            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3 mt-auto">
                                <button onClick={() => handleEditScreen(screen)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition">Edit</button>
                                <button onClick={() => handleDeleteScreen(screen._id)} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition">Delete</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">theaters</span>
                        <p>No screens created yet. Click "Add New Screen" to get started.</p>
                    </div>
                )}
            </div>

            {showSeatModal && managingScreen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Manage Seats: {managingScreen.name}</h3>
                            <button onClick={() => setShowSeatModal(false)} className="text-gray-500 hover:text-gray-800">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex justify-center gap-6 mb-6 text-sm flex-wrap">
                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></div> Standard</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-200 border border-red-300"></div> Damaged</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white border border-dashed border-gray-300"></div> Gap (Pathway)</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-200 border border-blue-300"></div> Differently-abled</div>
                        </div>
                        <p className="text-center text-gray-500 text-sm mb-4">Click a seat to cycle: Standard &rarr; Damaged &rarr; Gap &rarr; Differently-abled</p>

                        <div className="flex gap-4 items-start">

                            <div className="w-48 flex flex-col gap-1" style={{ paddingTop: 'calc(2rem + 1px)' }}>
                                <div className="flex text-xs font-bold text-gray-500 mb-2 uppercase text-center -mt-6 gap-2">
                                    <span className="w-16">Price</span>
                                    <span className="w-20">Category</span>
                                </div>
                                {Array.from({ length: managingScreen.rows }).map((_, r) => {
                                    const rowLabel = getRowLabel(r);
                                    if (!rowLabel) return <div key={r} className="h-8"></div>; // Spacer for pathway

                                    return (
                                        <div key={r} className="h-8 flex items-center relative group gap-1">
                                            <span className="absolute -left-4 text-xs font-bold text-gray-400 w-4 text-right pr-1">{rowLabel}</span>
                                            <input
                                                type="number"
                                                className="w-16 text-xs p-1 border rounded text-center focus:border-teal-500 outline-none"
                                                value={rowPrices[rowLabel] || ''}
                                                onChange={(e) => setRowPrices({ ...rowPrices, [rowLabel]: Number(e.target.value) })}
                                                placeholder="Price"
                                            />
                                            <input
                                                type="text"
                                                className="w-24 text-xs p-1 border rounded text-center focus:border-teal-500 outline-none"
                                                value={rowNames[rowLabel] || ''}
                                                onChange={(e) => setRowNames({ ...rowNames, [rowLabel]: e.target.value })}
                                                placeholder="Name"
                                            />
                                        </div>
                                    );
                                })}
                            </div>


                            <div className="overflow-x-auto flex justify-center bg-gray-100 p-8 rounded-xl border border-gray-200">
                                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${managingScreen.columns}, minmax(0, 1fr))` }}>
                                    {Array.from({ length: managingScreen.rows }).map((_, r) => {
                                        const rowLabel = getRowLabel(r);
                                        const isPathway = isRowFullGap(r);

                                        return Array.from({ length: managingScreen.columns }).map((_, c) => {
                                            const status = getSeatStatus(r, c);
                                            let colorClass = 'bg-white border-gray-300 hover:bg-gray-50';
                                            if (status === 'damaged') colorClass = 'bg-red-200 border-red-400 text-red-700';
                                            if (status === 'gap') colorClass = 'bg-transparent border-dashed border-gray-200 text-transparent hover:bg-gray-50 hover:text-gray-300';
                                            if (status === 'disabled') colorClass = 'bg-blue-200 border-blue-400 text-blue-700';

                                            return (
                                                <button
                                                    key={`${r}-${c}`}
                                                    onClick={() => toggleSeatStatus(r, c)}
                                                    className={`w-8 h-8 rounded border flex items-center justify-center text-xs transition-transform hover:scale-110 ${colorClass}`}
                                                    title={`Row ${r + 1} (${rowLabel}), Col ${c + 1} - ${status}`}
                                                >
                                                    {status === 'disabled' && <span className="material-symbols-outlined text-[14px]">accessible</span>}
                                                    {status === 'damaged' && <span className="material-symbols-outlined text-[14px]">block</span>}
                                                    {status === 'gap' && <span className="text-[10px] opacity-30">Gap</span>}
                                                    {status === 'standard' && <span className="text-[10px] text-gray-400 font-mono flex flex-col items-center leading-none">
                                                        <span className="font-bold text-gray-600">{rowLabel}</span>
                                                        <span>{c + 1}</span>
                                                    </span>}
                                                </button>
                                            );
                                        });
                                    })}
                                </div>
                            </div>


                            <div className="flex flex-col gap-1 pl-2" style={{ paddingTop: 'calc(2rem + 1px)' }}>
                                {Array.from({ length: managingScreen.rows }).map((_, r) => {
                                    const rowLabel = getRowLabel(r);
                                    return (
                                        <div key={r} className="h-8 flex items-center justify-center">
                                            {rowLabel ? <span className="text-xs font-bold text-gray-400">{rowLabel}</span> : <span className="text-[10px] text-gray-300 italic">Path</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="w-full flex justify-center mt-10">
                            <div className="w-2/3 h-12 bg-gradient-to-t from-teal-200 to-white flex items-start justify-center text-teal-800 text-xs font-bold tracking-[0.5em] uppercase shadow-lg border-b-4 border-teal-400 opacity-80"
                                style={{
                                    transform: 'perspective(400px) rotateX(20deg)',
                                    borderRadius: '0 0 50% 50% / 0 0 20px 20px',
                                    boxShadow: '0 -20px 30px -10px rgba(45, 212, 191, 0.4)'
                                }}>
                                <span className="mt-2">Screen</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowSeatModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Cancel</button>
                            <button onClick={saveSeatConfig} className="px-4 py-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md">Save Configuration</button>
                        </div>
                    </div>
                </div>
            )}

            {showShowtimeModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border-t-4 border-teal-500">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">{editingShowtimeId ? 'Edit Showtime' : 'Add Showtime'}</h3>
                        <form onSubmit={handleAddShowtime} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Select Movie</label>
                                <select
                                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                                    value={showtimeData.movieId}
                                    onChange={(e) => setShowtimeData({ ...showtimeData, movieId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Choose Approved Movie --</option>
                                    {myMovies.filter(m => {
                                        const selectedScreen = screens.find(s => s._id === targetScreenId);
                                        if (!selectedScreen) return true;

                                        if (m.format === 'All') return true;

                                        const type = selectedScreen.screenType;
                                        const format = m.format;

                                        if (type === 'IMAX') {
                                            return format && format.includes('IMAX');
                                        }

                                        if (type === '2D' || type === 'Standard') {
                                            return format === '2D' || format === 'Standard';
                                        }

                                        if (type === '3D') {
                                            return format === '3D' || format === '2D' || format === 'Standard';
                                        }

                                        return format === type;
                                    }).map(m => (
                                        <option key={m._id} value={m._id}>{m.title} ({m.format})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                                        value={showtimeData.date}
                                        onChange={(e) => setShowtimeData({ ...showtimeData, date: e.target.value })}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Time</label>
                                    <input
                                        type="time"
                                        className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                                        value={showtimeData.time}
                                        onChange={(e) => setShowtimeData({ ...showtimeData, time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowShowtimeModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md">
                                    {editingShowtimeId ? 'Update Show' : 'Add Show'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerScreens;
