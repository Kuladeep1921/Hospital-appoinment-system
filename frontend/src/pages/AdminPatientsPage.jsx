import { useEffect, useState } from 'react';
import { fetchPatients, deletePatient } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import Spinner from '../components/Spinner';

const AdminPatientsPage = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPatients = async () => {
            try {
                const { data } = await fetchPatients();
                setPatients(data);
            } catch {
                console.error('Failed to fetch patients');
            } finally {
                setLoading(false);
            }
        };
        loadPatients();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this patient record?')) return;
        try {
            await deletePatient(id);
            setPatients(patients.filter(p => p._id !== id));
        } catch {
            alert('Failed to delete patient');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Patient Database</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage registered patient records and accounts.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Spinner size="lg" /></div>
                ) : (
                    <div className="card p-0 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">#</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Patient Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Contact Info</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Registered Date</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {patients.map((p, i) => (
                                        <tr key={p._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold uppercase">
                                                        {p.name.charAt(0)}
                                                    </div>
                                                    <span className="font-semibold text-gray-800">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                <p>{p.email}</p>
                                                <p className="text-xs text-gray-400">{p.phone}</p>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-xs">
                                                {new Date(p.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(p._id)}
                                                    className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all"
                                                >
                                                    Delete Account
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {patients.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center text-gray-400">No patients registered.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminPatientsPage;
