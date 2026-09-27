"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
} from "lucide-react";
import confetti from "canvas-confetti";
export const StudyTimerModal = ({
  isOpen,
  onClose,
  onSessionComplete,
  availableSubjects,
}) => {
  const [mode, setMode] = useState("focus");
  const [presetDuration, setPresetDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(
    availableSubjects[0] || "General Study",
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  // Audio tone generator using Web Audio API for chime
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(
        880,
        audioCtx.currentTime + 0.3,
      ); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn("AudioContext not supported");
    }
  }, [soundEnabled]);
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Completed!
      setIsRunning(false);
      playChime();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
      if (mode === "focus") {
        onSessionComplete(presetDuration, selectedSubject);
        setMode("break");
        setTimeLeft(5 * 60);
      } else {
        setMode("focus");
        setTimeLeft(presetDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [
    isRunning,
    timeLeft,
    mode,
    presetDuration,
    selectedSubject,
    onSessionComplete,
    playChime,
  ]);
  if (!isOpen) return null;
  const handleSelectPreset = (minutes) => {
    setIsRunning(false);
    setPresetDuration(minutes);
    setTimeLeft(minutes * 60);
  };
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(presetDuration * 60);
  };
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = Math.round(
    ((presetDuration * 60 - timeLeft) / (presetDuration * 60)) * 100,
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Study Focus Timer
              </h3>
              <p className="text-xs text-slate-400">
                {mode === "focus"
                  ? "Deep Work Session"
                  : "Relax & Recharge Break"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title={soundEnabled ? "Mute Chime" : "Enable Chime"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex justify-center gap-2">
          {[15, 25, 50].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleSelectPreset(m)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                presetDuration === m && mode === "focus"
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {m} Min {m === 25 ? "⚡" : m === 50 ? "🔥" : ""}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMode("break");
              setTimeLeft(5 * 60);
              setPresetDuration(5);
              setIsRunning(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              mode === "break"
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            5m Break
          </button>
        </div>

        {/* Circular Display */}
        <div className="flex flex-col items-center justify-center my-4 relative">
          <div className="w-48 h-48 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative shadow-inner">
            <div
              className={`absolute inset-0 rounded-full border-4 ${mode === "focus" ? "border-indigo-500" : "border-emerald-500"} border-t-transparent border-l-transparent transition-all duration-1000`}
              style={{
                transform: `rotate(${Math.min(360, (progressPercent / 100) * 360)}deg)`,
              }}
            ></div>

            <div className="text-center">
              <span className="text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-1">
                {isRunning ? "Focus Mode" : "Paused"}
              </span>
            </div>
          </div>
        </div>

        {/* Subject Tag Selector */}
        {mode === "focus" && availableSubjects.length > 0 && (
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Logging time for Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-center text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
            >
              {availableSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg flex items-center gap-2 transition-all active:scale-[0.98] ${
              isRunning
                ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
