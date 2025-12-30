import React, { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CityContext from '../context/CityContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const { selectedCity, setSelectedCity, cities } = useContext(CityContext);

    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.trim().length === 0) {
                setSuggestions([]);
                return;
            }

            try {
                const res = await axios.get(`/api/movies?city=${selectedCity}`);
                const allMovies = res.data;

                const filtered = allMovies.filter(movie =>
                    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setSuggestions(filtered.slice(0, 5));
                setShowSuggestions(true);
            } catch (err) {
                console.error("Error fetching search suggestions:", err);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchSuggestions();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, selectedCity]);

    const handleMovieSelect = (movieId) => {
        navigate(`/movie/${movieId}`);
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (suggestions.length > 0) {
                handleMovieSelect(suggestions[0]._id);
            }
        }
    };

    return (
        <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800 transition-all duration-300">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <h1
                        onClick={() => navigate('/')}
                        className="text-3xl font-extrabold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent cursor-pointer"
                    >
                        Ventura
                    </h1>

                    <div className="relative group">
                        <button className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
                            <span>{selectedCity}</span>
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                            {cities.map(city => (
                                <div
                                    key={city}
                                    onClick={() => setSelectedCity(city)}
                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-700 text-sm ${selectedCity === city ? 'text-red-500 font-bold' : 'text-gray-300'}`}
                                >
                                    {city}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div ref={searchRef} className="relative hidden md:block">
                        <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 w-80 border border-gray-700 focus-within:border-red-500 transition-colors">
                            <span className="material-symbols-outlined text-gray-400 mr-2">search</span>
                            <input
                                type="text"
                                placeholder="Search for movies..."
                                className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
                                {suggestions.map((movie) => (
                                    <div
                                        key={movie._id}
                                        onClick={() => handleMovieSelect(movie._id)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-800 last:border-0"
                                    >
                                        <img
                                            src={movie.poster && movie.poster.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${movie.poster}` : movie.poster}
                                            alt={movie.title}
                                            className="w-10 h-14 object-cover rounded-md"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40x56?text=No+Img'; }}
                                        />
                                        <div>
                                            <h4 className="text-white text-sm font-bold">{movie.title}</h4>
                                            <p className="text-xs text-gray-400">{movie.genre} • {movie.language}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="relative group">
                            <button className="flex items-center gap-3 focus:outline-none">
                                <div className="text-right hidden sm:block">
                                    <p className="text-white font-semibold text-sm">Welcome,</p>
                                    <p className="text-red-500 font-bold text-sm">{user.name}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-purple-700 flex items-center justify-center text-white text-lg font-bold border-2 border-transparent group-hover:border-white transition-all shadow-lg">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-white transition-colors">expand_more</span>
                            </button>

                            <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 transform origin-top-right scale-95 group-hover:scale-100">
                                <div className="px-4 py-3 border-b border-gray-800">
                                    <p className="text-sm text-white font-bold truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={() => navigate('/profile/edit')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={() => navigate('/my-orders')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">receipt_long</span>
                                        My Orders
                                    </button>
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate('/');
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">logout</span>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login', { state: { from: location } })}
                            className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
