import React, { useState } from 'react';
import Navbar from '../../components/NavBar';
import Footer from '../../components/Footer';
import PlanMarkdown from '../../components/PlanMarkdown';
import apiClient from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const EXPERIENCE_OPTIONS = [
    { value: 'beginner', label: 'Beginner', hint: 'New to yoga or returning after a break' },
    { value: 'intermediate', label: 'Intermediate', hint: 'Comfortable holding basic poses' },
    { value: 'advanced', label: 'Advanced', hint: 'Regular practice, confident with balance' },
];

const TRACKED_POSES = ['Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand'];

export default function YogaPlanner() {
    const { user } = useAuth();
    const [form, setForm] = useState({ age: '', weight: '', height: '', experience: 'beginner' });
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const generatePlan = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.age || !form.weight || !form.height) {
            setError('Please fill in your age, weight, and height.');
            return;
        }

        setLoading(true);
        setPlan(null);
        try {
            const { data } = await apiClient.post('/api/generate-plan', form);
            setPlan(data.plan);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not generate a plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyPlan = async () => {
        try {
            await navigator.clipboard.writeText(plan);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard unavailable — ignore */
        }
    };

    const inputClass =
        'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A5A40]/40 focus:border-transparent';

    return (
        <div className="bg-[#F4F6F1] min-h-screen">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">
                {/* Header */}
                <div className="mb-8 max-w-2xl">
                    <span className="inline-block text-xs font-semibold tracking-wide uppercase text-[#3A5A40] bg-[#EDF1E8] px-2.5 py-1 rounded-full mb-3">
                        AI Powered
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                        AI Yoga Planner
                    </h1>
                    <p className="mt-3 text-slate-600 leading-relaxed">
                        {user ? `Hi ${user.firstName}, t` : 'T'}ell us a bit about yourself and we'll build a
                        personalized routine — warm-up, pose sequence, hold times, and cool-down — using the
                        poses POYO can track live on your webcam.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                        {TRACKED_POSES.map((p) => (
                            <span key={p} className="text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:sticky lg:top-24">
                            <h2 className="font-semibold text-slate-800 mb-1">Your details</h2>
                            <p className="text-sm text-slate-500 mb-5">
                                Used only to tailor this plan — nothing is stored.
                            </p>

                            {error && (
                                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={generatePlan} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="age" className="block text-xs font-medium text-slate-600 mb-1.5">Age</label>
                                        <input id="age" name="age" type="number" min="1" value={form.age} onChange={handleChange} placeholder="28" className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="weight" className="block text-xs font-medium text-slate-600 mb-1.5">Weight (kg)</label>
                                        <input id="weight" name="weight" type="number" min="1" value={form.weight} onChange={handleChange} placeholder="65" className={inputClass} />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="height" className="block text-xs font-medium text-slate-600 mb-1.5">Height (cm)</label>
                                    <input id="height" name="height" type="number" min="1" value={form.height} onChange={handleChange} placeholder="170" className={inputClass} />
                                </div>

                                <div>
                                    <label htmlFor="experience" className="block text-xs font-medium text-slate-600 mb-1.5">Experience level</label>
                                    <select id="experience" name="experience" value={form.experience} onChange={handleChange} className={`${inputClass} bg-white`}>
                                        {EXPERIENCE_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-400 mt-1.5">
                                        {EXPERIENCE_OPTIONS.find((o) => o.value === form.experience)?.hint}
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-[#3A5A40] hover:bg-[#2c4531] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                            </svg>
                                            Generating…
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5L13 3z" />
                                            </svg>
                                            Generate Plan
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Result */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[420px]">
                            {loading ? (
                                <div className="p-6">
                                    <div className="animate-pulse space-y-3">
                                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                                        <div className="h-3 bg-slate-100 rounded w-full" />
                                        <div className="h-3 bg-slate-100 rounded w-5/6" />
                                        <div className="h-4 bg-slate-200 rounded w-1/4 mt-6" />
                                        <div className="h-3 bg-slate-100 rounded w-full" />
                                        <div className="h-3 bg-slate-100 rounded w-4/6" />
                                        <div className="h-3 bg-slate-100 rounded w-5/6" />
                                    </div>
                                    <p className="text-sm text-slate-400 mt-6 text-center">Building your routine…</p>
                                </div>
                            ) : plan ? (
                                <>
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                        <h2 className="font-semibold text-slate-800">Your Personalized Plan</h2>
                                        <button
                                            onClick={copyPlan}
                                            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#3A5A40] border border-slate-200 hover:border-[#3A5A40]/40 rounded-lg px-3 py-1.5 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2M10 3h8a2 2 0 012 2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2V5a2 2 0 012-2z" />
                                            </svg>
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="px-6 py-5">
                                        <PlanMarkdown content={plan} />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center h-[420px] px-8">
                                    <div className="w-14 h-14 rounded-2xl bg-[#EDF1E8] text-[#3A5A40] flex items-center justify-center mb-4">
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-slate-700">No plan yet</h3>
                                    <p className="text-sm text-slate-500 mt-1 max-w-xs">
                                        Fill in your details and hit <span className="font-medium text-slate-600">Generate Plan</span> — your routine will appear here.
                                    </p>
                                </div>
                            )}
                        </div>

                        {plan && (
                            <p className="text-xs text-slate-400 mt-3 px-1">
                                AI-generated guidance. Listen to your body, and consult a professional if you have injuries or health conditions.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
