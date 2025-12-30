
import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const PartnerReport = () => {
    const { token } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', msg: '' });

        const formData = new FormData();
        formData.append('title', title);
        formData.append('message', message);
        if (file) {
            formData.append('attachment', file);
        }

        try {
            await axios.post('http://localhost:5000/api/partner/report', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setStatus({ type: 'success', msg: 'Report submitted successfully!' });
            setTitle('');
            setMessage('');
            setFile(null);
            document.getElementById('fileInput').value = "";
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to submit report' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-teal-600">report_problem</span>
                Submit a Report
            </h2>

            {status.msg && (
                <div className={`p-4 rounded-lg mb-6 ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.msg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Report Title / Subject</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                        placeholder="Brief summary of the issue"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Detailed Description</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none"
                        placeholder="Describe your issue or request in detail..."
                        required
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Attachment (Optional)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="space-y-1 text-center">
                            <span className="material-symbols-outlined text-4xl text-gray-400">cloud_upload</span>
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="fileInput" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input id="fileInput" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                            {file && <p className="text-sm font-semibold text-teal-600 mt-2">Selected: {file.name}</p>}
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                            Sending...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">send</span>
                            Submit Report
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default PartnerReport;
