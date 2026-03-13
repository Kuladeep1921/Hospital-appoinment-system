import { useEffect, useState } from 'react';
import { fetchDistricts, fetchHospitals, fetchDoctors, addDoctor, deleteDoctor } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import Spinner from '../components/Spinner';

const AdminDoctorsPage = () => {
    const [districts, setDistricts] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingHospitals, setLoadingHospitals] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        specialization: '',
        experience: '',
        consultationFee: '',
        district: '',
        hospitalId: ''
    });

    const [filter, setFilter] = useState({ district: '', hospitalId: '' });

    const specializations = [
        "Cardiologist", "Neurologist", "Orthopedic", "Dermatologist", 
        "Pediatrician", "Gynecologist", "General Physician", 
        "ENT Specialist", "Psychiatrist", "Gastroenterologist"
    ];

    useEffect(() => {
        const loadInitial = async () => {
            try {
                const { data } = await fetchDistricts();
                setDistricts(data);
                loadDoctors();
            } catch {
                console.error('Failed to load districts');
            }
        };
        loadInitial();
    }, []);

    const loadDoctors = async (params = {}) => {
        setLoading(true);
        try {
            const { data } = await fetchDoctors(params);
            setDoctors(data);
        } catch {
            console.error('Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleFormDistrictChange = async (e) => {
        const d = e.target.value;
        setForm({ ...form, district: d, hospitalId: '' });
        setHospitals([]);
        if (!d) return;
        setLoadingHospitals(true);
        try {
            const { data } = await fetchHospitals(d);
            setHospitals(data);
        } catch {
            console.error('Failed to load hospitals');
        } finally {
            setLoadingHospitals(false);
        }
    };

    const handleFilterChange = async (e) => {
        const { name, value } = e.target;
        const newFilter = { ...filter, [name]: value };
        if (name === 'district') newFilter.hospitalId = '';
        setFilter(newFilter);
        
        loadDoctors({ district: newFilter.district, hospitalId: newFilter.hospitalId });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await addDoctor(form);
            setDoctors([data, ...doctors]);
            setForm({
                name: '', specialization: '', experience: '',
                consultationFee: '', district: '', hospitalId: ''
            });
            alert('Doctor added successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add doctor');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete doctor?')) return;
        try {
            await deleteDoctor(id);
            setDoctors(doctors.filter(d => d._id !== id));
        } catch {
            alert('Failed to delete doctor');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Doctor Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage MediBook medical specialists and their assignments.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Add Doctor Form */}
                    <div className="lg:col-span-1">
                        <div className="card shadow-md">
                            <h2 className="text-lg font-bold mb-4 text-gray-700">➕ Add New Doctor</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Dr. Name"
                                        className="input-field"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                    <select
                                        required
                                        className="input-field"
                                        value={form.specialization}
                                        onChange={e => setForm({ ...form, specialization: e.target.value })}
                                    >
                                        <option value="">-- Select --</option>
                                        {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Yrs)</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={form.experience}
                                            onChange={e => setForm({ ...form, experience: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fee (₹)</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={form.consultationFee}
                                            onChange={e => setForm({ ...form, consultationFee: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                    <select
                                        required
                                        className="input-field"
                                        value={form.district}
                                        onChange={handleFormDistrictChange}
                                    >
                                        <option value="">-- District --</option>
                                        {districts.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between uppercase text-[10px] font-bold tracking-widest text-gray-400">
                                        Assign Hospital {loadingHospitals && <Spinner size="xs" />}
                                    </label>
                                    <select
                                        required
                                        className="input-field"
                                        value={form.hospitalId}
                                        disabled={!form.district || loadingHospitals}
                                        onChange={e => setForm({ ...form, hospitalId: e.target.value })}
                                    >
                                        <option value="">-- Select Hospital --</option>
                                        {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary w-full py-2.5 mt-2"
                                >
                                    {submitting ? <Spinner size="sm" /> : 'Confirm Add Doctor'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Doctors List */}
                    <div className="lg:col-span-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <h2 className="text-lg font-bold text-gray-700">Registered Doctors ({doctors.length})</h2>
                            <div className="flex items-center gap-2">
                                <select
                                    name="district"
                                    className="text-xs border rounded-lg px-2 py-1.5 focus:ring-1 ring-primary-500"
                                    value={filter.district}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Districts</option>
                                    {districts.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
                        ) : (
                            <div className="card p-0 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-5 py-3 text-left">Doctor Name</th>
                                                <th className="px-5 py-3 text-left">Specialization</th>
                                                <th className="px-5 py-3 text-left">Experience</th>
                                                <th className="px-5 py-3 text-left">Fee</th>
                                                <th className="px-5 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {doctors.map(doc => (
                                                <tr key={doc._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-gray-800">{doc.name}</p>
                                                        <p className="text-[11px] text-gray-400 truncate max-w-[150px]">{doc.district}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full text-[11px] font-bold">
                                                            {doc.specialization}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-500">{doc.experience} Years</td>
                                                    <td className="px-5 py-4 font-bold text-gray-700">₹{doc.consultationFee}</td>
                                                    <td className="px-5 py-4 text-right text-lg">
                                                        <button
                                                            onClick={() => handleDelete(doc._id)}
                                                            className="text-red-400 hover:text-red-600"
                                                            title="Delete Doctor"
                                                        >
                                                            🗑
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {doctors.length === 0 && (
                                    <div className="py-20 text-center text-gray-400">No doctors found matching filters.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDoctorsPage;
