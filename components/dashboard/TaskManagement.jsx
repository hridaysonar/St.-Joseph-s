"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Bell,
  Trash2,
} from "lucide-react";
import confetti from "canvas-confetti";
export const TaskManagement = ({
  tasks,
  onUpdateTasks,
}) => {
  const [filterType, setFilterType] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [isAdding, setIsAdding] = useState(false);
  // New task form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Study Task");
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 16),
  );
  const [priority, setPriority] = useState("Medium");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("18:00");
  // Task actions
  const toggleTask = (taskId) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.7 },
          });
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    onUpdateTasks(updated);
  };
  const deleteTask = (taskId) => {
    onUpdateTasks(tasks.filter((t) => t.id !== taskId));
  };
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newTask = {
      id: "task_" + Date.now(),
      name: name.trim(),
      description: description.trim(),
      type,
      deadline,
      priority,
      completed: false,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      createdAt: new Date().toISOString(),
    };
    onUpdateTasks([newTask, ...tasks]);
    setName("");
    setDescription("");
    setIsAdding(false);
  };
  const filteredTasks = tasks.filter((t) => {
    if (filterType !== "All" && t.type !== filterType) return false;
    if (filterPriority !== "All" && t.priority !== filterPriority) return false;
    return true;
  });
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskCompletionRate =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Task Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize study milestones, homework assignments, and daily tasks.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-[0.99] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Task Filters & Progress Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type filter */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            {["All", "Study Task", "Assignment/Homework", "Personal Task"].map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`shrink-0 whitespace-nowrap px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    filterType === t
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {t === "Assignment/Homework" ? "Assignment" : t}
                </button>
              ),
            )}
          </div>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Task Counter */}
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing {filteredTasks.length} of {tasks.length} tasks (
          {taskCompletionRate}% done)
        </div>
      </div>

      {/* New Task Modal / Drawer */}
      {isAdding && (
        <div className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="dialog-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Create New Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Task Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics Chapter 3 numerical problems"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details, pages, or guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Task Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Study Task">Study Task</option>
                    <option value="Assignment/Homework">
                      Assignment/Homework
                    </option>
                    <option value="Personal Task">Personal Task</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Deadline (Date & Time)
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Reminder Notification
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="remind"
                      checked={reminderEnabled}
                      onChange={(e) => setReminderEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="remind"
                      className="text-xs text-slate-600 dark:text-slate-300"
                    >
                      Enable Reminder
                    </label>
                    {reminderEnabled && (
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8">
            <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm">
              No tasks found in this filter.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add your daily homework, study goals, or revisions!
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue =
              !task.completed && new Date(task.deadline).getTime() < Date.now();
            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  task.completed
                    ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-75"
                    : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/20" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          task.completed
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {task.name}
                      </span>

                      {/* Type Badge */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          task.type === "Study Task"
                            ? "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300"
                            : task.type === "Assignment/Homework"
                              ? "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {task.type}
                      </span>

                      {/* Priority Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.priority === "High"
                            ? "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300"
                            : task.priority === "Medium"
                              ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300"
                              : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata: deadline & reminder */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <div
                        className={`flex items-center gap-1 ${isOverdue ? "text-rose-500 font-semibold" : ""}`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {isOverdue && "⚠️ Overdue: "}
                          {new Date(task.deadline).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {task.reminderEnabled && (
                        <div className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400">
                          <Bell className="w-3.5 h-3.5" />
                          <span>Reminder: {task.reminderTime || "Active"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
