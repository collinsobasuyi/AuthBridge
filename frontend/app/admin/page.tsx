"use client";

import { useState, useEffect, useCallback } from "react";

type User = {
  id: number;
  full_name: string;
  email: string;
  created_at?: string;
};

type LoadStatus = "idle" | "loading" | "error";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("idle");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", email: "" });
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoadStatus("loading");
    try {
      const res = await fetch(`${API}/api/users`);
      if (!res.ok) throw new Error();
      setUsers(await res.json());
      setLoadStatus("idle");
    } catch {
      setLoadStatus("error");
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchUsers();
  }, [authenticated, fetchUsers]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (ADMIN_PASSWORD !== "" && passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm({ full_name: user.full_name, email: user.email });
    setEditError("");
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const saveEdit = async (id: number) => {
    setSaving(true);
    setEditError("");
    try {
      const res = await fetch(`${API}/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to save.");
      }
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      setEditingId(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: number) => {
    setDeletingId(id);
    try {
      await fetch(`${API}/api/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Password gate ────────────────────────────────────────────────────────

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="mb-6 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-lg font-bold text-white shadow-sm">
                AB
              </div>
            </div>
            <h1 className="mb-1 text-center text-2xl font-bold text-white">Admin</h1>
            <p className="mb-6 text-center text-sm text-gray-400">
              Enter the admin password to continue.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="Password"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              {passwordError && (
                <p className="text-sm text-red-400">Incorrect password.</p>
              )}
              <button
                type="submit"
                className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Enter
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white">
                AB
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-0.5 text-sm text-gray-500">Manage registered users</p>
              </div>
            </div>
            <button
              onClick={() => setAuthenticated(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="mt-1 text-4xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Database</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">Neon PostgreSQL</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Backend</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">FastAPI</p>
          </div>
        </div>

        {/* Users table */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Registered Users</h2>
            <button
              onClick={fetchUsers}
              className="text-sm font-medium text-violet-600 hover:text-violet-800"
            >
              Refresh
            </button>
          </div>

          {/* Loading spinner */}
          {loadStatus === "loading" && (
            <div className="flex justify-center px-6 py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-violet-600" />
            </div>
          )}

          {loadStatus === "error" && (
            <p className="px-6 py-10 text-sm text-red-500">
              Could not load users. Make sure the backend is running.
            </p>
          )}

          {loadStatus === "idle" && users.length === 0 && (
            <div className="px-6 py-10 text-center">
              <p className="text-2xl">👤</p>
              <p className="mt-2 text-sm text-gray-400">No users registered yet.</p>
            </div>
          )}

          {loadStatus === "idle" && users.length > 0 && (
            <>
              {/* Desktop table — hidden on mobile */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Full Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) =>
                      editingId === user.id ? (
                        // Edit row
                        <tr key={user.id} className="bg-violet-50/50">
                          <td className="px-6 py-4 text-gray-400">{user.id}</td>
                          <td className="px-6 py-4">
                            <input
                              value={editForm.full_name}
                              onChange={(e) =>
                                setEditForm((f) => ({ ...f, full_name: e.target.value }))
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <input
                                value={editForm.email}
                                onChange={(e) =>
                                  setEditForm((f) => ({ ...f, email: e.target.value }))
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                              />
                              {editError && (
                                <p className="mt-1 text-xs text-red-500">{editError}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => saveEdit(user.id)}
                                disabled={saving}
                                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                              >
                                {saving ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : confirmDeleteId === user.id ? (
                        // Inline delete confirm row
                        <tr key={user.id} className="bg-red-50/60">
                          <td className="px-6 py-4 text-gray-400">{user.id}</td>
                          <td colSpan={2} className="px-6 py-4 text-sm font-medium text-red-700">
                            Delete <span className="font-semibold">{user.full_name}</span>? This cannot be undone.
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => deleteUser(user.id)}
                                disabled={deletingId === user.id}
                                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                              >
                                {deletingId === user.id ? "Deleting..." : "Yes, delete"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        // Normal row
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-400">{user.id}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{user.full_name}</td>
                          <td className="px-6 py-4 text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEdit(user)}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-violet-200 hover:text-violet-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(user.id)}
                                className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list — shown only on mobile */}
              <div className="divide-y divide-gray-100 sm:hidden">
                {users.map((user) => (
                  <div key={user.id} className="px-5 py-4">
                    {editingId === user.id ? (
                      <div className="space-y-3 rounded-xl bg-violet-50 p-4">
                        <input
                          value={editForm.full_name}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, full_name: e.target.value }))
                          }
                          placeholder="Full name"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                        />
                        <input
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, email: e.target.value }))
                          }
                          placeholder="Email"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                        />
                        {editError && <p className="text-xs text-red-500">{editError}</p>}
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(user.id)}
                            disabled={saving}
                            className="flex-1 rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : confirmDeleteId === user.id ? (
                      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                        <p className="mb-3 font-medium">
                          Delete <span className="font-semibold">{user.full_name}</span>? This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteUser(user.id)}
                            disabled={deletingId === user.id}
                            className="flex-1 rounded-lg bg-red-500 py-2 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                          >
                            {deletingId === user.id ? "Deleting..." : "Yes, delete"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{user.full_name}</p>
                          <p className="truncate text-sm text-gray-500">{user.email}</p>
                          <p className="mt-0.5 text-xs text-gray-400">ID #{user.id}</p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={() => startEdit(user)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-violet-200 hover:text-violet-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(user.id)}
                            className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
