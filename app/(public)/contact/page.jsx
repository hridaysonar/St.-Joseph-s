"use client";
import { useState } from "react";
import { HelpFeedbackModal } from "../../../components/forms/HelpFeedbackModal.jsx";
import PageLink from "../../../components/ui/PageLink.jsx";
export default function ContactPage() {
  const [open, setOpen] = useState(false);
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-16">
      <h1 className="text-3xl font-bold">Contact & feedback</h1>
      <p>
        Send a question, report a problem, or suggest a feature to the Student
        Life team.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
      >
        Send feedback
      </button>
      <div>
        <PageLink href="/dashboard">Open dashboard</PageLink>
      </div>
      {open && (
        <HelpFeedbackModal
          isOpen={open}
          profile={{ studentName: "", email: "" }}
          onClose={() => setOpen(false)}
        />
      )}
    </main>
  );
}
