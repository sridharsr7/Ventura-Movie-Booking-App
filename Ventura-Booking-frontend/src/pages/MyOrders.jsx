import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import QRCode from 'react-qr-code';

const MyOrders = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const res = await axios.get('/api/bookings/user', config);
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setOrdersLoading(false);
        }
    };

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
        <div className="min-h-screen bg-gray-900 text-white font-sans pt-24 pb-12 px-4 md:px-0">
            <div className="container mx-auto max-w-4xl">


                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
                        My Orders
                    </h2>
                    <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">
                        <span className="material-symbols-outlined">home</span>
                    </button>
                </div>

                <div className="space-y-6 animate-fade-in-up">
                    {ordersLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                        </div>
                    ) : orders.length > 0 ? (
                        orders.map((order) => (
                            <div
                                key={order._id}
                                onClick={() => navigate(`/orders/${order._id}`)}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row border border-gray-700 max-w-4xl mx-auto cursor-pointer hover:scale-[1.01] transition-transform duration-300 group"
                            >

                                <div className="w-full md:w-3/4 p-6 flex flex-col md:flex-row gap-6 bg-gradient-to-br from-gray-900 to-black text-white relative">
                                    <div className="w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl border border-gray-700 mx-auto md:mx-0">
                                        {order.movie && (
                                            <img
                                                src={order.movie.poster && order.movie.poster.startsWith('/uploads') ? `${order.movie.poster}` : order.movie.poster}
                                                alt={order.movie.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-2xl font-bold mb-2 text-white">{order.movie?.title || 'Unknown Movie'}</h3>
                                        <p className="text-gray-400 text-sm mb-4 uppercase tracking-widest">{order.screen?.partner?.name || 'Partner'} - {order.screen?.name}</p>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-gray-800 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 uppercase">Date</p>
                                                <p className="font-bold">{new Date(order.showDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="bg-gray-800 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 uppercase">Time</p>
                                                <p className="font-bold">{formatTime(order.showTime)}</p>
                                            </div>
                                            <div className="bg-gray-800 p-3 rounded-lg col-span-2">
                                                <p className="text-xs text-gray-500 uppercase">Seats</p>
                                                <p className="font-bold text-red-500 overflow-hidden text-ellipsis">
                                                    {order.seats.map(s => `${String.fromCharCode(65 + s.row)}${s.col + 1}`).join(', ')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'confirmed' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                                }`}>
                                                {order.status}
                                            </span>
                                            <span className="ml-4 text-xs text-gray-500">
                                                Order ID: <span className="font-mono">{order._id.slice(-6).toUpperCase()}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 flex flex-col justify-between items-center overflow-hidden hidden md:flex">
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className="w-4 h-4 rounded-full bg-gray-900 -mr-2"></div>
                                        ))}
                                        <div className="absolute right-[50%] h-full border-l-2 border-dashed border-gray-700"></div>
                                    </div>
                                </div>


                                <div className="w-full md:w-1/4 bg-white p-6 flex flex-col items-center justify-center border-l-2 border-dashed border-gray-300 relative">

                                    <div className="absolute -left-3 top-[-10px] w-6 h-6 bg-gray-900 rounded-full md:hidden"></div>
                                    <div className="absolute -left-3 bottom-[-10px] w-6 h-6 bg-gray-900 rounded-full md:hidden"></div>

                                    <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest text-center">Scan Entry</p>
                                    <div className="p-2 bg-white border-4 border-black rounded-lg">
                                        <QRCode
                                            value={order._id}
                                            size={120}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                    <p className="mt-4 text-[10px] text-gray-400 text-center font-mono">
                                        {order._id}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-12 bg-gray-800 rounded-2xl border border-gray-700">
                            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">receipt_long</span>
                            <p className="text-xl">No orders found.</p>
                            <button onClick={() => navigate('/')} className="mt-4 text-red-500 hover:text-red-400 underline">
                                Browse Movies
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOrders;
