import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const features = [
    {
        icon: '🩺',
        title: 'Expert Doctors',
        desc: 'Connect with certified specialists across every medical field. Quality care is just a click away.',
        color: 'bg-blue-50 border-blue-100',
        iconBg: 'bg-blue-100',
    },
    {
        icon: '📅',
        title: 'Easy Scheduling',
        desc: 'Book your appointment in minutes. Choose your preferred doctor, date and time — hassle free.',
        color: 'bg-primary-50 border-primary-100',
        iconBg: 'bg-primary-100',
    },
    {
        icon: '🔒',
        title: 'Secure & Private',
        desc: 'Your health data is protected with industry-standard encryption and privacy controls.',
        color: 'bg-purple-50 border-purple-100',
        iconBg: 'bg-purple-100',
    },
];

const stats = [
    { value: '500+', label: 'Expert Doctors' },
    { value: '10k+', label: 'Happy Patients' },
    { value: '20+', label: 'Specializations' },
    { value: '24/7', label: 'Support' },
];

const specializations = [
    { name: 'Cardiology', icon: '❤️' },
    { name: 'Dermatology', icon: '✨' },
    { name: 'Neurology', icon: '🧠' },
    { name: 'Orthopedics', icon: '🦴' },
    { name: 'Gynecology', icon: '🌸' },
    { name: 'Pediatrics', icon: '👶' },
    { name: 'Ophthalmology', icon: '👁️' },
    { name: 'General', icon: '🏥' },
];

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-50 via-white to-blue-50 pt-16 pb-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left */}
                        <div>
                            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                                Trusted Medical Booking Platform
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                Your Health,{' '}
                                <span className="text-primary-500">Our Priority</span>
                            </h1>
                            <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
                                Book appointments with top-rated doctors effortlessly.
                                Get the care you deserve, when you need it — from the comfort of your home.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/register" className="btn-primary text-base px-8 py-3 shadow-lg shadow-primary-200">
                                    Get Started Free →
                                </Link>
                                <Link to="/login" className="btn-outline text-base px-8 py-3">
                                    Sign In
                                </Link>
                                <Link to="/login" className="flex items-center text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors ml-4 underline decoration-gray-300 underline-offset-4">
                                    Admin Portal
                                </Link>
                            </div>

                            {/* Trust badges */}
                            <div className="flex items-center gap-6 mt-10">
                                <div className="flex -space-x-2">
                                    {['A', 'B', 'C', 'D'].map((l, i) => (
                                        <div key={i} className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm ${['bg-primary-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400'][i]}`}>
                                            {l}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex text-yellow-400 text-sm">★★★★★</div>
                                    <p className="text-xs text-gray-500 mt-0.5">10,000+ satisfied patients</p>
                                </div>
                            </div>
                        </div>

                        {/* Right – Decorative Card */}
                        <div className="hidden lg:flex justify-center">
                            <div className="relative">
                                {/* Main card */}
                                <div className="bg-white rounded-3xl shadow-2xl p-8 w-80 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-md">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">Appointment Booked!</p>
                                            <p className="text-xs text-gray-500">Confirmed ✓</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Doctor', value: 'Dr. Aisha Khan' },
                                            { label: 'Specialization', value: 'Cardiologist' },
                                            { label: 'Date', value: 'Tomorrow, 10:00 AM' },
                                            { label: 'Status', value: '✅ Approved' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-xs text-gray-400 font-medium">{label}</span>
                                                <span className="text-xs font-semibold text-gray-700">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 bg-primary-50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-primary-600 font-medium">Appointment ID: #APT-2024-001</p>
                                    </div>
                                </div>

                                {/* Floating badge top-right */}
                                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-3 border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">👨‍⚕️</span>
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">500+</p>
                                            <p className="text-xs text-gray-500">Doctors</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating badge bottom-left */}
                                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-3 border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">⭐</span>
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">4.9 / 5</p>
                                            <p className="text-xs text-gray-500">Rating</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-primary-500 py-10 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <p className="text-3xl font-bold text-white">{value}</p>
                            <p className="text-primary-100 text-sm mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose <span className="text-primary-500">MediBook</span>?
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto text-lg">
                            Everything you need for seamless healthcare — all in one place.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map(({ icon, title, desc, color, iconBg }) => (
                            <div
                                key={title}
                                className={`card border ${color} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
                            >
                                <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                    {icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Specializations */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Our <span className="text-primary-500">Specializations</span>
                        </h2>
                        <p className="text-gray-500">Expert doctors across all major medical fields</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {specializations.map(({ name, icon }) => (
                            <div
                                key={name}
                                className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                            >
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{icon}</div>
                                <p className="text-sm font-semibold text-gray-700">{name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-primary-500 to-primary-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Ready to Book Your Appointment?
                    </h2>
                    <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
                        Join thousands of patients who trust MediBook for their healthcare needs.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block bg-white text-primary-600 font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-primary-50 transition-all duration-200 active:scale-95"
                    >
                        Start for Free Today →
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
