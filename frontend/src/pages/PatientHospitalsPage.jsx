import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDistricts, fetchLiveHospitals, fetchDoctors } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import Spinner from '../components/Spinner';

const PatientHospitalsPage = () => {
    const navigate = useNavigate();
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [hospitals, setHospitals] = useState([]);
    const [hospitalDoctors, setHospitalDoctors] = useState({});
    const [loading, setLoading] = useState(false);
    const [expandedHospital, setExpandedHospital] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await fetchDistricts();
                setDistricts(data);
                if (data.length > 0) {
                    setSelectedDistrict(data[0].name);
                    loadHospitals(data[0].name);
                }
            } catch (err) {
                console.error(err);
            }
        };
        load();
    }, []);

    const loadHospitals = async (district) => {
        setLoading(true);
        setHospitals([]);
        setExpandedHospital(null);
        try {
            const { data } = await fetchLiveHospitals(district);
            setHospitals(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleHospital = async (hospitalId) => {
        if (expandedHospital === hospitalId) {
            setExpandedHospital(null);
            return;
        }

        setExpandedHospital(hospitalId);
        if (!hospitalDoctors[hospitalId]) {
            try {
                const { data } = await fetchDoctors({ hospitalId });
                setHospitalDoctors(prev => ({ ...prev, [hospitalId]: data }));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleBook = (doc) => {
        navigate('/dashboard/book', { 
            state: { 
                preSelectedDoctorId: doc._id,
                preSelectedHospitalId: doc.hospitalId?._id || doc.hospitalId,
                preSelectedDistrict: doc.district,
                preSelectedSpecialization: doc.specialization
            } 
        });
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Find Hospitals & Clinics</h1>
                <p className="text-gray-500 text-sm mt-1">Browse healthcare providers near you and book appointments instantly.</p>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Filter by District</label>
                    <select
                        value={selectedDistrict}
                        onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            loadHospitals(e.target.value);
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary-500 outline-none transition-all"
                    >
                        {districts.map(d => (
                            <option key={d._id} value={d.name}>{d.name}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-primary-50 px-4 py-3 rounded-xl flex items-center gap-3">
                    <span className="text-xl">🏥</span>
                    <div>
                        <p className="text-xs font-bold text-primary-600 leading-none">{hospitals.length}</p>
                        <p className="text-[10px] text-primary-400 font-bold uppercase mt-1">Live Hospitals Found</p>
                    </div>
                </div>
            </div>

            {hospitals.length > 0 && (
                <div className="mb-6 bg-green-600 text-white px-6 py-3 rounded-2xl inline-flex items-center gap-3 shadow-lg shadow-green-200">
                    <span className="text-lg">🌍</span>
                    <p className="text-sm font-bold uppercase tracking-wider">Showing Real Hospitals from OpenStreetMap</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hospitals.map(h => (
                        <div key={h._id} className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${expandedHospital === h._id ? 'border-primary-500 ring-4 ring-primary-50 shadow-xl' : 'border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200'}`}>
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">🏢</div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg leading-tight">{h.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                                                <span className="text-primary-500">📍</span> {h.district}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toggleHospital(h._id)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${expandedHospital === h._id ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}`}
                                    >
                                        {expandedHospital === h._id ? 'Close Details' : 'View Doctors'}
                                    </button>
                                </div>
                                {/* ... Details Logic ... */}
                                {expandedHospital === h._id && (
                                    <div className="mt-8 border-t border-gray-100 pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Available Specialists</h4>
                                            <p className="text-[10px] font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
                                                {hospitalDoctors[h._id]?.length || 0} Listed
                                            </p>
                                        </div>

                                        {!hospitalDoctors[h._id] ? (
                                            <div className="flex justify-center py-4"><Spinner size="sm" /></div>
                                        ) : hospitalDoctors[h._id].length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-4">No doctors registered at this facility yet.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {hospitalDoctors[h._id].map(doc => (
                                                    <div key={doc._id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between group hover:bg-white border-2 border-transparent hover:border-primary-100 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">👨‍⚕️</div>
                                                            <div>
                                                                <p className="font-bold text-gray-800 text-sm">{doc.name}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{doc.specialization}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right hidden sm:block">
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Fee</p>
                                                                <p className="text-sm font-black text-gray-700">₹{doc.consultationFee}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleBook(doc)}
                                                                className="bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95"
                                                            >
                                                                Book
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {hospitals.length === 0 && (
                        <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-gray-100">
                            <span className="text-6xl mb-4 block">🏥</span>
                            <h3 className="text-xl font-bold text-gray-800">No Hospitals Found</h3>
                            <p className="text-gray-400 mt-2">We couldn't find any medical facilities in {selectedDistrict} yet.</p>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default PatientHospitalsPage;
