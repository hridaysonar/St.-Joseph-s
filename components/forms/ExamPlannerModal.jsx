"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Trash2, MapPin } from "lucide-react";
export const ExamPlannerModal = ({ exams, onUpdateExams, subjects }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState(subjects[0]?.name || "Physics");
  const [date, setDate] = useState(
    new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().slice(0, 16),
  );
  const [readinessPercentage, setReadinessPercentage] = useState(70);
  const [room, setRoom] = useState("");
  const [notes, setNotes] = useState("");
  // Ticker for live countdown
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const getCountdown = (examDateStr) => {
    const diff = new Date(examDateStr).getTime() - Date.now();
    if (diff <= 0)
      return { expired: true, text: "Exam in progress or completed" };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return {
      expired: false,
      days,
      hours,
      text: `${days}d ${hours}h left`,
    };
  };
  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newExam = {
      id: "exam_" + Date.now(),
      name: name.trim(),
      subject,
      date,
      readinessPercentage,
      room: room.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    onUpdateExams([...exams, newExam]);
    setName("");
    setRoom("");
    setNotes("");
    setIsAdding(false);
  };
  const handleDelete = (id) => {
    onUpdateExams(exams.filter((e) => e.id !== id));
  };
  const handleUpdateReadiness = (id, newReadiness) => {
    onUpdateExams(
      exams.map((e) =>
        e.id === id ? { ...e, readinessPercentage: newReadiness } : e,
      ),
    );
  };
  const sortedExams = [...exams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Exam Planner & Countdown
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track upcoming board exams, mid-terms, and preparation readiness.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exam</span>
        </button>
      </div>

      {/* Add Exam Modal */}
      {isAdding && (
        <div className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="dialog-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Add Upcoming Exam
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                  Exam Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics 1st Paper - Pre-Test"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Hall / Room
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hall 2"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  <span className="uppercase">Current Readiness</span>
                  <span>{readinessPercentage}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={readinessPercentage}
                  onChange={(e) =>
                    setReadinessPercentage(Number(e.target.value))
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                  Chapters / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Chapters included, special formulas to revise..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Cards */}
      <div className="space-y-4">
        {sortedExams.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 bg-white dark:bg-slate-900">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
              No exams scheduled currently.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add your upcoming model tests or board examinations to see live
              countdowns.
            </p>
          </div>
        ) : (
          sortedExams.map((exam) => {
            const cd = getCountdown(exam.date);
            return (
              <div
                key={exam.id}
                className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                      {exam.subject}
                    </span>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                      {exam.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      {new Date(exam.date).toLocaleString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {exam.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {exam.room}
                      </span>
                    )}
                  </div>

                  {exam.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      {exam.notes}
                    </p>
                  )}

                  {/* Readiness Slider */}
                  <div className="pt-2 max-w-sm">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      <span>Preparation Readiness</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {exam.readinessPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${exam.readinessPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Countdown Badge & Delete */}
                <div className="flex md:flex-col items-center justify-between md:items-end gap-3 shrink-0">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-900/40 text-center min-w-[130px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
                      Countdown
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                      {cd.expired ? "Concluded" : `${cd.days}d ${cd.hours}h`}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Delete exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
