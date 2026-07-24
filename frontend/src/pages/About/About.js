import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/NavBar';
import Footer from '../../components/Footer';
import PlanMarkdown from '../../components/PlanMarkdown';
import apiClient from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const EXPERIENCE = [
    { value: 'beginner', label: 'Beginner', hint: 'New to yoga or returning after a break' },
    { value: 'intermediate', label: 'Intermediate', hint: 'Comfortable holding basic poses' },
    { value: 'advanced', label: 'Advanced', hint: 'Regular practice, confident with balance' },
];

const TRACKED = ['Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand'];

export default function YogaPlanner() {
    const { user } = useAuth();
    const [form, setForm] = useState({ age: '', weight: '', height: '', experience: 'beginner' });
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedId, setSavedId] = useState(null);
    const [plans, setPlans] = useState([]);

    const fetchPlans = useCallback(async () => {
        try {
            const { data } = await apiClient.get('/api/plans');
            setPlans(data.plans);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => { fetchPlans(); }, [fetchPlans]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const generate = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.age || !form.weight || !form.height) {
            setError('Please fill in your age, weight, and height.');
            return;
        }
        setLoading(true);
        setPlan(null);
        setSavedId(null);
        try {
            const { data } = await apiClient.post('/api/generate-plan', form);
            setPlan(data.plan);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not generate a plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const savePlan = async () => {
        setSaving(true);
        try {
            const { data } = await apiClient.post('/api/plans', {
                title: `${form.experience} plan · ${new Date().toLocaleDateString()}`,
                content: plan,
                meta: form,
            });
            setSavedId(data.plan._id);
            fetchPlans();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save the plan.');
        } finally {
            setSaving(false);
        }
    };

    const deletePlan = async (id) => {
        if (!window.confirm('Delete this saved plan?')) return;
        try {
            await apiClient.delete(`/api/plans/${id}`);
            if (savedId === id) setSavedId(null);
            fetchPlans();
        } catch { /* ignore */ }
    };

    const copyPlan = async () => {
        try {
            await navigator.clipboard.writeText(plan);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    return (
        <div className="min-h-screen bg-ink-950 relative">
            <div className="aurora" />
            <Navbar />

            <main className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-28 pb-16">
                <div className="mb-8 max-w-2xl">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-glow-300 bg-glow-500/10 border border-glow-400/25 px-3 py-1.5 rounded-full">
                        AI Powered
                    </span>
                    <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        AI Yoga <span className="text-gradient">Planner</span>
                    </h1>
                    <p className="mt-3 text-slate-400 leading-relaxed">
                        {user ? `Hi ${user.firstName}, t` : 'T'}ell us about yourself and we'll build a routine —
                        warm-up, sequence, hold times and cool-down — using the poses POYO tracks live.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                        {TRACKED.map((p) => (
                            <span key={p} className="text-xs bg-white/5 border border-white/10 text-slate-400 px-2.5 py-1 rounded-full">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="panel p-6 lg:sticky lg:top-24">
                            <h2 className="font-semibold text-white mb-1">Your details</h2>
                            <p className="text-sm text-slate-500 mb-5">Used only to tailor this plan.</p>

                            {error && (
                                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={generate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="age" className="label">Age</label>
                                        <input id="age" name="age" type="number" min="1" value={form.age} onChange={handleChange} placeholder="28" className="field" />
                                    </div>
                                    <div>
                                        <label htmlFor="weight" className="label">Weight (kg)</label>
                                        <input id="weight" name="weight" type="number" min="1" value={form.weight} onChange={handleChange} placeholder="65" className="field" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="height" className="label">Height (cm)</label>
                                    <input id="height" name="height" type="number" min="1" value={form.height} onChange={handleChange} placeholder="170" className="field" />
                                </div>
                                <div>
                                    <label htmlFor="experience" className="label">Experience level</label>
                                    <select id="experience" name="experience" value={form.experience} onChange={handleChange} className="field">
                                        {EXPERIENCE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    <p className="text-[11px] text-slate-500 mt-1.5">
                                        {EXPERIENCE.find((o) => o.value === form.experience)?.hint}
                                    </p>
                                </div>

                                <button type="submit" disabled={loading} className="btn-primary w-full">
                                    {loading ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                            </svg>
                                            Generating…
                                        </>
                                    ) : 'Generate Plan'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Result */}
                    <div className="lg:col-span-3 space-y-5">
                        <div className="panel min-h-[420px]">
                            {loading ? (
                                <div className="p-6 animate-pulse space-y-3">
                                    <div className="h-4 bg-white/10 rounded w-1/3" />
                                    <div className="h-3 bg-white/5 rounded w-full" />
                                    <div className="h-3 bg-white/5 rounded w-5/6" />
                                    <div className="h-4 bg-white/10 rounded w-1/4 mt-6" />
                                    <div className="h-3 bg-white/5 rounded w-full" />
                                    <div className="h-3 bg-white/5 rounded w-4/6" />
                                    <p className="text-sm text-slate-500 pt-6 text-center">Building your routine…</p>
                                </div>
                            ) : plan ? (
                                <>
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 gap-2">
                                        <h2 className="font-semibold text-white">Your plan</h2>
                                        <div className="flex gap-2">
                                            <button onClick={copyPlan} className="btn-ghost !px-3 !py-1.5 text-xs">
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                            <button
                                                onClick={savePlan}
                                                disabled={saving || !!savedId}
                                                className="btn-primary !px-3 !py-1.5 text-xs"
                                            >
                                                {savedId ? '✓ Saved' : saving ? 'Saving…' : 'Save plan'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="px-6 py-5">
                                        <PlanMarkdown content={plan} />
                                        <p className="text-xs text-slate-600 mt-6 pt-4 border-t border-white/10">
                                            AI-generated guidance. Listen to your body and consult a professional if you have injuries.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center h-[420px] px-8">
                                    <div className="w-14 h-14 rounded-2xl bg-glow-500/10 border border-glow-400/25 text-glow-300 flex items-center justify-center mb-4">
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-slate-300">No plan yet</h3>
                                    <p className="text-sm text-slate-500 mt-1 max-w-xs">
                                        Fill in your details and hit <span className="text-slate-300 font-medium">Generate Plan</span>.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Saved plans */}
                        <div className="panel p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-semibold text-white text-sm">Saved plans</h2>
                                <span className="text-xs text-slate-500">{plans.length} saved</span>
                            </div>
                            {plans.length === 0 ? (
                                <p className="text-sm text-slate-500 py-4 text-center">
                                    Generate a plan and hit <span className="text-slate-300">Save plan</span> to keep it here.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {plans.map((sp) => (
                                        <div key={sp._id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white truncate">{sp.title}</p>
                                                <p className="text-xs text-slate-500">{new Date(sp.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <button onClick={() => setPlan(sp.content)} className="text-xs text-glow-300 hover:text-glow-200 px-2">
                                                Open
                                            </button>
                                            <button
                                                onClick={() => deletePlan(sp._id)}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Delete plan"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m1 0l-.5 12a1 1 0 01-1 1H8a1 1 0 01-1-1L6.5 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-slate-600 mt-3">
                                Saved plans also appear on your <Link to="/profile" className="text-glow-400 hover:text-glow-300">profile</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
