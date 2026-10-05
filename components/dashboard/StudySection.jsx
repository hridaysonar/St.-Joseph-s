"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Layers,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { chapterProgress, getSubjectPapers } from "../../lib/syllabus.js";
import ChapterNotesModal from "./ChapterNotesModal.jsx";

const statuses = {
  "Not Started": "শুরু করিনি",
  Learning: "পড়ছি",
  Completed: "সম্পন্ন",
  Revision: "রিভিশন",
};
const surface =
  "rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";
const input =
  "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";
const bn = (value) => value.toLocaleString("bn-BD");

function Progress({ chapters, color = "#6366f1" }) {
  const { percent } = chapterProgress(chapters);
  return (
    <div
      role="progressbar"
      aria-label="অধ্যায়ের অগ্রগতি"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
}

export const StudySection = ({
  subjects,
  onUpdateSubjects,
  onOpenSyllabusSetup,
  initialSubjectId = null,
  publishedNotes = [],
  contentError = "",
}) => {
  const [selectedId, setSelectedId] = useState(initialSubjectId);
  const [paperId, setPaperId] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [revisionOnly, setRevisionOnly] = useState(false);
  const [newChapter, setNewChapter] = useState("");
  const [notesChapter, setNotesChapter] = useState(null);
  const heading = useRef(null);
  const statusTapTimes = useRef(new Map());
  const [now, setNow] = useState(() => Date.now());
  const subject = subjects.find((item) => item.id === selectedId);
  const papers = subject ? getSubjectPapers(subject) : [];
  const paper = papers.find((item) => item.id === paperId) || papers[0];
  const allChapters = subjects.flatMap((item) => item.chapters);
  const summary = chapterProgress(subject ? subject.chapters : allChapters);
  const rows = revisionOnly
    ? subjects.flatMap((item) =>
        item.chapters
          .filter((chapter) => chapter.status === "Revision")
          .map((chapter) => ({
            ...chapter,
            subjectId: item.id,
            subjectName: item.name,
          })),
      )
    : (paper?.chapters || []).map((chapter, index) => ({
        ...chapter,
        number: index + 1,
        subjectId: subject.id,
      }));
  const visible = rows.filter(
    (chapter) =>
      (filter === "All" || chapter.status === filter) &&
      chapter.name
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
  );
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [selectedId, revisionOnly]);

  const hasPendingUndo = allChapters.some(
    (chapter) => chapter.status === "Completed" && chapter.statusUndoUntil > now,
  );
  useEffect(() => {
    if (!hasPendingUndo) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [hasPendingUndo]);

  function openSubject(id) {
    setSelectedId(id);
    setPaperId(null);
    setQuery("");
    setFilter("All");
    setRevisionOnly(false);
    setNewChapter("");
  }
  function updateChapter(subjectId, chapterId, status, logRevision = false, undo = false) {
    const current = subjects.find((item) => item.id === subjectId)?.chapters.find(
      (chapter) => chapter.id === chapterId,
    );
    if (!current) return;
    const timestamp = Date.now();
    if (undo) {
      if (current.status !== "Completed" || !(current.statusUndoUntil > timestamp)) return;
    } else if (!logRevision) {
      if (current.status === status) return;
      // Preserve revision actions; guard repeated changes to ordinary statuses.
      if (current.status !== "Revision" && status !== "Revision") {
        const key = JSON.stringify([subjectId, chapterId]);
        if (timestamp - (statusTapTimes.current.get(key) || 0) < 750) return;
        statusTapTimes.current.set(key, timestamp);
      }
    }
    if (undo) {
      statusTapTimes.current.set(JSON.stringify([subjectId, chapterId]), timestamp);
    }
    setNow(timestamp);
    onUpdateSubjects(
      subjects.map((item) =>
        item.id !== subjectId
          ? item
          : {
              ...item,
              chapters: item.chapters.map((chapter) => {
                if (chapter.id !== chapterId) return chapter;
                const revise =
                  logRevision ||
                  (status === "Revision" && chapter.status !== "Revision");
                const { statusUndoUntil, ...savedChapter } = chapter;
                return {
                  ...savedChapter,
                  status,
                  // Save immediately so refresh preserves both progress and the deadline.
                  ...(!undo && chapter.status === "Not Started" && status === "Completed"
                    ? { statusUndoUntil: timestamp + 60_000 }
                    : {}),
                  revisionCount:
                    (chapter.revisionCount || 0) + (revise ? 1 : 0),
                  ...(revise
                    ? { lastRevised: new Date().toLocaleDateString("en-CA") }
                    : {}),
                };
              }),
            },
      ),
    );
  }
  function addChapter(event) {
    event.preventDefault();
    if (!newChapter.trim() || !subject || !paper) return;
    onUpdateSubjects(
      subjects.map((item) =>
        item.id !== subject.id
          ? item
          : {
              ...item,
              chapters: [
                ...item.chapters,
                {
                  id: crypto.randomUUID(),
                  name: newChapter.trim(),
                  paperId: paper.id === "unassigned" ? undefined : paper.id,
                  status: "Not Started",
                  revisionCount: 0,
                },
              ],
            },
      ),
    );
    setNewChapter("");
  }

  return (
    <div className="space-y-6 pb-20 text-slate-900 dark:text-white" lang="bn">
      <ChapterNotesModal chapter={notesChapter} notes={publishedNotes} error={contentError} onClose={() => setNotesChapter(null)} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {(subject || revisionOnly) && (
            <button
              onClick={() => openSubject(null)}
              className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400"
            >
              <ArrowLeft size={16} /> সকল বিষয়
            </button>
          )}
          <h2
            ref={heading}
            tabIndex={-1}
            className="text-2xl font-extrabold tracking-tight outline-none sm:text-3xl"
          >
            {revisionOnly ? "রিভিশনের সময়" : subject?.name || "আমার পড়াশোনা"}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {subject
              ? "পত্র বেছে নিন, অধ্যায় ধরে এগিয়ে যান।"
              : "ছোট ছোট অগ্রগতিতেই পুরো সিলেবাস শেষ হবে।"}
          </p>
        </div>
        <button
          onClick={onOpenSyllabusSetup}
          className={`${input} inline-flex items-center gap-2 font-semibold`}
        >
          <SlidersHorizontal size={16} /> সিলেবাস সাজান
        </button>
      </div>

      {!revisionOnly && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-lg flex-1">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-200">
                <GraduationCap size={17} />{" "}
                {subject ? "বিষয়ের অগ্রগতি" : "সিলেবাস ট্র্যাকার"}
              </p>
              <h3 className="text-2xl font-bold sm:text-3xl">
                {summary.percent === 100
                  ? "দারুণ! সব অধ্যায় সম্পন্ন।"
                  : "আজ একটু এগিয়ে যাই"}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-indigo-100">
                {bn(summary.total)}টি অধ্যায়ের মধ্যে {bn(summary.completed)}টি
                সম্পন্ন হয়েছে।
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-emerald-300 transition-all"
                  style={{ width: `${summary.percent}%` }}
                />
              </div>
            </div>
            <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-8 border-white/15 bg-white/5">
              <strong className="text-3xl">{bn(summary.percent)}%</strong>
              <span className="mt-1 text-xs text-indigo-200">সম্পন্ন</span>
            </div>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-3 border-t border-white/15 pt-5 text-xs text-indigo-100">
            <span>
              {bn(subject ? papers.length : subjects.length)}টি{" "}
              {subject ? "বিভাগ" : "বিষয়"}
            </span>
            <span>•</span>
            <span>{bn(summary.total - summary.completed)}টি অধ্যায় বাকি</span>
          </div>
        </section>
      )}

      {!subject && !revisionOnly ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold">
              আমার বিষয়গুলো{" "}
              <span className="text-sm font-normal text-slate-400">
                ({bn(subjects.length)})
              </span>
            </h3>
            <button
              onClick={() => {
                setRevisionOnly(true);
                setFilter("All");
                setQuery("");
              }}
              className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
            >
              <RotateCcw size={15} /> রিভিশন তালিকা
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {subjects.map((item) => {
              const stats = chapterProgress(item.chapters);
              return (
                <button
                  key={item.id}
                  onClick={() => openSubject(item.id)}
                  className={`${surface} group p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 motion-reduce:transform-none`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800"
                      style={{ color: item.color }}
                    >
                      <BookOpen size={24} />
                    </span>
                    <ArrowUpRight
                      size={19}
                      className="text-slate-300 group-hover:text-indigo-500"
                    />
                  </div>
                  <h4 className="text-lg font-bold">{item.name}</h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {getSubjectPapers(item)
                      .map((part) => part.name)
                      .join(" · ")}
                  </p>
                  <div className="mb-2 mt-6 flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {bn(stats.completed)}/{bn(stats.total)} অধ্যায় সম্পন্ন
                    </span>
                    <strong style={{ color: item.color }}>
                      {bn(stats.percent)}%
                    </strong>
                  </div>
                  <Progress chapters={item.chapters} color={item.color} />
                  <p className="mt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    বিস্তারিত দেখুন →
                  </p>
                </button>
              );
            })}
          </div>
          {!subjects.length && (
            <div className={`${surface} p-8 text-center text-slate-500`}>
              এখনও কোনো বিষয় যোগ করা হয়নি। সিলেবাস সাজান থেকে শুরু করুন।
            </div>
          )}
        </section>
      ) : (
        <>
          {!revisionOnly && (
            <div
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
              aria-label="পত্র নির্বাচন"
            >
              {papers.map((part) => {
                const stats = chapterProgress(part.chapters);
                return (
                  <button
                    key={part.id}
                    aria-pressed={paper.id === part.id}
                    onClick={() => {
                      setPaperId(part.id);
                      setQuery("");
                      setFilter("All");
                      setNewChapter("");
                    }}
                    className={`${surface} p-5 text-left transition ${paper.id === part.id ? "ring-2 ring-indigo-500 shadow-sm" : "hover:border-indigo-300"}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2 font-bold">
                        <Layers size={18} className="text-indigo-500" />
                        {part.name}
                      </span>
                      {paper.id === part.id && (
                        <CheckCircle2 size={18} className="text-indigo-500" />
                      )}
                    </div>
                    <div className="mb-3 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {bn(stats.completed)}/{bn(stats.total)} অধ্যায়
                      </span>
                      <span>{bn(stats.percent)}%</span>
                    </div>
                    <Progress chapters={part.chapters} />
                  </button>
                );
              })}
            </div>
          )}
          <section className={`${surface} overflow-hidden`}>
            <div className="space-y-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
              <h3 className="text-lg font-bold">
                {revisionOnly
                  ? "রিভিশন তালিকা"
                  : `${paper?.name} — অধ্যায়সমূহ`}{" "}
                <span className="text-sm font-normal text-slate-400">
                  ({bn(rows.length)})
                </span>
              </h3>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    aria-label="অধ্যায় খুঁজুন"
                    placeholder="অধ্যায় খুঁজুন…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className={`${input} w-full pl-10`}
                  />
                </label>
                {!revisionOnly && (
                  <select
                    aria-label="স্ট্যাটাস অনুযায়ী দেখুন"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className={input}
                  >
                    <option value="All">সকল অধ্যায়</option>
                    {Object.entries(statuses).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {visible.map((chapter) => (
                <div
                  key={`${chapter.subjectId}-${chapter.id}`}
                  className="flex flex-col gap-4 p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${chapter.status === "Completed" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}
                    >
                      {chapter.status === "Completed" ? (
                        <CheckCircle2 size={18} />
                      ) : revisionOnly ? (
                        <RotateCcw size={16} />
                      ) : (
                        bn(chapter.number).padStart(2, "০")
                      )}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold leading-relaxed">
                        {chapter.name}
                      </h4>
                      {chapter.subjectName && (
                        <p className="mt-1 text-xs text-indigo-500">
                          {chapter.subjectName}
                        </p>
                      )}
                      {chapter.revisionCount > 0 && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {bn(chapter.revisionCount)} বার রিভিশন
                          {chapter.lastRevised
                            ? ` · সর্বশেষ ${chapter.lastRevised}`
                            : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button type="button" onClick={() => setNotesChapter(chapter)} aria-label={`${chapter.name} — Notes`} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-indigo-600 dark:border-slate-700 dark:text-indigo-400">Notes</button>
                    <select
                      aria-label={`${chapter.name} — স্ট্যাটাস`}
                      value={chapter.status}
                      onChange={(event) =>
                        updateChapter(
                          chapter.subjectId,
                          chapter.id,
                          event.target.value,
                        )
                      }
                      className={input}
                    >
                      {Object.entries(statuses).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {chapter.status === "Completed" && chapter.statusUndoUntil > now && (
                      <button
                        type="button"
                        aria-label={`${chapter.name} — পড়া হয়েছে বাতিল করুন`}
                        onClick={() => updateChapter(chapter.subjectId, chapter.id, "Not Started", false, true)}
                        className="rounded-xl bg-indigo-50 px-3 py-2.5 text-sm text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                      >
                        Undo ({bn(Math.ceil((chapter.statusUndoUntil - now) / 1000))} সেকেন্ড)
                      </button>
                    )}
                    {chapter.status === "Revision" && (
                      <button
                        aria-label={`${chapter.name} — আজ রিভিশন করেছি`}
                        title="আজ রিভিশন করেছি (+১)"
                        onClick={() =>
                          updateChapter(
                            chapter.subjectId,
                            chapter.id,
                            "Revision",
                            true,
                          )
                        }
                        className="rounded-xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-950/40"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!visible.length && (
              <div className="px-6 py-12 text-center">
                <BookOpen className="mx-auto mb-4 text-slate-300" size={34} />
                <h4 className="font-semibold">
                  {rows.length
                    ? "কোনো অধ্যায় পাওয়া যায়নি"
                    : revisionOnly
                      ? "রিভিশনের তালিকা এখন খালি"
                      : "অধ্যায়ের তালিকা তৈরি করুন"}
                </h4>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {rows.length
                    ? "অন্য নামে খুঁজুন অথবা স্ট্যাটাস ফিল্টার পরিবর্তন করুন।"
                    : revisionOnly
                      ? "অধ্যায়ের স্ট্যাটাস রিভিশন করলে এখানে দেখাবে।"
                      : paper?.note ||
                        "এই পত্রে আপনার বইয়ের অধ্যায় বা টপিক যোগ করুন।"}
                </p>
              </div>
            )}
            {!revisionOnly && paper && (
              <form
                onSubmit={addChapter}
                className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/20 sm:flex-row"
              >
                <input
                  aria-label="নতুন অধ্যায়ের নাম"
                  value={newChapter}
                  onChange={(event) => setNewChapter(event.target.value)}
                  placeholder={`${paper.name}-এ নতুন অধ্যায় যোগ করুন`}
                  className={`${input} min-w-0 flex-1`}
                  maxLength={200}
                  required
                />
                <button
                  disabled={!newChapter.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
                >
                  <Plus size={16} /> অধ্যায় যোগ করুন
                </button>
              </form>
            )}
          </section>
        </>
      )}
    </div>
  );
};
