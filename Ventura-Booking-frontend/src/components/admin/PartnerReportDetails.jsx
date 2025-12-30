
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const PartnerReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/admin/partner-reports/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReport(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching report details:", err);
                setLoading(false);
            }
        };

        fetchReportDetails();
    }, [id, token]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/admin/partner-reports/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReport(res.data);
            setReport(prev => ({ ...prev, status: newStatus }));
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!report) {
        return <div className="p-6">Report not found.</div>;
    }

    return (
        <div className="animate-fade-in p-6 max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/admin/dashboard/partner-reports')}
                className="mb-6 flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
                <span className="material-symbols-outlined mr-2">arrow_back</span>
                Back to Reports
            </button>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Report Details</h2>
                        <p className="text-gray-500 text-sm mt-1">ID: {report._id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {report.status === 'pending' && (
                            <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full uppercase text-sm">New</span>
                        )}
                        {report.status === 'viewed' && (
                            <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full uppercase text-sm">Viewed</span>
                        )}
                        {report.status === 'resolved' && (
                            <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full uppercase text-sm">Completed</span>
                        )}
                    </div>
                </div>

                <div className="p-8 grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Partner Information</h3>
                        <div className="space-y-4">
                            {report.partner ? (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wide">Name</label>
                                        <p className="font-medium text-gray-900">{report.partner.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                                        <p className="font-medium text-gray-900">{report.partner.email}</p>
                                    </div>

                                    <div className="pt-2 mt-2 border-t border-dashed">
                                        <p className="text-xs text-green-600 font-semibold mb-2">
                                            <span className="material-symbols-outlined text-sm align-middle mr-1">verified_user</span>
                                            Verified Partner
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wide">Mobile Number</label>
                                        <p className="font-medium text-gray-900">{report.partner.mobile}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wide">Location</label>
                                        <p className="font-medium text-gray-900">{report.partner.location}</p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Partner information not available.</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Message Content</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Title</label>
                                <p className="font-bold text-gray-900 text-lg">{report.title}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Sent At</label>
                                <p className="font-medium text-gray-900">{new Date(report.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Message</label>
                                <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {report.message}
                                </div>
                            </div>
                            {report.attachment && (
                                <div className="mt-4">
                                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Attachment</label>
                                    <a
                                        href={`http://localhost:5000/${report.attachment}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-3 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors w-full justify-center"
                                    >
                                        <span className="material-symbols-outlined">attachment</span>
                                        Download / View Attachment
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    {report.status !== 'viewed' && report.status !== 'resolved' && (
                        <button
                            onClick={() => handleStatusUpdate('viewed')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                            Mark as Viewed
                        </button>
                    )}

                    {report.status !== 'resolved' ? (
                        <button
                            onClick={() => handleStatusUpdate('resolved')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">check</span>
                            Mark as Completed
                        </button>
                    ) : (
                        <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">done_all</span>
                            Already Completed
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartnerReportDetails;
