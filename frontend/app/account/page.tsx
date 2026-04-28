"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // ── Name edit ──────────────────────────────────────────────────────────
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  // ── Password change ────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  // ── Delete ─────────────────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("authbridge_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const parsed: User = JSON.parse(stored);
    setUser(parsed);
    setNameValue(parsed.full_name);
  }, [router]);

  const signOut = () => {
    localStorage.removeItem("authbridge_user");
    router.push("/login");
  };

  const saveName = async () => {
    if (!user) return;
    if (nameValue.trim().length === 0) {
      setNameError("Name cannot be empty.");
      return;
    }
    setNameSaving(true);
    setNameError("");
    setNameSuccess(false);
    try {
      const res = await fetch(`${API}/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: nameValue.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to update name.");
      }
      const updated: User = await res.json();
      setUser(updated);
      setNameValue(updated.full_name);
      localStorage.setItem("authbridge_user", JSON.stringify(updated));
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err: unknown) {
      setNameError(err instanceof Error ? err.message : "Failed to update name.");
    } finally {
      setNameSaving(false);
    }
  };

  const savePassword = async () => {
    if (!user) return;
    setPwError("");
    setPwSuccess(false);
    if (pwForm.newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch(`${API}/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwForm.newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to update password.");
      }
      setPwForm({ newPassword: "", confirmPassword: "" });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`${API}/api/users/${user.id}`, { method: "DELETE" });
      if (res.status !== 204) throw new Error("Failed to delete account.");
      localStorage.removeItem("authbridge_user");
      router.push("/");
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account.");
      setDeleting(false);
    }
  };

  if (!user) return null;

  const memberSince = new Date(user.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const passwordsMatch =
    pwForm.confirmPassword.length > 0 &&
    pwForm.newPassword === pwForm.confirmPassword;
  const passwordsMismatch =
    pwForm.confirmPassword.length > 0 &&
    pwForm.newPassword !== pwForm.confirmPassword;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white">
              AB
            </div>
            <span className="text-base font-semibold text-gray-900">AuthBridge</span>
          </div>
          <button
            onClick={signOut}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Profile hero */}
        <div className="mb-8 flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet-100 text-2xl font-bold text-violet-700">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="mt-0.5 text-xs text-gray-400">Member since {memberSince}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Edit name */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Edit name</h2>
            <p className="mt-0.5 text-sm text-gray-500">Update your display name.</p>
            <div className="mt-5 flex gap-3">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => {
                  setNameValue(e.target.value);
                  setNameError("");
                  setNameSuccess(false);
                }}
                placeholder="Your full name"
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
              <button
                onClick={saveName}
                disabled={nameSaving || nameValue.trim() === user.full_name}
                className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
              >
                {nameSaving ? "Saving…" : "Save"}
              </button>
            </div>
            {nameError && (
              <p className="mt-2 text-sm text-red-600">{nameError}</p>
            )}
            {nameSuccess && (
              <p className="mt-2 text-sm font-medium text-green-600">Name updated successfully.</p>
            )}
          </section>

          {/* Change password */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Change password</h2>
            <p className="mt-0.5 text-sm text-gray-500">Choose a strong password of at least 8 characters.</p>
            <div className="mt-5 space-y-4">
              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">New password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showNew ? "text" : "password"}
                    value={pwForm.newPassword}
                    onChange={(e) => {
                      setPwForm((f) => ({ ...f, newPassword: e.target.value }));
                      setPwError("");
                    }}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-violet-600 hover:text-violet-800"
                  >
                    {showNew ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={pwForm.confirmPassword}
                    onChange={(e) => {
                      setPwForm((f) => ({ ...f, confirmPassword: e.target.value }));
                      setPwError("");
                    }}
                    placeholder="Repeat your new password"
                    className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                      passwordsMatch
                        ? "border-green-400 focus:border-green-500 focus:ring-green-200"
                        : passwordsMismatch
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-300 focus:border-violet-500 focus:ring-violet-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-violet-600 hover:text-violet-800"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
                {pwForm.confirmPassword.length > 0 && (
                  <p className={`mt-1 text-xs font-medium ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </div>

              {pwError && <p className="text-sm text-red-600">{pwError}</p>}
              {pwSuccess && (
                <p className="text-sm font-medium text-green-600">Password changed successfully.</p>
              )}

              <button
                onClick={savePassword}
                disabled={pwSaving || !pwForm.newPassword || !pwForm.confirmPassword}
                className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
              >
                {pwSaving ? "Updating…" : "Update password"}
              </button>
            </div>
          </section>

          {/* Danger zone */}
          <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Danger zone</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="mt-5 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Delete my account
              </button>
            ) : (
              <div className="mt-5 rounded-xl bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">
                  Are you sure? This will permanently delete your account.
                </p>
                {deleteError && (
                  <p className="mt-2 text-sm text-red-600">{deleteError}</p>
                )}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={deleteAccount}
                    disabled={deleting}
                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {deleting ? "Deleting…" : "Yes, delete my account"}
                  </button>
                  <button
                    onClick={() => {
                      setConfirmDelete(false);
                      setDeleteError("");
                    }}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
