"use client";
import React from "react";
import { ShieldCheck, X } from "lucide-react";
export const AdminPortalModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="admin-access-title" className="dialog-panel w-full max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between"><ShieldCheck className="text-indigo-600" /><button onClick={onClose} aria-label="Close admin access" className="p-3"><X size={20} /></button></div>
        <h2 id="admin-access-title" className="text-xl font-bold">Student Life Admin</h2>
        <p className="text-sm text-slate-500">Continue to the Admin Panel and sign in with your Admin email and password.</p>
        <a href="/admin" className="block rounded-xl bg-indigo-600 px-4 py-3 text-center font-semibold text-white">Open Admin Panel</a>
      </div>
    </div>
  );
};
