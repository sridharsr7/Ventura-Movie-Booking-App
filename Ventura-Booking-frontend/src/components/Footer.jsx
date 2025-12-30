import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-black py-12 border-t border-gray-800">
            <div className="container mx-auto px-6 text-center">
                <Link to="/" className="inline-block text-2xl font-bold mb-6 bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
                    Ventura Booking
                </Link>
                <div className="flex justify-center gap-8 text-gray-400 mb-8 flex-wrap">
                    <Link to="/about" className="hover:text-white transition">About Us</Link>
                    <Link to="/contact" className="hover:text-white transition">Contact</Link>
                    <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
                </div>
                <p className="text-gray-600">© 2025 Ventura Inc. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
