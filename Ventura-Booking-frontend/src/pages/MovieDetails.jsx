import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const MovieDetails = () => {
    const { user, logout } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [movie, setMovie] = useState(null);
    const [showtimeData, setShowtimeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [uniqueDates, setUniqueDates] = useState([]);
    const [selectedCity, setSelectedCity] = useState("Chennai");
    const [showTrailer, setShowTrailer] = useState(false);

    const [canReview, setCanReview] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [isReviewing, setIsReviewing] = useState(false);
    const [tempRating, setTempRating] = useState(0);
    const [comment, setComment] = useState('');

    const [cities, setCities] = useState([]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/movies/locations');
                setCities(res.data);
            } catch (err) {
                console.error('Error fetching cities:', err);
                setCities([]);
            }
        };
        fetchCities();
    }, []);

    useEffect(() => {
        const checkEligibility = async () => {
            if (user && movie) {
                try {
                    const token = localStorage.getItem('token');
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const res = await axios.get(`http://localhost:5000/api/movies/${id}/review-eligibility`, config);
                    setCanReview(res.data.canReview);
                    setHasReviewed(res.data.hasReviewed);
                    if (res.data.hasReviewed) {
                        setUserRating(res.data.rating);
                    }
                } catch (error) {
                    console.error("Error checking review status", error);
                }
            }
        };
        checkEligibility();
    }, [user, movie, id]);

    const handleRate = async () => {
        if (tempRating === 0) return;
        if (!comment.trim()) {
            alert('Please add a comment to your review.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post(`http://localhost:5000/api/movies/${id}/rate`, {
                rating: tempRating,
                comment: comment
            }, config);

            setHasReviewed(true);
            setUserRating(tempRating * 2); 
            setCanReview(false);
            setIsReviewing(false);

            setMovie(prev => ({
                ...prev,
                averageRating: res.data.newAverage,
                totalVotes: res.data.newTotalVotes
            }));

        } catch (error) {
            console.error("Error submitting review", error);
            alert(error.response?.data?.message || "Failed to submit review");
        }
    };


    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                const movieRes = await axios.get(`http://localhost:5000/api/movies/${id}`);
                setMovie(movieRes.data);

                const showtimeRes = await axios.get(`http://localhost:5000/api/movies/${id}/showtimes`);
                setShowtimeData(showtimeRes.data);
            } catch (err) {
                console.error("Error fetching movie details:", err);
                setError("Failed to load movie details.");
            } finally {
                setLoading(false);
            }
        };

        fetchMovieData();
    }, [id]);

    useEffect(() => {
        if (showtimeData.length > 0) {
            const dates = new Set();
            showtimeData.forEach(screen => {
                screen.showtimes.forEach(slot => {
                    if (slot.date) {
                        dates.add(new Date(slot.date).toISOString().split('T')[0]);
                    }
                });
            });
            const sortedDates = Array.from(dates).sort();
            setUniqueDates(sortedDates);
            if (sortedDates.length > 0 && !selectedDate) {
                setSelectedDate(sortedDates[0]);
            }
        }
    }, [showtimeData]);

    const filteredScreens = showtimeData.map(screen => {
        const relevantShowtimes = screen.showtimes.filter(slot => {
            if (!selectedDate) return true;
            return new Date(slot.date).toISOString().split('T')[0] === selectedDate;
        });
        return { ...screen, showtimes: relevantShowtimes };
    }).filter(screen => screen.showtimes.length > 0);

    if (loading) return (
        <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
            <div className="w-1 h-32 bg-red-600 animate-pulse"></div>
        </div>
    );
    if (error) return <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center text-red-500 font-mono text-xl">{error}</div>;
    if (!movie) return <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center text-white font-mono text-xl">Movie Not Found</div>;

    const posterUrl = movie.poster && movie.poster.startsWith('/uploads') ? `http://localhost:5000${movie.poster}` : movie.poster;

    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-red-500 selection:text-black overflow-hidden flex flex-col md:flex-row">


            <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800 transition-all duration-300 top-0 left-0">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <h1
                            onClick={() => navigate('/')}
                            className="text-3xl font-extrabold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent cursor-pointer"
                        >
                            Ventura
                        </h1>

                        <div className="relative group hidden md:block">
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


                        <div className="hidden lg:flex items-center bg-gray-800 rounded-full px-4 py-2 w-80 border border-gray-700 focus-within:border-red-500 transition-colors">
                            <span className="material-symbols-outlined text-gray-400 mr-2">search</span>
                            <input
                                type="text"
                                placeholder="Search for movies..."
                                className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500"
                            />
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


            <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative md:fixed top-0 left-0 bg-black z-0 md:z-auto pt-24 md:pt-0"> {/* Pt-24 to push below fixed navbar on mobile */}
                <img
                    src={posterUrl}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-contain md:object-cover lg:object-contain opacity-100 md:pt-20 pb-10 px-4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0a0a0a]"></div>

                {movie.trailerLink && (
                    <button
                        onClick={() => setShowTrailer(true)}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-white font-bold tracking-wider hover:bg-red-600 hover:border-red-600 transition-all group animate-pulse hover:animate-none"
                    >
                        <span className="material-symbols-outlined filled">play_circle</span>
                        WATCH TRAILER
                    </button>
                )}


                <button
                    onClick={() => navigate('/')}
                    className="absolute top-6 left-6 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white text-white hover:text-black transition-all md:hidden"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>


            </div>


            <div className="w-full md:w-1/2 md:ml-[50%] min-h-screen bg-[#0a0a0a] relative z-10">



                <div className="px-6 md:px-16 pt-4 md:pt-12 pb-24">

                    <div className="mb-12">
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="px-3 py-1 border border-white/20 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                {movie.language}
                            </span>
                            <span className="px-3 py-1 border border-white/20 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                {movie.format || '2D'}
                            </span>
                            <span className="px-3 py-1 bg-white text-black text-[10px] uppercase tracking-widest font-bold">
                                {movie.genre}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8 uppercase text-white">
                            {movie.title}
                        </h1>
                        <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
                            <div className="flex items-center gap-6 text-gray-500 font-mono text-sm">
                                <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                                <span>•</span>
                                <span>{new Date(movie.releaseDate).getFullYear()}</span>
                                <span>•</span>
                                <span>{movie.language}</span>
                                <span>•</span>
                                <button
                                    onClick={() => navigate(`/movie/${movie._id}/reviews`)}
                                    className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors group"
                                >
                                    <span className="text-yellow-500 material-symbols-outlined text-sm">star</span>
                                    <span className="font-bold text-white">
                                        {movie.averageRating ? movie.averageRating.toFixed(1) : '0'}/10
                                    </span>
                                    <span className="text-xs">
                                        ({movie.totalVotes || 0} Votes)
                                    </span>
                                    <span className="material-symbols-outlined text-sm text-gray-500 group-hover:text-white transition-colors">chevron_right</span>
                                </button>
                                <span>•</span>
                                <span className="text-red-500">
                                    {movie.status === 'running' ? 'IN THEATERS' : 'COMING SOON'}
                                </span>
                            </div>

                            {user && (
                                <div>
                                    {canReview && !hasReviewed && (
                                        <button
                                            onClick={() => setIsReviewing(true)}
                                            className="px-4 py-2 bg-yellow-500 text-black font-bold text-sm rounded-full hover:bg-yellow-400 transition-colors flex items-center gap-2 w-max"
                                        >
                                            <span className="material-symbols-outlined text-lg">rate_review</span>
                                            Rate Movie
                                        </button>
                                    )}
                                    {hasReviewed && (
                                        <div className="text-yellow-500 text-sm font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined">check_circle</span>
                                            You rated this {userRating}/10
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="mb-16">
                        <p className="text-lg md:text-xl leading-relaxed text-[#a1a1a1] font-serif italic">
                            "{movie.description}"
                        </p>
                    </div>


                    {(movie.cast && movie.cast.length > 0) && (
                        <div className="mb-16">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#555] mb-6">Starring</h3>
                            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                                {movie.cast.map((actor, idx) => (
                                    <div key={idx} className="flex-shrink-0 w-32 relative group cursor-pointer">
                                        <div className="aspect-[3/4] bg-[#111] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 ease-out">
                                            <img
                                                src={actor.photo.startsWith('/uploads') ? `http://localhost:5000${actor.photo}` : actor.photo}
                                                alt={actor.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.backgroundColor = '#222'; }}
                                            />
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-xs font-bold text-white uppercase truncate">{actor.name}</p>
                                            <p className="text-[10px] text-gray-500 font-mono truncate">{actor.characterName}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {movie.status === 'upcoming' ? (
                        <div id="booking" className="mb-12">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#555] mb-8 flex items-center justify-between">
                                <span>Release Information</span>
                                <span className="text-blue-500">Coming Soon</span>
                            </h3>
                            <div className="bg-[#111] p-8 rounded-2xl border border-gray-800 text-center">
                                <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">event_upcoming</span>
                                <h2 className="text-2xl font-bold text-white mb-2">Releasing on {new Date(movie.releaseDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                                <p className="text-gray-400">Tickets will be available for booking closer to the release date.</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-6 px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div id="booking" className="mb-12">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#555] mb-8 flex items-center justify-between">
                                <span>Select Showtime</span>
                                <span className="text-red-500 animate-pulse">● Live Booking</span>
                            </h3>

                            {uniqueDates.length > 0 && (
                                <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
                                    {uniqueDates.map(dateStr => {
                                        const date = new Date(dateStr);
                                        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                                        const dayNum = date.getDate();
                                        const month = date.toLocaleDateString('en-US', { month: 'short' });
                                        const isSelected = selectedDate === dateStr;

                                        return (
                                            <button
                                                key={dateStr}
                                                onClick={() => setSelectedDate(dateStr)}
                                                className={`flex flex-col items-center justify-center min-w-[60px] h-[80px] rounded-xl transition-all duration-300 cursor-pointer ${isSelected ? 'bg-red-600 text-white shadow-lg scale-105' : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222] hover:text-white'}`}
                                            >
                                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{month}</span>
                                                <span className="text-xl font-black leading-none my-1">{dayNum}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{day}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {filteredScreens.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredScreens.map((screen, idx) => (
                                        <div key={idx} className="group relative bg-[#111] hover:bg-[#161616] transition-colors border-l-2 border-transparent hover:border-red-600 p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                                <div>
                                                    <h4 className="text-xl font-bold uppercase tracking-tight">
                                                        {screen.partnerName || screen.screenName}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 font-mono mt-1">
                                                        {screen.partnerName ? (
                                                            <>
                                                                {screen.screenName}
                                                                {screen.location && ` • ${screen.location}`}
                                                            </>
                                                        ) : (
                                                            screen.location || ''
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                {screen.showtimes.map((slot, sIdx) => (
                                                    <button
                                                        key={sIdx}
                                                        onClick={() => {
                                                            if (user) {
                                                                navigate(`/book/${screen.screenId}/${slot._id}`);
                                                            } else {
                                                                navigate('/login', { state: { from: location } });
                                                            }
                                                        }}
                                                        className="relative py-3 px-2 bg-[#222] hover:bg-white hover:text-black transition-all group-item cursor-pointer group/tooltip"
                                                    >

                                                        {slot.stats && (
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max bg-white text-black p-3 rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-50">
                                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
                                                                <div className="relative flex gap-4 text-center">
                                                                    {slot.stats.map((stat, i) => (
                                                                        <div key={i} className="flex flex-col items-center min-w-[60px]">
                                                                            <span className="text-sm font-bold">₹{stat.price}</span>
                                                                            <span className="text-[10px] uppercase font-bold text-gray-500">{stat.category}</span>
                                                                            <span className={`text-[10px] font-bold ${stat.status === 'Available' ? 'text-green-500' :
                                                                                stat.status === 'Fast Filling' ? 'text-orange-500' :
                                                                                    'text-red-500'
                                                                                }`}>
                                                                                {stat.status}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <span className="block text-sm font-bold">{formatTime(slot.time)}</span>
                                                        <span className="block text-[8px] uppercase tracking-widest mt-1 opacity-60">
                                                            {new Date(slot.date).getDate()} {new Date(slot.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                                                        </span>

                                                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#111] rounded-full group-hover:bg-[#161616]"></div>
                                                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#111] rounded-full group-hover:bg-[#161616]"></div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 border border-dashed border-[#333] text-center font-mono text-gray-500">
                                    NO SHOWTIMES AVAILABLE
                                </div>
                            )}
                        </div>
                    )}


                    {(movie.crew && movie.crew.length > 0) && (
                        <div className="border-t border-[#222] pt-8">
                            <div className="grid grid-cols-2 gap-8">
                                {movie.crew.slice(0, 4).map((member, i) => (
                                    <div key={i}>
                                        <p className="text-[10px] text-[#555] uppercase tracking-widest">{member.role}</p>
                                        <p className="text-sm font-bold text-gray-300">{member.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
            {isReviewing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#111] border border-gray-800 rounded-2xl p-8 w-full max-w-sm text-center relative shadow-2xl">
                        <button
                            onClick={() => setIsReviewing(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <h3 className="text-2xl font-bold text-white mb-2">Rate this Movie</h3>
                        <p className="text-sm text-gray-400 mb-8">How was your experience watching {movie.title}?</p>

                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setTempRating(star)}
                                    onClick={() => setTempRating(star)}
                                    className={`transition-all transform hover:scale-110 ${star <= tempRating ? 'text-yellow-500' : 'text-gray-600'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-4xl fill-current">star</span>
                                </button>
                            ))}
                        </div>

                        <div className="mb-6">
                            <label className="block text-left text-xs font-bold text-gray-500 mb-2">Your Review (Required)</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts about the movie..."
                                className="w-full h-24 bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-600 resize-none"
                            ></textarea>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleRate}
                                disabled={tempRating === 0 || !comment.trim()}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${tempRating > 0 && comment.trim()
                                    ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showTrailer && movie.trailerLink && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
                    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                        <button
                            onClick={() => setShowTrailer(false)}
                            className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <iframe
                            src={getYouTubeEmbedUrl(movie.trailerLink)}
                            title="Movie Trailer"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieDetails;
