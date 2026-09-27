"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import confetti from "canvas-confetti";
const STATUS_CONFIG = {
  "Not Started": {
    label: "Not Started",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  Learning: {
    label: "Learning",
    bg: "bg-amber-100 dark:bg-amber-950/80",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-800",
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  Completed: {
    label: "Completed",
    bg: "bg-emerald-100 dark:bg-emerald-950/80",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-300 dark:border-emerald-800",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Revision: {
    label: "Revision",
    bg: "bg-purple-100 dark:bg-purple-950/80",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-300 dark:border-purple-800",
    icon: <RotateCcw className="w-3.5 h-3.5" />,
  },
};
export const StudySection = ({
  subjects,
  onUpdateSubjects,
  onOpenSyllabusSetup,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    subjects[0]?.id || "",
  );
  const [filterStatus, setFilterStatus] = useState("All");
  const [showRevisionOnly, setShowRevisionOnly] = useState(false);
  // Overall syllabus stats calculation
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
  const overallProgress =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;
  const currentSubject =
    subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const updateChapterStatus = (subjectId, chapterId, newStatus) => {
    const updatedSubjects = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      const updatedChapters = sub.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const isNowCompleted =
          newStatus === "Completed" && ch.status !== "Completed";
        if (isNowCompleted) {
          confetti({
            particleCount: 25,
            spread: 45,
            origin: { y: 0.6 },
          });
        }
        return {
          ...ch,
          status: newStatus,
          revisionCount:
            newStatus === "Revision" ? ch.revisionCount + 1 : ch.revisionCount,
          lastRevised:
            newStatus === "Revision"
              ? new Date().toISOString().split("T")[0]
              : ch.lastRevised,
        };
      });
      return { ...sub, chapters: updatedChapters };
    });
    onUpdateSubjects(updatedSubjects);
  };
  const incrementRevision = (subjectId, chapterId) => {
    const updatedSubjects = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      const updatedChapters = sub.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch,
          status: "Revision",
          revisionCount: (ch.revisionCount || 0) + 1,
          lastRevised: new Date().toISOString().split("T")[0],
        };
      });
      return { ...sub, chapters: updatedChapters };
    });
    onUpdateSubjects(updatedSubjects);
  };
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Study & Syllabus Progress
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track chapter completion, active learning, and revision cycles.
          </p>
        </div>

        <button
          onClick={onOpenSyllabusSetup}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs sm:text-sm hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Edit Syllabus Structure</span>
        </button>
      </div>

      {/* Overall Progress Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-indigo-300/90">
              Academic Milestone
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Overall Syllabus: {overallProgress}% Completed
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-md">
              {completedChapters} of {totalChapters} chapters mastered. Keep up
              the consistency for your upcoming exams!
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>{completedChapters} Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>{learningChapters} Learning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span>{revisionChapters} Need Revision</span>
              </div>
            </div>
          </div>

          {/* Radial or Big percentage badge */}
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent border-l-transparent transition-all duration-700"
                style={{
                  transform: `rotate(${Math.min(360, (overallProgress / 100) * 360)}deg)`,
                }}
              ></div>
              <div className="text-center">
                <span className="text-2xl font-black">{overallProgress}%</span>
                <span className="block text-[9px] uppercase tracking-wider text-slate-300">
                  Done
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Carousel / Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
            Select Subject
          </h3>
          <button
            onClick={() => setShowRevisionOnly(!showRevisionOnly)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-all ${
              showRevisionOnly
                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revision Mode</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {subjects.map((sub) => {
            const subCompleted = sub.chapters.filter(
              (c) => c.status === "Completed",
            ).length;
            const subRate =
              sub.chapters.length > 0
                ? Math.round((subCompleted / sub.chapters.length) * 100)
                : 0;
            const isSelected =
              sub.id === currentSubject?.id && !showRevisionOnly;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  setSelectedSubjectId(sub.id);
                  setShowRevisionOnly(false);
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "border-indigo-600 bg-white dark:bg-slate-800 shadow-md ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sub.color }}
                  ></span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {sub.name}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {subCompleted}/{sub.chapters.length} chapters ({subRate}%)
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${subRate}%`, backgroundColor: sub.color }}
                  ></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapters Board */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
        {/* Board Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: currentSubject?.color || "#3B82F6" }}
            ></span>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {showRevisionOnly
                  ? "All Chapters Requiring Revision"
                  : `${currentSubject?.name} Chapters`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click status badges to advance progress or log revision cycles.
              </p>
            </div>
          </div>

          {!showRevisionOnly && (
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              {["All", "Not Started", "Learning", "Completed", "Revision"].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`shrink-0 whitespace-nowrap px-2.5 py-2 rounded-lg transition-all ${
                      filterStatus === st
                        ? "bg-white dark:bg-slate-900 font-bold text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {st}
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        {/* Chapters List */}
        <div className="space-y-3">
          {showRevisionOnly
            ? // Revision items from all subjects
              (() => {
                const allRevisionChapters = [];
                subjects.forEach((sub) => {
                  sub.chapters.forEach((ch) => {
                    if (ch.status === "Revision" || ch.revisionCount > 0) {
                      allRevisionChapters.push({
                        subjectName: sub.name,
                        subjectId: sub.id,
                        chapter: ch,
                      });
                    }
                  });
                });
                if (allRevisionChapters.length === 0) {
                  return (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      No chapters currently marked for revision! Mark a chapter
                      as &quot;Revision&quot; once completed to review it before
                      exams.
                    </div>
                  );
                }
                return allRevisionChapters.map(
                  ({ subjectName, subjectId, chapter }) => (
                    <div
                      key={`${subjectId}-${chapter.id}`}
                      className="p-4 rounded-2xl border border-purple-200/80 dark:border-purple-950/60 bg-purple-50/30 dark:bg-purple-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                            {subjectName}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {chapter.name}
                          </h4>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                          <span>
                            Revised: <b>{chapter.revisionCount} time(s)</b>
                          </span>
                          {chapter.lastRevised && (
                            <span>Last revised: {chapter.lastRevised}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => incrementRevision(subjectId, chapter.id)}
                        className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Revised Today (+1)</span>
                      </button>
                    </div>
                  ),
                );
              })()
            : // Current subject chapters
              currentSubject?.chapters
                .filter((ch) =>
                  filterStatus === "All" ? true : ch.status === filterStatus,
                )
                .map((chapter, idx) => {
                  const cfg = STATUS_CONFIG[chapter.status];
                  return (
                    <div
                      key={chapter.id}
                      className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-xs text-slate-500">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {chapter.name}
                          </h4>
                          {chapter.revisionCount > 0 && (
                            <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5 flex items-center gap-2">
                              <span>
                                Revised {chapter.revisionCount} time(s)
                              </span>
                              {chapter.lastRevised && (
                                <span>• Last: {chapter.lastRevised}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Cycle Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                        {[
                          "Not Started",
                          "Learning",
                          "Completed",
                          "Revision",
                        ].map((st) => {
                          const isCurrent = chapter.status === st;
                          const stCfg = STATUS_CONFIG[st];
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() =>
                                updateChapterStatus(
                                  currentSubject.id,
                                  chapter.id,
                                  st,
                                )
                              }
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all ${
                                isCurrent
                                  ? `${stCfg.bg} ${stCfg.text} ${stCfg.border} shadow-xs font-bold ring-2 ring-indigo-500/20`
                                  : "border-transparent text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                              }`}
                            >
                              {stCfg.icon}
                              <span>{st}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
        </div>
      </div>
    </div>
  );
};
