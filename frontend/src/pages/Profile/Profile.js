import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import Avatar from '../../components/Avatar';
import PlanMarkdown from '../../components/PlanMarkdown';
import apiClient from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const poseList = ['Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand'];

const StatCard = ({ label, value, unit, icon, accent = 'text-glow-300' }) => (
    <div className="panel p-5">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
            <span className="text-base leading-none">{icon}</span>
            <p className="text-xs uppercase tracking-wide">{label}</p>
        </div>
        <p className={`text-3xl font-extrabold ${accent}`}>
            {value}
            {unit && <span className="text-sm text-slate-500 font-medium ml-1">{unit}</span>}
        </p>
    </div>
);

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [selectedPose, setSelectedPose] = useState(poseList[0]);
    const [plans, setPlans] = useState([]);
    const [openPlan, setOpenPlan] = useState(null);

    const fetchPlans = useCallback(async () => {
        try {
            const { data } = await apiClient.get('/api/plans');
            setPlans(data.plans);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        apiClient.get('/api/profile').then(({ data }) => setProfile(data.user)).catch(() => { });
        fetchPlans();
    }, [fetchPlans]);

    useEffect(() => {
        apiClient
            .get(`/api/leaderboard?pose=${selectedPose}`)
            .then(({ data }) => setLeaderboard(data.leaderboard))
            .catch(() => { });
    }, [selectedPose]);

    const deletePlan = async (id) => {
        if (!window.confirm('Delete this saved plan?')) return;
        try {
            await apiClient.delete(`/api/plans/${id}`);
            setOpenPlan((p) => (p === id ? null : p));
            fetchPlans();
        } catch { /* ignore */ }
    };

    if (!user) return null;

    const p = profile || {};
    const bestTimes = poseList.reduce((acc, pose) => ({ ...acc, [pose]: p[`${pose}_best`] || 0 }), {});
    const topPose = poseList.reduce((a, b) => (bestTimes[a] >= bestTimes[b] ? a : b), poseList[0]);
    const medal = (i) => ['🥇', '🥈', '🥉'][i] || i + 1;

    return (
        <div className="min-h-screen bg-ink-950">
            <NavBar />

            <main className="max-w-6xl mx-auto px-5 sm:px-6 pt-24 pb-16">
                {/* Header */}
                <div className="panel p-6 sm:p-7 mb-5 relative overflow-hidden">
                    <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-glow-500/10 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
                        <Avatar user={{ ...user, ...p }} size="w-20 h-20" text="text-2xl" ring />
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-white truncate">
                                {user.firstName} {user.lastName}
                            </h1>
                            <p className="text-slate-400 text-sm truncate">{user.email}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                {p.currentStreak > 0 && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-orange-500/10 border border-orange-500/30 text-orange-300 px-2.5 py-1 rounded-full">
                                        🔥 {p.currentStreak}-day streak
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-full">
                                    Best pose · {topPose}
                                </span>
                                {user.role === 'admin' && (
                                    <span className="inline-flex items-center text-xs font-medium bg-glow-500/15 border border-glow-400/30 text-glow-300 px-2.5 py-1 rounded-full">
                                        admin
                                    </span>
                                )}
                            </div>
                        </div>
                        <Link to="/yoga">
                            <button className="btn-primary whitespace-nowrap">Start session</button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                    <StatCard label="Current streak" value={p.currentStreak || 0} unit="days" icon="🔥" accent="text-orange-300" />
                    <StatCard label="Longest streak" value={p.longestStreak || 0} unit="days" icon="🏆" accent="text-amber-300" />
                    <StatCard label="Total practice" value={Math.round(p.cumulativePoseTime || 0)} unit="s" icon="⏱" />
                    <StatCard label="Sessions" value={p.sessionCount || 0} unit="" icon="🧘" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Best times */}
                    <div className="panel p-6">
                        <h2 className="font-semibold text-white mb-4">Best hold per pose</h2>
                        <div className="space-y-3">
                            {poseList.map((pose) => {
                                const val = bestTimes[pose];
                                const max = Math.max(...Object.values(bestTimes), 1);
                                return (
                                    <div key={pose}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-300">{pose}</span>
                                            <span className="text-slate-400 font-medium">{val.toFixed ? val.toFixed(1) : val}s</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-glow-600 to-glow-300 transition-all duration-700"
                                                style={{ width: `${Math.min(100, (val / max) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="panel p-6">
                        <div className="flex items-center justify-between mb-4 gap-3">
                            <h2 className="font-semibold text-white">Global leaderboard</h2>
                            <select
                                value={selectedPose}
                                onChange={(e) => setSelectedPose(e.target.value)}
                                className="field !w-auto !py-1.5 text-xs"
                            >
                                {poseList.map((pose) => <option key={pose} value={pose}>{pose}</option>)}
                            </select>
                        </div>

                        {leaderboard.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-10">No entries yet — be the first!</p>
                        ) : (
                            <div className="space-y-1">
                                {leaderboard.map((entry, i) => {
                                    const d = entry.userDetails;
                                    const isMe = `${d.firstName} ${d.lastName}` === `${user.firstName} ${user.lastName}`;
                                    return (
                                        <div
                                            key={entry.userId || i}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isMe ? 'bg-glow-500/10 border border-glow-400/25' : 'hover:bg-white/5'
                                                }`}
                                        >
                                            <span className="w-6 text-center text-sm text-slate-400 shrink-0">{medal(i)}</span>
                                            <Avatar user={d} size="w-8 h-8" text="text-[10px]" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white truncate">
                                                    {d.firstName} {d.lastName}
                                                    {isMe && <span className="text-glow-300 text-xs ml-1.5">you</span>}
                                                </p>
                                                {d.currentStreak > 0 && (
                                                    <p className="text-[11px] text-orange-300/80">🔥 {d.currentStreak}-day streak</p>
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-glow-200 shrink-0">
                                                {Number(entry[`${selectedPose}_best`] || 0).toFixed(1)}s
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Saved plans */}
                <div className="panel p-6 mt-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-white">Saved plans</h2>
                        <Link to="/about" className="text-sm text-glow-300 hover:text-glow-200">+ New plan</Link>
                    </div>

                    {plans.length === 0 ? (
                        <p className="text-sm text-slate-500 py-6 text-center">
                            No saved plans yet. Generate one in the <Link to="/about" className="text-glow-300">AI Planner</Link>.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {plans.map((plan) => (
                                <div key={plan._id} className="rounded-xl border border-white/10 bg-ink-900 overflow-hidden">
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <button
                                            onClick={() => setOpenPlan(openPlan === plan._id ? null : plan._id)}
                                            className="flex-1 text-left min-w-0"
                                        >
                                            <p className="text-sm font-medium text-white truncate">{plan.title}</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(plan.createdAt).toLocaleDateString()}
                                                {plan.meta?.experience && ` · ${plan.meta.experience}`}
                                            </p>
                                        </button>
                                        <button
                                            onClick={() => setOpenPlan(openPlan === plan._id ? null : plan._id)}
                                            className="text-xs text-slate-400 hover:text-white px-2 py-1"
                                        >
                                            {openPlan === plan._id ? 'Hide' : 'View'}
                                        </button>
                                        <button
                                            onClick={() => deletePlan(plan._id)}
                                            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete plan"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m1 0l-.5 12a1 1 0 01-1 1H8a1 1 0 01-1-1L6.5 7" />
                                            </svg>
                                        </button>
                                    </div>
                                    {openPlan === plan._id && (
                                        <div className="px-4 pb-4 pt-1 border-t border-white/10">
                                            <PlanMarkdown content={plan.content} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
