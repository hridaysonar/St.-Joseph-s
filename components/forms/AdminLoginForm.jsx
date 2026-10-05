"use client";
import React, { useState } from "react";
export default function AdminLoginForm({ email, enabled }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function login(event) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sign-in failed.");
      window.location.replace("/admin");
    } catch (failure) { setError(failure.message); setBusy(false); }
  }
  const field = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900";
  return <form onSubmit={login} className="space-y-4">
    <label className="block text-sm font-medium">Admin email<input name="email" type="email" autoComplete="username" defaultValue={email} required maxLength={254} className={field} /></label>
    <label className="block text-sm font-medium">Admin password<input name="password" type="password" autoComplete="current-password" required maxLength={1024} className={field} /></label>
    <p className="text-xs text-slate-500">Use your Student Life Admin password.</p>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {!enabled && <p role="alert" className="text-sm text-rose-700">Admin password setup required on the server.</p>}
    <button disabled={!enabled || busy} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>
  </form>;
}
