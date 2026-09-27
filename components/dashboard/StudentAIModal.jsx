"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Bot, Loader2 } from "lucide-react";
export const StudentAIModal = ({
  isOpen,
  onClose,
  profile,
  subjects,
  exams,
  studyMinutesToday,
}) => {
  const [messages, setMessages] = useState([
    {
      id: "welcome-msg",
      role: "assistant",
      text: `Assalamu Alaikum, **${profile.studentName}**! 🎓\nI am your **Student AI** companion for **${profile.school}** (Science TWELVE, Room 204).\n\nHow can I help you today?\n- Ask **"What should I study today?"** based on your routine & syllabus\n- Ask about upcoming **Quiz Week** (Tuesday English, Saturday Physics)\n- Request a personalized 25-minute or 2-hour study plan\n- Get concept explanations for Physics, Chemistry, Biology, Math, ICT!`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages]);
  if (!isOpen) return null;
  const quickPrompts = [
    "What should I study today based on my syllabus?",
    "How should I prepare for Quiz Week in Physics & English?",
    "Explain the concept of Lenz's Law simply",
    "Make a 2-hour focused revision routine for tonight",
    "Help me prepare for practical lab sessions",
  ];
  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;
    const userMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput("");
    setLoading(true);
    try {
      // Build syllabus summary
      const syllabusSummary = subjects.map((s) => ({
        name: s.name,
        totalChapters: s.chapters.length,
        completedChapters: s.chapters.filter((c) => c.status === "Completed")
          .length,
        learningChapters: s.chapters
          .filter((c) => c.status === "Learning")
          .map((c) => c.name),
        revisionChapters: s.chapters
          .filter((c) => c.status === "Revision")
          .map((c) => c.name),
      }));
      const nearestExams = exams.map((e) => ({
        name: e.name,
        subject: e.subject,
        date: new Date(e.date).toLocaleDateString(),
        readiness: e.readinessPercentage,
      }));
      const res = await fetch("/api/student-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          context: {
            studentName: profile.studentName,
            school: profile.school,
            grade: profile.grade,
            group: profile.group,
            subjects: syllabusSummary,
            upcomingExams: nearestExams,
            studyHoursToday: studyMinutesToday,
          },
          history: messages.slice(-5).map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });
      if (!res.ok) {
        throw new Error("Server returned an error");
      }
      const data = await res.json();
      const aiReply = {
        id: "msg_ai_" + Date.now(),
        role: "assistant",
        text:
          data.reply ||
          "I am ready to help you plan your next study milestone.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      const errorMsg = {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        text: `I had trouble connecting to the study server. Please verify your connection or try again shortly. In the meantime, don't forget to review your **${subjects[0]?.name || "current"}** chapters!`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="dialog-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl h-[86dvh] max-h-[720px] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Student AI
                </h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  Study Assistant
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalized for {profile.studentName} (
                {profile.grade || "Student"})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat message stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`min-w-0 flex-1 max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-xs"
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 rounded-tl-xs"
                }`}
              >
                <div className="whitespace-pre-line font-normal">{m.text}</div>
                <div
                  className={`text-[10px] mt-1.5 text-right ${m.role === "user" ? "text-indigo-200" : "text-slate-400"}`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  {profile.studentName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center text-slate-500 dark:text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl px-4 py-2.5 border border-slate-200/80 dark:border-slate-700/60">
                <span>
                  Student AI is analyzing your syllabus and preparing answer...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 overflow-x-auto scrollbar-none flex gap-2">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors shadow-2xs"
            >
              ✨ {prompt}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Student AI anything about your studies..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
