import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfService = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <Navbar />

            <div className="pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl font-bold mb-8 pb-4 border-b border-gray-800">Terms of Service</h1>

                    <div className="space-y-8 text-gray-300 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using Ventura Booking, you agree to comply with and be bound by these Terms of Service. If you do not agree, strictly do not use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Booking Policy</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>All bookings are subject to availability.</li>
                                <li>Tickets once sold cannot be cancelled, exchanged, or refunded unless otherwise stated in our cancellation policy.</li>
                                <li>You must carry the digital ticket or booking ID to the venue.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. User Conduct</h2>
                            <p>
                                You agree not to use the website for any unlawful purpose or any purpose prohibited by these terms. This includes attempting to hack, disrupt, or compromise the integrity of our booking system.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Limitation of Liability</h2>
                            <p>
                                Ventura Booking is an intermediary platform. We are not responsible for the quality of service, show cancellations, or facility issues at the partner theaters. However, we will assist in resolving disputes where possible.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Modifications</h2>
                            <p>
                                We reserve the right to change these terms at any time. Continued use of the service following any changes constitutes acceptance of the new terms.
                            </p>
                        </section>

                        <div className="text-sm text-gray-500 mt-12 pt-8 border-t border-gray-800">
                            Last updated: December 2025
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TermsOfService;
