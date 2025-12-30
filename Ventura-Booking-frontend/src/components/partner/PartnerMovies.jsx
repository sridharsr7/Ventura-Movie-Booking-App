import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const PartnerMovies = () => {
    const { token } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('marketplace');
    const [movies, setMovies] = useState([]);
    const [myMovies, setMyMovies] = useState([]);

    useEffect(() => {
        if (activeTab === 'marketplace') {
            fetchAvailableMovies();
        } else if (activeTab === 'my-movies') {
            fetchMyMovies();
        }
    }, [activeTab, token]);

    const fetchAvailableMovies = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get('http://localhost:5000/api/partner/movies', config);
            setMovies(res.data);
        } catch (err) {
            console.error('Error fetching movies:', err);
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

    const handleApproveMovie = async (movieId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`http://localhost:5000/api/partner/movies/${movieId}/approve`, {}, config);
            fetchAvailableMovies();
            alert('Movie Approved!');
        } catch (err) {
            console.error(err);
            alert('Failed to approve movie');
        }
    };

    const handleRejectMovie = async (movieId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`http://localhost:5000/api/partner/movies/${movieId}/reject`, {}, config);
            if (activeTab === 'marketplace') fetchAvailableMovies();
            if (activeTab === 'my-movies') fetchMyMovies();
            alert('Movie Rejected/Removed!');
        } catch (err) {
            console.error(err);
            alert('Failed to reject movie');
        }
    };

    return (
        <div>
            <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setActiveTab('marketplace')}
                    className={`pb-2 px-1 font-semibold ${activeTab === 'marketplace' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    Marketplace (Available)
                </button>
                <button
                    onClick={() => setActiveTab('my-movies')}
                    className={`pb-2 px-1 font-semibold ${activeTab === 'my-movies' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    My Approved Movies
                </button>
            </div>

            {activeTab === 'marketplace' && (
                <div className="space-y-8 animate-fade-in">
                   
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-600">movie</span>
                            Now Available for Screening
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {movies.filter(m => m.status === 'running').length > 0 ? (
                                movies.filter(m => m.status === 'running').map(movie => (
                                    <div key={movie._id} className="relative rounded-xl overflow-hidden shadow-md bg-gray-50">
                                        <div className="aspect-[2/3] bg-gray-200">
                                            <img
                                                src={movie.poster && movie.poster.startsWith('/uploads') ? `http://localhost:5000${movie.poster}` : movie.poster}
                                                alt={movie.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }}
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-lg truncate">{movie.title}</h4>
                                            <p className="text-sm text-gray-500">{movie.language} • {movie.genre}</p>
                                            <div className="mt-4 flex gap-2">
                                                {movie.isApproved ? (
                                                    <button disabled className="w-full bg-green-100 text-green-700 py-2 rounded font-semibold cursor-default">
                                                        Approved
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleRejectMovie(movie._id)} className="flex-1 bg-red-100 text-red-600 py-2 rounded font-semibold hover:bg-red-200">
                                                            Reject
                                                        </button>
                                                        <button onClick={() => handleApproveMovie(movie._id)} className="flex-1 bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700">
                                                            Approve
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 col-span-full italic">No running movies available at the moment.</p>
                            )}
                        </div>
                    </div>

                   
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">upcoming</span>
                            Upcoming Releases
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {movies.filter(m => m.status === 'upcoming').length > 0 ? (
                                movies.filter(m => m.status === 'upcoming').map(movie => (
                                    <div key={movie._id} className="relative rounded-xl overflow-hidden shadow-md bg-gray-50 opacity-90">
                                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm">
                                            COMING SOON
                                        </div>
                                        <div className="aspect-[2/3] bg-gray-200">
                                            <img
                                                src={movie.poster && movie.poster.startsWith('/uploads') ? `http://localhost:5000${movie.poster}` : movie.poster}
                                                alt={movie.title}
                                                className="w-full h-full object-cover grayscale-[0.2]"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }}
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-lg truncate text-gray-800">{movie.title}</h4>
                                            <p className="text-sm text-gray-500">{movie.language} • {movie.genre}</p>
                                            <div className="mt-4">
                                                <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded font-semibold cursor-not-allowed text-sm">
                                                    Approvals Open Soon
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 col-span-full italic">No upcoming movies added yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'my-movies' && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-fade-in">
                    <h3 className="text-xl font-bold mb-4">My Approved Movies</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {myMovies.length > 0 ? (
                            myMovies.map(movie => (
                                <div key={movie._id} className="relative rounded-xl overflow-hidden shadow-md bg-gray-50">
                                    <div className="aspect-[2/3] bg-gray-200">
                                        <img
                                            src={movie.poster && movie.poster.startsWith('/uploads') ? `http://localhost:5000${movie.poster}` : movie.poster}
                                            alt={movie.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-lg truncate">{movie.title}</h4>
                                        <p className="text-sm text-gray-500">{movie.language} • {movie.genre}</p>
                                        <div className="mt-4">
                                            <button onClick={() => handleRejectMovie(movie._id)} className="w-full bg-red-100 text-red-600 py-2 rounded font-semibold hover:bg-red-200">
                                                Remove / Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No approved movies yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerMovies;
