import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatbotSuggestion, fetchDoctors } from '../services/api';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your Medical Assistant. How are you feeling today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleLocationFailed = (data) => {
        setMessages(prev => [
            ...prev,
            { text: "Location access denied. Please navigate to the full AI Chatbot page to select your district manually.", sender: 'bot' }
        ]);
        setLoading(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const { data } = await getChatbotSuggestion(userMsg.text);

            setTimeout(() => {
                setMessages(prev => [...prev, { text: "To suggest nearby doctors and hospitals, please allow location access.", sender: 'bot' }]);
                
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        try {
                            const { latitude, longitude } = position.coords;
                            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                            const geoData = await res.json();
                            
                            let detectedArea = geoData.locality || '';
                            let detectedCity = geoData.city || 'Hyderabad';
                            
                            detectedCity = detectedCity.replace(/ District/gi, '').trim();
                            detectedArea = detectedArea.replace(/ District/gi, '').trim();
                            
                            let locationString = detectedArea ? `${detectedArea}, ${detectedCity}` : detectedCity;
                            
                            setMessages(prev => [...prev, { text: `📍 Location detected: ${locationString}`, sender: 'bot' }]);
                            
                            // Fetch doctors
                            const docsRes = await fetchDoctors({ district: detectedCity, specialization: data.specialization });
                            const doctors = docsRes.data || [];
                            
                            let botText = `Based on your symptoms, I detected that you might need a ${data.specialization}. ${data.message}`;
                            
                            if (doctors.length === 0) {
                                botText += `\nI couldn't find any ${data.specialization}s in ${detectedDistrict} right now.`;
                            } else {
                                const docNames = doctors.map(d => d.name).join(", ");
                                botText += `\nRecommended doctors near you: ${docNames}.`;
                                
                                // Save to localStorage for BookAppointment page auto-fill
                                localStorage.setItem("suggestedDoctors", JSON.stringify({
                                    specialization: data.specialization,
                                    doctors: doctors
                                }));
                            }
                            
                            setMessages(prev => [...prev, { text: botText, sender: 'bot', specialization: data.specialization }]);
                            setLoading(false);
                            
                        } catch (err) {
                            handleLocationFailed(data);
                        }
                    }, (err) => {
                        handleLocationFailed(data);
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
                <div className="absolute bottom-20 right-0 w-[90vw] sm:w-[380px] h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-10">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl backdrop-blur-sm">🤖</div>
                            <div>
                                <p className="font-bold">Medical AI Assistant</p>
                                <p className="text-[10px] text-white/80 uppercase tracking-widest font-bold">Online • Ready to help</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm shadow-sm transition-all ${msg.sender === 'user'
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                                    }`}>
                                    {msg.text}

                                    {/* Action Button for Doctor Recommendation */}
                                    {msg.sender === 'bot' && msg.specialization && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <button
                                                onClick={() => navigate('/dashboard/book')}
                                                className="w-full bg-primary-100/50 hover:bg-primary-100 text-primary-700 font-bold py-2 rounded-xl text-xs transition-colors border border-primary-200/50"
                                            >
                                                📅 Book Appointment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 p-3.5 rounded-2xl rounded-tl-none flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe your symptoms..."
                            className="flex-1 bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 rounded-xl px-4 py-3 text-sm transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="bg-primary-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-primary-700 disabled:bg-gray-200 transition-all shadow-md active:scale-95"
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
