import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <Navbar />

            <div className="relative pt-32 pb-20 px-6">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 to-purple-500 bg-clip-text text-transparent pb-2 leading-tight">
                        Reimagining Cinema
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Ventura is not just a booking platform; it's your gateway to the world of storytelling.
                        We bring the magic of movies closer to you with seamless experiences and premium service.
                    </p>
                </div>
            </div>

            <div className="bg-gray-800/50 py-16">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="p-4">
                            <h3 className="text-4xl font-bold text-white mb-2">1M+</h3>
                            <p className="text-red-500">Tickets Sold</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-4xl font-bold text-white mb-2">500+</h3>
                            <p className="text-red-500">Partner Theaters</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-4xl font-bold text-white mb-2">50+</h3>
                            <p className="text-red-500">Cities</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-4xl font-bold text-white mb-2">4.8/5</h3>
                            <p className="text-red-500">User Rating</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-20 px-6">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="md:w-1/2">
                            <img
                                src="https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=2079&auto=format&fit=crop"
                                alt="Cinema Experience"
                                className="rounded-2xl shadow-2xl shadow-red-500/20"
                            />
                        </div>
                        <div className="md:w-1/2 space-y-6">
                            <h2 className="text-3xl font-bold text-white">Our Mission</h2>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                We believe that watching a movie is more than just entertainment—it's an emotional journey.
                                Our mission is to make that journey effortless from the moment you decide to watch a film until
                                the credits roll.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-red-500/10 p-3 rounded-lg text-red-500">
                                        <span className="material-symbols-outlined">rocket_launch</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Innovation First</h4>
                                        <p className="text-gray-400 text-sm">Constantly pushing boundaries for better UI/UX.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-red-500/10 p-3 rounded-lg text-red-500">
                                        <span className="material-symbols-outlined">favorite</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Customer Centric</h4>
                                        <p className="text-gray-400 text-sm">24/7 support and user-friendly policies.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AboutUs;
