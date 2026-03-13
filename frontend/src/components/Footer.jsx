import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold text-white">
                                Medi<span className="text-primary-400">Book</span>
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Making healthcare accessible and convenient for everyone. Book appointments with top specialists in minutes.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
                            <li><Link to="/login" className="hover:text-primary-400 transition-colors">Login</Link></li>
                            <li><Link to="/register" className="hover:text-primary-400 transition-colors">Register</Link></li>
                            <li><Link to="/dashboard" className="hover:text-primary-400 transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="flex items-center gap-2">
                                <span>📧</span> support@medibook.health
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📞</span> +1 (800) 123-4567
                            </li>
                            <li className="flex items-center gap-2">
                                <span>🏥</span> Available 24 / 7
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
                    © {new Date().getFullYear()} MediBook. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
