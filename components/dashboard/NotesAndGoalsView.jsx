"use client";

import React, { useState } from "react";
import {
  FileText,
  Target,
  Plus,
  Trash2,
  Pin,
  CheckCircle2,
  Circle,
  Search,
  Calendar,
} from "lucide-react";
import confetti from "canvas-confetti";
export const NotesAndGoalsView = ({
  notes,
  onUpdateNotes,
  goals,
  onUpdateGoals,
  subjects,
}) => {
  const [tab, setTab] = useState("notes");
  const [searchQuery, setSearchQuery] = useState("");
  // New Note State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSubject, setNoteSubject] = useState(
    subjects[0]?.name || "General",
  );
  // New Goal State
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState("Daily");
  const [goalDeadline, setGoalDeadline] = useState(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0],
  );
  // Note actions
  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    const newNote = {
      id: "note_" + Date.now(),
      title: noteTitle.trim(),
      content: noteContent.trim(),
      subjectName: noteSubject,
      color: "#EFF6FF",
      isPinned: false,
      updatedAt: new Date().toISOString(),
    };
    onUpdateNotes([newNote, ...notes]);
    setNoteTitle("");
    setNoteContent("");
    setIsAddingNote(false);
  };
  const togglePinNote = (id) => {
    onUpdateNotes(
      notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
    );
  };
  const deleteNote = (id) => {
    onUpdateNotes(notes.filter((n) => n.id !== id));
  };
  // Goal actions
  const handleSaveGoal = (e) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    const newGoal = {
      id: "goal_" + Date.now(),
      title: goalTitle.trim(),
      type: goalType,
      deadline: goalDeadline,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    onUpdateGoals([newGoal, ...goals]);
    setGoalTitle("");
    setIsAddingGoal(false);
  };
  const toggleGoal = (id) => {
    onUpdateGoals(
      goals.map((g) => {
        if (g.id === id) {
          const next = !g.completed;
          if (next) {
            confetti({
              particleCount: 25,
              spread: 40,
              origin: { y: 0.7 },
            });
          }
          return { ...g, completed: next };
        }
        return g;
      }),
    );
  };
  const deleteGoal = (id) => {
    onUpdateGoals(goals.filter((g) => g.id !== id));
  };
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.subjectName &&
        n.subjectName.toLowerCase().includes(searchQuery.toLowerCase())),
  );
  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Notes & Goals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Capture quick revision formulas, lecture summaries, and targeted
            study milestones.
          </p>
        </div>

        <div className="flex max-w-full flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setTab("notes")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              tab === "notes"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Quick Notes ({notes.length})</span>
          </button>
          <button
            onClick={() => setTab("goals")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              tab === "goals"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Academic Goals ({goals.length})</span>
          </button>
        </div>
      </div>

      {/* Tab: Quick Notes */}
      {tab === "notes" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search notes by formula or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 pl-9 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={() => setIsAddingNote(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Note</span>
            </button>
          </div>

          {/* Add Note Modal */}
          {isAddingNote && (
            <div className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
              <div className="dialog-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Create Quick Study Note
                </h3>

                <form onSubmit={handleSaveNote} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                      Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Carnot Engine Efficiency Formula"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                      Subject
                    </label>
                    <select
                      value={noteSubject}
                      onChange={(e) => setNoteSubject(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                      <option value="General">General / Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                      Content / Formula
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Write your study notes, short explanations, or key reminders..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                    >
                      Save Note
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                      {note.subjectName || "Study"}
                    </span>
                    <button
                      onClick={() => togglePinNote(note.id)}
                      className={`p-1 rounded-lg ${
                        note.isPinned
                          ? "text-indigo-600 fill-indigo-600"
                          : "text-slate-300 hover:text-slate-500"
                      }`}
                      title={note.isPinned ? "Unpin note" : "Pin note"}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {note.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed font-mono">
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="hover:text-rose-500 p-1"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Goals */}
      {tab === "goals" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddingGoal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Set Goal</span>
            </button>
          </div>

          {/* Add Goal Modal */}
          {isAddingGoal && (
            <div className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
              <div className="dialog-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Add Academic Goal
                </h3>

                <form onSubmit={handleSaveGoal} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                      Goal Description *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Master all 10 Physics chapters before December"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                        Goal Horizon
                      </label>
                      <select
                        value={goalType}
                        onChange={(e) => setGoalType(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Daily">Daily Goal</option>
                        <option value="Weekly">Weekly Goal</option>
                        <option value="Academic">Academic / Long-Term</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={goalDeadline}
                        onChange={(e) => setGoalDeadline(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingGoal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                    >
                      Set Goal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Goals List */}
          <div className="space-y-3">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                  goal.completed
                    ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleGoal(goal.id)}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {goal.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          goal.completed
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {goal.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                        {goal.type}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Target: {goal.deadline}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                  title="Delete goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
