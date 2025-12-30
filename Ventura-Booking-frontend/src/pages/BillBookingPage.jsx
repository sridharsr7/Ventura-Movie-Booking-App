import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const BillBookingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);


    if (!location.state) {
        return (
            <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white gap-4">
                <p>No booking session found.</p>
                <button onClick={() => navigate('/')} className="text-red-500 hover:underline">Go Home</button>
            </div>
        );
    }

    const {
        screenId,
        movieId,
        showtimeId,
        showDate,
        showTime,
        seats,
        screenName,
        baseTotal
    } = location.state;

    const [processing, setProcessing] = useState(false);

    const CONVENIENCE_FEE = 49.00;
    const IGST_RATE = 0.18;
    const igstAmount = CONVENIENCE_FEE * IGST_RATE;
    const finalTotal = baseTotal + CONVENIENCE_FEE + igstAmount;

    const formatTime = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m < 10 ? '0' + m : m} ${ampm}`;
    };

    const handlePayment = async () => {
        setProcessing(true);
        try {
            const bookingData = {
                screenId,
                movieId,
                showtimeId,
                showDate,
                showTime,
                seats,
                totalAmount: finalTotal
            };

            const res = await axios.post('/api/bookings', bookingData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            navigate('/booking-success', {
                state: {
                    booking: res.data,
                    screenName: screenName
                }
            });
        } catch (err) {
            console.error("Booking failed:", err);
            alert(err.response?.data?.message || "Booking Failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">

            <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-900/20 blur-[150px] rounded-full pointer-events-none z-0"></div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">


                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm uppercase tracking-widest font-bold"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back to Seat Selection
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full pointer-events-none z-0"></div>

                            <h2 className="text-2xl font-black uppercase tracking-tight italic mb-1 relative z-10 text-white">Booking Summary</h2>
                            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-6">Review your order</p>

                            <div className="space-y-6 relative z-10">

                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Screen</span>
                                    <span className="text-lg font-bold text-white">{screenName || 'Cinema Screen'}</span>
                                </div>

                                <div className="flex gap-8">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Date</span>
                                        <span className="text-white font-mono text-sm">{new Date(showDate).toDateString()}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Time</span>
                                        <span className="text-white font-mono text-sm">{formatTime(showTime)}</span>
                                    </div>
                                </div>


                                <div>
                                    <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2 block">Seats Selected ({seats.length})</span>
                                    <div className="flex flex-wrap gap-2">
                                        {seats.map((seat, index) => (
                                            <span key={index} className="bg-white/10 border border-white/10 px-3 py-1 rounded text-xs font-bold text-white">
                                                {seat.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="col-span-1">
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500">receipt_long</span>
                                    Bill Details
                                </h3>

                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between items-center text-gray-300">
                                        <span>Ticket Price ({seats.length} x Seats)</span>
                                        <span className="font-mono">₹ {baseTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-400">
                                        <span>Convenience Fee</span>
                                        <span className="font-mono">₹ {CONVENIENCE_FEE.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-400">
                                        <span>IGST (18%)</span>
                                        <span className="font-mono">₹ {igstAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="my-6 border-t border-dashed border-white/20"></div>

                                <div className="flex justify-between items-center text-white mb-2">
                                    <span className="font-black uppercase tracking-wider text-sm">Total Payable</span>
                                    <div className="flex items-center gap-1 text-red-500">
                                        <span className="text-xl font-bold">₹</span>
                                        <span className="text-2xl font-black">{finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg hover:shadow-red-900/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {processing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Pay Now <span className="material-symbols-outlined">payments</span>
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-gray-600 text-center mt-3 leading-tight">By clicking Proceed, you agree to our Terms & Conditions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillBookingPage;
