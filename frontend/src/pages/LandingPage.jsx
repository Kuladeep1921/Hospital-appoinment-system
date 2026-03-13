import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const features = [
    {
        icon: '👨‍⚕️',
        title: 'Elite Specialists',
        desc: 'Access a curated network of top-tier medical experts. Precision care is now just a tap away.',
        color: 'from-blue-500/10 to-transparent border-blue-500/20',
        iconBg: 'bg-blue-500/10 text-blue-500',
    },
    {
        icon: '⚡',
        title: 'Instant Booking',
        desc: 'Experience our ultra-fast scheduling. Book, reschedule, and manage appointments with zero friction.',
        color: 'from-primary-500/10 to-transparent border-primary-500/20',
        iconBg: 'bg-primary-500/10 text-primary-500',
    },
    {
        icon: '🛡️',
        title: 'Bank-Grade Security',
        desc: 'Your health records are shielded by enterprise-level encryption. Total privacy, absolute peace of mind.',
        color: 'from-purple-500/10 to-transparent border-purple-500/20',
        iconBg: 'bg-purple-500/10 text-purple-500',
    },
];

const stats = [
    { value: '500+', label: 'Elite Doctors' },
    { value: '10k+', label: 'Active Patients' },
    { value: '25+', label: 'Specializations' },
    { value: '24/7', label: 'AI Support' },
];

