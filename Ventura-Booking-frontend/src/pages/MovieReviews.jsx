import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MovieReviews = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const movieRes = await axios.get(`/api/movies/${id}`);
                setMovie(movieRes.data);

                const reviewsRes = await axios.get(`/api/movies/${id}/reviews`);
                setReviews(reviewsRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="w-1 h-32 bg-red-600 animate-pulse"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-6 md:p-12">
            <button
                onClick={() => navigate(-1)}
                className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                Back to Movie
            </button>

            <div className="max-w-4xl mx-auto">
                <div className="mb-12 border-b border-gray-800 pb-8">
                    <h1 className="text-4xl font-bold mb-2">Reviews</h1>
                    <h2 className="text-xl text-gray-500">{movie?.title}</h2>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-yellow-500 material-symbols-outlined text-2xl">star</span>
                        <span className="text-2xl font-bold">{movie?.averageRating ? movie.averageRating.toFixed(1) : '0'}/10</span>
                        <span className="text-gray-500">({movie?.totalVotes} votes)</span>
                    </div>
                </div>

                {reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-[#111] border border-gray-800 p-6 rounded-xl hover:border-gray-700 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold">
                                            {review.user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold">{review.user?.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full">
                                        <span className="text-yellow-500 material-symbols-outlined text-sm">star</span>
                                        <span className="text-yellow-500 font-bold">{review.rating}/10</span>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">"{review.comment}"</p>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-50">rate_review</span>
                        <p className="text-xl">No reviews yet.</p>
                        <p className="text-sm mt-2">Be the first to rate this movie!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieReviews;
