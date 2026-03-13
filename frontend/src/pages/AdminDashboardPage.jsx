import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllAppointments, fetchDoctors } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import Spinner from '../components/Spinner';

const StatCard = ({ icon, label, value, color, bg, onClick }) => (
    <div
        onClick={onClick}
        className={`card border ${bg} flex items-center gap-5 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-purple-200 transition-all duration-300' : ''}`}
    >
        <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
            {icon}
        </div>
        <div>
            <p className="text-3xl font-bold text-gray-800 tracking-tight">{value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">{label}</p>
        </div>
    </div>
);

const AdminDashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [apptRes, docRes] = await Promise.all([
                    getAllAppointments(),
                    fetchDoctors()
                ]);
                setAppointments(apptRes.data);
                setDoctors(docRes.data);
            } catch {
                setAppointments([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const pending = appointments.filter((a) => a.status === 'Pending').length;
    const walkins = appointments.filter((a) => !a.userId).length;
    const online = appointments.length - walkins;

    const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const todayAppointments = appointments.filter(a => {
        return new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) === todayStr;
    });

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 p-6 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/30 text-indigo-100 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-indigo-400/30">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Administrator View
                    </div>
                    <h1 className="text-3xl font-extrabold mb-1">
                        MediBook Headquarters
                    </h1>
                    <p className="text-indigo-200 text-sm max-w-lg">
                        Welcome back, {user?.name}. Manage hospitals, doctors, patients, and global operations from your central command.
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 right-20 w-32 h-32 bg-purple-500 opacity-20 rounded-full translate-y-1/2 blur-xl"></div>
                <div className="absolute top-1/2 right-10 text-8xl opacity-10 blur-sm pointer-events-none">🏥</div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><Spinner size="lg" /></div>
            ) : (
                <>
                    {/* Advanced Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        <StatCard icon="🕒" label="Pending Approval" value={pending} color="bg-orange-100 text-orange-600" bg="border-orange-100/50" onClick={() => navigate('/dashboard/admin/appointments')} />
                        <StatCard icon="🚶" label="Offline Walk-ins" value={walkins} color="bg-rose-100 text-rose-600" bg="border-rose-100/50" onClick={() => navigate('/dashboard/admin/appointments?type=walkin')} />
                        <StatCard icon="📅" label="Today's Bookings" value={todayAppointments.length} color="bg-blue-100 text-blue-600" bg="border-blue-100/50" onClick={() => navigate('/dashboard/admin/appointments?date=today')} />
                        <StatCard icon="👨‍⚕️" label="Total Doctors" value={doctors.length} color="bg-teal-100 text-teal-600" bg="border-teal-100/50" onClick={() => navigate('/dashboard/admin/doctors')} />
                    </div>

                    {/* Admin Actions */}
                    <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">Quick Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                        <Link
                            to="/dashboard/admin/walkin"
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all group flex items-start gap-4"
                        >
                            <div className="w-12 h-12 bg-purple-50 group-hover:bg-purple-500 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-colors">
                                🚶
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 group-hover:text-purple-600">Register Walk-in</p>
                                <p className="text-xs text-gray-500 mt-1">Book for offline patients</p>
                            </div>
                        </Link>

                        <Link
                            to="/dashboard/admin/hospitals"
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group flex items-start gap-4"
                        >
                            <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-500 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-colors">
                                🏥
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 group-hover:text-blue-600">Manage Hospitals</p>
                                <p className="text-xs text-gray-500 mt-1">Add or remove hospitals</p>
                            </div>
                        </Link>

                        <Link
                            to="/dashboard/admin/doctors"
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all group flex items-start gap-4"
                        >
                            <div className="w-12 h-12 bg-teal-50 group-hover:bg-teal-500 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-colors">
                                👨‍⚕️
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 group-hover:text-teal-600">Doctor Directory</p>
                                <p className="text-xs text-gray-500 mt-1">Manage specialists</p>
                            </div>
                        </Link>

                        <Link
                            to="/dashboard/admin/patients"
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group flex items-start gap-4"
                        >
                            <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-500 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-colors">
                                👥
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 group-hover:text-indigo-600">Patient Database</p>
                                <p className="text-xs text-gray-500 mt-1">Manage user accounts</p>
                            </div>
                        </Link>

                        <Link
                            to="/dashboard/admin/appointments"
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group flex items-start gap-4"
                        >
                            <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-500 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-colors">
                                📋
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 group-hover:text-blue-600">Review Requests</p>
                                <p className="text-xs text-gray-500 mt-1">Approve/reject bookings</p>
                            </div>
                        </Link>
                    </div>

                    {/* Quick Overview */}
                    <div className="card border-0 shadow-sm ring-1 ring-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Hospital Traffic Overview</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Online App vs Offline Walk-ins</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5">
                            <div
                                onClick={() => navigate('/dashboard/admin/appointments?type=online')}
                                className="flex items-center gap-4 cursor-pointer hover:shadow-md hover:scale-[1.01] hover:bg-white border border-transparent hover:border-blue-100 p-4 -mx-4 rounded-xl transition-all duration-300"
                            >
                                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-2xl">📱</div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1 text-sm font-semibold">
                                        <span className="text-gray-700">Online Patient Bookings</span>
                                        <span className="text-blue-600">{online}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(online / (appointments.length || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => navigate('/dashboard/admin/appointments?type=walkin')}
                                className="flex items-center gap-4 cursor-pointer hover:shadow-md hover:scale-[1.01] hover:bg-white border border-transparent hover:border-purple-100 p-4 -mx-4 rounded-xl transition-all duration-300"
                            >
                                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-2xl">🏥</div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1 text-sm font-semibold">
                                        <span className="text-gray-700">Offline Walk-in Patients</span>
                                        <span className="text-purple-600">{walkins}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(walkins / (appointments.length || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
};

export default AdminDashboardPage;
