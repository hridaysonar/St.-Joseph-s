"use client";

import React from "react";
import { getHomeSubjectCards } from "../../lib/syllabus.js";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Calendar,
  Play,
  ChevronRight,
} from "lucide-react";
export const HomeDashboard = ({
  profile,
  tasks,
  onUpdateTasks,
  subjects,
  exams,
  routinePeriods,
  studyLogs,
  onNavigateTab,
  onOpenTimer,
  onOpenAI,
  onOpenSetup,
  onOpenSubject,
}) => {
  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", icon: "☀️" };
    if (hour < 17) return { text: "Good afternoon", icon: "🌤️" };
    return { text: "Good evening", icon: "🌙" };
  };
  const greeting = getGreeting();
  // Today study minutes
  const todayStr = new Date().toISOString().split("T")[0];
  const todayStudyMinutes = studyLogs
    .filter((l) => l.date === todayStr)
    .reduce((acc, curr) => acc + curr.minutes, 0);
  // Tasks today
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const toggleTask = (taskId) => {
    onUpdateTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    );
  };
  // Next Class from routine
  const currentDayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });
  const todayClasses = routinePeriods.filter((p) => p.day === currentDayName);
  const nextClass = todayClasses[0] || routinePeriods[0];
  // Nearest upcoming exam
  const nearestExam = [...exams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )[0];
  const getDaysLeft = (dateStr) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days` : "Today";
  };
  // Syllabus progress
  let totalChapters = 0;
  let completedChapters = 0;
  subjects.forEach((s) => {
    s.chapters.forEach((c) => {
      totalChapters++;
      if (c.status === "Completed") completedChapters++;
    });
  });
  const syllabusRate =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;
  return (
    <div className="space-y-6">
      {/* 4. Home Hero Banner: Personalized greeting with Student's Name */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 text-xs font-semibold backdrop-blur-md">
              <span>{greeting.icon}</span>
              <span>{greeting.text}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {profile.studentName}!
            </h1>

            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-lg leading-relaxed">
              Welcome back to your personal command center. You have{" "}
              {pendingTasks.length} pending tasks today and {todayStudyMinutes}{" "}
              minutes of focused study logged.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onOpenTimer}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Focus Timer</span>
              </button>

              <button
                onClick={onOpenAI}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 backdrop-blur-md transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ask Student AI</span>
              </button>
            </div>
          </div>

          {/* Quick Academic Profile Snapshot */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col gap-2 w-full md:w-56 md:shrink-0 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
              Active Enrollment
            </span>
            <div className="font-bold text-sm text-white">
              {profile.grade || "Student"}
            </div>
            <div className="text-indigo-200">
              {profile.school || "College / School"}
            </div>
            <div className="text-indigo-300/80 text-[11px] pt-1 border-t border-white/10 flex justify-between">
              <span>{profile.group || "Science"}</span>
              <span>{profile.batch || "Batch 2026"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row: Study Time, Subjects, Tasks, Syllabus */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Study Time Today */}
        <div
          onClick={onOpenTimer}
          className="p-4 rounded-3xl border border-indigo-200/80 dark:border-indigo-950/60 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Study Time
            </span>
            <Clock className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {todayStudyMinutes}m
          </div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            + Click to focus
          </span>
        </div>

        <div className="p-4 rounded-3xl border border-emerald-200/80 dark:border-emerald-950/60 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2"><span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subjects</span><BookOpen className="w-4 h-4 text-emerald-500" /></div>
          <div className="text-2xl font-black">7</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Your academic subjects</span>
        </div>

        {/* Tasks Progress */}
        <div
          onClick={() => onNavigateTab("tasks")}
          className="p-4 rounded-3xl border border-purple-200/80 dark:border-purple-950/60 bg-white dark:bg-slate-900 shadow-xs hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today Tasks
            </span>
            <CheckCircle2 className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {completedTasks.length}/{tasks.length}
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            {pendingTasks.length} pending
          </span>
        </div>

        {/* Syllabus Progress */}
        <div
          onClick={() => onNavigateTab("study")}
          className="p-4 rounded-3xl border border-amber-200/80 dark:border-amber-950/60 bg-white dark:bg-slate-900 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Syllabus
            </span>
            <BookOpen className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {syllabusRate}%
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {completedChapters}/{totalChapters} Chapters
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide): Today's Tasks & Subjects */}
        <div className="lg:col-span-2 space-y-6">
          <section aria-labelledby="home-subjects-heading" className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-indigo-500" /><h2 id="home-subjects-heading" className="font-bold text-base">My Subjects</h2></div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your everyday learning, all in one place.</p>
            <ol className="mt-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {getHomeSubjectCards(subjects).map(({ label, subject }, index) => (
                <li key={subject.id}>
                  <button type="button" onClick={() => onOpenSubject(subject)} aria-label={`${label} — পত্র ও অধ্যায় দেখুন`} className="group flex min-h-20 w-full items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-100/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 dark:focus-visible:ring-offset-slate-900">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-indigo-600 dark:bg-slate-800 dark:text-indigo-300">{index + 1}</span>
                  <span className="flex-1 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </li>
              ))}
            </ol>
          </section>

          {/* Today's Tasks Quick List */}
          <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Today&apos;s Priority Tasks
                </h3>
              </div>

              <button
                onClick={() => onNavigateTab("tasks")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View all ({tasks.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-2 gap-3 ${
                    task.completed
                      ? "bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60"
                      : "bg-white dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-semibold truncate ${task.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}
                    >
                      {task.name}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      task.priority === "High"
                        ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Next Class, Upcoming Exam, Quick Actions */}
        <div className="space-y-6">
          {/* Next Class Widget */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Institutional Routine
              </span>
              <button
                onClick={() => onNavigateTab("routine")}
                className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-0.5"
              >
                <span>Routine</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {nextClass ? (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-indigo-700 dark:text-indigo-300">
                      Period {nextClass.periodNumber}: {nextClass.subject}
                    </span>
                    {nextClass.isQuizWeek && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 animate-pulse">
                        ✦ QUIZ WEEK ✦
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    {nextClass.timeSlot}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    📍 {nextClass.room || "Science Room No: 204"}
                  </span>
                  <span>
                    👨‍🏫{" "}
                    {nextClass.teacherCode
                      ? `Code: ${nextClass.teacherCode}`
                      : nextClass.teacher || "—"}
                  </span>
                </div>
                {profile.specialNote && (
                  <p className="text-[10px] text-slate-400 pt-1 border-t border-indigo-100/70 dark:border-indigo-900/40">
                    💡 Standard: Room 204 (Psychology: 107)
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No classes recorded today (Weekly Holiday: Friday).
              </p>
            )}
          </div>

          {/* Upcoming Exam Countdown Widget */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Next Exam
                </h4>
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                {getDaysLeft(nearestExam?.date)}
              </span>
            </div>

            {nearestExam ? (
              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {nearestExam.name}
                </div>
                <div className="text-slate-400 text-[11px]">
                  Subject: <b>{nearestExam.subject}</b> •{" "}
                  {new Date(nearestExam.date).toLocaleDateString()}
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${nearestExam.readinessPercentage}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No upcoming exams set.</p>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Quick Shortcuts
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigateTab("tasks")}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  + Add Task
                </div>
                <span className="text-[10px] text-slate-400">
                  Assignment or study
                </span>
              </button>

              <button
                onClick={onOpenTimer}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  ⚡ Focus 25m
                </div>
                <span className="text-[10px] text-slate-400">
                  Pomodoro session
                </span>
              </button>

              <button
                onClick={onOpenSetup}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  📚 Syllabus
                </div>
                <span className="text-[10px] text-slate-400">
                  Setup chapters
                </span>
              </button>

              <button
                onClick={() => onNavigateTab("routine")}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  📄 PDF Routine
                </div>
                <span className="text-[10px] text-slate-400">
                  View college PDF
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
