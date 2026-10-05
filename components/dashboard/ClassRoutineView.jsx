"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Calendar,
  Clock,
  MapPin,
  User,
  Table,
  RotateCw,
  Sparkles,
  Printer,
} from "lucide-react";
const ROUTINE_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"];
export const ClassRoutineView = ({
  routineFile,
  onUpdateRoutineFile,
  periods,
  onUpdatePeriods,
  publishedRoutine = null,
  contentError = "",
}) => {
  const [activeTab, setActiveTab] = useState("official");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);
  useEffect(() => {
    // Prefer the currently published college routine; saved views stay available.
    if (publishedRoutine?.id) setActiveTab("published");
  }, [publishedRoutine?.id]);
  // Time slots matching St. Joseph's College routine
  const TIME_SLOTS = [
    { id: 1, label: "09:00 - 09:45", name: "1st Period" },
    { id: 2, label: "09:45 - 10:30", name: "2nd Period" },
    { id: 3, label: "10:30 - 11:15", name: "3rd Period" },
    { id: "break", label: "11:15 - 11:45", name: "BREAK" },
    { id: 4, label: "11:45 - 12:30", name: "4th Period" },
    { id: 5, label: "12:30 - 01:15", name: "5th Period" },
    { id: 6, label: "01:15 - 02:00", name: "6th Period" },
  ];
  // Detect current active class period based on time
  const [currentSlotIndex, setCurrentSlotIndex] = useState(null);
  useEffect(() => {
    const updateActiveSlot = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeInMinutes = hours * 60 + minutes;
      // 09:00 = 540m, 14:00 = 840m
      if (timeInMinutes >= 540 && timeInMinutes < 585) setCurrentSlotIndex(1);
      else if (timeInMinutes >= 585 && timeInMinutes < 630)
        setCurrentSlotIndex(2);
      else if (timeInMinutes >= 630 && timeInMinutes < 675)
        setCurrentSlotIndex(3);
      else if (timeInMinutes >= 675 && timeInMinutes < 705)
        setCurrentSlotIndex(0); // Break
      else if (timeInMinutes >= 705 && timeInMinutes < 750)
        setCurrentSlotIndex(4);
      else if (timeInMinutes >= 750 && timeInMinutes < 795)
        setCurrentSlotIndex(5);
      else if (timeInMinutes >= 795 && timeInMinutes < 840)
        setCurrentSlotIndex(6);
      else setCurrentSlotIndex(null);
    };
    updateActiveSlot();
    const timer = setInterval(updateActiveSlot, 60000);
    return () => clearInterval(timer);
  }, []);
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      alert("Please upload a PDF or image file of your class routine.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const routineObj = {
        fileName: file.name,
        fileDataUrl: reader.result,
        fileType: file.type,
        uploadedAt: new Date().toLocaleDateString(),
      };
      onUpdateRoutineFile(routineObj);
      setActiveTab("pdf");
    };
    reader.readAsDataURL(file);
  };
  const handlePrint = () => {
    window.print();
  };
  const getPeriodForDayAndSlot = (day, periodNumber) => {
    return periods.find(
      (p) => p.day === day && p.periodNumber === periodNumber,
    );
  };
  const dayPeriods = periods
    .filter((p) => p.day === selectedDay)
    .sort((a, b) => a.periodNumber - b.periodNumber);
  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Science (TWLVE) • Room 404
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              Class Routine - 2026
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            St. Joseph&apos;s School and College, Bonpara
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Student: <b>Nahid Hasan</b> • Weekly Holiday: <b>Friday</b> • Natore
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 self-start sm:self-auto">
          {publishedRoutine && <button onClick={() => setActiveTab("published")} className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold ${activeTab === "published" ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"}`}><FileText size={14} />Published Routine</button>}
          <button
            onClick={() => setActiveTab("official")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "official"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{publishedRoutine ? "Saved Routine Table" : "Full Routine Table"}</span>
          </button>

          <button
            onClick={() => setActiveTab("daily")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "daily"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily View</span>
          </button>

          <button
            onClick={() => setActiveTab("pdf")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "pdf"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Personal PDF File</span>
          </button>
        </div>
      </div>

      {/* 1. Official Table View (Exact layout from the image) */}
      {contentError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{contentError}</p>}
      {publishedRoutine && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-white p-4 dark:border-indigo-900 dark:bg-slate-900">
          <div><h3 className="font-bold">{publishedRoutine.title}</h3><p className="text-xs text-slate-500">Currently published college routine</p>{publishedRoutine.description && <p className="mt-1 text-sm">{publishedRoutine.description}</p>}</div>
          <a href={publishedRoutine.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"><FileText size={16} />Open Routine PDF</a>
        </section>
      )}
      {activeTab === "official" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                Effective Date: <b>22.04.2026</b>
              </span>
              <span>
                • Room No: <b>204 (Sci-B)</b>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-500" />
                <span>Print Routine</span>
              </button>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Personal PDF</span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Authentic Document Presentation Container */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
            {/* Institution Letterhead Header */}
            <div className="p-6 sm:p-8 text-center border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-indigo-50/40 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                St. Joseph&apos;s School and College, Bonpara
              </h1>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                Class Routine - 2026
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                <span>
                  <b>Class:</b> Science (TWELVE)
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span>
                  <b>Student Name:</b> Nahid Hasan
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span>
                  <b>Science Room No:</b> 204
                </span>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="max-w-full overflow-x-auto" tabIndex={0} role="region" aria-label="Weekly class routine">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white dark:bg-slate-950 font-bold border-b border-slate-700">
                    <th className="p-3.5 min-w-[90px] border-r border-slate-800">
                      DAY
                    </th>
                    <th className="p-3.5 min-w-[110px] border-r border-slate-800">
                      09:00 - 09:45
                    </th>
                    <th className="p-3.5 min-w-[110px] border-r border-slate-800">
                      09:45 - 10:30
                    </th>
                    <th className="p-3.5 min-w-[110px] border-r border-slate-800">
                      10:30 - 11:15
                    </th>
                    <th className="p-3.5 min-w-[60px] bg-slate-800/80 dark:bg-slate-900 border-r border-slate-800 text-[10px] font-mono tracking-widest">
                      11:15 - 11:45
                    </th>
                    <th className="p-3.5 min-w-[110px] border-r border-slate-800">
                      11:45 - 12:30
                    </th>
                    <th className="p-3.5 min-w-[110px] border-r border-slate-800">
                      12:30 - 01:15
                    </th>
                    <th className="p-3.5 min-w-[110px]">01:15 - 02:00</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {ROUTINE_DAYS.map((day, dIdx) => (
                    <tr
                      key={day}
                      className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Day Label */}
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white bg-slate-50/70 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                        {day}
                      </td>

                      {/* Period 1 */}
                      <td className="p-3 border-r border-slate-200 dark:border-slate-800">
                        {(() => {
                          const p = getPeriodForDayAndSlot(day, 1);
                          if (!p) return "—";
                          return (
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {p.subject}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                                {p.teacherCode || p.teacher}
                              </div>
                              {p.isQuizWeek && (
                                <span className="inline-block text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                                  ✦ QUIZ WEEK ✦
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Period 2 */}
                      <td className="p-3 border-r border-slate-200 dark:border-slate-800">
                        {(() => {
                          const p = getPeriodForDayAndSlot(day, 2);
                          if (!p) return "—";
                          return (
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {p.subject}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                                {p.teacherCode || p.teacher}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Period 3 */}
                      <td className="p-3 border-r border-slate-200 dark:border-slate-800">
                        {(() => {
                          const p = getPeriodForDayAndSlot(day, 3);
                          if (!p) return "—";
                          return (
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {p.subject}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                                {p.teacherCode || p.teacher}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Break Column (Spanning row or vertical indicator) */}
                      {dIdx === 0 ? (
                        <td
                          rowSpan={5}
                          className="bg-slate-50 dark:bg-slate-900/80 border-r border-slate-200 dark:border-slate-800 text-slate-400 font-black tracking-widest text-[11px] select-none py-6"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span>B</span>
                            <span>R</span>
                            <span>E</span>
                            <span>A</span>
                            <span>K</span>
                          </div>
                        </td>
                      ) : null}

                      {/* Period 4 */}
                      <td className="p-3 border-r border-slate-200 dark:border-slate-800">
                        {(() => {
                          const p = getPeriodForDayAndSlot(day, 4);
                          if (!p) return "—";
                          return (
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {p.subject}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                                {p.teacherCode || p.teacher}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Period 5 */}
                      <td className="p-3 border-r border-slate-200 dark:border-slate-800">
                        {(() => {
                          const p = getPeriodForDayAndSlot(day, 5);
                          if (!p) return "—";
                          return (
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {p.subject}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                                {p.teacherCode || p.teacher}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Period 6 */}
                      <td className="p-3">
                        {(() => {
                          const p = getPeriodForDayAndSlot(day, 6);
                          if (!p) return "—";
                          return (
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {p.subject}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                                {p.teacherCode || p.teacher}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Special Note from Routine banner */}
            <div className="p-4 sm:p-5 bg-rose-50/60 dark:bg-rose-950/20 border-t border-rose-100 dark:border-rose-900/40 text-xs">
              <p className="text-rose-800 dark:text-rose-300 font-medium leading-relaxed">
                <span className="font-bold text-rose-900 dark:text-rose-200">
                  Special Note from Routine:
                </span>{" "}
                If Higher Mathematics, Psychology & Agriculture are combined,
                then the Psychology room no is 107. (Your standard classroom for
                Sci-B is Room No: 204).
              </p>
            </div>

            {/* Document Footer */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>
                Effective Date: <b>22.04.2026</b> | Weekly Holiday:{" "}
                <b>Friday</b>
              </span>
              <span className="font-medium italic">
                St. Joseph&apos;s School and College, Bonpara, Natore.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Daily View (Optimized for Mobile Phones) */}
      {activeTab === "daily" && (
        <div className="space-y-4">
          {/* Day selection tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            {ROUTINE_DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  selectedDay === d
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Daily Card Stream */}
          <div className="space-y-3">
            {dayPeriods.map((period, idx) => {
              const isBreakAfter = period.periodNumber === 3;
              return (
                <React.Fragment key={period.id}>
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold uppercase text-indigo-400">
                          P-{period.periodNumber}
                        </span>
                        <span className="text-xs font-black font-mono">
                          {period.timeSlot.split(" - ")[0]}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {period.subject}
                          </h4>
                          {period.isQuizWeek && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                              ✦ QUIZ WEEK ✦
                            </span>
                          )}
                          {period.isPractical && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              Practical Lab
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            {period.timeSlot}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {period.teacherCode
                              ? `Teacher ${period.teacherCode}`
                              : period.teacher || "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {period.room || "Room 204"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Break Card */}
                  {isBreakAfter && (
                    <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-center flex items-center justify-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>
                        11:15 - 11:45 • RECESS & PRAYER BREAK (30 Mins)
                      </span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Uploaded PDF / Image File Viewer */}
      {activeTab === "pdf" && (
        <div className="space-y-4">
          {routineFile ? (
            <div className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                      {routineFile.fileName}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Uploaded on {routineFile.uploadedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Replace PDF</span>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <a
                    href={routineFile.fileDataUrl}
                    download={routineFile.fileName}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    title="Download Routine"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => onUpdateRoutineFile(null)}
                    className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50"
                    title="Delete Routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="w-full bg-slate-950/5 dark:bg-slate-950/50 flex items-center justify-center p-2 sm:p-4 min-h-[500px]">
                {routineFile.fileType === "application/pdf" ? (
                  <iframe
                    src={routineFile.fileDataUrl}
                    className="w-full h-[600px] rounded-2xl border-0 shadow-inner bg-white"
                    title="Class Routine PDF"
                  />
                ) : (
                  <img
                    src={routineFile.fileDataUrl}
                    alt="Class Routine"
                    className="max-h-[650px] max-w-full rounded-2xl object-contain shadow-md"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center bg-white dark:bg-slate-900 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Keep a Personal Routine Copy
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-6">
                Upload a PDF or photo for your own device. The published college
                routine is managed by the Admin.
              </p>

              <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 active:scale-[0.99] transition-all">
                <Upload className="w-4 h-4" />
                <span>Select PDF or Image</span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
