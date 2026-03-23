import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchDoctors, bookAppointment, fetchDistricts, fetchHospitals } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import Spinner from '../components/Spinner';

const BookAppointmentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Data States
    const [districts, setDistricts] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [doctors, setDoctors] = useState([]);
    
    // Loading States
    const [loadingDistricts, setLoadingDistricts] = useState(true);
    const [loadingHospitals, setLoadingHospitals] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [suggestion, setSuggestion] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        district: '',
        hospitalId: '',
        doctorId: '',
        specialization: '',
        date: '',
        timeSlot: '',
        problem: '',
    });

    // 1. Initial Load: Districts + Geolocation + Pre-selection from AI Assistant
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const { data } = await fetchDistricts();
                setDistricts(data);
                
                // Check if we have pre-selected data from navigation (AI Assistant)
                if (location.state?.preSelectedDoctorId || location.state?.preSelectedDistrict) {
                    const { preSelectedDoctorId, preSelectedHospitalId, preSelectedDistrict, preSelectedSpecialization, preFilledProblem } = location.state;
                    
                    setForm(prev => ({
                        ...prev,
                        district: preSelectedDistrict || '',
                        hospitalId: preSelectedHospitalId || '',
                        doctorId: preSelectedDoctorId || '',
                        specialization: preSelectedSpecialization || '',
                        problem: preFilledProblem || ''
                    }));

                    // Load secondary data incrementally based on what we have
                    if (preSelectedDistrict) {
                        setLoadingHospitals(true);
                        const hRes = await fetchHospitals(preSelectedDistrict);
                        setHospitals(hRes.data);
                        setLoadingHospitals(false);
                    }

                    if (preSelectedHospitalId) {
                        setLoadingDoctors(true);
                        const dRes = await fetchDoctors({ hospitalId: preSelectedHospitalId });
                        setDoctors(dRes.data);
                        setLoadingDoctors(false);
                    }

                } else {
                    // Normal flow: Geolocation
                    if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition(async (position) => {
                            try {
                                const { latitude, longitude } = position.coords;
                                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                const geoData = await res.json();
                                const city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.county;
                                
                                if (city) {
                                    const matchedDistrict = data.find(d => 
                                        city.toLowerCase().includes(d.name.toLowerCase()) || 
                                        d.name.toLowerCase().includes(city.toLowerCase())
                                    );
                                    if (matchedDistrict) {
                                        handleDistrictChange({ target: { value: matchedDistrict.name } });
                                    }
                                }
                            } catch (err) {
                                console.error('Geo-coding error:', err);
                            }
                        });
                    }
                }
            } catch {
                setError('Failed to load initial data.');
            } finally {
                setLoadingDistricts(false);
            }
        };

        loadInitialData();

        // Check for chatbot suggestions (Global highlights)
        const savedSuggestion = localStorage.getItem("suggestedDoctors");
        if (savedSuggestion) {
            setSuggestion(JSON.parse(savedSuggestion));
        }
    }, [location.state]);

    // 2. District Change Handlers
    const handleDistrictChange = async (e) => {
        const districtName = e.target.value;
        setForm(prev => ({ ...prev, district: districtName, hospitalId: '', doctorId: '', specialization: '' }));
        setHospitals([]);
        setDoctors([]);

        if (!districtName) return;

        setLoadingHospitals(true);
        try {
            const { data } = await fetchHospitals(districtName);
            setHospitals(data);
        } catch {
            setError('Failed to load hospitals for this district.');
        } finally {
            setLoadingHospitals(false);
        }
    };

    // 3. Hospital Change Handler
    const handleHospitalChange = async (e) => {
        const selectedId = e.target.value;
        
        setError('');
        setForm(prev => ({ ...prev, hospitalId: selectedId, doctorId: '', specialization: '' }));
        setDoctors([]);

        if (!selectedId) return;

        setLoadingDoctors(true);
        try {
            const { data } = await fetchDoctors({ hospitalId: selectedId });
            
            // If there's a suggestion, highlight or filter
            if (suggestion) {
                const recommended = data.filter(doc =>
                    suggestion.doctors.some(s => s.name === doc.name)
                );
                setDoctors(recommended.length > 0 ? recommended : data);
            } else {
                setDoctors(data);
            }
        } catch {
            setError('Failed to load doctors for this hospital.');
        } finally {
            setLoadingDoctors(false);
        }
    };

    // 4. Doctor Change Handler
    const handleDoctorChange = (e) => {
        const id = e.target.value;
        const doc = doctors.find((d) => d._id === id);
        setForm(prev => ({ ...prev, doctorId: id, specialization: doc?.specialization || '' }));
    };

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.doctorId || !form.date || !form.timeSlot || !form.problem.trim())
            return setError('Please fill in all required fields.');
        if (form.problem.trim().length < 10)
            return setError('Please describe your problem in at least 10 characters.');

        setError('');
        setSubmitting(true);
        try {
            await bookAppointment({
                doctorId: form.doctorId,
                date: form.date,
                timeSlot: form.timeSlot,
                problem: form.problem,
            });
            setSuccess(true);
            localStorage.removeItem("suggestedDoctors"); 
            setTimeout(() => navigate('/dashboard/appointments'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book appointment.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Book an Appointment</h1>
                    {location.state?.preSelectedDoctorId && (
                        <p className="bg-primary-50 text-primary-600 px-3 py-1 rounded-lg inline-block text-[11px] font-bold mt-2 uppercase tracking-wider">
                            ✨ Pre-selected by AI Assistant
                        </p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                        Find hospitals and doctors in your location to schedule a visit.
                    </p>
                </div>

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-6">
                        <div className="text-4xl mb-3">🎉</div>
                        <p className="text-green-700 font-bold text-lg">Appointment Booked!</p>
                        <p className="text-green-600 text-sm mt-1">
                            Your appointment has been submitted. Redirecting to your appointments...
                        </p>
                    </div>
                )}

                {!success && (
                    <div className="card shadow-md">
                        {error && (
                            <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                                <span className="mt-0.5">⚠️</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Step 1: District Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                                    <span>Select Location / District <span className="text-red-400">*</span></span>
                                    {loadingDistricts && <Spinner size="xs" />}
                                </label>
                                <select
                                    name="district"
                                    value={form.district}
                                    onChange={handleDistrictChange}
                                    className="input-field"
                                    disabled={loadingDistricts}
                                >
                                    <option value="">-- Choose District --</option>
                                    {districts.map(d => (
                                        <option key={d._id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Step 2: Hospital Dropdown */}
                            {(form.district || loadingHospitals) && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                                        <span>Select Hospital <span className="text-red-400">*</span></span>
                                        {loadingHospitals && <Spinner size="xs" />}
                                    </label>
                                    <select
                                        name="hospitalId"
                                        value={form.hospitalId}
                                        onChange={handleHospitalChange}
                                        className="input-field"
                                        disabled={loadingHospitals}
                                    >
                                        <option value="">-- Choose Hospital --</option>
                                        {hospitals.map(h => (
                                            <option key={h._id} value={h._id}>{h.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Step 3: Doctor Dropdown */}
                            {(form.hospitalId || loadingDoctors) && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Select Doctor <span className="text-red-400">*</span>
                                        </label>
                                        {loadingDoctors && <Spinner size="xs" />}
                                    </div>
                                    <select
                                        name="doctorId"
                                        value={form.doctorId}
                                        onChange={handleDoctorChange}
                                        className="input-field"
                                        disabled={loadingDoctors}
                                    >
                                        <option value="">-- Choose Doctor --</option>
                                        {doctors.filter(d => !form.specialization || d.specialization === form.specialization).map(doc => (
                                            <option key={doc._id} value={doc._id}>
                                                {doc.name} — {doc.specialization} (₹{doc.consultationFee})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Specialization Filter (Conditional) */}
                            {form.hospitalId && doctors.length > 0 && (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        Filter by Specialist Type
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {["All", "Cardiologist", "Neurologist", "Orthopedic", "Dermatologist", "Pediatrician", "Gynecologist", "General Physician", "ENT Specialist", "Psychiatrist", "Gastroenterologist"].map(spec => (
                                            <button
                                                key={spec}
                                                type="button"
                                                onClick={() => setForm({ ...form, specialization: spec === 'All' ? '' : spec, doctorId: '' })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                    (spec === 'All' && !form.specialization) || form.specialization === spec
                                                    ? 'bg-primary-500 text-white shadow-sm'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                                                }`}
                                            >
                                                {spec}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Date and Time */}
                            {form.doctorId && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Date <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            name="date"
                                            type="date"
                                            min={today}
                                            value={form.date}
                                            onChange={handleChange}
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Time Slot <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            name="timeSlot"
                                            value={form.timeSlot}
                                            onChange={handleChange}
                                            className="input-field"
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
                            )}

                            {/* Problem */}
                            {form.doctorId && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Describe Your Problem <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        name="problem"
                                        rows={4}
                                        placeholder="Briefly describe your symptoms..."
                                        value={form.problem}
                                        onChange={handleChange}
                                        className="input-field resize-none"
                                    />
                                </div>
                            )}

                            {form.doctorId && (
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary w-full py-3 text-base disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Spinner size="sm" /> Booking...
                                        </span>
                                    ) : (
                                        '📅 Confirm Booking'
                                    )}
                                </button>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BookAppointmentPage;
