"use client";

import React from "react";
import { Clock, CheckCircle2, BookOpen, Flame, BarChart3 } from "lucide-react";
export const AnalyticsView = ({ subjects, tasks, studyLogs, dailyNamaz }) => {
  // 1. Study time today & weekly
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = studyLogs.filter((l) => l.date === todayStr);
  const totalMinutesToday = todayLogs.reduce(
    (acc, curr) => acc + curr.minutes,
    0,
  );
  // Last 7 days study minutes
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayMinutes = studyLogs
      .filter((l) => l.date === dateStr)
      .reduce((acc, curr) => acc + curr.minutes, 0);
    last7Days.push({ dayName, date: dateStr, minutes: dayMinutes });
  }
  const maxMinutes = Math.max(...last7Days.map((d) => d.minutes), 60);
  // 2. Syllabus completion
  let totalChapters = 0;
  let completedChapters = 0;
  let learningChapters = 0;
  let revisionChapters = 0;
  subjects.forEach((s) => {
    s.chapters.forEach((c) => {
      totalChapters++;
      if (c.status === "Completed") completedChapters++;
      else if (c.status === "Learning") learningChapters++;
      else if (c.status === "Revision") revisionChapters++;
    });
  });
  const syllabusProgress =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;
  // 3. Task completion
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskProgress =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  // 4. Namaz completed today
  const namazCompleted = Object.values(dailyNamaz.prayers).filter(
    Boolean,
  ).length;
  const namazProgress = Math.round((namazCompleted / 5) * 100);
  // Estimated streak
  const streakDays = Math.max(1, Math.min(14, studyLogs.length + 3));
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Progress & Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Detailed metrics of your academic journey, focus time, and
          consistency.
        </p>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <div className="p-4 sm:p-5 rounded-3xl border border-amber-200/80 dark:border-amber-950/60 bg-gradient-to-br from-amber-50/70 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Study Streak
            </span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {streakDays} Days
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Keep it burning! 🔥
          </span>
        </div>

        {/* Study Time Today */}
        <div className="p-4 sm:p-5 rounded-3xl border border-indigo-200/80 dark:border-indigo-950/60 bg-gradient-to-br from-indigo-50/70 to-blue-50/50 dark:from-indigo-950/20 dark:to-blue-950/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
              Study Today
            </span>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalMinutesToday} min
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {Math.floor(totalMinutesToday / 60)}h {totalMinutesToday % 60}m
            logged
          </span>
        </div>

        {/* Syllabus Done */}
        <div className="p-4 sm:p-5 rounded-3xl border border-emerald-200/80 dark:border-emerald-950/60 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Syllabus
            </span>
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {syllabusProgress}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {completedChapters}/{totalChapters} Chapters
          </span>
        </div>

        {/* Tasks Complete */}
        <div className="p-4 sm:p-5 rounded-3xl border border-purple-200/80 dark:border-purple-950/60 bg-gradient-to-br from-purple-50/70 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              Tasks Done
            </span>
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {taskProgress}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {completedTasks}/{tasks.length} Complete
          </span>
        </div>
      </div>

      {/* Weekly Study Time Chart */}
      <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Weekly Study Time (Last 7 Days)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Minutes per day</span>
        </div>

        {/* Chart Bars */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-6 pb-2">
          {last7Days.map((d, i) => {
            const heightPercent = Math.max(
              10,
              Math.round((d.minutes / maxMinutes) * 100),
            );
            const isToday = i === 6;
            return (
              <div
                key={d.date}
                className="flex flex-col items-center gap-2 h-full justify-end"
              >
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {d.minutes > 0 ? `${d.minutes}m` : "0"}
                </span>
                <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col justify-end h-32">
                  <div
                    className={`w-full rounded-xl transition-all duration-700 ${
                      isToday
                        ? "bg-gradient-to-t from-indigo-600 to-purple-500"
                        : d.minutes > 0
                          ? "bg-indigo-400/80 dark:bg-indigo-600/60"
                          : "bg-transparent"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
                <span
                  className={`text-[11px] font-semibold ${isToday ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-400"}`}
                >
                  {d.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Breakdown Progress Bars */}
      <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Syllabus Mastery by Subject
        </h3>

        <div className="space-y-4">
          {subjects.map((sub) => {
            const subTotal = sub.chapters.length;
            const subCompleted = sub.chapters.filter(
              (c) => c.status === "Completed",
            ).length;
            const subLearning = sub.chapters.filter(
              (c) => c.status === "Learning",
            ).length;
            const rate =
              subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;
            return (
              <div key={sub.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: sub.color }}
                    ></span>
                    <span>{sub.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">
                    {subCompleted}/{subTotal} chapters ({rate}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${rate}%`, backgroundColor: sub.color }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
