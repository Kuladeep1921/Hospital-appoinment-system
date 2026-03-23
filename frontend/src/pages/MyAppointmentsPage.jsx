import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserAppointments, deleteAppointment, updateAppointment } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

const MyAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [editingAppt, setEditingAppt] = useState(null);
    const [editForm, setEditForm] = useState({ doctorId: '', date: '', timeSlot: '', problem: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
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
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await deleteAppointment(id);
            setAppointments(appointments.filter((a) => a._id !== id));
        } catch (error) {
            alert('Failed to delete appointment');
        }
    };

    const startEdit = (appt) => {
        setEditingAppt(appt);
        setEditForm({
            doctorId: appt.doctorId?._id || '',
            date: new Date(appt.date).toISOString().split('T')[0],
            timeSlot: appt.timeSlot || '',
            problem: appt.problem
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await updateAppointment(editingAppt._id, editForm);
            setAppointments(appointments.map(a => a._id === editingAppt._id ? data : a));
            setEditingAppt(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update appointment');
        } finally {
            setSubmitting(false);
        }
    };

    const filters = ['All', 'Pending', 'Approved', 'Rejected'];
    const filtered =
        filter === 'All'
            ? appointments
            : appointments.filter((a) => a.status === filter);

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Track all your medical appointments and their status.
                </p>
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
                                    ? "You haven't booked any appointments yet."
                                    : `No ${filter.toLowerCase()} appointments.`}
                            </p>
                            {filter === 'All' && (
                                <Link to="/dashboard/book" className="btn-primary inline-block mt-6 text-sm">
                                    Book Your First Appointment
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block card overflow-hidden p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                {['#', 'Doctor', 'Specialization', 'Date', 'Problem', 'Status', 'Actions'].map((h) => (
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
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center text-sm font-bold text-primary-600 flex-shrink-0">
                                                                {appt.doctorId?.name?.charAt(0)}
                                                            </div>
                                                            <span className="font-semibold text-gray-800">{appt.doctorId?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-500">{appt.doctorId?.specialization}</td>
                                                    <td className="px-5 py-4 text-gray-500">
                                                        <p>{new Date(appt.date).toLocaleDateString('en-US', {
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
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {appt.status === 'Pending' && (
                                                                <button
                                                                    onClick={() => startEdit(appt)}
                                                                    className="text-blue-500 hover:text-blue-700 font-medium text-xs px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                                                >
                                                                    Edit
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(appt._id)}
                                                                className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                                            >
                                                                Delete
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
                                                <div className="w-11 h-11 bg-primary-100 rounded-2xl flex items-center justify-center text-base font-bold text-primary-600">
                                                    {appt.doctorId?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">{appt.doctorId?.name}</p>
                                                    <p className="text-xs text-gray-500">{appt.doctorId?.specialization}</p>
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
                                                <button
                                                    onClick={() => startEdit(appt)}
                                                    className="flex-1 text-center text-blue-600 font-medium text-sm py-1.5 bg-blue-50 rounded-lg"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(appt._id)}
                                                className="flex-1 text-center text-red-600 font-medium text-sm py-1.5 bg-red-50 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Edit Modal */}
                    {editingAppt && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Appointment</h3>
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                                        <input
                                            className="input-field bg-gray-50"
                                            value={editingAppt?.doctorId?.name || ''}
                                            disabled
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={editForm.date}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                                            <select
                                                value={editForm.timeSlot}
                                                onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                                                className="input-field"
                                                required
                                            >
                                                <option value="">-- Choose time --</option>
                                                <optgroup label="Morning (9 AM - 12 PM)">
                                                    {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'].map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Evening (6 PM - 8 PM)">
                                                    {['06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'].map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Problem</label>
                                        <textarea
                                            value={editForm.problem}
                                            onChange={(e) => setEditForm({ ...editForm, problem: e.target.value })}
                                            className="input-field max-h-32"
                                            rows="3"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setEditingAppt(null)}
                                            className="flex-1 btn-outline py-2"
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 btn-primary py-2"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}
        </DashboardLayout>
    );
};

export default MyAppointmentsPage;
