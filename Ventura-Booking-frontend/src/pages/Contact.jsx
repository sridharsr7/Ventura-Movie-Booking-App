import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthContext from '../context/AuthContext';

const Contact = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/contact', formData);
            alert("Thanks for contacting us! We'll get back to you shortly.");
            setFormData(prev => ({ ...prev, message: '' }));
        } catch (error) {
            console.error("Error sending message", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <Navbar />

            <div className="pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
                        <p className="text-gray-400">We'd love to hear from you. Our team is always here to chat.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-xl">
                            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>

                            {!user ? (
                                <div className="text-center py-8">
                                    <span className="material-symbols-outlined text-5xl text-gray-500 mb-4">lock</span>
                                    <h3 className="text-xl font-bold mb-2">Login Required</h3>
                                    <p className="text-gray-400 mb-6">Please sign in to send us a message.</p>
                                    <button
                                        onClick={() => navigate('/login', { state: { from: location } })}
                                        className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-lg"
                                    >
                                        Sign In
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
                                        <input
                                            required
                                            type="text"
                                            readOnly
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed outline-none"
                                            value={formData.name}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            readOnly
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed outline-none"
                                            value={formData.email}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                                        <textarea
                                            required
                                            rows="4"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Type your message here..."
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Sending...' : 'SendMessage'}
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="space-y-8">
                            <div className="bg-gray-800/30 p-8 rounded-2xl border border-gray-700 hover:border-red-500/50 transition-colors">
                                <span className="material-symbols-outlined text-4xl text-red-500 mb-4">location_on</span>
                                <h3 className="text-xl font-bold mb-2">Headquarters</h3>
                                <p className="text-gray-400">
                                    123 Cinema Boulevard,<br />
                                    Entertainment District,<br />
                                    Chennai, Tamil Nadu 600001
                                </p>
                            </div>

                            <div className="bg-gray-800/30 p-8 rounded-2xl border border-gray-700 hover:border-red-500/50 transition-colors">
                                <span className="material-symbols-outlined text-4xl text-red-500 mb-4">mail</span>
                                <h3 className="text-xl font-bold mb-2">Email Us</h3>
                                <p className="text-gray-400">
                                    support@venturabooking.com<br />
                                    partners@venturabooking.com
                                </p>
                            </div>

                            <div className="bg-gray-800/30 p-8 rounded-2xl border border-gray-700 hover:border-red-500/50 transition-colors">
                                <span className="material-symbols-outlined text-4xl text-red-500 mb-4">call</span>
                                <h3 className="text-xl font-bold mb-2">Call Us</h3>
                                <p className="text-gray-400">
                                    +91 98765 43210<br />
                                    Mon - Fri, 9am - 6pm
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Contact;
