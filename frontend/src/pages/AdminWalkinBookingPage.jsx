import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDistricts, fetchHospitals, fetchDoctors, bookAppointment } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import Spinner from '../components/Spinner';

const AdminWalkinBookingPage = () => {
    const navigate = useNavigate();
    const [districts, setDistricts] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingHospitals, setLoadingHospitals] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        patientName: '',
        patientPhone: '',
        district: '',
        hospitalId: '',
        doctorId: '',
        date: '',
        timeSlot: '10:00 AM',
        problem: 'Offline consultation walk-in'
    });

    useEffect(() => {
        const loadDistricts = async () => {
            try {
                const { data } = await fetchDistricts();
                setDistricts(data);
            } catch {
                setError('Failed to fetch districts');
            } finally {
                setLoading(false);
            }
        };
        loadDistricts();
    }, []);

    const handleDistrictChange = async (e) => {
        const districtName = e.target.value;
        setForm(prev => ({ ...prev, district: districtName, hospitalId: '', doctorId: '' }));
        setHospitals([]);
        setDoctors([]);

        if (!districtName) return;

        setLoadingHospitals(true);
        try {
            const { data } = await fetchHospitals(districtName);
            setHospitals(data);
        } catch {
            setError('Failed to load hospitals');
        } finally {
            setLoadingHospitals(false);
        }
    };

    const handleHospitalChange = async (e) => {
        const selectedId = e.target.value;
        setError('');
        setForm(prev => ({ ...prev, hospitalId: selectedId, doctorId: '' }));
        setDoctors([]);
        if (!selectedId) return;
        setLoadingDoctors(true);
        try {
            const { data } = await fetchDoctors({ hospitalId: selectedId });
            setDoctors(data);
        } catch {
            setError('Failed to load doctors');
        } finally {
            setLoadingDoctors(false);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await bookAppointment({
                patientName: form.patientName,
                patientPhone: form.patientPhone,
                doctorId: form.doctorId,
                date: form.date,
                timeSlot: form.timeSlot,
                problem: form.problem
            });
            alert('Walk-in Appointment Booked Successfully!');
            navigate('/dashboard/admin/appointments');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register walk-in');
        } finally {
            setIsSubmitting(false);
        }
    };

    const timeSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM'
    ];

    if (loading) return <DashboardLayout><div className="flex justify-center mt-20"><Spinner size="lg" /></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                        🚶
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Register Walk-in Patient</h1>
                        <p className="text-gray-500 text-sm mt-1">Book an instant appointment for offline patients physically at the reception.</p>
                    </div>
                </div>

                <div className="card shadow-lg border-purple-100 ring-1 ring-purple-50">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                            <span className="mt-0.5">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    👤 Full Name
                                </label>
                                <input
                                    required
                                    name="patientName"
                                    type="text"
                                    value={form.patientName}
                                    onChange={handleChange}
                                    className="input-field border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                                    placeholder="Enter patient name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    📞 Phone Number
                                </label>
                                <input
                                    required
                                    name="patientPhone"
                                    type="text"
                                    value={form.patientPhone}
                                    onChange={handleChange}
                                    className="input-field border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                                    placeholder="e.g. +1 234 567 890"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    📍 District
                                </label>
                                <select
                                    name="district"
                                    value={form.district}
                                    onChange={handleDistrictChange}
                                    className="input-field"
                                >
                                    <option value="">-- Choose District --</option>
                                    {districts.map(d => (
                                        <option key={d._id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                                    <span>🏥 Hospital</span>
                                    {loadingHospitals && <Spinner size="xs" />}
                                </label>
                                <select
                                    name="hospitalId"
                                    value={form.hospitalId}
                                    onChange={handleHospitalChange}
                                    className="input-field"
                                    disabled={!form.district || loadingHospitals}
                                >
                                    <option value="">-- Choose Hospital --</option>
                                    {hospitals.map(h => (
                                        <option key={h._id} value={h._id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                                <span>👨‍⚕️ Select Doctor</span>
                                {loadingDoctors && <Spinner size="xs" />}
                            </label>
                            <select
                                name="doctorId"
                                value={form.doctorId}
                                onChange={handleChange}
                                className="input-field border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                                disabled={!form.hospitalId || loadingDoctors}
                            >
                                <option value="">-- Choose Doctor --</option>
                                {doctors.map((doc) => (
                                    <option key={doc._id} value={doc._id}>
                                        {doc.name} — {doc.specialization}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    📅 Appointment Date
                                </label>
                                <input
                                    required
                                    name="date"
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={form.date}
                                    onChange={handleChange}
                                    className="input-field border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    ⏰ Select Time Slot
                                </label>
                                <select
                                    name="timeSlot"
                                    value={form.timeSlot}
                                    onChange={handleChange}
                                    className="input-field border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                                >
                                    {timeSlots.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                📝 Problem / Reason for Visit
                            </label>
                            <textarea
                                required
                                name="problem"
                                rows="3"
                                value={form.problem}
                                onChange={handleChange}
                                className="input-field border-gray-300 focus:border-purple-500 focus:ring-purple-200 resize-none"
                                placeholder="Describe the health issue briefly..."
                            ></textarea>
                        </div>

                        <div className="border-t border-gray-100 pt-5 mt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting || !form.doctorId}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-purple-200 disabled:opacity-70 transition-colors"
                            >
                                {isSubmitting ? <span className="flex items-center justify-center gap-2"><Spinner size="sm" /> Registering Walk-in...</span> : 'Confirm Offline Booking'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminWalkinBookingPage;
