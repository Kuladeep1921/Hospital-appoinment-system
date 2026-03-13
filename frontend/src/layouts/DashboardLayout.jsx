import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Chatbot from '../components/Chatbot';

const navItems = [
    {
        to: '/dashboard',
        label: 'Dashboard',
        end: true,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        to: '/dashboard/book',
        label: 'Book Appointment',
        end: false,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        to: '/dashboard/appointments',
        label: 'My Appointments',
        end: false,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
    },
    {
        to: '/dashboard/hospitals',
        label: 'Find Hospitals',
        end: false,
        icon: (
            <span className="w-5 h-5 flex items-center justify-center text-[18px]">🏥</span>
        ),
    },
    {
        to: '/dashboard/chatbot',
        label: 'AI Health Assistant',
        end: false,
        icon: (
            <span className="w-5 h-5 flex items-center justify-center text-[18px]">🤖</span>
        ),
    },
];

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isAdmin = user?.role === 'admin';

    const getNavItems = () => {
        if (isAdmin) {
            return [
                {
                    to: '/dashboard',
                    label: 'Dashboard',
                    end: true,
                    icon: navItems[0].icon,
                },
                {
                    to: '/dashboard/admin/appointments',
                    label: 'Manage Appointments',
                    end: false,
                    icon: navItems[2].icon,
                },
                {
                    to: '/dashboard/admin/hospitals',
                    label: 'Hospitals',
                    end: false,
                    icon: (
                        <span className="w-5 h-5 flex items-center justify-center text-[18px]">🏥</span>
                    ),
                },
                {
                    to: '/dashboard/admin/doctors',
                    label: 'Doctors',
                    end: false,
                    icon: (
                        <span className="w-5 h-5 flex items-center justify-center text-[18px]">👨‍⚕️</span>
                    ),
                },
                {
                    to: '/dashboard/admin/patients',
                    label: 'Patients',
                    end: false,
                    icon: (
                        <span className="w-5 h-5 flex items-center justify-center text-[18px]">👥</span>
                    ),
                },
                {
                    to: '/dashboard/admin/walkin',
                    label: 'Walk-in Booking',
                    end: false,
                    icon: (
                        <span className="w-5 h-5 flex items-center justify-center text-[18px]">🚶</span>
                    ),
                }
            ];
        }

        return navItems;
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-lg z-30
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none
        `}
            >
                {/* Logo */}
                <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
                    <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-gray-800">
                        Medi<span className="text-primary-500">Book</span>
                    </span>
                </div>

                {/* User Info */}
                <div className="px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 bg-primary-50 rounded-xl p-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                            <p className="text-xs text-primary-600 font-medium capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="p-4 flex flex-col gap-1 flex-1">
                    {getNavItems().map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
                {/* Mobile topbar */}
                <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between lg:hidden shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="text-lg font-bold text-gray-800">
                        Medi<span className="text-primary-500">Book</span>
                    </span>
                    <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

                {/* Chatbot for Patients */}
                {!isAdmin && <Chatbot />}
            </div>
        </div>
    );
};

export default DashboardLayout;
