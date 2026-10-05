"use client";

import React, { useState } from "react";
import {
  User,
  School,
  Calendar,
  Hash,
  Mail,
  Phone,
  Edit3,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
export const ProfileView = ({
  profile,
  onUpdateProfile,
  onOpenHelpFeedback,
  onOpenAdminPortal,
  onOpenAuth,
  onSyncNow,
  isSyncing,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const handleSave = (e) => {
    e.preventDefault();
    onUpdateProfile(form);
    setIsEditing(false);
  };
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Student Profile & Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal academic identity and institutional records.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onSyncNow}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Sync account to backend cloud store"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-indigo-500 ${isSyncing ? "animate-spin" : ""}`}
            />
            <span>{isSyncing ? "Syncing..." : "Sync Cloud"}</span>
          </button>

          <button
            onClick={() => {
              setForm(profile);
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Main Student ID Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with photo / initials */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 border-indigo-400/40 p-1 bg-slate-950 shadow-2xl flex items-center justify-center overflow-hidden">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.studentName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white">
                  {profile.studentName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
          </div>

          {/* Student Info Details */}
          <div className="space-y-3 text-center sm:text-left flex-1">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  Student ID: {profile.studentId || "STD-UNASSIGNED"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Active Enrolled
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {profile.studentName}
              </h3>
              <p className="text-sm font-medium text-indigo-200/90 mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                <School className="w-4 h-4 text-indigo-300" />
                <span>
                  {profile.school || "Institutional School / College"}
                </span>
              </p>
            </div>

            {/* Quick Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
                <span className="text-[10px] text-indigo-200 block uppercase">
                  Class / Grade
                </span>
                <span className="font-bold text-white">
                  {profile.grade || "Not set"}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
                <span className="text-[10px] text-indigo-200 block uppercase">
                  Group / Stream
                </span>
                <span className="font-bold text-white">
                  {profile.group || "Not set"}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-indigo-200 block uppercase">
                  Batch / Academic Year
                </span>
                <span className="font-bold text-white">
                  {profile.batch || "Not set"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details & Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Account Info Card */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Account Details</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Email Address</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {profile.email || "Not connected"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Mobile Phone</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {profile.phone || "Not connected"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Enrolled Date</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {new Date(profile.joinedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Hash className="w-4 h-4 text-slate-400" />
                <span>Account Identifier</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {profile.userId}
              </span>
            </div>
          </div>
        </div>

        {/* Support, Privacy & Admin Options */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Assistance & System</span>
            </h4>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Have an issue, feature suggestion, or question? Send official
              feedback to the Admin.
            </p>

            <div className="space-y-2">
              <button
                onClick={onOpenHelpFeedback}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Help & Feedback / Contact Admin
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Official Gmail support portal
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={onOpenAdminPortal}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Admin Portal (Email / Password)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      View synced student directory (privacy enforced)
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Switch Account / Sign In
            </button>
            <span className="text-[11px] text-slate-400">
              Private student data stored locally
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="dialog-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Edit Student Profile
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  value={form.studentName}
                  onChange={(e) =>
                    setForm({ ...form, studentName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    School / College
                  </label>
                  <input
                    type="text"
                    value={form.school}
                    onChange={(e) =>
                      setForm({ ...form, school: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={form.studentId}
                    onChange={(e) =>
                      setForm({ ...form, studentId: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Class / Grade
                  </label>
                  <input
                    type="text"
                    value={form.grade}
                    onChange={(e) =>
                      setForm({ ...form, grade: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Group / Stream
                  </label>
                  <input
                    type="text"
                    value={form.group}
                    onChange={(e) =>
                      setForm({ ...form, group: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Batch
                  </label>
                  <input
                    type="text"
                    value={form.batch}
                    onChange={(e) =>
                      setForm({ ...form, batch: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                  Profile Photo URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={form.profilePhoto}
                  onChange={(e) =>
                    setForm({ ...form, profilePhoto: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
