import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserAppointments } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';

const StatCard = ({ icon, label, value, color, bg }) => (
    <div className={`p-6 rounded-[2rem] border-2 ${bg} flex items-center gap-5 transition-all hover:scale-[1.02] cursor-default bg-white`}>
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm font-bold`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-black text-gray-800 tracking-tight">{value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
    </div>
);

const HEALTH_TIPS = [
    "Stay hydrated! Aim for at least 8 glasses of water a day.",
    "A 30-minute walk daily can boost your cardiovascular health significantly.",
    "Make sure to get 7-9 hours of quality sleep every night.",
    "An apple a day keeps the doctor away! Don't forget your fruits.",
    "Remember to take short breaks every 45 minutes when working on a computer.",
    "Regular health check-ups can help find problems before they start.",
    "Practice mindfulness or meditation for 10 minutes to reduce stress."
];

import AdminDashboardPage from './AdminDashboardPage';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tip, setTip] = useState("");

    useEffect(() => {
        if (!user || user.role === 'admin') return;
        setLoading(true);
        const load = async () => {
            try {
                const { data } = await getUserAppointments();
                setAppointments(data);
            } catch {
                setAppointments([]);
            } finally {
                setLoading(false);
            }
        };
        load();
        setTip(HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)]);
    }, [user]);

    const pending = appointments.filter((a) => a.status === 'Pending').length;
    const approved = appointments.filter((a) => a.status === 'Approved').length;
    const rejected = appointments.filter((a) => a.status === 'Rejected').length;

    const recent = appointments.slice(0, 5);

    if (user?.role === 'admin') return <AdminDashboardPage />;

    return (
        <DashboardLayout>
            {/* Header with Greeting & Health Tip */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-800">
                        Welcome back, <span className="text-primary-500">{user?.name?.split(' ')[0]}</span>! ✨
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 font-medium max-w-md">Your health dashboard is up to date. How are you feeling today?</p>
                </div>
                
                <div className="bg-indigo-50/50 border-2 border-indigo-100 p-5 rounded-[2rem] max-w-xs relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">💡</div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Health Tip of the Day</p>
                    <p className="text-xs font-bold text-indigo-600 leading-relaxed italic">"{tip}"</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        <StatCard icon="📋" label="Total" value={appointments.length} color="bg-blue-50 text-blue-600" bg="border-blue-50" />
                        <StatCard icon="⏳" label="Pending" value={pending} color="bg-yellow-50 text-yellow-600" bg="border-yellow-50" />
                        <StatCard icon="✅" label="Approved" value={approved} color="bg-green-50 text-green-600" bg="border-green-50" />
                        <StatCard icon="❌" label="Rejected" value={rejected} color="bg-red-50 text-red-600" bg="border-red-50" />
                    </div>

                    {/* AI Chatbot CTA Banner */}
                    <div className="mb-10 relative overflow-hidden bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-200">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-md text-center md:text-left">
                                <h2 className="text-2xl font-black mb-3">Not sure which doctor to see? </h2>
                                <p className="text-primary-100 font-medium text-sm leading-relaxed mb-6">
                                    Our AI assistant can analyze your symptoms and recommend the right specialist in your area instantly.
                                </p>
                                <button 
                                    onClick={() => navigate('/dashboard/chatbot')}
                                    className="bg-white text-primary-600 font-black px-8 py-3.5 rounded-2xl shadow-lg hover:bg-black hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto md:mx-0"
                                >
                                    <span>Try AI Health Assistant</span>
                                    <span className="text-xl">🤖</span>
                                </button>
                            </div>
                            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center text-7xl animate-pulse">
                                🤖
                            </div>
                        </div>
                        {/* Decorative blobs */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Recent Appointments */}
                        <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-gray-800">Recent Appointments</h2>
                                <Link to="/dashboard/appointments" className="text-xs font-black text-primary-600 hover:text-black uppercase tracking-widest border-b-2 border-primary-100 pb-0.5 transition-colors">
                                    View full history →
                                </Link>
                            </div>

                            {recent.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                                    <div className="text-5xl mb-4">📭</div>
                                    <h3 className="text-lg font-bold text-gray-800">No appointments found</h3>
                                    <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">Get started by booking your first medical consultation through our platform.</p>
                                    <Link to="/dashboard/book" className="btn-primary inline-flex mt-6 px-10">
                                        Book Now
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-50">
                                                <th className="text-left py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Doctor</th>
                                                <th className="text-left py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Specialist</th>
                                                <th className="text-left py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                                <th className="text-left py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {recent.map((appt) => (
                                                <tr key={appt._id} className="group transition-colors hover:bg-primary-50/30">
                                                    <td className="py-5 px-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-sm font-bold text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">👨‍⚕️</div>
                                                            <span className="font-bold text-gray-800">{appt.doctorId?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-2">
                                                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight group-hover:bg-white transition-colors">{appt.doctorId?.specialization}</span>
                                                    </td>
                                                    <td className="py-5 px-2 font-bold text-gray-500">
                                                        {new Date(appt.date).toLocaleDateString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="py-5 px-2">
                                                        <StatusBadge status={appt.status} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Quick Access Sidebar */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                                <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-tight">Quick Access</h3>
                                <div className="space-y-4">
                                    <Link to="/dashboard/book" className="flex items-center gap-4 p-4 rounded-2xl bg-primary-50 border-2 border-transparent hover:border-primary-200 transition-all group">
                                        <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">📅</div>
                                        <div>
                                            <p className="font-extrabold text-gray-800 text-sm">New Appointment</p>
                                            <p className="text-[11px] font-bold text-primary-400 uppercase">Book in minutes</p>
                                        </div>
                                    </Link>
                                    <Link to="/dashboard/hospitals" className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 border-2 border-transparent hover:border-indigo-200 transition-all group">
                                        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">🏥</div>
                                        <div>
                                            <p className="font-extrabold text-gray-800 text-sm">Find Hospitals</p>
                                            <p className="text-[11px] font-bold text-indigo-400 uppercase">Browse providers</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="bg-black rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                                <h3 className="text-xl font-black mb-2">Need Help?</h3>
                                <p className="text-gray-400 text-xs font-medium leading-relaxed mb-6">Our support team is available 24/7 for any urgent queries.</p>
                                <a href="mailto:support@medibook.health" className="flex items-center gap-2 text-primary-400 font-black text-sm hover:text-white transition-colors">
                                    Contact Support →
                                </a>
                                <div className="absolute -bottom-6 -right-6 text-9xl opacity-10 rotate-12">☎️</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
};

export default DashboardPage;
