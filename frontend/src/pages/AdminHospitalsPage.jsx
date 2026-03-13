import { useEffect, useState } from 'react';
import { fetchDistricts, fetchHospitals, createHospital, deleteHospital } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import Spinner from '../components/Spinner';

const AdminHospitalsPage = () => {
    const [districts, setDistricts] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const [form, setForm] = useState({ name: '', district: '', address: '' });
    const [selectedDistrict, setSelectedDistrict] = useState('All');

    useEffect(() => {
        const loadDistricts = async () => {
            try {
                const { data } = await fetchDistricts();
                setDistricts(data);
                loadHospitals();
            } catch {
                setError('Failed to fetch districts');
                setLoading(false);
            }
        };
        loadDistricts();
    }, []);

    const loadHospitals = async (dist = 'All') => {
        setLoading(true);
        try {
            const { data } = await fetchHospitals(dist === 'All' ? '' : dist);
            setHospitals(data);
        } catch {
            setError('Failed to load hospitals');
        } finally {
            setLoading(false);
        }
    };

    const handleDistrictFilter = (e) => {
        const d = e.target.value;
        setSelectedDistrict(d);
        loadHospitals(d);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.district) return;
        setSubmitting(true);
        try {
            const { data } = await createHospital(form);
            setHospitals([data, ...hospitals]);
            setForm({ name: '', district: '', address: '' });
            alert('Hospital added successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add hospital');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this hospital?')) return;
        try {
            await deleteHospital(id);
            setHospitals(hospitals.filter(h => h._id !== id));
        } catch {
            alert('Failed to delete hospital');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Hospital Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Add or remove hospitals from the MediBook network.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-1">
                        <div className="card shadow-md">
                            <h2 className="text-lg font-bold mb-4 text-gray-700">Add New Hospital</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Hospital Name"
                                        className="input-field"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                    <select
                                        required
                                        className="input-field"
                                        value={form.district}
                                        onChange={e => setForm({ ...form, district: e.target.value })}
                                    >
                                        <option value="">-- Select District --</option>
                                        {districts.map(d => (
                                            <option key={d._id} value={d.name}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        className="input-field"
                                        placeholder="Physical Address"
                                        rows="2"
                                        value={form.address}
                                        onChange={e => setForm({ ...form, address: e.target.value })}
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary w-full py-2.5"
                                >
                                    {submitting ? <Spinner size="sm" /> : '➕ Add Hospital'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-700">Existing Hospitals</h2>
                            <select
                                className="text-sm border rounded-lg px-3 py-1.5 focus:ring-2 ring-primary-500"
                                value={selectedDistrict}
                                onChange={handleDistrictFilter}
                            >
                                <option value="All">All Districts</option>
                                {districts.map(d => (
                                    <option key={d._id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-10"><Spinner size="lg" /></div>
                        ) : (
                            <div className="card p-0 overflow-hidden shadow-sm">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-5 py-3 text-left">Hospital</th>
                                            <th className="px-5 py-3 text-left">District</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {hospitals.map(h => (
                                            <tr key={h._id} className="hover:bg-gray-50">
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-gray-800">{h.name}</p>
                                                    <p className="text-xs text-gray-400">{h.address}</p>
                                                </td>
                                                <td className="px-5 py-4 text-gray-600">{h.district}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(h._id)}
                                                        className="text-red-500 hover:text-red-700 font-bold p-2"
                                                        title="Delete Hospital"
                                                    >
                                                        🗑
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {hospitals.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-5 py-10 text-center text-gray-400">No hospitals found in this district.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminHospitalsPage;
