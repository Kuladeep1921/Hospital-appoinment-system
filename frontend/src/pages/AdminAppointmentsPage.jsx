import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAllAppointments, updateAppointmentStatus, deleteAppointment } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

const AdminAppointmentsPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await getAllAppointments();
                setAppointments(data);
            } catch {
                setAppointments([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        const actionText = status === 'Approved' ? 'accept' : 'reject';
        if (!window.confirm(`Are you sure you want to ${actionText} this appointment?`)) return;
        try {
            const { data } = await updateAppointmentStatus(id, status);
            setAppointments(appointments.map(a => a._id === id ? data : a));
        } catch (error) {
            alert('Failed to update appointment status');
        }
    };

    const handleDelete = async (id) => {
        console.log('Attempting to delete appointment ID:', id);
        if (!window.confirm('Are you sure you want to delete this appointment?')) return;
        try {
            const response = await deleteAppointment(id);
            console.log('Delete API response:', response);
            setAppointments(appointments.filter((a) => a._id !== id));
            alert('Appointment deleted successfully');
        } catch (error) {
            console.error('Delete error details:', error.response || error);
            alert('Failed to delete appointment');
        }
    };

    const filters = ['All', 'Pending', 'Approved', 'Rejected'];

    // Parse URL queries
    const qType = searchParams.get('type');
    const qDate = searchParams.get('date');

    const filtered = appointments.filter((a) => {
        // Status Tabs filter
        if (filter !== 'All' && a.status !== filter) return false;

        // Query Param Type Filter
        if (qType === 'walkin' && a.userId) return false;
        if (qType === 'online' && !a.userId) return false;

        // Query Param Date Filter
        if (qDate === 'today') {
            const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            const apptDateStr = new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            if (apptDateStr !== todayStr) return false;
        }

        return true;
    });

    return (
        <DashboardLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">All Appointments</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage patient appointments across the entire hospital.
                    </p>
                </div>

                {/* Active Filter Badge */}
                {(qType || qDate) && (
                    <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
                        <span className="text-sm font-semibold text-indigo-700">
                            {qType === 'walkin' && "Showing Walk-in Bookings"}
                            {qType === 'online' && "Showing Online Bookings"}
                            {qDate === 'today' && "Showing Today's Bookings"}
                        </span>
                        <button
                            onClick={() => navigate('/dashboard/admin/appointments')}
                            className="bg-indigo-200 hover:bg-indigo-300 text-indigo-800 text-xs font-bold px-2 py-1 rounded-md transition"
                        >
                            Clear Filter ✕
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : (
                <>
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {filters.map((f) => {
                            const count = f === 'All'
                                ? appointments.length
                                : appointments.filter((a) => a.status === f).length;
                            return (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${filter === f
                                        ? 'bg-primary-500 text-white shadow-sm'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                                        }`}
                                >
                                    {f} <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-xs ${filter === f ? 'bg-primary-400 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="card text-center py-16">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-gray-700 font-semibold text-lg">No appointments found</p>
                            <p className="text-gray-400 text-sm mt-2">
                                {filter === 'All'
                                    ? "There are no appointments booked yet."
                                    : `No ${filter.toLowerCase()} appointments.`}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block card overflow-hidden p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                {['#', 'Patient', 'Doctor', 'Date & Time', 'Problem', 'Status', 'Actions'].map((h) => (
                                                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filtered.map((appt, i) => (
                                                <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-5 py-4 text-gray-400 font-medium">{i + 1}</td>
                                                    <td className="px-5 py-4">
                                                        <span className="font-semibold text-gray-800">
                                                            {appt.userId ? appt.userId.name : <span className="text-purple-600">{appt.patientName} (Walk-in)</span>}
                                                        </span>
                                                        <br />
                                                        <span className="text-xs text-gray-400">
                                                            {appt.userId ? appt.userId.phone : appt.patientPhone}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="font-semibold text-gray-800">{appt.doctorId?.name}</span>
                                                        <br />
                                                        <span className="text-xs text-gray-500">{appt.doctorId?.specialization}</span>
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-500">
                                                        <p className="font-medium">{new Date(appt.date).toLocaleDateString('en-US', {
                                                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                                        })}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{appt.timeSlot}</p>
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-500 max-w-xs">
                                                        <p className="truncate">{appt.problem}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <StatusBadge status={appt.status} />
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {appt.status === 'Pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(appt._id, 'Approved')}
                                                                        className="text-green-600 font-medium text-xs px-2.5 py-1.5 bg-green-50 rounded hover:bg-green-100 transition-colors"
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(appt._id, 'Rejected')}
                                                                        className="text-red-600 font-medium text-xs px-2.5 py-1.5 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(appt._id)}
                                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-colors"
                                                            >
                                                                Delete 🗑
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4">
                                {filtered.map((appt) => (
                                    <div key={appt._id} className="card border border-gray-100 hover:shadow-lg transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">Patient: {appt.userId ? appt.userId.name : <span className="text-purple-600">{appt.patientName} (Offline)</span>}</p>
                                                    <p className="text-xs text-gray-500">M.D: {appt.doctorId?.name}</p>
                                                </div>
                                            </div>
                                            <StatusBadge status={appt.status} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                                            <div className="bg-gray-50 rounded-lg p-2.5">
                                                <p className="text-gray-400 mb-0.5">Date & Time</p>
                                                <p className="font-semibold text-gray-700">
                                                    {new Date(appt.date).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric', year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-gray-500">{appt.timeSlot}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-2.5 col-span-2">
                                                <p className="text-gray-400 mb-0.5">Problem</p>
                                                <p className="font-medium text-gray-700 line-clamp-2">{appt.problem}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 border-t pt-3 border-gray-100">
                                            {appt.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(appt._id, 'Approved')}
                                                        className="flex-1 text-center text-green-600 font-medium text-sm py-2 bg-green-50 rounded-lg hover:bg-green-100 transition"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(appt._id, 'Rejected')}
                                                        className="flex-1 text-center text-red-600 font-medium text-sm py-2 bg-red-50 rounded-lg hover:bg-red-100 transition"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(appt._id)}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition shadow-sm"
                                            >
                                                Delete 🗑
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </DashboardLayout>
    );
};

export default AdminAppointmentsPage;
