"use client";

import React from "react";
import BrandLogo from "./BrandLogo.jsx";
import {
  Home,
  CheckSquare,
  BookOpen,
  CalendarDays,
  User,
  Sparkles,
  Clock,
  BarChart2,
  FileText,
  Calendar,
  Sun,
  Moon,
  Bell,
} from "lucide-react";
export const Navigation = ({
  currentTab,
  onChangeTab,
  onOpenAI,
  onOpenTimer,
  onOpenAuth,
  isDarkMode,
  onToggleDarkMode,
  profile,
  unreadNotificationsCount,
  onOpenNotifications,
}) => {
  const navItems = [
    { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
    { id: "tasks", label: "Tasks", icon: <CheckSquare className="w-5 h-5" /> },
    { id: "study", label: "Study", icon: <BookOpen className="w-5 h-5" /> },
    {
      id: "routine",
      label: "Routine",
      icon: <CalendarDays className="w-5 h-5" />,
    },
    { id: "namaz", label: "Namaz", icon: <Moon className="w-5 h-5" /> },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
  ];
  return (
    <>
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-0 sm:min-h-16 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          {/* Brand Logo & Name (No "by Nahid" here per specification rule) */}
          <button
            type="button"
            aria-label="Student Life home"
            onClick={() => onChangeTab("home")}
            className="flex shrink-0 items-center gap-2.5 cursor-pointer select-none text-left"
          >
            <BrandLogo size={44} priority />
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-none">
                Student Life
              </div>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                Personal Student System
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onChangeTab(item.id)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    active
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Icons: Timer, Analytics, Notes, Exams, Dark Mode, Notification */}
          <div className="flex w-full sm:w-auto items-center justify-between gap-1 [&>button]:min-h-11 [&>button]:min-w-9 [&>button]:justify-center sm:[&>button]:min-h-10">
            <button
              onClick={onOpenTimer}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Focus Timer"
            >
              <Clock className="w-4 h-4 text-indigo-500" />
            </button>

            <button
              onClick={() => onChangeTab("analytics")}
              className={`p-2 rounded-xl transition-colors ${
                currentTab === "analytics"
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Analytics"
            >
              <BarChart2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onChangeTab("notes")}
              className={`p-2 rounded-xl transition-colors ${
                currentTab === "notes"
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Notes & Goals"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={() => onChangeTab("exams")}
              className={`p-2 rounded-xl transition-colors ${
                currentTab === "exams"
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Exams"
            >
              <Calendar className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
              )}
            </button>

            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Profile Avatar & Login Quick Link */}
            <button
              onClick={onOpenAuth}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors ml-1"
            >
              <span>Account</span>
            </button>

            <button
              onClick={() => onChangeTab("profile")}
              className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center justify-center overflow-hidden border border-indigo-500/30"
              title={`${profile.studentName} (${profile.grade || "Student"})`}
            >
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.studentName}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.studentName.slice(0, 2).toUpperCase()
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Floating Ask Student AI Button (Spec requirement #4, #9, #20) */}
      <button
        onClick={onOpenAI}
        className="assistant-launcher fixed z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all group"
      >
        <div className="relative">
          <Sparkles
            className="w-4 h-4 animate-spin text-amber-300"
            style={{ animationDuration: "4s" }}
          />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
        <span>Ask Student AI</span>
      </button>

      {/* Mobile and tablet navigation */}
      <nav aria-label="Mobile navigation" className="mobile-navigation xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 py-1.5 px-3">
        <div className="mx-auto grid max-w-xl grid-cols-6">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-2xl transition-colors ${
                  active
                    ? "text-indigo-600 dark:text-indigo-400 font-bold"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {item.icon}
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
