import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';

const BookingSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [bookingDetails, setBookingDetails] = useState(null);

    useEffect(() => {
        if (location.state && location.state.booking) {
            setBookingDetails({
                ...location.state.booking,
                screenName: location.state.screenName 
            });
        }
    }, [location]);

    if (!bookingDetails) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

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
        <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-red-600/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

            <div className="relative z-10 w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                    <span className="material-symbols-outlined text-4xl text-black font-bold">check</span>
                </div>

                <h1 className="text-3xl font-black uppercase italic mb-2">Booking Confirmed!</h1>
                <p className="text-gray-400 text-sm mb-8">Your ticket has been successfully booked.</p>

                <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 mb-8 relative overflow-hidden">
                    <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#111] rounded-full"></div>
                    <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#111] rounded-full"></div>

                    <div className="mb-6">
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Booking ID</p>
                        <p className="text-lg font-mono text-white tracking-wider">{bookingDetails._id}</p>
                    </div>

                    <div className="bg-white p-2 rounded-xl w-32 h-32 mx-auto mb-6">
                        <QRCode
                            value={bookingDetails._id}
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Screen</p>
                            <p className="font-bold text-sm truncate">{bookingDetails.screenName || 'Screen'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Amount</p>
                            <p className="font-bold text-sm text-red-500">₹ {bookingDetails.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Date</p>
                            <p className="font-bold text-sm">{new Date(bookingDetails.showDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Time</p>
                            <p className="font-bold text-sm">{formatTime(bookingDetails.showTime)}</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-dashed border-white/10 text-left">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Seats</p>
                        <div className="flex flex-wrap gap-2">
                            {bookingDetails.seats.map((seat, i) => (
                                <span key={i} className="bg-white/10 px-2 py-1 rounded text-xs font-bold text-gray-300">{seat.label}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/my-orders')}
                        className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        View My Orders
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 bg-transparent border border-white/10 text-gray-400 font-bold rounded-xl hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccess;
