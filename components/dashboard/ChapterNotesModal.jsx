"use client";
import React from "react";
import { X, FileText } from "lucide-react";
export default function ChapterNotesModal({ chapter, notes, error, onClose }) {
  if (!chapter) return null;
  const matching = notes.filter((note) => note.subjectId === chapter.subjectId && note.paperId === chapter.paperId && note.chapterId === chapter.id);
  const paperNotes = notes.filter((note) => note.subjectId === chapter.subjectId && note.paperId === chapter.paperId && !note.chapterId && note.contentType === "Paper Material");
  return (
    <div className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="chapter-notes-title" className="dialog-panel w-full max-w-lg space-y-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <header className="flex items-start justify-between gap-3"><div><h2 id="chapter-notes-title" className="font-bold">Notes</h2><p className="text-sm text-slate-500">{chapter.name}</p></div><button onClick={onClose} aria-label="Close notes" className="p-3"><X size={20} /></button></header>
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
        {!matching.length && !error && <p className="text-sm text-slate-500">এই অধ্যায়ের জন্য এখনো কোনো নোট প্রকাশ করা হয়নি।</p>}
        {matching.map((note) => <Note key={note.id} note={note} />)}
        {paperNotes.length > 0 && <><h3 className="font-semibold">Paper materials</h3>{paperNotes.map((note) => <Note key={note.id} note={note} />)}</>}
      </div>
    </div>
  );
}
function Note({ note }) {
  return <article className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700"><h3 className="font-semibold">{note.title}</h3><p className="text-xs text-slate-500">{note.contentType}</p>{note.description && <p className="whitespace-pre-wrap text-sm">{note.description}</p>}<a href={note.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm text-white"><FileText size={16} />Open PDF</a></article>;
}
