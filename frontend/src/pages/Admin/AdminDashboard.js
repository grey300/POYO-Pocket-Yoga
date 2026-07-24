import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { track } from '@vercel/analytics';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Tooltip, Filler, Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import apiClient from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler, Legend);

const emptyForm = { firstName: '', lastName: '', email: '', password: '', role: 'user' };

const chartBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { intersect: false, mode: 'index' } },
    scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 10 } } },
        y: {
            beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#64748b', font: { size: 10 }, precision: 0 },
        },
    },
};

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await apiClient.get('/api/admin/stats');
            setStats(data.stats);
        } catch (err) { console.error('stats error', err); }
    }, []);

    const fetchUsers = useCallback(async (term = '') => {
        setLoading(true);
        setError('');
        try {
            const { data } = await apiClient.get('/api/admin/users', { params: term ? { search: term } : {} });
            setUsers(data.users);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStats(); fetchUsers(); }, [fetchStats, fetchUsers]);

    const onSearch = (e) => { e.preventDefault(); fetchUsers(search.trim()); };

    const openCreate = () => { setForm(emptyForm); setEditingId(null); setFormError(''); setModal('create'); };
    const openEdit = (u) => {
        setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, password: '', role: u.role });
        setEditingId(u._id); setFormError(''); setModal('edit');
    };
    const closeModal = () => { setModal(null); setEditingId(null); setForm(emptyForm); };
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const submitForm = async (e) => {
        e.preventDefault();
        setFormError(''); setSaving(true);
        try {
            if (modal === 'create') {
                await apiClient.post('/api/admin/users', form);
                track('admin_user_created', { role: form.role });
            } else {
                const payload = { ...form };
                if (!payload.password) delete payload.password;
                await apiClient.put(`/api/admin/users/${editingId}`, payload);
                track('admin_user_updated', { role: form.role });
            }
            closeModal();
            await Promise.all([fetchUsers(search.trim()), fetchStats()]);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Save failed.');
        } finally { setSaving(false); }
    };

    const deleteUser = async (u) => {
        if (!window.confirm(`Delete ${u.firstName} ${u.lastName} (${u.email})? This also removes their practice data.`)) return;
        try {
            await apiClient.delete(`/api/admin/users/${u._id}`);
            track('admin_user_deleted');
            await Promise.all([fetchUsers(search.trim()), fetchStats()]);
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed.');
        }
    };

    const handleLogout = () => { logout(); navigate('/admin/login'); };

    const Stat = ({ label, value, sub, icon, accent = 'text-glow-300' }) => (
        <div className="panel p-5">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
                <span>{icon}</span>
                <p className="text-xs uppercase tracking-wide">{label}</p>
            </div>
            <p className={`text-3xl font-extrabold ${accent}`}>{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
    );

    const signupData = stats && {
        labels: stats.signupsByDay.map((d) => d.date.slice(5)),
        datasets: [{
            data: stats.signupsByDay.map((d) => d.count),
            borderColor: '#3B8CFF', backgroundColor: 'rgba(59,140,255,0.15)',
            fill: true, tension: 0.35, pointRadius: 2, pointBackgroundColor: '#3B8CFF', borderWidth: 2,
        }],
    };

    const poseData = stats && {
        labels: stats.posePopularity.map((p) => p.pose),
        datasets: [{
            data: stats.posePopularity.map((p) => p.users),
            backgroundColor: 'rgba(59,140,255,0.55)', borderColor: '#3B8CFF',
            borderWidth: 1, borderRadius: 6,
        }],
    };

    return (
        <div className="min-h-screen bg-ink-950">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-ink-950/85 backdrop-blur-md border-b border-white/10">
                <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-glow-500 text-white flex items-center justify-center font-black text-sm shadow-glow">P</div>
                        <span className="font-semibold text-white">POYO Admin</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                            <Avatar user={user} size="w-8 h-8" text="text-[10px]" />
                            <span className="text-sm text-slate-400">{user?.email}</span>
                        </div>
                        <button onClick={handleLogout} className="btn-ghost !py-1.5 !px-3 text-sm">Log out</button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-5 sm:px-6 py-8">
                <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
                <p className="text-slate-500 mb-6">Platform activity and user management.</p>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 p-1 rounded-xl bg-ink-900 border border-white/10 w-fit">
                    {['overview', 'users'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-glow-500 text-white shadow-glow' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {tab === 'overview' && stats && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                            <Stat label="Total users" value={stats.totalUsers} sub={`${stats.newUsers7d} new this week`} icon="👥" />
                            <Stat label="Live sessions" value={stats.totalSessions} sub={`${stats.sessionUsers} users practiced`} icon="🧘" accent="text-sky-300" />
                            <Stat label="AI plans" value={stats.totalPlans} sub={`${stats.planUsers} users generated`} icon="✨" accent="text-violet-300" />
                            <Stat label="Practice time" value={`${stats.totalPracticeTime}s`} sub="all users combined" icon="⏱" accent="text-amber-300" />
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                            <Stat label="Active (7d)" value={stats.activeUsers7d} sub="practiced this week" icon="⚡" accent="text-emerald-300" />
                            <Stat label="Active (30d)" value={stats.activeUsers30d} sub="practiced this month" icon="📈" accent="text-emerald-300" />
                            <Stat label="Saved plans" value={stats.savedPlans} sub="kept by users" icon="🔖" accent="text-violet-300" />
                            <Stat label="Best streak" value={`${stats.bestStreak}d`} sub="longest on record" icon="🔥" accent="text-orange-300" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div className="panel p-5">
                                <h2 className="font-semibold text-white mb-1">New signups</h2>
                                <p className="text-xs text-slate-500 mb-4">Last 14 days</p>
                                <div className="h-56">{signupData && <Line data={signupData} options={chartBase} />}</div>
                            </div>
                            <div className="panel p-5">
                                <h2 className="font-semibold text-white mb-1">Pose popularity</h2>
                                <p className="text-xs text-slate-500 mb-4">Users who have practiced each pose</p>
                                <div className="h-56">{poseData && <Bar data={poseData} options={chartBase} />}</div>
                            </div>
                        </div>
                    </>
                )}

                {tab === 'users' && (
                    <div className="panel">
                        <div className="p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-b border-white/10">
                            <div>
                                <h2 className="font-semibold text-white">Users</h2>
                                <p className="text-sm text-slate-500">{users.length} shown</p>
                            </div>
                            <div className="flex gap-2">
                                <form onSubmit={onSearch}>
                                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search users…" className="field !py-2 w-44 sm:w-56 text-sm" />
                                </form>
                                <button onClick={openCreate} className="btn-primary !py-2 !px-3.5 text-sm whitespace-nowrap">+ Add User</button>
                            </div>
                        </div>

                        {error && <div className="m-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 text-sm">{error}</div>}

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500 border-b border-white/10">
                                        <th className="py-3 px-5 font-medium">User</th>
                                        <th className="py-3 px-5 font-medium">Role</th>
                                        <th className="py-3 px-5 font-medium">Streak</th>
                                        <th className="py-3 px-5 font-medium">Activity</th>
                                        <th className="py-3 px-5 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="py-10 text-center text-slate-500">Loading…</td></tr>
                                    ) : users.length === 0 ? (
                                        <tr><td colSpan={5} className="py-10 text-center text-slate-500">No users found.</td></tr>
                                    ) : users.map((u) => {
                                        const isSelf = u._id === user?.id || u._id === user?._id;
                                        return (
                                            <tr key={u._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                                                <td className="py-3 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar user={u} size="w-9 h-9" text="text-[10px]" />
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-white truncate">{u.firstName} {u.lastName}</p>
                                                            <p className="text-slate-500 text-xs truncate">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-5">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin'
                                                        ? 'bg-glow-500/20 text-glow-300 border border-glow-400/30'
                                                        : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-5 text-slate-300">
                                                    {u.currentStreak > 0 ? <span className="text-orange-300">🔥 {u.currentStreak}d</span> : <span className="text-slate-600">—</span>}
                                                </td>
                                                <td className="py-3 px-5 text-slate-400 text-xs">
                                                    {u.sessionCount || 0} sessions · {u.planCount || 0} plans
                                                </td>
                                                <td className="py-3 px-5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => openEdit(u)} title="Edit"
                                                            className="p-2 rounded-lg text-slate-500 hover:text-glow-300 hover:bg-glow-500/10 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.5 5.5l3 3M4 20l4-1 10-10-3-3L5 16l-1 4z" /></svg>
                                                        </button>
                                                        <button onClick={() => deleteUser(u)} disabled={isSelf}
                                                            title={isSelf ? "You can't delete yourself" : 'Delete'}
                                                            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m1 0l-.5 12a1 1 0 01-1 1H8a1 1 0 01-1-1L6.5 7" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={closeModal}>
                    <div className="panel !bg-ink-850 shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-white">{modal === 'create' ? 'Add New User' : 'Edit User'}</h3>
                            <button onClick={closeModal} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
                            </button>
                        </div>

                        <form onSubmit={submitForm} className="p-6 space-y-4">
                            {formError && <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 text-sm">{formError}</div>}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">First name</label>
                                    <input name="firstName" value={form.firstName} onChange={handleFormChange} className="field" required />
                                </div>
                                <div>
                                    <label className="label">Last name</label>
                                    <input name="lastName" value={form.lastName} onChange={handleFormChange} className="field" required />
                                </div>
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input name="email" type="email" value={form.email} onChange={handleFormChange} className="field" required />
                            </div>
                            <div>
                                <label className="label">
                                    Password {modal === 'edit' && <span className="text-slate-600 font-normal">(leave blank to keep)</span>}
                                </label>
                                <input name="password" type="password" value={form.password} onChange={handleFormChange}
                                    placeholder={modal === 'edit' ? '••••••••' : ''} className="field" required={modal === 'create'} />
                            </div>
                            <div>
                                <label className="label">Role</label>
                                <select name="role" value={form.role} onChange={handleFormChange} className="field">
                                    <option value="user">user</option>
                                    <option value="admin">admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={closeModal} className="btn-ghost !py-2">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary !py-2">{saving ? 'Saving…' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
