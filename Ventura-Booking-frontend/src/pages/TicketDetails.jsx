import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import QRCode from 'react-qr-code';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`/api/bookings/${id}`, config);
                setBooking(res.data);
            } catch (err) {
                console.error("Error fetching ticket:", err);
                setError("Failed to load ticket details.");
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchBooking();
    }, [id, token]);

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
    );

    if (error || !booking) return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white gap-4">
            <p className="text-xl text-red-500">{error || "Ticket not found"}</p>
            <button onClick={() => navigate('/my-orders')} className="text-gray-400 hover:text-white underline">Back to Orders</button>
        </div>
    );

   

    const basePrice = booking.seats.reduce((sum, seat) => sum + (seat.price || 0), 0);
    const feesAndTax = booking.totalAmount - basePrice;


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
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans py-12 px-4 flex justify-center items-start">
            <div className="w-full max-w-3xl bg-[#111] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">

                <div className="bg-gradient-to-r from-red-900 to-black p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <button
                        onClick={() => navigate('/my-orders')}
                        className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back
                    </button>

                    <div className="mt-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                        <div className="w-32 h-48 rounded-lg overflow-hidden shadow-lg border border-white/20 flex-shrink-0">
                            <img
                                src={booking.movie.poster && booking.movie.poster.startsWith('/uploads') ? `${booking.movie.poster}` : booking.movie.poster}
                                alt={booking.movie.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">{booking.movie.title}</h1>
                            <p className="text-gray-300 text-lg">{booking.screen.partner.name} - {booking.screen.name}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                                <div className="bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Date</p>
                                    <p className="font-mono">{new Date(booking.showDate).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Time</p>
                                    <p className="font-mono">{formatTime(booking.showTime)}</p>
                                </div>
                                <div className="bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Booking ID</p>
                                    <p className="font-mono text-yellow-500">{booking._id.slice(-6).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                        <div>
                            <h3 className="text-gray-500 uppercase tracking-widest text-sm font-bold mb-6">Seat Details</h3>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {booking.seats.map((seat, i) => (
                                    <div key={i} className="bg-gray-800 px-3 py-2 rounded border border-gray-700 flex flex-col items-center min-w-[60px]">
                                        <span className="text-xs text-gray-500 font-bold">{seat.label}</span>
                                        <span className="font-mono text-sm">₹{seat.price}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2 rounded">
                                        <QRCode
                                            value={booking._id}
                                            size={64}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Scan at Entry</p>
                                        <p className="text-xs text-gray-500">{booking.status === 'confirmed' ? 'Booking Confirmed' : 'Cancelled'}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {booking.status}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 rounded-2xl p-6 md:p-8 border border-gray-800">
                            <h3 className="text-gray-500 uppercase tracking-widest text-sm font-bold mb-6">Payment Summary</h3>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between text-gray-300">
                                    <span>Ticket Price ({booking.seats.length} Seats)</span>
                                    <span className="font-mono">₹{basePrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Convenience Fees & Tax</span>
                                    <span className="font-mono">₹{feesAndTax.toFixed(2)}</span>
                                </div>

                                <div className="border-t border-gray-700 my-4 pt-4 flex justify-between items-center">
                                    <span className="font-bold text-lg text-white">Total Amount</span>
                                    <span className="font-bold text-2xl text-red-500 font-mono">₹{booking.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-xs text-gray-600 mb-2">Payment completed via Online</p>
                                <button
                                    onClick={() => window.print()}
                                    className="w-full py-3 border border-gray-700 hover:bg-gray-800 rounded-xl transition-colors text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">print</span>
                                    Print Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-2 bg-gradient-to-r from-red-600 via-purple-600 to-red-600"></div>
            </div>
        </div>
    );
};

export default TicketDetails;
