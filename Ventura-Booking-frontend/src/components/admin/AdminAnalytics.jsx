import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const AdminAnalytics = () => {
    const { token } = useContext(AuthContext);
    const [partnersAnalytics, setPartnersAnalytics] = useState([]);
    const [allMovies, setAllMovies] = useState([]);

    useEffect(() => {
        fetchPartnersAnalytics();
        fetchAllMovies();
    }, []);

    const [selectedCity, setSelectedCity] = useState(localStorage.getItem('adminSelectedCity') || 'All');

    useEffect(() => {
        localStorage.setItem('adminSelectedCity', selectedCity);
    }, [selectedCity]);

    const cities = [...new Set(partnersAnalytics.map(p => p.location).filter(l => l && l.trim() !== ''))];

    const filteredAnalytics = selectedCity === 'All'
        ? partnersAnalytics
        : partnersAnalytics.filter(p => p.location === selectedCity);

    const fetchAllMovies = async () => {
        try {
            const res = await axios.get('/api/movies');
            setAllMovies(res.data);
        } catch (err) {
            console.error('Error fetching all movies:', err);
        }
    };

    const fetchPartnersAnalytics = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const res = await axios.get('/api/admin/partners-analytics', config);
            setPartnersAnalytics(res.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        }
    };

    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ screenId: '', showtimeId: '', time: '', date: '', movieId: '' });

    const handleEditClick = (screenId, showtime) => {
        setEditData({
            screenId,
            showtimeId: showtime._id,
            time: showtime.time,
            date: showtime.date ? showtime.date.split('T')[0] : '',
            movieId: showtime.movie?._id || showtime.movie || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateShowtime = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`/api/admin/screens/${editData.screenId}/showtimes/${editData.showtimeId}`, {
                time: editData.time,
                date: editData.date,
                movieId: editData.movieId
            }, config);

            alert('Showtime updated successfully');
            setShowEditModal(false);
            fetchPartnersAnalytics();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to update showtime');
        }
    };

    return (
        <div className="space-y-8 relative">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Partner Analytics</h2>
                <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                >
                    <option value="All">All Locations</option>
                    {cities.map((city, index) => (
                        <option key={index} value={city}>{city}</option>
                    ))}
                </select>
            </div>

            {filteredAnalytics.length > 0 ? (
                filteredAnalytics.map(partner => (
                    <div key={partner._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{partner.name} <span className="text-sm font-normal text-gray-500">({partner.email})</span></h3>
                                <p className="text-sm text-gray-500">{partner.location} • {partner.address}</p>
                            </div>
                            <div className="text-right">
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                                    {partner.screens?.length || 0} Screens
                                </span>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    Approved Movies ({partner.approvedMovies?.length || 0})
                                </h4>

                                {partner.approvedMovies && partner.approvedMovies.length > 0 ? (
                                    <div className="space-y-3">
                                        {partner.approvedMovies.map(movie => (
                                            <div key={movie._id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                                                <div>
                                                    <p className="font-bold text-sm text-gray-800">{movie.title}</p>
                                                    <p className="text-xs text-gray-500">{movie.language}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No movies approved yet.</p>
                                )}
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500">theaters</span>
                                    Screens & Showtimes
                                </h4>

                                {partner.screens && partner.screens.length > 0 ? (
                                    <div className="space-y-4">
                                        {partner.screens.map(screen => (
                                            <div key={screen._id} className="border border-gray-200 rounded-xl p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h5 className="font-bold text-gray-800">{screen.name}</h5>
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                        {screen.seatCapacity} Seats • {screen.screenType}
                                                    </span>
                                                </div>

                                                <div className="space-y-1">
                                                    {screen.showtimes && screen.showtimes.length > 0 ? (
                                                        screen.showtimes.map(st => (
                                                            <div key={st._id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded group">
                                                                <div>
                                                                    <span className="font-bold text-gray-700 mr-2">{st.time}</span>
                                                                    {st.date && <span className="text-gray-500 mr-2">[{new Date(st.date).toLocaleDateString()}]</span>}
                                                                    <span className="text-gray-600 truncate max-w-[150px]">{st.movie?.title || 'Unknown'}</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleEditClick(screen._id, st)}
                                                                    className="text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-gray-400 italic">No showtimes scheduled.</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No screens added.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <span className="material-symbols-outlined text-4xl mb-2">analytics</span>
                    <p>No partner activity found {selectedCity !== 'All' ? ` in ${selectedCity}` : ''}.</p>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Edit Showtime</h3>
                        <form onSubmit={handleUpdateShowtime} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Movie</label>
                                <select
                                    className="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editData.movieId}
                                    onChange={e => setEditData({ ...editData, movieId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select Movie --</option>
                                    {allMovies.map(movie => (
                                        <option key={movie._id} value={movie._id}>{movie.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editData.date}
                                    onChange={e => setEditData({ ...editData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Time</label>
                                <input
                                    type="time"
                                    className="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editData.time}
                                    onChange={e => setEditData({ ...editData, time: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1.5 rounded text-gray-600 hover:bg-gray-100">Cancel</button>
                                <button type="submit" className="px-3 py-1.5 rounded bg-blue-600 text-white font-bold hover:bg-blue-700">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnalytics;
