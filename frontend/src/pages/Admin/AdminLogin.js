import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login, logout } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(formData.email.trim(), formData.password);
            if (user.role !== 'admin') {
                logout();
                setError('This account does not have admin access.');
                return;
            }
            navigate('/admin', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-950">
            {/* Left brand panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#3A5A40] via-[#2c4531] to-[#1a231d]">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-2xl" />
                <div className="absolute bottom-0 -right-16 w-80 h-80 rounded-full bg-emerald-400/10 blur-2xl" />
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-xl font-black">P</div>
                        <span className="text-lg font-semibold tracking-tight">POYO Admin</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black leading-tight tracking-tight">
                            Manage your<br />yoga community.
                        </h1>
                        <p className="mt-4 text-white/70 max-w-sm">
                            Members, roles, and practice stats — all in one clean control panel.
                        </p>
                    </div>
                    <p className="text-white/40 text-sm">Restricted area · authorized administrators only</p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex items-center gap-3 mb-8 text-white">
                        <div className="w-10 h-10 rounded-2xl bg-[#3A5A40] flex items-center justify-center text-lg font-black">P</div>
                        <span className="text-lg font-semibold">POYO Admin</span>
                    </div>

                    <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                    <p className="text-slate-400 mt-1 mb-8">Sign in to the admin portal.</p>

                    {error && (
                        <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-300">Email</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="admin@poyo.com"
                                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2.5 pl-10 pr-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-slate-300">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </span>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2.5 pl-10 pr-10 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-transparent"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((s) => !s)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                                    tabIndex={-1}
                                >
                                    {showPw ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A9.1 9.1 0 0112 4c5 0 9 4.5 9 8a11 11 0 01-2.2 3.3M6.1 6.1A11 11 0 003 12c0 3.5 4 8 9 8a9 9 0 003.9-.9" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