const specializations = [
    { name: 'Cardiology', icon: '🫀', desc: 'Heart & Blood' },
    { name: 'Dermatology', icon: '✨', desc: 'Skin & Hair' },
    { name: 'Neurology', icon: '🧠', desc: 'Brain & Nerves' },
    { name: 'Orthopedics', icon: '🦴', desc: 'Bones & Joints' },
    { name: 'Gynecology', icon: '🌸', desc: 'Women Health' },
    { name: 'Pediatrics', icon: '👶', desc: 'Child Care' },
    { name: 'Ophthalmology', icon: '👁️', desc: 'Eye Care' },
    { name: 'Physician', icon: '🩺', desc: 'General Med' },
];

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#0B0F19] text-gray-200 overflow-hidden font-sans">
            <Navbar />

            {/* Glowing Orbs Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Hero Section */}
            <section className="relative pt-24 pb-32 px-4 z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Typography */}
                    <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-5 py-2.5 rounded-full mb-8 shadow-xl">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                            </span>
                            <span className="text-sm font-semibold tracking-wide text-gray-300">Next-Gen Healthcare Platform</span>
                        </div>
                        
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-8 tracking-tight">
                            Healthcare at the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-emerald-400 to-blue-500 drop-shadow-sm">
                                Speed of Life.
                            </span>
                        </h1>
                        
                        <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl font-light">
                            Skip the waiting room. Connect instantly with top-rated medical specialists, book appointments effortlessly, and take control of your health journey.
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-5">
                            <Link to="/register" className="relative group inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-primary-600 rounded-2xl hover:bg-primary-500 hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:-translate-y-1 active:scale-95">
                                Start Your Journey
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </Link>
                            
                            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 font-bold text-gray-300 transition-all duration-300 border-2 border-white/10 rounded-2xl hover:bg-white/5 hover:text-white hover:border-white/20 active:scale-95">
                                Member Sign In
                            </Link>
                        </div>

                        {/* Social Proof */}
                        <div className="flex items-center gap-6 mt-14 pt-8 border-t border-white/10">
                            <div className="flex -space-x-3">
                                {[
                                    'https://i.pravatar.cc/100?img=1',
                                    'https://i.pravatar.cc/100?img=2',
                                    'https://i.pravatar.cc/100?img=3',
                                    'https://i.pravatar.cc/100?img=4'
                                ].map((img, i) => (
                                    <img key={i} src={img} className="w-12 h-12 rounded-full border-2 border-[#0B0F19] object-cover shadow-lg" alt="User" />
                                ))}
                            </div>
                            <div>
                                <div className="flex text-yellow-500 text-lg mb-1">
                                    ★★★★★
                                </div>
                                <p className="text-sm font-medium text-gray-400">Trusted by <span className="text-white font-bold">10,000+</span> patients</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Interactive Mockup */}
                    <div className="hidden lg:flex justify-end relative">
                        {/* Main Glass Card */}
                        <div className="relative z-20 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 w-[24rem] shadow-2xl animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                            
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Booking Confirmed</h3>
                                        <p className="text-sm text-emerald-400 font-medium">Ready for your visit</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-[#0B0F19]/50 rounded-3xl p-6 border border-white/5 mb-6 space-y-5">
                                <div className="flex items-center gap-4">
                                    <img src="https://i.pravatar.cc/150?img=32" alt="Dr" className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
                                    <div>
                                        <h4 className="text-white font-bold text-lg">Dr. Aisha Khan</h4>
                                        <p className="text-sm text-primary-400 font-medium">Cardiology Specialist</p>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-400">Date & Time</p>
                                    <p className="text-sm font-bold text-white bg-white/10 px-3 py-1.5 rounded-lg">Tomorrow, 10:00 AM</p>
                                </div>
                            </div>
                            
                            <div className="w-full bg-gradient-to-r from-primary-600/20 to-emerald-600/20 text-emerald-300 text-center py-4 rounded-2xl border border-emerald-500/20 font-mono text-sm tracking-widest font-bold">
                                #APT-2024-001
                            </div>
                        </div>

                        {/* Floating Badges */}
                        <div className="absolute top-10 -left-12 z-30 bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-bounce [animation-duration:4s]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-xl">👨‍⚕️</div>
                                <div>
                                    <p className="text-white font-bold">500+</p>
                                    <p className="text-xs text-gray-400 font-medium">Total Specialists</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-8 right-8 z-30 bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-bounce [animation-duration:5s] [animation-delay:1s]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center text-xl">⭐</div>
                                <div>
                                    <p className="text-white font-bold">4.9 / 5</p>
                                    <p className="text-xs text-gray-400 font-medium">Average Rating</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Stats Bar */}
            <section className="relative z-10 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto py-12 px-4 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
                    {stats.map(({ value, label }) => (
                        <div key={label} className="text-center group">
                            <p className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-2 group-hover:scale-110 transition-transform">{value}</p>
                            <p className="text-primary-500 font-semibold tracking-wide uppercase text-xs">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features section */}
            <section className="py-32 px-4 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                            Intelligent Healthcare. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">Engineered for You.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map(({ icon, title, desc, color, iconBg }) => (
                            <div key={title} className={`bg-gradient-to-br ${color} bg-opacity-10 backdrop-blur-lg border rounded-[2rem] p-8 hover:-translate-y-2 transition-all duration-300 group`}>
                                <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                                    {icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
                                <p className="text-gray-400 leading-relaxed font-light">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Specializations Grid */}
            <section className="py-32 px-4 bg-[#080B13] relative border-t border-white/5">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[150px] pointer-events-none" />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Mastering Every <br /><span className="text-primary-500">Discipline.</span></h2>
                            <p className="text-gray-400 text-lg max-w-md font-light">Comprehensive care covering every aspect of human health, backed by industry leaders.</p>
                        </div>
                        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-bold flex items-center gap-2 group">
                            View all specialists <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {specializations.map(({ name, icon, desc }) => (
                            <div key={name} className="bg-white/5 border border-white/10 hover:border-primary-500/50 hover:bg-white/10 rounded-3xl p-6 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                <div className="text-4xl mb-6 group-hover:scale-110 origin-left transition-transform duration-300">{icon}</div>
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">{name}</h3>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-emerald-600 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
                
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight">
                        Don't Compromise on Care.
                    </h2>
                    <p className="text-primary-100 text-xl mb-10 max-w-2xl mx-auto font-light">
                        Join the platform redefining medical access. Secure your health's future within 60 seconds.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center justify-center bg-white text-primary-700 font-black px-12 py-5 rounded-2xl shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:bg-gray-50 transition-all duration-300 active:scale-95 text-lg"
                    >
                        Create Free Account
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
