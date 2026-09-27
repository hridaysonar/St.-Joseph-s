"use client";
import { CheckCircle2, Circle, Sun, Sunrise, Sunset, Moon } from "lucide-react";
import confetti from "canvas-confetti";
const NAMAZ_CONFIG = [
  {
    name: "Fajr",
    time: "04:45 AM",
    icon: <Sunrise className="w-4 h-4" />,
    color: "from-blue-500/20 to-indigo-500/10",
  },
  {
    name: "Zuhr",
    time: "01:15 PM",
    icon: <Sun className="w-4 h-4" />,
    color: "from-amber-500/20 to-yellow-500/10",
  },
  {
    name: "Asr",
    time: "04:30 PM",
    icon: <Sun className="w-4 h-4" />,
    color: "from-orange-500/20 to-amber-500/10",
  },
  {
    name: "Maghrib",
    time: "06:05 PM",
    icon: <Sunset className="w-4 h-4" />,
    color: "from-rose-500/20 to-orange-500/10",
  },
  {
    name: "Isha",
    time: "07:35 PM",
    icon: <Moon className="w-4 h-4" />,
    color: "from-indigo-500/20 to-purple-500/10",
  },
];
export default function NamazView({ dailyNamaz, onUpdateNamaz }) {
  // Namaz toggle
  const toggleNamaz = (prayerName) => {
    const updatedPrayers = {
      ...dailyNamaz.prayers,
      [prayerName]: !dailyNamaz.prayers[prayerName],
    };
    const updated = { ...dailyNamaz, prayers: updatedPrayers };
    onUpdateNamaz(updated);
    const completedCount = Object.values(updatedPrayers).filter(Boolean).length;
    if (completedCount === 5) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };
  const namazCompletedCount = Object.values(dailyNamaz.prayers).filter(
    Boolean,
  ).length;
  const namazPercentage = Math.round((namazCompletedCount / 5) * 100);
  return <section className="space-y-6 pb-6"><div><h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Namaz Dashboard</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Track your five daily prayers. Tap a prayer to update your progress.</p></div>
      {/* Daily prayer tracker */}
      <div className="rounded-3xl border border-emerald-200/80 dark:border-emerald-950/60 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/20 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                <span>Daily Namaz Progress</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  {namazCompletedCount}/5 Completed ({namazPercentage}%)
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Part of your daily discipline and spiritual focus
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full sm:w-48 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${namazPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Namaz 5 Prayers Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {NAMAZ_CONFIG.map(({ name, time, icon }) => {
            const isCompleted = dailyNamaz.prayers[name];
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleNamaz(name)}
                aria-pressed={isCompleted}
                aria-label={`${name}: ${isCompleted ? "Completed" : "Pending"}`}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-emerald-400"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`p-1.5 rounded-xl ${isCompleted ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
                  >
                    {icon}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">{name}</div>
                  <div
                    className={`text-[11px] ${isCompleted ? "text-emerald-100" : "text-slate-400"}`}
                  >
                    {time}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

  </section>;
}
