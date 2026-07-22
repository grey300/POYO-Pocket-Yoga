import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { firstName: '', lastName: '', email: '', password: '', role: 'user' };

// Deterministic avatar tint from a string.
const AVATAR_TINTS = ['bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'];
const tintFor = (s = '') => AVATAR_TINTS[s.charCodeAt(0) % AVATAR_TINTS.length];

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modal, setModal] = useState(null); // 'create' | 'edit' | null
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await apiClient.get('/api/admin/stats');
            setStats(data.stats);
        } catch (err) {
            console.error('stats error', err);
        }
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

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, [fetchStats, fetchUsers]);

    const onSearch = (e) => {
        e.preventDefault();
        fetchUsers(search.trim());
    };

    const openCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setFormError('');
        setModal('create');
    };

    const openEdit = (u) => {
        setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, password: '', role: u.role });
        setEditingId(u._id);
        setFormError('');
        setModal('edit');
    };

    const closeModal = () => {
        setModal(null);
        setEditingId(null);
        setForm(emptyForm);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const submitForm = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);
        try {
            if (modal === 'create') {
                await apiClient.post('/api/admin/users', form);
            } else {
                const payload = { ...form };
                if (!payload.password) delete payload.password;
                await apiClient.put(`/api/admin/users/${editingId}`, payload);
            }
            closeModal();
            await Promise.all([fetchUsers(search.trim()), fetchStats()]);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Save failed.');
        } finally {
            setSaving(false);
        }
    };

    const deleteUser = async (u) => {
        if (!window.confirm(`Delete ${u.firstName} ${u.lastName} (${u.email})? This also removes their practice data.`)) return;
        try {
            await apiClient.delete(`/api/admin/users/${u._id}`);
            await Promise.all([fetchUsers(search.trim()), fetchStats()]);
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed.');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const initials = (u) => `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();

    const StatCard = ({ label, value, icon, accent }) => (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>{icon}</div>
            <div>
                <p className="text-2xl font-extrabold text-slate-800 leading-none">{value}</p>
                <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#3A5A40] text-white flex items-center justify-center font-black">P</div>
                        <span className="font-semibold text-slate-800">POYO Admin</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full ${tintFor(user?.email)} text-white flex items-center justify-center text-xs font-bold`}>
                                {user ? initials(user) : ''}
                            </div>
                            <span className="text-sm text-slate-600">{user?.email}</span>
                        </div>
                        <button onClick={handleLogout} className="text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 transition-colors">
                            Log out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-1">Dashboard</h1>
                <p className="text-slate-500 mb-6">Overview of your users and activity.</p>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard label="Total Users" value={stats.totalUsers} accent="bg-emerald-50 text-emerald-600"
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a3 3 0 10-3-3" /></svg>} />
                        <StatCard label="Members" value={stats.totalMembers} accent="bg-sky-50 text-sky-600"
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                        <StatCard label="Admins" value={stats.totalAdmins} accent="bg-violet-50 text-violet-600"
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" /></svg>} />
                        <StatCard label="Total Practice (s)" value={stats.totalPracticeTime} accent="bg-amber-50 text-amber-600"
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" /></svg>} />
                    </div>
                )}

                {/* Users card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-b border-slate-100">
                        <div>
                            <h2 className="font-semibold text-slate-800">Users</h2>
                            <p className="text-sm text-slate-500">{users.length} shown</p>
                        </div>
                        <div className="flex gap-2">
                            <form onSubmit={onSearch} className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M21 21l-4-4" /></svg>
                                </span>
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search users…"
                                    className="w-48 sm:w-56 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white"
                                />
                            </form>
                            <button onClick={openCreate} className="inline-flex items-center gap-1.5 bg-[#3A5A40] hover:bg-[#2c4531] text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
                                Add User
                            </button>
                        </div>
                    </div>

                    {error && <div className="m-5 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>}

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-500 border-b border-slate-100">
                                    <th className="py-3 px-5 font-medium">User</th>
                                    <th className="py-3 px-5 font-medium">Role</th>
                                    <th className="py-3 px-5 font-medium">Joined</th>
                                    <th className="py-3 px-5 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} className="py-10 text-center text-slate-400">Loading…</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={4} className="py-10 text-center text-slate-400">No users found.</td></tr>
                                ) : (
                                    users.map((u) => {
                                        const isSelf = u._id === user?.id || u._id === user?._id;
                                        return (
                                            <tr key={u._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                                                <td className="py-3 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-full ${tintFor(u.email)} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                                                            {initials(u)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-slate-800 truncate">{u.firstName} {u.lastName}</p>
                                                            <p className="text-slate-500 text-xs truncate">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-5">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-5 text-slate-500">
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                                </td>
                                                <td className="py-3 px-5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => openEdit(u)} title="Edit" className="p-2 rounded-lg text-slate-500 hover:text-[#3A5A40] hover:bg-emerald-50 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.5 5.5l3 3M4 20l4-1 10-10-3-3L5 16l-1 4z" /></svg>
                                                        </button>
                                                        <button onClick={() => deleteUser(u)} disabled={isSelf} title={isSelf ? "You can't delete yourself" : 'Delete'} className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m1 0l-.5 12a1 1 0 01-1 1H8a1 1 0 01-1-1L6.5 7" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-800">{modal === 'create' ? 'Add New User' : 'Edit User'}</h3>
                            <button onClick={closeModal} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
                            </button>
                        </div>

                        <form onSubmit={submitForm} className="p-6 space-y-4">
                            {formError && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{formError}</div>}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">First name</label>
                                    <input name="firstName" value={form.firstName} onChange={handleFormChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Last name</label>
                                    <input name="lastName" value={form.lastName} onChange={handleFormChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                                <input name="email" type="email" value={form.email} onChange={handleFormChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                    Password {modal === 'edit' && <span className="text-slate-400 font-normal">(leave blank to keep)</span>}
                                </label>
                                <input name="password" type="password" value={form.password} onChange={handleFormChange} placeholder={modal === 'edit' ? '••••••••' : ''} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40" required={modal === 'create'} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                                <select name="role" value={form.role} onChange={handleFormChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                                    <option value="user">user</option>
                                    <option value="admin">admin</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Cancel</button>
                                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-[#3A5A40] text-white rounded-lg hover:bg-[#2c4531] disabled:opacity-60">
                                    {saving ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
