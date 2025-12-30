import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import AdminPartnerScreens from './AdminPartnerScreens';

const AdminPartners = () => {
    const { token } = useContext(AuthContext);
    const [partners, setPartners] = useState([]);
    const [partnerData, setPartnerData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        address: '',
        location: ''
    });
    const [partnerLoading, setPartnerLoading] = useState(false);
    const [partnerMessage, setPartnerMessage] = useState('');
    const [partnerError, setPartnerError] = useState('');

    const [editingPartnerId, setEditingPartnerId] = useState(null);
    const [managingPartner, setManagingPartner] = useState(() => {
        const saved = localStorage.getItem('adminManagingPartner');
        return saved ? JSON.parse(saved) : null;
    });
    const formRef = useRef(null);

    const [selectedCity, setSelectedCity] = useState(localStorage.getItem('adminSelectedCity') || 'All');

    useEffect(() => {
        localStorage.setItem('adminSelectedCity', selectedCity);
    }, [selectedCity]);

    useEffect(() => {
        if (managingPartner) {
            localStorage.setItem('adminManagingPartner', JSON.stringify(managingPartner));
        } else {
            localStorage.removeItem('adminManagingPartner');
        }
    }, [managingPartner]);

    const cities = [...new Set(partners.map(p => p.location).filter(l => l && l.trim() !== ''))];

    const filteredPartners = selectedCity === 'All'
        ? partners
        : partners.filter(p => p.location === selectedCity);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const res = await axios.get('http://localhost:5000/api/admin/partners', config);
            setPartners(res.data);
        } catch (err) {
            console.error('Error fetching partners:', err);
        }
    };

    const handlePartnerChange = (e) => {
        setPartnerData({ ...partnerData, [e.target.name]: e.target.value });
    };

    const handleCreateOrUpdatePartner = async (e) => {
        e.preventDefault();
        setPartnerLoading(true);
        setPartnerMessage('');
        setPartnerError('');

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            if (editingPartnerId) {
                await axios.put(`http://localhost:5000/api/admin/partners/${editingPartnerId}`, partnerData, config);
                setPartnerMessage('Partner updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/admin/partners', partnerData, config);
                setPartnerMessage('Partner created successfully!');
            }

            setPartnerData({
                name: '',
                email: '',
                password: '',
                mobile: '',
                address: '',
                location: ''
            });
            setEditingPartnerId(null);
            fetchPartners();
        } catch (err) {
            setPartnerError(err.response?.data?.message || 'Failed to save partner');
        } finally {
            setPartnerLoading(false);
        }
    };

    const handleEditClick = (partner) => {
        setPartnerData({
            name: partner.name,
            email: partner.email,
            password: '',
            mobile: partner.mobile,
            address: partner.address || '',
            location: partner.location || ''
        });
        setEditingPartnerId(partner._id);
        setPartnerMessage('');
        setPartnerError('');
        setPartnerMessage('');
        setPartnerError('');
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleCancelEdit = () => {
        setPartnerData({
            name: '',
            email: '',
            password: '',
            mobile: '',
            address: '',
            location: ''
        });
        setEditingPartnerId(null);
        setPartnerMessage('');
        setPartnerError('');
    };

    const handleDeletePartner = async (id) => {
        if (window.confirm('Are you sure you want to delete this partner?')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                await axios.delete(`http://localhost:5000/api/admin/partners/${id}`, config);
                fetchPartners();
            } catch (err) {
                console.error('Error deleting partner:', err);
                setPartnerError('Failed to delete partner');
            }
        }
    };



    if (managingPartner) {
        return (
            <div>
                <button
                    onClick={() => setManagingPartner(null)}
                    className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Partners List
                </button>
                <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800">Managing Screens for: <span className="text-teal-600">{managingPartner.name}</span></h2>
                    <p className="text-sm text-gray-500">Full control over screens, seats, and showtimes.</p>
                </div>
                <AdminPartnerScreens partnerId={managingPartner._id} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div ref={formRef} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {editingPartnerId ? 'Edit Partner' : 'Create New Partner'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {editingPartnerId ? 'Update partner details.' : 'Add a theater owner or partner to the platform.'}
                        </p>
                    </div>
                    {editingPartnerId && (
                        <button
                            onClick={handleCancelEdit}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                <div className="p-8">
                    {partnerMessage && (
                        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 border border-green-200 flex items-center">
                            <span className="material-symbols-outlined mr-2">check_circle</span>
                            {partnerMessage}
                        </div>
                    )}
                    {partnerError && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 border border-red-200 flex items-center">
                            <span className="material-symbols-outlined mr-2">error</span>
                            {partnerError}
                        </div>
                    )}

                    <form onSubmit={handleCreateOrUpdatePartner} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Partner Name</label>
                            <input
                                type="text"
                                name="name"
                                value={partnerData.name}
                                onChange={handlePartnerChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="e.g. Cinema World"
                                required
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile"
                                value={partnerData.mobile}
                                onChange={handlePartnerChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="e.g. 9876543210"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address (Login ID)</label>
                            <input
                                type="email"
                                name="email"
                                value={partnerData.email}
                                onChange={handlePartnerChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="partner@example.com"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Password {editingPartnerId && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={partnerData.password}
                                onChange={handlePartnerChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="••••••••"
                                required={!editingPartnerId}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={partnerData.address}
                                onChange={handlePartnerChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Theater Address"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Location (City/Area)</label>
                            <input
                                type="text"
                                name="location"
                                value={partnerData.location}
                                onChange={handlePartnerChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="e.g. Mumbai, Andheri West"
                            />
                        </div>

                        <div className="col-span-2 mt-4">
                            <button
                                type="submit"
                                disabled={partnerLoading}
                                className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 shadow-md"
                            >
                                {partnerLoading ? 'Processing...' : (editingPartnerId ? 'Update Partner' : 'Create Partner Account')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>


            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Registered Partners</h3>
                        <p className="text-sm text-gray-500">List of all current partners.</p>
                    </div>

                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                    >
                        <option value="All">All Locations</option>
                        {cities.map((city, index) => (
                            <option key={index} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold selection:bg-none">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4 text-center">Manage</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPartners.length > 0 ? (
                                filteredPartners.map((partner) => (
                                    <tr key={partner._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 font-medium">{partner.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{partner.email}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {partner.location}
                                            <br />
                                            <span className="text-xs text-gray-400">{partner.address}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setManagingPartner(partner)}
                                                className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition"
                                            >
                                                Screens
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEditClick(partner)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 rounded hover:bg-blue-50 transition cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeletePartner(partner._id)}
                                                className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded hover:bg-red-50 transition cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No partners found in {selectedCity}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPartners;
