"use client";

import React, { useMemo, useState } from 'react';
import { Edit, Search, Trash2, Users } from 'lucide-react';
import { useAdminUsers, useUpdateAdminUserMutation, useDeleteAdminUserMutation } from '@/hooks/useAdminUsers';

function getCurrentAdmin() {
    try {
        const currentUserStr = localStorage.getItem('user');
        return currentUserStr ? JSON.parse(currentUserStr) : null;
    } catch {
        return null;
    }
}

export default function UserManagementPage() {
    const { data, isPending: loading, error: fetchError } = useAdminUsers();
    const updateUserMutation = useUpdateAdminUserMutation();
    const deleteUserMutation = useDeleteAdminUserMutation();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: 'student',
        study_year: 1
    });

    const currentAdmin = useMemo(() => getCurrentAdmin(), []);
    const displayError = error || fetchError?.message;
    const totalUsers = Array.isArray(data) ? data.length : 0;

    const filteredUsers = useMemo(() => {
        const users = Array.isArray(data) ? data : [];
        const query = search.trim().toLowerCase();
        const sorted = [...users].sort((a, b) => {
            const aDate = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
            const bDate = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
            return bDate - aDate;
        });

        if (!query) return sorted;

        return sorted.filter((user) => (
            user.name?.toLowerCase().includes(query)
            || user.email?.toLowerCase().includes(query)
            || user.role?.toLowerCase().includes(query)
        ));
    }, [data, search]);

    const openEditModal = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'student',
            study_year: user.study_year || 1
        });
        setError('');
        setSuccess('');
    };

    const handleUpdateUser = async (event) => {
        event.preventDefault();

        if (!editingUser) return;

        setError('');
        setSuccess('');

        try {
            await updateUserMutation.mutateAsync({ userId: editingUser._id, ...editForm });
            setSuccess('User updated successfully');
            setEditingUser(null);
        } catch (err) {
            setError(err.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async (user) => {
        const adminId = currentAdmin?._id || currentAdmin?.user_id;
        if (user._id === adminId) {
            setError('You cannot delete your own admin account.');
            return;
        }

        const confirmed = window.confirm(`Delete ${user.name}? This action cannot be undone.`);
        if (!confirmed) return;

        setError('');
        setSuccess('');

        try {
            const data = await deleteUserMutation.mutateAsync(user._id);
            setSuccess(data?.message || 'User deleted successfully');
        } catch (err) {
            setError(err.message || 'Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 pb-10 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-56 rounded-md bg-gray-200" />
                        <div className="h-4 w-72 rounded-md bg-gray-100" />
                    </div>
                    <div className="h-8 w-36 rounded-md bg-emerald-100/70" />
                </div>

                <div className="rounded-md border border-gray-200 bg-white p-4 shadow-xs flex items-center gap-4">
                    <div className="h-5 w-5 rounded bg-gray-100" />
                    <div className="h-4 flex-1 rounded bg-gray-100" />
                </div>

                <div className="rounded-md border border-gray-200 bg-white shadow-xs overflow-hidden">
                    <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-200">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="h-4 w-20 rounded bg-gray-200" />
                        ))}
                    </div>
                    <div className="divide-y divide-gray-100">
                        {Array.from({ length: 6 }).map((_, row) => (
                            <div key={row} className="grid grid-cols-5 gap-4 px-6 py-4 items-center">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-100" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-28 rounded bg-gray-200" />
                                        <div className="h-3 w-40 rounded bg-gray-100" />
                                    </div>
                                </div>
                                <div className="h-5 w-16 rounded-full bg-gray-100" />
                                <div className="h-4 w-28 rounded bg-gray-100" />
                                <div className="h-5 w-16 rounded-full bg-gray-100" />
                                <div className="flex justify-end gap-2">
                                    <div className="h-8 w-8 rounded-md bg-gray-100" />
                                    <div className="h-8 w-8 rounded-md bg-gray-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">User Management</h2>
                    <p className="mt-1 text-sm text-slate-500">Edit, review, and remove user accounts.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    <Users size={16} />
                    {totalUsers} total users
                </div>
            </div>

            {displayError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{displayError}</div>
            )}
            {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
            )}

            <div className="flex items-center gap-4 rounded-md border border-gray-200 bg-white p-4 shadow-xs">
                <Search className="text-gray-400" size={20} />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users by name, email, or role..."
                    className="flex-1 outline-none text-sm text-gray-700"
                />
            </div>

            <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-xs">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Name</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Role</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Last Login</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="transition-colors hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${user.role === 'admin' ? 'border-blue-200 text-blue-700 bg-blue-50/60' : 'border-gray-200 text-gray-600 bg-gray-50'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${user.isVerified ? 'border-emerald-200 text-emerald-700 bg-emerald-50/60' : 'border-amber-200 text-amber-700 bg-amber-50/60'}`}>
                                        {user.isVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="rounded-md p-2 text-gray-400 transition-colors hover:bg-emerald-50/70 hover:text-[#0bc07d]"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user)}
                                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                                    No users found for your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-md bg-white p-6 shadow-xl border border-gray-200">
                        <h3 className="text-lg font-semibold text-slate-800">Edit User</h3>
                        <p className="mt-1 text-sm text-slate-500">Update user details and role.</p>

                        <form onSubmit={handleUpdateUser} className="mt-4 space-y-4">
                            <input
                                value={editForm.name}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0ddc90]"
                                placeholder="Name"
                            />
                            <input
                                value={editForm.email}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0ddc90]"
                                placeholder="Email"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                                    className="rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0ddc90]"
                                >
                                    <option value="student">student</option>
                                    <option value="admin">admin</option>
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={editForm.study_year}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, study_year: Number(e.target.value) || 1 }))}
                                    className="rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0ddc90]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-[#0ddc90] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#0bc07d]"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
