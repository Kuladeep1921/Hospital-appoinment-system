import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatbotSuggestion, fetchDoctors, fetchDistricts } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import Spinner from '../components/Spinner';

const AIChatbotPage = () => {
    const navigate = useNavigate();
    const chatEndRef = useRef(null);
    
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am your MediBook AI assistant. Please describe your health problem or symptoms in natural language (e.g. "I have chest pain" or "I am feeling stressed").' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [districts, setDistricts] = useState([]);
    
    // Workflow state
    const [step, setStep] = useState('symptoms'); // symptoms -> district -> results
    const [currentSymptoms, setCurrentSymptoms] = useState('');
    const [matchedSpecialization, setMatchedSpecialization] = useState('');
    const [analysisMessage, setAnalysisMessage] = useState('');

    useEffect(() => {
        const loadDistricts = async () => {
            try {
                const { data } = await fetchDistricts();
                setDistricts(data);
            } catch (err) {
                console.error('Failed to load districts', err);
            }
        };
        loadDistricts();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const fetchAndShowDoctors = async (districtName, specialization, analysisMsg) => {
        setLoading(true);
        try {
            const { data } = await fetchDoctors({ district: districtName, specialization });
            
            setTimeout(() => {
                setMessages(prev => [...prev, { 
                    role: 'bot', 
                    text: `Based on your symptoms, I detected that you might need a ${specialization}. ${analysisMsg}`,
                }]);

                if (data.length === 0) {
                    setMessages(prev => [...prev, { 
                        role: 'bot', 
                        text: `I couldn't find any ${specialization}s in ${districtName} right now. I recommend checking a nearby district.` 
                    }]);
                } else {
                    setMessages(prev => [...prev, { 
                        role: 'bot', 
                        text: `Recommended Doctors Near You (${districtName}):`,
                        type: 'doctor-list',
                        doctors: data,
                        selectedDistrict: districtName
                    }]);
                }
                setStep('symptoms');
                setLoading(false);
            }, 1000);

        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Failed to fetch doctors. Please try again.' }]);
            setLoading(false);
            setStep('symptoms');
        }
    };

    const handleLocationFailed = () => {
        setMessages(prev => [...prev, { 
            role: 'bot', 
            text: 'Location access denied or failed. Please select your district manually from the options below.',
            type: 'district-select'
        }]);
        setStep('district');
        setLoading(false);
    };

    const handleDistrictDetected = (districtName, specialization, analysisMsg) => {
        setMessages(prev => [...prev, { role: 'bot', text: `📍 Location detected: ${districtName}` }]);
        fetchAndShowDoctors(districtName, specialization, analysisMsg);
    };

    const handleSendSymptoms = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || step !== 'symptoms') return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setCurrentSymptoms(userMsg);
        setInput('');
        setLoading(true);

        try {
            // First analyze symptoms to get specialization (Internal analysis)
            const { data } = await getChatbotSuggestion(userMsg);
            setMatchedSpecialization(data.specialization);
            setAnalysisMessage(data.message);
            
            setTimeout(() => {
                setMessages(prev => [...prev, { 
                    role: 'bot', 
                    text: 'To suggest nearby doctors and hospitals, please allow location access.',
                }]);
                
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        try {
                            const { latitude, longitude } = position.coords;
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
                            const geoData = await res.json();
                            
                            // Extract possible district/city
                            let detectedDistrict = geoData.address.state_district || geoData.address.county || geoData.address.city || geoData.address.town || 'Hyderabad';
                            
                            // Remove "District" suffix if present
                            detectedDistrict = detectedDistrict.replace(/ District/g, '').trim();
                            
                            handleDistrictDetected(detectedDistrict, data.specialization, data.message);
                        } catch (err) {
                            handleLocationFailed();
                        }
                    }, (err) => {
                        handleLocationFailed();
                    }, { timeout: 10000 });
                } else {
                    handleLocationFailed();
                }
            }, 800);

        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: 'I encountered an error analyzing your symptoms. Please try again.' }]);
            setLoading(false);
        }
    };

    const handleDistrictSelect = async (districtName) => {
        setMessages(prev => [...prev, { role: 'user', text: `My district is ${districtName}` }]);
        fetchAndShowDoctors(districtName, matchedSpecialization, analysisMessage);
    };

    const handleBookNow = (doctor) => {
        navigate('/dashboard/book', { 
            state: { 
                preSelectedDoctorId: doctor._id,
                preSelectedHospitalId: doctor.hospitalId?._id || doctor.hospitalId,
                preSelectedDistrict: doctor.district,
                preSelectedSpecialization: doctor.specialization,
                preFilledProblem: currentSymptoms
            } 
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto h-[82vh] flex flex-col">
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                        <span className="bg-gradient-to-br from-primary-500 to-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">🤖</span> 
                        MediBook AI Medical Assistant
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Safe, quick, and reliable doctor recommendations based on your symptoms.</p>
                </div>

                <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl shadow-primary-500/10 border border-gray-100 flex flex-col overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
                                <div className={`max-w-[85%] ${
                                    msg.role === 'user' 
                                        ? 'bg-gradient-to-br from-primary-600 to-indigo-700 text-white rounded-3xl rounded-tr-none shadow-blue-200' 
                                        : 'bg-indigo-50/50 text-gray-800 rounded-3xl rounded-tl-none border border-indigo-100/50'
                                } p-5 shadow-sm`}>
                                    {msg.text && <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                                    
                                    {/* District Select UI */}
                                    {msg.type === 'district-select' && (
                                        <div className="mt-5 space-y-3">
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 mb-1">Select your location</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                                {districts.map(d => (
                                                    <button
                                                        key={d._id}
                                                        onClick={() => handleDistrictSelect(d.name)}
                                                        className="bg-white border-2 border-transparent hover:border-primary-500 hover:text-primary-600 px-4 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95 text-center"
                                                    >
                                                        {d.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Doctor List UI */}
                                    {msg.type === 'doctor-list' && (
                                        <div className="mt-6 space-y-5">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Recommended Doctors in {msg.selectedDistrict}</p>
                                            </div>
                                            {msg.doctors.map(doc => (
                                                <div key={doc._id} className="bg-white p-5 rounded-3xl border border-indigo-50 shadow-sm flex flex-col gap-4 hover:shadow-xl hover:border-primary-200 transition-all duration-300 group">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">👨‍⚕️</div>
                                                            <div>
                                                                <h3 className="font-extrabold text-gray-800 text-lg group-hover:text-primary-600 transition-colors">{doc.name}</h3>
                                                                <p className="text-xs font-bold text-primary-500 uppercase tracking-tighter">{doc.specialization}</p>
                                                                <p className="text-sm text-gray-500 font-medium mt-1.5 flex items-center gap-1.5">
                                                                    <span className="text-indigo-400">🏥</span> {doc.hospitalId?.name || 'Hospital Name'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Consultation Fee</p>
                                                            <p className="text-xl font-black text-gray-800 tracking-tight">₹{doc.consultationFee}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                                                        <div className="bg-gray-50/50 p-3 rounded-2xl">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Experience</p>
                                                            <p className="text-sm font-bold text-gray-700">{doc.experience} Years of Practice</p>
                                                        </div>
                                                        <div className="bg-gray-50/50 p-3 rounded-2xl">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Available Slots</p>
                                                            <p className="text-[11px] font-bold text-indigo-600">09:00 AM - 12:30 PM</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleBookNow(doc)}
                                                        className="w-full bg-primary-600 hover:bg-black text-white text-sm font-black py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                                                    >
                                                        <span>Book Appointment Now</span>
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-indigo-50/50 p-5 rounded-3xl rounded-tl-none border border-indigo-100 flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                    <span className="text-xs font-black text-primary-600 uppercase tracking-widest">Assistant is analyzing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 border-t border-gray-100 bg-white/80 backdrop-blur-xl relative z-10">
                        <form onSubmit={handleSendSymptoms} className="relative max-w-3xl mx-auto">
                            <input
                                type="text"
                                disabled={step !== 'symptoms' || loading}
                                placeholder={step === 'district' ? "Please select a district above..." : "Describe your problem (e.g. Back pain, chest pain)..."}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-[2rem] py-5 pl-8 pr-32 transition-all outline-none text-gray-800 font-medium shadow-inner disabled:opacity-50"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading || step !== 'symptoms' || !input.trim()}
                                className="absolute right-2 top-2 bottom-2 px-8 bg-black text-white font-black rounded-[1.8rem] hover:bg-primary-600 transition-all disabled:opacity-30 disabled:hover:bg-black flex items-center gap-2"
                            >
                                <span>Send</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14m-7-7l7 7-7 7" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AIChatbotPage;
