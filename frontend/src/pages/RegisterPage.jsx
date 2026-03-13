import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const RegisterPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const validate = () => {
        if (!form.name || !form.age || !form.gender || !form.phone || !form.email || !form.password || !form.confirmPassword)
            return 'Please fill in all fields.';
        if (parseInt(form.age) < 1 || parseInt(form.age) > 120)
            return 'Please enter a valid age.';
        if (!/\S+@\S+\.\S+/.test(form.email))
            return 'Please enter a valid email address.';
        if (form.password.length < 6)
            return 'Password must be at least 6 characters.';
        if (form.password !== form.confirmPassword)
            return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) return setError(validationError);

        setError('');
        setLoading(true);
        try {
            const { data } = await registerUser({
                name: form.name,
                age: parseInt(form.age),
                gender: form.gender,
                phone: form.phone,
                email: form.email,
                password: form.password,
            });
            login(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-gray-800">
                            Medi<span className="text-primary-500">Book</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800 mt-4">Create your account</h1>
                    <p className="text-gray-500 text-sm mt-1">Join MediBook and take control of your health</p>
                </div>

                <div className="card shadow-xl border-gray-100">
                    {error && (
                        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                            <span className="mt-0.5">⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        {/* Age & Gender */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Age <span className="text-red-400">*</span>
                                </label>
                                <input
                                    id="age"
                                    name="age"
                                    type="number"
                                    placeholder="25"
                                    min="1"
                                    max="120"
                                    value={form.age}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Gender <span className="text-red-400">*</span>
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Phone Number <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+1 234 567 8900"
                                value={form.phone}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@email.com"
                                value={form.email}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Confirm Password <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        <button
                            id="register-btn"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Spinner size="sm" /> Creating Account...
                                </span>
                            ) : (
                                'Create Account →'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
