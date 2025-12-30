import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const AdminMovies = () => {
    const { token } = useContext(AuthContext);
    const [movies, setMovies] = useState([]);
    const [showMovieForm, setShowMovieForm] = useState(false);
    const [editingMovieId, setEditingMovieId] = useState(null);
    const [movieData, setMovieData] = useState({
        title: '',
        description: '',
        poster: '',
        trailerLink: '',
        genre: '',
        language: '',
        duration: '',
        releaseDate: '',
        releaseDate: '',
        status: 'upcoming',
        format: '2D',
        cast: [],
        crew: []
    });
    const [posterFile, setPosterFile] = useState(null);
    const formRef = useRef(null);
    const [movieLoading, setMovieLoading] = useState(false);

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const res = await axios.get('/api/movies?all=true');
            setMovies(res.data);
        } catch (err) {
            console.error('Error fetching movies:', err);
        }
    };

    const handleMovieChange = (e) => {
        setMovieData({ ...movieData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setPosterFile(e.target.files[0]);
    };

    const addCastMember = () => {
        setMovieData({ ...movieData, cast: [...movieData.cast, { name: '', role: '', characterName: '', photo: '', photoFile: null }] });
    };

    const removeCastMember = (index) => {
        const newCast = [...movieData.cast];
        newCast.splice(index, 1);
        setMovieData({ ...movieData, cast: newCast });
    };

    const updateCastMember = (index, field, value) => {
        const newCast = [...movieData.cast];
        if (field === 'photoFile') {
            newCast[index].photoFile = value;
            newCast[index].isNewFile = true;
        } else {
            newCast[index][field] = value;
        }
        setMovieData({ ...movieData, cast: newCast });
    };

    const addCrewMember = () => {
        setMovieData({ ...movieData, crew: [...movieData.crew, { name: '', role: '', photo: '', photoFile: null }] });
    };

    const removeCrewMember = (index) => {
        const newCrew = [...movieData.crew];
        newCrew.splice(index, 1);
        setMovieData({ ...movieData, crew: newCrew });
    };

    const updateCrewMember = (index, field, value) => {
        const newCrew = [...movieData.crew];
        if (field === 'photoFile') {
            newCrew[index].photoFile = value;
            newCrew[index].isNewFile = true;
        } else {
            newCrew[index][field] = value;
        }
        setMovieData({ ...movieData, crew: newCrew });
    };

    const handleMovieSubmit = async (e) => {
        e.preventDefault();
        setMovieLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', movieData.title);
            formData.append('description', movieData.description);
            formData.append('genre', movieData.genre);
            formData.append('language', movieData.language);
            formData.append('duration', movieData.duration);
            formData.append('releaseDate', movieData.releaseDate);
            formData.append('status', movieData.status);
            formData.append('format', movieData.format);
            formData.append('trailerLink', movieData.trailerLink);

            if (posterFile) {
                formData.append('poster', posterFile);
            } else {
                formData.append('poster', movieData.poster);
            }

            const castForJson = movieData.cast.map(c => ({
                name: c.name,
                role: c.role,
                characterName: c.characterName,
                photo: c.photo,
                isNewFile: c.isNewFile
            }));
            formData.append('cast', JSON.stringify(castForJson));

            movieData.cast.forEach((member) => {
                if (member.photoFile) {
                    formData.append('castPhotos', member.photoFile);
                }
            });

            const crewForJson = movieData.crew.map(c => ({
                name: c.name,
                role: c.role,
                photo: c.photo,
                isNewFile: c.isNewFile
            }));
            formData.append('crew', JSON.stringify(crewForJson));

            movieData.crew.forEach((member) => {
                if (member.photoFile) {
                    formData.append('crewPhotos', member.photoFile);
                }
            });


            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            };

            if (editingMovieId) {
                await axios.put(`/api/movies/${editingMovieId}`, formData, config);
                alert('Movie updated successfully');
            } else {
                await axios.post('/api/movies', formData, config);
                alert('Movie added successfully');
            }

            cancelMovieEdit();
            fetchMovies();
        } catch (err) {
            console.error('Error saving movie:', err);
            alert('Failed to save movie');
        } finally {
            setMovieLoading(false);
        }
    };

    const handleEditMovieClick = (movie) => {
        setMovieData({
            title: movie.title,
            description: movie.description,
            poster: movie.poster,
            trailerLink: movie.trailerLink || '',
            genre: movie.genre,
            language: movie.language,
            duration: movie.duration,
            releaseDate: movie.releaseDate.split('T')[0],
            releaseDate: movie.releaseDate.split('T')[0],
            status: movie.status,
            format: movie.format || '2D',
            cast: movie.cast || [],
            crew: movie.crew || []
        });
        setPosterFile(null);
        setEditingMovieId(movie._id);
        setShowMovieForm(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleDeleteMovie = async (id) => {
        if (window.confirm('Are you sure you want to delete this movie?')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                await axios.delete(`/api/movies/${id}`, config);
                fetchMovies();
            } catch (err) {
                console.error('Error deleting movie:', err);
                alert('Failed to delete movie');
            }
        }
    };

    const cancelMovieEdit = () => {
        setMovieData({
            title: '',
            description: '',
            poster: '',
            trailerLink: '',
            genre: '',
            language: '',
            duration: '',
            releaseDate: '',
            releaseDate: '',
            status: 'upcoming',
            format: '2D',
            cast: [],
            crew: []
        });
        setPosterFile(null);
        setEditingMovieId(null);
        setShowMovieForm(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Movies Management</h2>
                <button
                    onClick={() => {
                        setShowMovieForm(!showMovieForm);
                        if (showMovieForm) cancelMovieEdit();
                    }}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${showMovieForm ? 'bg-gray-200 text-gray-800' : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                >
                    {showMovieForm ? 'Cancel' : 'Add New Movie'}
                </button>
            </div>

            {showMovieForm && (
                <div ref={formRef} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
                    <h3 className="text-xl font-bold mb-6">{editingMovieId ? 'Edit Movie' : 'Add New Movie'}</h3>
                    <form onSubmit={handleMovieSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Movie Title</label>
                            <input
                                type="text"
                                name="title"
                                value={movieData.title}
                                onChange={handleMovieChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Poster Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            />
                            {movieData.poster && <p className="text-xs text-green-600 mt-1">Current: {movieData.poster}</p>}
                        </div>
                        <div className="col-span-2 md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Trailer Link (Youtube/Embed URL)</label>
                            <input
                                type="text"
                                name="trailerLink"
                                value={movieData.trailerLink}
                                onChange={handleMovieChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                placeholder="https://www.youtube.com/embed/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Genre</label>
                            <input
                                type="text"
                                name="genre"
                                value={movieData.genre}
                                onChange={handleMovieChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                required
                                placeholder="Action, Drama, Sci-Fi"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Language</label>
                            <input
                                type="text"
                                name="language"
                                value={movieData.language}
                                onChange={handleMovieChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                required
                                placeholder="English, Hindi, Tamil"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="Hours"
                                        min="0"
                                        value={Math.floor(movieData.duration / 60) || 0}
                                        onChange={(e) => {
                                            const h = parseInt(e.target.value) || 0;
                                            const m = movieData.duration % 60;
                                            setMovieData({ ...movieData, duration: (h * 60) + m });
                                        }}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                        required
                                    />
                                    <span className="text-xs text-gray-500 mt-1 block">Hours</span>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="Mins"
                                        min="0"
                                        max="59"
                                        value={movieData.duration % 60 || 0}
                                        onChange={(e) => {
                                            const m = parseInt(e.target.value) || 0;
                                            const h = Math.floor(movieData.duration / 60);
                                            setMovieData({ ...movieData, duration: (h * 60) + m });
                                        }}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                        required
                                    />
                                    <span className="text-xs text-gray-500 mt-1 block">Minutes</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Release Date</label>
                            <input
                                type="date"
                                name="releaseDate"
                                value={movieData.releaseDate}
                                onChange={handleMovieChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                            <select
                                name="status"
                                value={movieData.status}
                                onChange={handleMovieChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="running">Running</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Format</label>
                            <select
                                name="format"
                                value={movieData.format}
                                onChange={handleMovieChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                <option value="2D">2D</option>
                                <option value="3D">3D</option>
                                <option value="4DX">4DX</option>
                                <option value="IMAX 2D">IMAX 2D</option>
                                <option value="IMAX 3D">IMAX 3D</option>
                                <option value="SCREEN X">SCREEN X</option>
                                <option value="All">All</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={movieData.description}
                                onChange={handleMovieChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-24"
                                required
                            ></textarea>
                        </div>


                        <div className="col-span-2 border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-bold text-gray-700">Cast</h4>
                                <button type="button" onClick={addCastMember} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">+ Add Cast</button>
                            </div>
                            <div className="space-y-4">
                                {movieData.cast.map((member, index) => (
                                    <div key={index} className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-lg">
                                        <div className="flex-1 min-w-[150px]">
                                            <input placeholder="Name" value={member.name} onChange={(e) => updateCastMember(index, 'name', e.target.value)} className="w-full px-3 py-1 border rounded" required />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <input placeholder="Role (e.g. Hero)" value={member.role} onChange={(e) => updateCastMember(index, 'role', e.target.value)} className="w-full px-3 py-1 border rounded" required />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <input placeholder="Character Name" value={member.characterName} onChange={(e) => updateCastMember(index, 'characterName', e.target.value)} className="w-full px-3 py-1 border rounded" required />
                                        </div>
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs text-gray-500 mb-1">Photo</label>
                                            <input type="file" accept="image/*" onChange={(e) => updateCastMember(index, 'photoFile', e.target.files[0])} className="w-full text-xs" />
                                            {member.photo && !member.photoFile && <span className="text-[10px] text-green-600 block truncate">{member.photo}</span>}
                                        </div>
                                        <button type="button" onClick={() => removeCastMember(index)} className="text-red-500 hover:text-red-700"><span className="material-symbols-outlined">delete</span></button>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className="col-span-2 border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-bold text-gray-700">Crew</h4>
                                <button type="button" onClick={addCrewMember} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">+ Add Crew</button>
                            </div>
                            <div className="space-y-4">
                                {movieData.crew.map((member, index) => (
                                    <div key={index} className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-lg">
                                        <div className="flex-1 min-w-[150px]">
                                            <input placeholder="Name" value={member.name} onChange={(e) => updateCrewMember(index, 'name', e.target.value)} className="w-full px-3 py-1 border rounded" required />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <input placeholder="Role (e.g. Director)" value={member.role} onChange={(e) => updateCrewMember(index, 'role', e.target.value)} className="w-full px-3 py-1 border rounded" required />
                                        </div>
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs text-gray-500 mb-1">Photo</label>
                                            <input type="file" accept="image/*" onChange={(e) => updateCrewMember(index, 'photoFile', e.target.files[0])} className="w-full text-xs" />
                                            {member.photo && !member.photoFile && <span className="text-[10px] text-green-600 block truncate">{member.photo}</span>}
                                        </div>
                                        <button type="button" onClick={() => removeCrewMember(index)} className="text-red-500 hover:text-red-700"><span className="material-symbols-outlined">delete</span></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <button
                                type="submit"
                                disabled={movieLoading}
                                className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {movieLoading ? 'Processing...' : (editingMovieId ? 'Update Movie' : 'Add Movie')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Running Movies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {movies.filter(m => m.status === 'running').length > 0 ? (
                        movies.filter(m => m.status === 'running').map(movie => (
                            <div key={movie._id} className="group relative rounded-xl overflow-hidden shadow-lg bg-gray-900 aspect-[2/3]">
                                <img
                                    src={movie.poster && movie.poster.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${movie.poster}` : movie.poster}
                                    alt={movie.title}
                                    className="w-full h-full object-cover group-hover:opacity-50 transition"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }}
                                />
                                <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/90 to-transparent">
                                    <h4 className="text-white font-bold text-lg">{movie.title}</h4>
                                    <p className="text-gray-300 text-sm">{movie.language} • {movie.genre}</p>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => handleEditMovieClick(movie)}
                                            className="flex-1 bg-blue-600 text-white py-1 rounded text-xs font-bold hover:bg-blue-700 cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMovie(movie._id)}
                                            className="flex-1 bg-red-600 text-white py-1 rounded text-xs font-bold hover:bg-red-700 cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                    Running
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full">No running movies found.</p>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Upcoming Movies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {movies.filter(m => m.status === 'upcoming').length > 0 ? (
                        movies.filter(m => m.status === 'upcoming').map(movie => (
                            <div key={movie._id} className="group relative rounded-xl overflow-hidden shadow-lg bg-gray-900 aspect-[2/3]">
                                <img
                                    src={movie.poster && movie.poster.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${movie.poster}` : movie.poster}
                                    alt={movie.title}
                                    className="w-full h-full object-cover group-hover:opacity-50 transition"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }}
                                />
                                <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/90 to-transparent">
                                    <h4 className="text-white font-bold text-lg">{movie.title}</h4>
                                    <p className="text-gray-300 text-sm">{movie.language} • {movie.genre}</p>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => handleEditMovieClick(movie)}
                                            className="flex-1 bg-blue-600 text-white py-1 rounded text-xs font-bold hover:bg-blue-700 cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMovie(movie._id)}
                                            className="flex-1 bg-red-600 text-white py-1 rounded text-xs font-bold hover:bg-red-700 cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                    Upcoming
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full">No upcoming movies found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMovies;
