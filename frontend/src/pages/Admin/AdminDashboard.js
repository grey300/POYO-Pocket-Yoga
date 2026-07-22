import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { firstName: '', lastName: '', email: '', password: '', role: 'user' };

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state: mode is 'create' | 'edit' | null
    const [modal, setModal] = useState(null);
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
                if (!payload.password) delete payload.password; // don't reset password unless provided
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
        if (!window.confirm(`Delete ${u.firstName} ${u.lastName} (${u.email})? This also removes their practice data.`)) {
            return;
        }
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

    const StatCard = ({ label, value }) => (
        <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-extrabold text-[#3A5A40] mt-1">{value}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F4F6F1]">
            {/* Top bar */}
            <div className="bg-[#3A5A40] text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">POYO Admin</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-white/80 hidden sm:block">{user?.email}</span>
                        <button onClick={handleLogout} className="text-sm bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg">
                            Log out
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard label="Total Users" value={stats.totalUsers} />
                        <StatCard label="Members" value={stats.totalMembers} />
                        <StatCard label="Admins" value={stats.totalAdmins} />
                        <StatCard label="Total Practice (s)" value={stats.totalPracticeTime} />
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">User Management</h2>
                    <div className="flex gap-2">
                        <form onSubmit={onSearch} className="flex gap-2">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search name or email…"
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A5A40]"
                            />
                            <button type="submit" className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-900">
                                Search
                            </button>
                        </form>
                        <button onClick={openCreate} className="bg-[#3A5A40] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#242F2A]">
                            + Add User
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{error}</div>
                )}

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-[#EDF1E8] text-gray-600 text-left">
                                    <th className="py-3 px-4">Name</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">Role</th>
                                    <th className="py-3 px-4">Joined</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">Loading…</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">No users found.</td></tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u._id} className="border-t border-gray-100">
                                            <td className="py-3 px-4 text-gray-800 font-medium">{u.firstName} {u.lastName}</td>
                                            <td className="py-3 px-4 text-gray-600">{u.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-[#3A5A40] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                <button onClick={() => openEdit(u)} className="text-[#3A5A40] hover:underline mr-4">Edit</button>
                                                <button
                                                    onClick={() => deleteUser(u)}
                                                    disabled={u._id === user?.id || u._id === user?._id}
                                                    className="text-red-600 hover:underline disabled:text-gray-300 disabled:no-underline"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create / Edit modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            {modal === 'create' ? 'Add New User' : 'Edit User'}
                        </h3>

                        {formError && (
                            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">{formError}</div>
                        )}

                        <form onSubmit={submitForm} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input name="firstName" value={form.firstName} onChange={handleFormChange} placeholder="First name" className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3A5A40]" required />
                                <input name="lastName" value={form.lastName} onChange={handleFormChange} placeholder="Last name" className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3A5A40]" required />
                            </div>
                            <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="Email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3A5A40]" required />
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleFormChange}
                                placeholder={modal === 'edit' ? 'New password (leave blank to keep)' : 'Password'}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3A5A40]"
                                required={modal === 'create'}
                            />
                            <select name="role" value={form.role} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3A5A40]">
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                            </select>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-[#3A5A40] text-white rounded-lg hover:bg-[#242F2A] disabled:opacity-60">
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
