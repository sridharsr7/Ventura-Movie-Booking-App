import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <Navbar />

            <div className="pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl font-bold mb-8 pb-4 border-b border-gray-800">Privacy Policy</h1>

                    <div className="space-y-8 text-gray-300 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                            <p className="mb-4">
                                At Ventura Booking, we collect information that you provide directly to us when you create an account, make a booking, or communicate with us. This includes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Personal identification (Name, Email, Phone number)</li>
                                <li>Payment information (processed securely by third-party providers)</li>
                                <li>Booking history and preferences</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                            <p>
                                We use the information we collect to provide, maintain, and improve our services, including:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li>Processing your bookings and sending confirmations.</li>
                                <li>Sending you updates, security alerts, and support messages.</li>
                                <li>Personalizing your experience and recommending movies.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
                            <p>
                                We implement appropriate technical measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Cookies</h2>
                            <p>
                                We use cookies to understand your usage of our website and improve user experience. You can choose to disable cookies through your browser settings, but this may affect some functionality of our site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at <span className="text-red-500">privacy@venturabooking.com</span>.
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

export default PrivacyPolicy;
