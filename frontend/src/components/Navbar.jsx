import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                    d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-800">
                            Medi<span className="text-primary-500">Book</span>
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-lg hover:bg-primary-50"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="btn-primary text-sm py-2 px-4"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-lg hover:bg-primary-50"
                                >
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
