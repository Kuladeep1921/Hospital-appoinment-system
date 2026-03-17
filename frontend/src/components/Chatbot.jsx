import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatbotSuggestion, fetchDoctors, fetchLiveHospitals, bookAppointment } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Chatbot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(() => {
        return sessionStorage.getItem('chatbot_isOpen') === 'true';
    });
    const [messages, setMessages] = useState(() => {
        const saved = sessionStorage.getItem('chatbot_messages');
        return saved ? JSON.parse(saved) : [
            { text: "Hello! I'm your Medical Assistant. How are you feeling today?", sender: 'bot' }
        ];
    });
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Booking State
    const [bookingState, setBookingState] = useState(null); // { doctor, step: 'date-time' | 'confirm' }
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
        sessionStorage.setItem('chatbot_messages', JSON.stringify(messages));
        sessionStorage.setItem('chatbot_isOpen', isOpen);
    }, [messages, isOpen]);

    const generateTimeSlots = () => {
        return ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
    };

    const handleLocationFailed = () => {
        setMessages(prev => [
            ...prev,
            { text: "Location access denied. Please allow location access and try again.", sender: 'bot' }
        ]);
        setLoading(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || bookingState) return;

        const userMsg = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            // Include age and gender in suggestion request
            const { data } = await getChatbotSuggestion(userMsg.text, user?.age, user?.gender);

            setTimeout(() => {
                setMessages(prev => [...prev, { text: "Detecting your location to find nearby hospitals and doctors...", sender: 'bot' }]);
                
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        try {
                            const { latitude, longitude } = position.coords;
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=en`);
                            const geoData = await res.json();
                            
                            let detectedCity = 'Hyderabad'; // Default fallback

                            if (geoData.address) {
                                const raw = geoData.address.state_district || geoData.address.city || geoData.address.county || geoData.address.town || 'Hyderabad';
                                detectedCity = raw.split(',')[0].replace(/ District/gi, '').trim();
                                const area = geoData.address.suburb || geoData.address.neighbourhood || geoData.address.village || geoData.address.town || geoData.address.road || '';
                                const displayLocation = area ? `${area}, ${detectedCity}` : detectedCity;
                                setMessages(prev => [...prev, { text: `📍 Location detected: ${displayLocation}. Finding best ${data.specialization}s for you...`, sender: 'bot' }]);
                            } else {
                                setMessages(prev => [...prev, { text: `📍 Location detected: ${detectedCity}. Finding best ${data.specialization}s for you...`, sender: 'bot' }]);
                            }
                            
                            // Fetch doctors and hospitals independently so one failure doesn't block the other
                            const [docsRes, hospRes] = await Promise.allSettled([
                                fetchDoctors({ district: detectedCity, specialization: data.specialization }),
                                fetchLiveHospitals(detectedCity)
                            ]);
                            
                            const doctors = docsRes.status === 'fulfilled' ? (docsRes.value.data || []) : [];
                            const liveHospitals = hospRes.status === 'fulfilled' ? (hospRes.value.data || []) : [];
                            
                            let botText = `Based on your symptoms and profile, I found some ${data.specialization}s in your area.`;
                            
                            if (liveHospitals.length > 0) {
                                const hospitalList = liveHospitals.map(h => h.name).slice(0, 3).join(", ");
                                botText += `\n\n🏥 Nearby Real Hospitals: ${hospitalList}.`;
                            }

                            if (doctors.length === 0) {
                                botText += `\n\nI couldn't find any specific ${data.specialization} doctors registered in ${detectedCity} at the moment.`;
                                setMessages(prev => [...prev, { text: botText, sender: 'bot' }]);
                            } else {
                                setMessages(prev => [...prev, { 
                                    text: botText, 
                                    sender: 'bot',
                                    doctors: doctors.slice(0, 3) 
                                }]);
                            }
                            setLoading(false);
                            
                        } catch (err) {
                            console.error('Chatbot fetch error:', err);
                            setMessages(prev => [...prev, { text: "Sorry, I had trouble fetching doctors. Please try again.", sender: 'bot' }]);
                            setLoading(false);
                        }
                    }, () => {
                        handleLocationFailed();
                    }, { timeout: 10000 });
                } else {
                    handleLocationFailed(data);
                }
            }, 800);

        } catch (error) {
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", sender: 'bot' }]);
            setLoading(false);
        }
    };

    const initiationBooking = (doctor) => {
        setBookingState({ doctor, step: 'date-time' });
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime) return;
        
        setLoading(true);
        try {
            await bookAppointment({
                doctorId: bookingState.doctor._id,
                date: selectedDate,
                timeSlot: selectedTime,
                problem: messages[messages.length - 2]?.text || "Consultation from Chatbot"
            });

            setMessages(prev => [...prev, { 
                text: `✅ Appointment confirmed for ${bookingState.doctor.name} on ${selectedDate} at ${selectedTime}.`, 
                sender: 'bot' 
            }]);
            setBookingState(null);
            setSelectedDate('');
            setSelectedTime('');
        } catch (error) {
            setMessages(prev => [...prev, { text: "Failed to book appointment. Please try again.", sender: 'bot' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-primary-600 hover:bg-primary-700'
                    } text-white`}
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[95vw] sm:w-[420px] h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-10">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl backdrop-blur-sm shadow-inner">🤖</div>
                                <div>
                                    <p className="font-bold text-lg leading-tight uppercase tracking-tight">MediBook AI</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                                        <p className="text-[10px] text-white/80 font-medium uppercase tracking-widest">Always Active</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-[10px] bg-white/10 px-2 py-1 rounded-full backdrop-blur-md font-medium">V2.5 Premium</div>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Close"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm transition-all ${msg.sender === 'user'
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-700 rounded-tl-none border border-gray-200'
                                    }`}>
                                    {msg.text}
                                    
                                    {/* Doctor Suggestions */}
                                    {msg.doctors && (
                                        <div className="mt-4 space-y-3">
                                            {msg.doctors.map((doc, idx) => (
                                                <div key={idx} className="bg-gray-50 rounded-xl p-3 border border-gray-200 hover:border-primary-300 transition-colors shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-bold text-primary-900">{doc.name}</p>
                                                            <p className="text-[10px] text-primary-600 font-semibold uppercase">{doc.specialization}</p>
                                                        </div>
                                                        <div className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                            {doc.experience}+ Years Exp
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mb-3">
                                                        🏥 {doc.hospitalId?.name || 'Local Clinic'}
                                                    </p>
                                                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                                                        <span className="text-[10px] text-gray-400 font-medium uppercase">Starts From</span>
                                                        <span className="text-xs font-bold text-gray-700">₹{doc.consultationFee || 500}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => initiationBooking(doc)}
                                                        className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        📅 Book Now
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[9px] text-gray-400 mt-1 mx-1 uppercase tracking-tighter">
                                    {msg.sender === 'bot' ? 'Assistant' : 'You'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}

                        {/* Booking Overlay/Inline Form */}
                        {bookingState && (
                            <div className="bg-white border-2 border-primary-500 p-5 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm">📅</span>
                                        Finalize Booking
                                    </h3>
                                    <button onClick={() => setBookingState(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                                </div>
                                <p className="text-xs text-gray-500 mb-4 px-1 italic">Selecting for Dr. {bookingState.doctor.name}</p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Select Date</label>
                                        <input 
                                            type="date" 
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full mt-1 bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Available slots</label>
                                        <div className="grid grid-cols-3 gap-2 mt-1">
                                            {generateTimeSlots().map(slot => (
                                                <button 
                                                    key={slot}
                                                    onClick={() => setSelectedTime(slot)}
                                                    className={`py-2 text-[10px] rounded-lg font-bold border transition-all ${
                                                        selectedTime === slot 
                                                        ? 'bg-primary-600 border-primary-600 text-white shadow-md scale-95' 
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-primary-200 hover:bg-primary-50'
                                                    }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleBooking}
                                        disabled={!selectedDate || !selectedTime || loading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {loading ? 'Processing...' : 'Confirm OP Appointment'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {loading && !bookingState && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1.5 shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={bookingState ? "Finish booking above..." : "Type your symptoms..."}
                            disabled={bookingState}
                            className="flex-1 bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 rounded-2xl px-5 py-3.5 text-sm transition-all placeholder:text-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading || bookingState}
                            className="bg-primary-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-primary-700 disabled:bg-gray-100 disabled:text-gray-300 transition-all shadow-md active:scale-95"
                        >
                            <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
