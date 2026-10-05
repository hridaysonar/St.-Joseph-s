"use client";
import React, { useEffect, useState } from "react";
import { ShieldCheck, Upload, RotateCw, LogOut } from "lucide-react";

const sections = ["Dashboard", "Routine Management", "Syllabus Management", "Chapter Notes", "User Problem Reports", "Feature Suggestions", "File/PDF Management", "Settings", "Students", "Other Feedback"];
const field = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900";
const button = "min-h-11 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
const card = "rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900";
async function api(path, options = {}) {
  const response = await fetch(`/api/admin/${path}`, options);
  const data = await response.json();
  if (response.status === 401) { window.location.href = "/admin"; throw new Error("Session expired."); }
  if (!response.ok) throw new Error(data.error || "Operation failed.");
  return data;
}
const jsonOptions = (method, data) => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });

export default function AdminDashboard() {
  const [tab, setTab] = useState("Dashboard");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [subjectId, setSubjectId] = useState("");
  const [paperId, setPaperId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [contentType, setContentType] = useState("Chapter Note");
  const [editing, setEditing] = useState(null);
  const [addKind, setAddKind] = useState("chapter");
  const [studentSearch, setStudentSearch] = useState("");
  async function refresh() { const next = await api("overview"); setData(next); }
  useEffect(() => { refresh().catch((failure) => setError(failure.message)); }, []);
  const subject = data?.catalog.find((item) => item.id === subjectId);
  const papers = subject?.papers || [];
  const chapters = subject?.chapters.filter((item) => item.paperId === paperId) || [];
  async function perform(action, message) {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try { await action(); await refresh(); setNotice(message); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); setProgress(null); }
  }
  function upload(path, method, form) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, `/api/admin/${path}`);
      xhr.upload.onprogress = (event) => { if (event.lengthComputable) setProgress(Math.round(event.loaded / event.total * 100)); };
      xhr.onload = () => {
        let result;
        try { result = JSON.parse(xhr.responseText); } catch { reject(new Error("Upload failed. Please try again.")); return; }
        if (xhr.status >= 200 && xhr.status < 300) resolve(result);
        else reject(new Error(result.error || "Upload failed."));
      };
      xhr.onerror = () => reject(new Error("Upload connection failed. Existing file is preserved."));
      xhr.timeout = 120000;
      xhr.ontimeout = () => reject(new Error("Upload timed out. Refresh to check whether it completed."));
      xhr.send(form);
    });
  }
  function submitContent(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const file = form.get("file");
    if (file?.size && (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024)) { setError("Choose a PDF no larger than 10 MB."); return; }
    perform(async () => {
      if (editing) {
        if (file?.size) await upload(`content/${editing.id}`, "PATCH", form);
        else await api(`content/${editing.id}`, jsonOptions("PATCH", { title: form.get("title"), description: form.get("description") }));
        setEditing(null);
      } else {
        form.set("kind", tab === "Routine Management" ? "routine" : "note");
        await upload("content", "POST", form);
      }
      element.reset();
    }, "Saved successfully. Use Publish when the PDF is ready for students.");
  }
  const content = data?.content.filter((item) => tab === "Routine Management" ? item.kind === "routine" : tab === "Chapter Notes" ? item.kind === "note" : true) || [];
  const reports = tab === "User Problem Reports" ? data?.reports : data?.suggestions;
  return (
    <main className="mx-auto min-h-dvh max-w-6xl space-y-5 px-3 py-5 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><ShieldCheck className="text-indigo-600" /><div><h1 className="text-xl font-bold">Student Life Admin</h1><a href="/dashboard" className="text-sm text-indigo-600">← Student dashboard</a></div></div>
        <div className="flex gap-2"><button disabled={busy} className={button} onClick={() => perform(refresh, "Updated.")} aria-label="Refresh"><RotateCw size={18} /></button><button disabled={busy} className={button} onClick={() => perform(async () => { await api("logout", { method: "POST" }); window.location.href = "/admin"; }, "Signed out.")}><LogOut size={18} /><span className="sr-only">Sign out</span></button></div>
      </header>
      <nav aria-label="Admin sections" className="flex gap-2 overflow-x-auto pb-2">{sections.map((section) => <button key={section} disabled={busy} onClick={() => { setTab(section); setEditing(null); setNotice(""); }} className={`min-h-11 shrink-0 rounded-xl px-4 text-sm ${tab === section ? "bg-indigo-600 text-white" : "bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-200"}`}>{section}</button>)}</nav>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</p>}
      {!data ? <p>{error ? "Admin sign-in succeeded. Content could not load; restore the database connection and press Refresh." : "Loading admin content…"}</p> : <>
        <h2 className="text-lg font-bold">{tab}</h2>
        {tab === "Dashboard" && <div className="grid gap-3 sm:grid-cols-3">{[["PDFs", data.content.length], ["New reports", data.reports.filter((item) => item.status === "New").length], ["Suggestions", data.suggestions.length]].map(([label, count]) => <div key={label} className={card}><p className="text-sm text-slate-500">{label}</p><p className="text-3xl font-bold text-indigo-600">{count}</p></div>)}<div className={`${card} sm:col-span-3`}><h3 className="font-semibold">Current published routine</h3>{data.content.find((item) => item.kind === "routine" && item.published)?.title || "No published routine"}</div></div>}
        {(["Routine Management", "Chapter Notes"].includes(tab) || editing) && <form key={editing?.id || tab} onSubmit={submitContent} className={`${card} space-y-4`}>
          <h3 className="font-semibold">{editing ? "Edit selected content" : tab === "Routine Management" ? "Upload new routine" : "Add academic PDF"}</h3>
          {!editing && tab === "Chapter Notes" && <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">Subject<select name="subjectId" required className={field} value={subjectId} onChange={(event) => { setSubjectId(event.target.value); setPaperId(""); setChapterId(""); }}><option value="">Select subject</option>{data.catalog.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="space-y-1 text-sm">Paper<select name="paperId" required className={field} value={paperId} onChange={(event) => { setPaperId(event.target.value); setChapterId(""); }}><option value="">Select paper</option>{papers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="space-y-1 text-sm">Content type<select name="contentType" className={field} value={contentType} onChange={(event) => setContentType(event.target.value)}>{["Chapter Note", "Class Note", "Short Note", "MCQ Note", "Revision Note", "Paper Material"].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="space-y-1 text-sm">Chapter<select name="chapterId" required={contentType !== "Paper Material"} className={field} value={chapterId} onChange={(event) => setChapterId(event.target.value)}><option value="">{contentType === "Paper Material" ? "Whole paper" : "Select chapter"}</option>{chapters.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          </div>}
          <label className="block space-y-1 text-sm">Title<input name="title" required maxLength={160} defaultValue={editing?.title || ""} className={field} /></label>
          <label className="block space-y-1 text-sm">Description (optional)<textarea name="description" maxLength={2000} defaultValue={editing?.description || ""} className={field} /></label>
          <label className="block space-y-1 text-sm">{editing ? "Replace PDF (optional)" : "PDF (maximum 10 MB)"}<input name="file" type="file" accept="application/pdf,.pdf" required={!editing} className={field} /></label>
          {progress !== null && <div role="status"><progress max="100" value={progress} className="w-full" /><p className="text-sm">{progress}% {progress === 100 ? "— validating and saving…" : "uploaded"}</p></div>}
          <div className="flex gap-2"><button className={button} disabled={busy}><Upload size={16} className="mr-2 inline" />{busy ? "Saving…" : "Save"}</button>{editing && <button type="button" className={button} onClick={() => setEditing(null)}>Cancel</button>}</div>
        </form>}
        {["Routine Management", "Chapter Notes", "File/PDF Management"].includes(tab) && <div className="space-y-3">{!content.length && <p className="text-sm text-slate-500">No uploaded PDFs yet.</p>}{content.map((item) => {
          const selectedSubject = data.catalog.find((subject) => subject.id === item.subjectId);
          return <article key={item.id} className={`${card} space-y-3`}><div><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-slate-500">{item.published ? "Published" : "Unpublished"} · {item.fileName} · {(item.fileSize / 1024 / 1024).toFixed(2)} MB</p>{selectedSubject && <p className="text-sm text-slate-500">{selectedSubject.name} → {selectedSubject.papers.find((paper) => paper.id === item.paperId)?.name} → {selectedSubject.chapters.find((chapter) => chapter.id === item.chapterId)?.name || "Whole paper"} · {item.contentType}</p>}<p className="text-sm">{item.description}</p></div><div className="flex flex-wrap gap-2"><a href={item.url} target="_blank" rel="noopener noreferrer" className={button}>Open PDF</a><button className={button} disabled={busy} onClick={() => setEditing(item)}>Edit / Replace</button><button className={button} disabled={busy} onClick={() => perform(() => api(`content/${item.id}`, jsonOptions("PATCH", { action: item.published ? "unpublish" : "publish" })), item.published ? "Unpublished." : "Published for students.")}>{item.published ? "Unpublish" : "Publish"}</button><button className="min-h-11 rounded-xl border border-rose-200 px-4 text-sm text-rose-600" disabled={busy || (item.kind === "routine" && item.published)} onClick={() => { if (window.confirm(`Delete only “${item.title}” and its PDF?`)) perform(() => api(`content/${item.id}`, jsonOptions("PATCH", { action: "delete" })), "Selected content deleted."); }}>Delete</button></div></article>;
        })}</div>}
        {tab === "Syllabus Management" && <div className="space-y-4"><p className="text-sm text-slate-500">Add subjects, papers or chapters. Existing names and student progress are preserved.</p><form className={`${card} space-y-3`} onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const input = new FormData(form); perform(async () => { await api("catalog", jsonOptions("POST", Object.fromEntries(input))); form.reset(); }, "Syllabus item added. Student progress is preserved."); }}>
          <label className="block text-sm">Add<select name="kind" value={addKind} onChange={(event) => setAddKind(event.target.value)} className={field}>{["subject", "paper", "chapter"].map((kind) => <option key={kind}>{kind}</option>)}</select></label>
          {addKind !== "subject" && <label className="block text-sm">Subject<select name="subjectId" required value={subjectId} onChange={(event) => { setSubjectId(event.target.value); setPaperId(""); }} className={field}><option value="">Select subject</option>{data.catalog.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
          {addKind === "chapter" && <label className="block text-sm">Paper<select name="paperId" required value={paperId} onChange={(event) => setPaperId(event.target.value)} className={field}><option value="">Select paper</option>{papers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
          <label className="block text-sm">Name<input name="name" required maxLength={160} className={field} /></label><button className={button} disabled={busy}>Add</button>
        </form>{data.catalog.map((item) => <details key={item.id} className={card}><summary className="cursor-pointer font-semibold">{item.name}</summary>{item.papers.map((paper) => <div key={paper.id} className="mt-3"><h4 className="text-sm font-semibold">{paper.name}</h4><ul className="mt-2 space-y-1 text-sm text-slate-500">{item.chapters.filter((chapter) => chapter.paperId === paper.id).map((chapter) => <li key={chapter.id}>{chapter.name}</li>)}</ul></div>)}</details>)}</div>}
        {["User Problem Reports", "Feature Suggestions"].includes(tab) && <div className="space-y-3">{!reports?.length && <p>No submissions yet.</p>}{reports?.map((item) => <article key={item.id} className={`${card} space-y-3`}><p className="whitespace-pre-wrap text-sm">{item.message}</p><p className="text-xs text-slate-500">{item.category} · {new Date(item.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}<br />{item.studentName} · {item.studentEmail} · {item.studentId} (self-reported)<br />Email: {item.emailStatus}</p><label className="block text-sm">Status<select className={field} disabled={busy} value={item.status} onChange={(event) => perform(() => api(`${tab === "User Problem Reports" ? "reports" : "suggestions"}/${item.id}`, jsonOptions("PATCH", { status: event.target.value })), "Review status updated.")}>{(tab === "User Problem Reports" ? ["New", "Reviewing", "Resolved"] : ["New", "Reviewing", "Planned", "Implemented", "Declined"]).map((status) => <option key={status}>{status}</option>)}</select></label></article>)}</div>}
        {tab === "Settings" && <div className={`${card} space-y-3 text-sm`}><p>Authorized Admin: <strong>{data.settings.adminEmail}</strong></p><p>Email notifications: {data.settings.emailConfigured ? "Configured" : "Setup required"}</p><p>PDF limit: {data.settings.maxPdfMB} MB</p><p>Sessions expire after 8 hours. Only the configured Admin email and password, or its verified Google account, can sign in.</p><form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); perform(() => api("config", jsonOptions("POST", { adminContactEmail: form.get("email") })), "Support email updated."); }} className="space-y-2"><label className="block">Public support email<input key={data.settings.supportEmail} name="email" type="email" required defaultValue={data.settings.supportEmail} className={field} /></label><p className="text-xs text-slate-500">Changing the contact address does not change Admin access or report notification recipient.</p><button disabled={busy} className={button}>Save support email</button></form></div>}
        {tab === "Students" && <><label className="block text-sm">Search students<input className={field} value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Name, school, class or ID" /></label><div className="grid gap-3 sm:grid-cols-2">{data.students.filter((student) => [student.studentName, student.school, student.grade, student.studentId].some((value) => value?.toLowerCase().includes(studentSearch.toLowerCase()))).map((student) => <article key={student.userId || student._id} className={card}><h3 className="font-semibold">{student.studentName}</h3><p className="text-sm text-slate-500">{student.email}<br />{student.school} · {student.grade}<br />{student.studentId}</p></article>)}</div></>}
        {tab === "Other Feedback" && <div className="space-y-3">{!data.feedbacks.length && <p>No feedback yet.</p>}{data.feedbacks.map((item) => <article key={item.id || item._id} className={card}><h3 className="font-semibold">{item.type}</h3><p className="whitespace-pre-wrap text-sm">{item.message}</p><p className="text-xs text-slate-500">{item.studentName} · {item.createdAt}</p></article>)}</div>}
      </>}
    </main>
  );
}
