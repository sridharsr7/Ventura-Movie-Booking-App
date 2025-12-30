import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const BookingPage = () => {
    const { screenId, showtimeId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);

    const [screen, setScreen] = useState(null);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [screenRes, bookedRes] = await Promise.all([
                    axios.get(`/api/partner/screens/${screenId}`),
                    axios.get(`/api/bookings/showtime/${screenId}/${showtimeId}`)
                ]);

                setScreen(screenRes.data);
                setBookedSeats(bookedRes.data);
            } catch (err) {
                console.error("Error fetching booking data:", err);
                setError("Failed to load seating chart.");
            } finally {
                setLoading(false);
            }
        };

        if (screenId && showtimeId) {
            fetchData();
            const interval = setInterval(fetchData, 5000);
            return () => clearInterval(interval);
        }
    }, [screenId, showtimeId]);


    const [showTermsModal, setShowTermsModal] = useState(false);

    const handleSeatClick = (rowIndex, colIndex, price, label) => {
        const isSelected = selectedSeats.some(s => s.row === rowIndex && s.col === colIndex);

        if (isSelected) {
            setSelectedSeats(selectedSeats.filter(s => !(s.row === rowIndex && s.col === colIndex)));
        } else {
            if (selectedSeats.length >= 10) {
                alert("You can only select up to 10 seats.");
                return;
            }
            setSelectedSeats([...selectedSeats, { row: rowIndex, col: colIndex, price, label }]);
        }
    };

    const handleBooking = () => {
        if (!user) {
            navigate('/login', { state: { from: location } });
            return;
        }
        if (selectedSeats.length === 0) return;
        setShowTermsModal(true);
    };

    const confirmBooking = () => {
        const showtime = screen.showtimes.find(st => st._id === showtimeId);
        const baseTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

        navigate('/bill-summary', {
            state: {
                screenId,
                movieId: showtime.movie,
                showtimeId,
                showDate: showtime.date,
                showTime: showtime.time,
                seats: selectedSeats,
                screenName: screen.name,
                baseTotal
            }
        });
        setShowTermsModal(false);
    };

    const isSeatBooked = (r, c) => {
        return bookedSeats.some(s => s.row === r && s.col === c);
    };

    const isSeatSelected = (r, c) => {
        return selectedSeats.some(s => s.row === r && s.col === c);
    };

    const getSeatStatus = (r, c) => {
        if (!screen) return 'standard';
        const special = screen.specialSeats.find(s => s.row === r && s.col === c);
        if (special) return special.status;
        return 'standard';
    };

    const isRowFullGap = (row) => {
        if (!screen) return false;
        for (let c = 0; c < screen.columns; c++) {
            const status = getSeatStatus(row, c);
            if (status === 'standard') return false;
        }
        return true;
    };

    const getRowLabel = (targetRow) => {
        let visualRowIndex = 0;
        if (isRowFullGap(targetRow)) return "";

        for (let r = 0; r < targetRow; r++) {
            if (!isRowFullGap(r)) {
                visualRowIndex++;
            }
        }
        return String.fromCharCode(65 + visualRowIndex);
    };

    const getSeatLabel = (r, c) => {
        const rowLabel = getRowLabel(r);
        return `${rowLabel}${c + 1}`;
    };

    const getPriceRanges = () => {
        if (!screen || !screen.rows) return [];
        const ranges = [];
        let currentPrice = null;
        let startRow = 0;
        let isRangeActive = false;

        for (let r = 0; r < screen.rows; r++) {
            if (isRowFullGap(r)) {
                if (isRangeActive) {
                    ranges.push({ start: startRow, end: r - 1, price: currentPrice });
                    isRangeActive = false;
                    currentPrice = null;
                }
                continue;
            }

            const rowLabel = getRowLabel(r);
            const price = (screen.rowPrices && screen.rowPrices[rowLabel]) ? Number(screen.rowPrices[rowLabel]) : 150;

            if (!isRangeActive) {
                currentPrice = price;
                startRow = r;
                isRangeActive = true;
            } else if (price !== currentPrice) {
                ranges.push({ start: startRow, end: r - 1, price: currentPrice });
                currentPrice = price;
                startRow = r;
            }
        }
        if (isRangeActive) {
            ranges.push({ start: startRow, end: screen.rows - 1, price: currentPrice });
        }
        return ranges;
    };


    if (loading) return (
        <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-mono text-sm uppercase tracking-widest animate-pulse">Loading Cinema...</p>
            </div>
        </div>
    );
    if (error) return <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center text-red-500 font-mono">{error}</div>;

    const grid = [];
    for (let r = 0; r < screen.rows; r++) {
        const rowSeats = [];
        for (let c = 0; c < screen.columns; c++) {
            rowSeats.push({ r, c });
        }
        grid.push(rowSeats);
    }

    const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden selection:bg-red-500 selection:text-black">


            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>


            <header className="relative z-10 w-full p-6 flex justify-between items-start border-b border-white/5 bg-black/50 backdrop-blur-sm">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2 text-sm uppercase tracking-widest font-bold"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back
                    </button>
                    <h1 className="text-3xl font-black uppercase tracking-tight italic">{screen.name}</h1>
                    <p className="text-gray-500 text-xs font-mono mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • Live Booking
                    </p>
                </div>
            </header>


            <main className="flex-1 relative z-10 flex flex-col items-center justify-center pt-8 pb-32 px-4 overflow-y-auto w-full">






                <div className="flex flex-col gap-3 items-center w-full overflow-x-auto pb-12 no-scrollbar">
                    {(() => {
                        let lastPrice = null;
                        let lastRowName = null;
                        let lastRowWasGap = false;
                        return grid.map((row, rIdx) => {
                            const rowLabel = getRowLabel(rIdx);
                            const price = (screen.rowPrices && screen.rowPrices[rowLabel]) ? Number(screen.rowPrices[rowLabel]) : 150;
                            const rowName = (screen.rowNames && screen.rowNames[rowLabel]) ? screen.rowNames[rowLabel] : '';
                            const isGap = isRowFullGap(rIdx) || (rowName && rowName.toUpperCase() === 'GAP');
                            let header = null;

                            if (!isGap && !lastRowWasGap && (price !== lastPrice || rowName !== lastRowName)) {
                                header = (
                                    <div key={`header-${rIdx}`} className="w-full flex items-center justify-center gap-4 my-4 opacity-80">
                                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-500"></div>
                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                                            ₹ {price}
                                            {(screen.rowNames && screen.rowNames[getRowLabel(rIdx)]) && (
                                                <span className="text-white ml-2 text-xs border border-white/20 px-2 py-0.5 rounded bg-white/5">
                                                    {screen.rowNames[getRowLabel(rIdx)]}
                                                </span>
                                            )}
                                        </span>
                                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-500"></div>
                                    </div>
                                );
                            }

                            if (!isGap) {
                                lastPrice = price;
                                lastRowName = rowName;
                            }
                            lastRowWasGap = isGap;


                            return (
                                <React.Fragment key={rIdx}>
                                    {header}
                                    <div className="flex items-center gap-6 group/row hover:bg-white/5 px-4 py-1 rounded-xl transition-colors duration-300">
                                        <span className="w-4 text-center text-[10px] text-gray-600 font-bold font-mono group-hover/row:text-white transition-colors">
                                            {isGap ? '' : getRowLabel(rIdx)}
                                        </span>

                                        <div className="flex gap-3">
                                            {row.map(({ r, c }) => {
                                                const status = getSeatStatus(r, c);
                                                const booked = isSeatBooked(r, c);
                                                const selected = isSeatSelected(r, c);
                                                const label = getSeatLabel(r, c);

                                                if (isGap || status === 'gap') return <div key={`${r}-${c}`} className="w-8"></div>;

                                                let baseClass = "w-8 h-8 rounded-t-lg text-[9px] font-bold flex items-center justify-center transition-all duration-200 transform relative cursor-pointer group/seat ";

                                                if (booked) {
                                                    baseClass += "bg-[#1a1a1a] text-[#333] cursor-not-allowed border border-[#222]";
                                                } else if (status === 'disabled' || status === 'damaged') {
                                                    baseClass += "invisible";
                                                } else if (selected) {
                                                    baseClass += "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] scale-110 z-10 border border-red-500";
                                                } else {
                                                    baseClass += "bg-[#111] text-gray-500 border border-white/10 hover:border-white/50 hover:bg-[#222] hover:text-white hover:scale-110 hover:z-20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]";
                                                }

                                                return (
                                                    <div key={`${r}-${c}`} className="relative">
                                                        <button
                                                            disabled={booked || status !== 'standard'}
                                                            onClick={() => handleSeatClick(r, c, price, label)}
                                                            className={baseClass}
                                                        >
                                                            {selected ? '' : label.substring(1)}
                                                            {selected && <span className="material-symbols-outlined text-sm font-bold">check</span>}


                                                            <div className="absolute -bottom-1 left-0 w-full h-1 bg-black/50 rounded-b-sm"></div>
                                                        </button>


                                                        {!booked && status === 'standard' && (
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[10px] font-bold rounded opacity-0 group-hover/seat:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-xl">
                                                                {label} • ₹{price}
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        });
                    })()}
                </div>


                <div className="w-full max-w-4xl mt-12 mb-16 relative perspective-[1000px] group">
                    <div className="relative w-full h-16 bg-gradient-to-t from-white/20 to-transparent transform -rotate-x-12 origin-bottom rounded-[0_0_50%_50%_/_0_0_100%_100%] shadow-[0_-20px_50px_rgba(255,255,255,0.1)] border-b border-white/30">

                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    </div>
                    <p className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-[0.5em] font-bold">Screen This Way</p>
                </div>


                <div className={`fixed bottom-0 left-0 w-full z-40 bg-black/90 backdrop-blur-md border-t border-white/10 py-4 shadow-2xl transition-all duration-500 transform ${selectedSeats.length > 0 ? 'translate-y-full' : 'translate-y-0'}`}>
                    <div className="flex justify-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-[#111] border border-white/20"></div>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Available</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-red-600 border border-red-500 shadow-[0_0_5px_rgba(220,38,38,0.5)]"></div>
                            <span className="text-[10px] uppercase tracking-wider text-white font-bold">Selected</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-[#1a1a1a] border border-[#222]"></div>
                            <span className="text-[10px] uppercase tracking-wider text-gray-600 font-bold">Booked</span>
                        </div>
                    </div>
                </div>

            </main>


            <div className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-500 ease-in-out ${selectedSeats.length > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/10"></div>
                <div className="container mx-auto max-w-5xl px-6 py-6 relative flex flex-col md:flex-row items-center justify-between gap-6">

                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="hidden md:block">
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Seats Selected</span>
                            <div className="flex gap-2">
                                {selectedSeats.map(s => (
                                    <span key={s.label} className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">{s.label}</span>
                                ))}
                            </div>
                        </div>
                        <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                        <div>
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Total Amount</span>
                            <span className="text-3xl font-black text-white tracking-tight">₹ {totalPrice}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleBooking}
                        disabled={processing}
                        className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:shadow-[0_15px_40px_rgba(220,38,38,0.5)] transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group cursor-pointer"
                    >
                        {processing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Proceed to Pay'}
                        {!processing && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                    </button>
                </div>
            </div>


            {showTermsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowTermsModal(false)}></div>
                    <div className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500">gavel</span>
                                Terms & Conditions
                            </h3>
                            <div className="text-xs text-gray-400 space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                <p>1. Wearing a face mask and following other Covid guidelines are mandatory (As per the directions from your local authorities).</p>
                                <p className="text-red-400">2. Cinema reserves the right to cancel or modify showtimes without prior notice due to low occupancy, technical issues, or other operational reasons.</p>
                                <p className="text-red-400">3. Kindly check the selected show is an AM or PM (Early morning or Midnight).</p>
                                <p className="text-red-400">4. A Customer Under the Influence of Alcohol will not be allowed inside the Cinema. Ticket Amount will not be Refunded.</p>
                                <p>5. No Seat Delivery for Online Food & Beverage Order.</p>
                                <p>6. Outside Food & Beverages is not Allowed inside the Cinema.</p>
                                <p>7. Smoking is Strictly Prohibited inside the Premises.</p>
                                <p>8. Post 1 hour of the showtime Customers will not be permitted inside the cinema.</p>
                                <p>9. Tickets are compulsory for children above 3 years of Age.</p>
                                <p>10. Children below the Age of 18 Can't be allowed for 'A' Certified Movies.</p>
                                <p>11. Decisions taken by Management is Final & Abiding.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-[#1a1a1a] flex gap-4 border-t border-white/5">
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-sm uppercase tracking-wider cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBooking}
                                disabled={processing}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {processing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Accept'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default BookingPage;
