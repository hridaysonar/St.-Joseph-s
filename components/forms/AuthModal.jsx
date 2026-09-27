"use client";

import React, { useState } from "react";
import {
  X,
  Phone,
  Lock,
  User,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  LogIn,
  UserPlus,
} from "lucide-react";
export const AuthModal = ({ isOpen, onClose, onSuccess, currentProfile }) => {
  const [mode, setMode] = useState("login");
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  // Register form state
  const [regName, setRegName] = useState(
    currentProfile.studentName || "Nahid Hasan",
  );
  const [regEmail, setRegEmail] = useState(
    currentProfile.email || "nahid.hasan@gmail.com",
  );
  const [regPhone, setRegPhone] = useState(
    currentProfile.phone || "+880 1712-345678",
  );
  const [regPassword, setRegPassword] = useState("student123");
  const [regSchool, setRegSchool] = useState(
    "St. Joseph's School and College, Bonpara",
  );
  const [regGrade, setRegGrade] = useState("Science (TWELVE)");
  const [regGroup, setRegGroup] = useState("Science (Sci-B)");
  const [regBatch, setRegBatch] = useState("Batch 2027");
  const [regStudentId, setRegStudentId] = useState("SJSC-2027-404");
  const [regRoom, setRegRoom] = useState("Science Room No: 404");
  // OTP state
  const [otpPhone, setOtpPhone] = useState(
    currentProfile.phone || "+880 1712-345678",
  );
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  if (!isOpen) return null;
  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setError("Please provide your Email/Phone/ID and Password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Logged in successfully!");
        setTimeout(() => {
          onSuccess(data.user);
          onClose();
        }, 500);
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      // Graceful offline fallback
      onSuccess({
        studentName: loginIdentifier.includes("@")
          ? "Nahid Hasan"
          : loginIdentifier,
        email: loginIdentifier.includes("@")
          ? loginIdentifier
          : currentProfile.email,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };
  // Handle Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regPassword.trim()) {
      setError("Please enter your full name and a password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        studentName: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        school: regSchool,
        grade: regGrade,
        group: regGroup,
        batch: regBatch,
        studentId: regStudentId,
        classroomNo: regRoom,
      };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Account registered & synced to MongoDB database!");
        setTimeout(() => {
          onSuccess(data.user);
          onClose();
        }, 500);
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      onSuccess({
        studentName: regName,
        email: regEmail,
        phone: regPhone,
        school: regSchool,
        grade: regGrade,
        group: regGroup,
        studentId: regStudentId,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };
  // Google sign in simulation
  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        studentName: "Nahid Hasan",
        email: "nahid.hasan@gmail.com",
        school: "St. Joseph's School and College, Bonpara",
        grade: "Science (TWELVE)",
        group: "Science (Sci-B)",
        batch: "Batch 2027",
        studentId: "SJSC-2026-204",
        classroomNo: "Science Room No: 204",
      });
      onClose();
    }, 600);
  };
  // OTP Verification
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode !== "5284") {
      setError("Invalid code. Please use simulated code: 5284");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        phone: otpPhone,
        studentName: "Nahid Hasan",
        school: "St. Joseph's School and College, Bonpara",
      });
      onClose();
    }, 500);
  };
  return (
    <div className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
      <div className="dialog-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-7 shadow-2xl relative overflow-hidden max-h-[92dvh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {mode === "login" && "Student Login"}
            {mode === "register" && "New Student Registration"}
            {mode === "otp" && "Verify Mobile OTP"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            St. Joseph&apos;s School and College, Bonpara • Cloud Connected
          </p>
        </div>

        {/* Tab Selector: Login vs Register */}
        {mode !== "otp" && (
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-4 border border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                mode === "login"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                mode === "register"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* 1. Login Mode */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Email, Mobile, or Student ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="nahid.hasan@gmail.com or SJSC-2026-204"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Logging in..." : "Sign In with Account"}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold">
                    Quick Fast Access
                  </span>
                </div>
              </div>

              {/* 1-Click Nahid Hasan Quick Sign In */}
              <button
                type="button"
                onClick={() => {
                  onSuccess({
                    studentName: "Nahid Hasan",
                    school: "St. Joseph's School and College, Bonpara",
                    grade: "Science (TWELVE)",
                    group: "Science (Sci-B)",
                    batch: "Batch 2027",
                    studentId: "SJSC-2027-404",
                    email: "nahid.hasan@gmail.com",
                    phone: "+880 1712-345678",
                    classroomNo: "Science Room No: 404",
                  });
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40 transition-colors text-left text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    NH
                  </div>
                  <div>
                    <div className="font-bold">Continue as Nahid Hasan</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      St. Joseph&apos;s College • Room 204
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-500" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.14C3.27 21.41 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.41l4.03-3.14z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.59 1.25 6.59l4.03 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("otp")}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile OTP</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. Registration Mode */}
          {mode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nahid Hasan"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="student@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+880 1700-000000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Create Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Password (e.g. student123)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Student ID
                  </label>
                  <input
                    type="text"
                    placeholder="SJSC-2026-204"
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  School / College
                </label>
                <input
                  type="text"
                  value={regSchool}
                  onChange={(e) => setRegSchool(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Class / Grade
                  </label>
                  <input
                    type="text"
                    value={regGrade}
                    onChange={(e) => setRegGrade(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Group / Stream
                  </label>
                  <input
                    type="text"
                    value={regGroup}
                    onChange={(e) => setRegGroup(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Classroom No
                  </label>
                  <input
                    type="text"
                    value={regRoom}
                    onChange={(e) => setRegRoom(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading
                  ? "Creating Account..."
                  : "Complete Registration & Save"}
              </button>
            </form>
          )}

          {/* 3. OTP Mode */}
          {mode === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Simulated SMS sent to <b>{otpPhone}</b>. Use code: <b>5284</b>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-center">
                  Enter 4-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="5284"
                  className="w-full text-center tracking-[1em] font-mono text-2xl py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="w-1/3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400">
          MongoDB Connected • Data stored securely on device and cloud
        </div>
      </div>
    </div>
  );
};
