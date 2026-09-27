"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  X,
  Users,
  MessageSquare,
  Settings,
  Search,
  EyeOff,
  CheckCircle,
  LogOut,
  RefreshCw,
} from "lucide-react";
export const AdminPortalModal = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [adminContactEmail, setAdminContactEmail] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [configSuccess, setConfigSuccess] = useState("");
  const [search, setSearch] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: passcode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        loadAdminData(passcode);
      } else {
        setAuthError(data.error || "Incorrect Admin passcode");
      }
    } catch (err) {
      setAuthError("Connection failed");
    } finally {
      setLoading(false);
    }
  };
  const loadAdminData = async (token) => {
    // 1. Fetch Students
    try {
      const res = await fetch(`/api/admin/students`, {
        headers: { "x-admin-token": token },
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (e) {
      console.error(e);
    }
    // 2. Fetch Feedbacks
    try {
      const res = await fetch(`/api/admin/feedbacks`, {
        headers: { "x-admin-token": token },
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
      }
    } catch (e) {
      console.error(e);
    }
    // 3. Fetch Config
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        setAdminContactEmail(
          data.adminContactEmail || "hridoy.dev.natore@gmail.com",
        );
        setNewAdminEmail(
          data.adminContactEmail || "hridoy.dev.natore@gmail.com",
        );
      }
    } catch (e) {
      console.error(e);
    }
  };
  const handleUpdateEmailConfig = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": passcode,
        },
        body: JSON.stringify({ adminContactEmail: newAdminEmail.trim() }),
      });
      if (res.ok) {
        setAdminContactEmail(newAdminEmail.trim());
        setConfigSuccess("Official Admin Gmail updated successfully!");
        setTimeout(() => setConfigSuccess(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };
  if (!isOpen) return null;
  const filteredStudents = students.filter(
    (s) =>
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.school?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      s.grade?.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="dialog-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>Student Life • Admin Console</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Strict Privacy Enforced
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official backend administration portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Authenticated: Passcode Screen */}
        {!isAuthenticated ? (
          <div className="w-full p-5 sm:p-12 text-center max-w-md mx-auto my-auto space-y-5">
            <div className="w-14 h-14 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                Admin Authentication
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter the administrator secret passcode to access directory and
                configuration. (Default: <b>admin123</b>)
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Enter Admin Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full text-center tracking-widest text-lg px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
              >
                {loading ? "Authenticating..." : "Unlock Admin Portal"}
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin View */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Privacy Rule Banner (Strict specification compliance #17) */}
            <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/40 px-5 py-2.5 flex items-center gap-2 text-indigo-800 dark:text-indigo-300 text-xs">
              <EyeOff className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>
                <b>Privacy Rule:</b> Admins can ONLY view basic student
                accounts. Private tasks, notes, study logs, and AI conversations
                are strictly inaccessible to the Admin.
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 pt-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab("students")}
                  className={`px-2 sm:px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                    activeTab === "students"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Student Directory ({students.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("feedback")}
                  className={`px-2 sm:px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                    activeTab === "feedback"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Feedback / Tickets ({feedbacks.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("config")}
                  className={`px-2 sm:px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                    activeTab === "config"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Admin Support Email</span>
                </button>
              </div>

              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 p-1"
                title="Lock portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Tab 1: Students Directory */}
              {activeTab === "students" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <input
                        type="text"
                        placeholder="Search student by name, school, class..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-1.5 pl-8 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    </div>

                    <button
                      onClick={() => loadAdminData(passcode)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                        <tr>
                          <th className="p-3">Student</th>
                          <th className="p-3">School / College</th>
                          <th className="p-3">Class & Group</th>
                          <th className="p-3">Batch</th>
                          <th className="p-3">Student ID</th>
                          <th className="p-3">Last Active</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="p-8 text-center text-slate-400"
                            >
                              No synced student accounts found yet.
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((s) => (
                            <tr
                              key={s.userId}
                              className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                            >
                              <td className="p-3 font-semibold flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-[10px] text-indigo-600 overflow-hidden">
                                  {s.profilePhoto ? (
                                    <img
                                      src={s.profilePhoto}
                                      alt={s.studentName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    s.studentName.slice(0, 2).toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <div>{s.studentName}</div>
                                  <div className="text-[10px] text-slate-400">
                                    {s.email || s.phone || s.userId}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">{s.school || "—"}</td>
                              <td className="p-3">
                                <span className="font-semibold">
                                  {s.grade || "—"}
                                </span>{" "}
                                <span className="text-slate-400">
                                  ({s.group || "General"})
                                </span>
                              </td>
                              <td className="p-3">{s.batch || "—"}</td>
                              <td className="p-3 font-mono font-medium">
                                {s.studentId || "—"}
                              </td>
                              <td className="p-3 text-[11px] text-slate-400">
                                {s.lastActive
                                  ? new Date(s.lastActive).toLocaleDateString()
                                  : "Recent"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Feedback & Tickets */}
              {activeTab === "feedback" && (
                <div className="space-y-3">
                  {feedbacks.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No feedback or support requests submitted yet.
                    </div>
                  ) : (
                    feedbacks.map((fb) => (
                      <div
                        key={fb.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                              {fb.type}
                            </span>
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {fb.subject}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(fb.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          {fb.message}
                        </p>

                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                          <span>
                            Student: <b>{fb.studentName}</b> (
                            {fb.studentId || fb.studentEmail || "No ID"})
                          </span>
                          <span className="text-emerald-500 font-medium">
                            Status: Received
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Official Support Configuration */}
              {activeTab === "config" && (
                <div className="max-w-lg mx-auto py-4 space-y-5">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      Admin Contact & Support Settings
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Configure the official Admin Gmail address. All student
                      support inquiries and mailto links will target this
                      address.
                    </p>
                  </div>

                  {configSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{configSuccess}</span>
                    </div>
                  )}

                  <form
                    onSubmit={handleUpdateEmailConfig}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                        Official Admin Gmail Address *
                      </label>
                      <input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="admin@gmail.com"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
                    >
                      Save Admin Gmail
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
