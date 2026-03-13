import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password)
            return setError('Please enter your email and password.');

        setError('');
        setLoading(true);
        try {
            const { data } = await loginUser({ email: form.email, password: form.password });
            login(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
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
                    <h1 className="text-2xl font-bold text-gray-800 mt-4">Welcome back!</h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in to manage your appointments</p>
                </div>

                <div className="card shadow-xl border-gray-100">
                    {error && (
                        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                            <span className="mt-0.5">⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email or Phone
                            </label>
                            <input
                                id="login-email"
                                name="email"
                                type="text"
                                placeholder="john@email.com"
                                value={form.email}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <span className="text-xs text-primary-600 hover:underline cursor-pointer">
                                    Forgot password?
                                </span>
                            </div>
                            <input
                                id="login-password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        {/* Remember Me */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    id="rememberMe"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={form.rememberMe}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.rememberMe ? 'bg-primary-500 border-primary-500' : 'border-gray-300 group-hover:border-primary-400'}`}>
                                    {form.rememberMe && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-sm text-gray-600">Remember me</span>
                        </label>

                        <button
                            id="login-btn"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Spinner size="sm" /> Signing in...
                                </span>
                            ) : (
                                'Sign In →'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 font-semibold hover:underline">
                            Register now
                        </Link>
                    </p>
                </div>

                {/* Demo hint */}
                <div className="mt-4 space-y-3">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                        <p className="text-xs text-blue-600 font-medium">
                            💡 First time? <Link to="/register" className="underline">Create a free account</Link> to get started.
                        </p>
                    </div>
                    {/* Admin Access Hint */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center flex flex-col items-center">
                        <p className="text-xs text-gray-500 font-medium mb-2">Are you a Hospital Administrator?</p>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, email: 'admin@hospital.com', password: 'HospitalPassword123' })}
                            className="bg-white border border-gray-300 text-gray-700 hover:text-primary-600 hover:border-primary-300 text-xs font-bold shadow-sm py-1.5 px-4 rounded-lg transition-all"
                        >
                            👨‍💼 Autofill Admin Credentials
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
