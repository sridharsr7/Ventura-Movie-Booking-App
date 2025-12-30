import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import CityContext from '../context/CityContext';

const Home = () => {
    const navigate = useNavigate();
    const { selectedCity } = useContext(CityContext);
    const [currentSlide, setCurrentSlide] = useState(0);

    const heroSlides = [
        {
            id: 1,
            title: "Epic Adventures Await",
            subtitle: "Experience the magic of cinema",
            image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop",
            color: "from-purple-900 to-black"
        },
        {
            id: 2,
            title: "Blockbuster Movies",
            subtitle: "Watch the latest hits",
            image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
            color: "from-blue-900 to-black"
        },
        {
            id: 3,
            title: "Cinema Paradise",
            subtitle: "Book your tickets now",
            image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
            color: "from-red-900 to-black"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const [movies, setMovies] = useState([]);
    const [upcomingMovies, setUpcomingMovies] = useState([]);

    useEffect(() => {
        const fetchMoviesByCity = async () => {
            try {
                const res = await axios.get(`/api/movies?city=${selectedCity}`);
                setMovies(res.data);
            } catch (err) {
                console.error('Error fetching movies:', err);
            }
        };

        fetchMoviesByCity();

    }, [selectedCity]);

    useEffect(() => {
        const fetchUpcomingMovies = async () => {
            try {
                const res = await axios.get('/api/movies?status=upcoming');
                setUpcomingMovies(res.data);
            } catch (err) {
                console.error('Error fetching upcoming movies:', err);
            }
        };

        fetchUpcomingMovies();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden">
            <Navbar />

            <div className="relative h-[600px] w-full overflow-hidden">
                {heroSlides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-60 mix-blend-multiply z-10`}></div>
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover transform scale-105" // Slight zoom effect
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-20"></div>

                        <div className="absolute z-30 bottom-20 left-0 w-full">
                            <div className="container mx-auto px-6">
                                <h2 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl animate-fade-in-up">
                                    {slide.title}
                                </h2>
                                <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl drop-shadow-md">
                                    {slide.subtitle}
                                </p>
                                <button
                                    onClick={() => {
                                        const element = document.getElementById('recommended-movies');
                                        if (element) {
                                            element.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-xl cursor-pointer"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="absolute bottom-6 right-6 z-30 flex gap-2">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-4 bg-gray-500'}`}
                        />
                    ))}
                </div>
            </div>

            <div id="recommended-movies" className="container mx-auto px-6 py-16">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-1">Recommended Movies</h2>
                        <p className="text-gray-400">Handpicked just for you</p>
                    </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {movies.length > 0 ? (
                        movies.map((movie) => (
                            <div
                                key={movie._id}
                                onClick={() => navigate(`/movie/${movie._id}`)}
                                className="group relative rounded-xl overflow-hidden cursor-pointer"
                            >
                                <div className="aspect-[2/3] w-full overflow-hidden rounded-xl">
                                    <img
                                        src={movie.poster && movie.poster.startsWith('/uploads') ? `${movie.poster}` : movie.poster}
                                        alt={movie.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }}
                                    />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-lg font-bold truncate">{movie.title}</h3>
                                    <p className="text-sm text-gray-300 mb-2">{movie.genre}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-yellow-500 text-sm font-bold">
                                            <span className="material-icons text-sm mr-1">star</span>
                                            {movie.averageRating ? movie.averageRating.toFixed(1) : '0'}/10
                                            <span className="text-xs text-gray-400 ml-1 font-normal">({movie.totalVotes || 0} Votes)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-500 py-12">
                            <span className="material-symbols-outlined text-4xl mb-3">movie_off</span>
                            <p>No movies showing in {selectedCity} right now.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 pb-16">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-1">Upcoming Movies</h2>
                        <p className="text-gray-400">Coming soon to theaters near you</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {upcomingMovies.length > 0 ? (
                        upcomingMovies.map((movie) => (
                            <div
                                key={movie._id}
                                onClick={() => navigate(`/movie/${movie._id}`)}
                                className="group relative rounded-xl overflow-hidden cursor-pointer grayscale hover:grayscale-0 transition-all duration-500"
                            >
                                <div className="aspect-[2/3] w-full overflow-hidden rounded-xl">
                                    <img
                                        src={movie.poster && movie.poster.startsWith('/uploads') ? `${movie.poster}` : movie.poster}
                                        alt={movie.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }}
                                    />
                                </div>
                                <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Coming Soon
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-lg font-bold truncate">{movie.title}</h3>
                                    <p className="text-sm text-gray-300 mb-2">{movie.genre}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-400">
                                            {new Date(movie.releaseDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-500 py-12">
                            <span className="material-symbols-outlined text-4xl mb-3">event_busy</span>
                            <p>No upcoming movies announced yet.</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Home;
