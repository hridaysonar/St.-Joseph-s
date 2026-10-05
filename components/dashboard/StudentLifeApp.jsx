"use client";
import NamazView from "./NamazView.jsx";
import TeamSection from "../common/TeamSection.jsx";
import SiteFooter from "../common/SiteFooter.jsx";

import React, { useState, useEffect } from "react";
import {
  loadProfile,
  saveProfile,
  loadTasks,
  saveTasks,
  loadNamaz,
  saveNamaz,
  loadSubjects,
  saveSubjects,
  loadAcademicSetup,
  saveAcademicSetup,
  loadStudyLogs,
  saveStudyLogs,
  loadExams,
  saveExams,
  loadNotes,
  saveNotes,
  loadGoals,
  saveGoals,
  loadRoutinePeriods,
  saveRoutinePeriods,
  loadRoutineFile,
  saveRoutineFile,
  syncBasicProfileToServer,
} from "../../lib/utils.js";
import { SplashScreen } from "../common/SplashScreen.jsx";
import { Navigation } from "../common/Navigation.jsx";
import { HomeDashboard } from "../dashboard/HomeDashboard.jsx";
import { TaskManagement } from "../dashboard/TaskManagement.jsx";
import { StudySection } from "../dashboard/StudySection.jsx";
import { ClassRoutineView } from "../dashboard/ClassRoutineView.jsx";
import { ProfileView } from "../dashboard/ProfileView.jsx";
import { AnalyticsView } from "../dashboard/AnalyticsView.jsx";
import { NotesAndGoalsView } from "../dashboard/NotesAndGoalsView.jsx";
import { ExamPlannerModal } from "../forms/ExamPlannerModal.jsx";
import { StudentAIModal } from "../dashboard/StudentAIModal.jsx";
import { StudyTimerModal } from "../dashboard/StudyTimerModal.jsx";
import { SyllabusSetupModal } from "../forms/SyllabusSetupModal.jsx";
import { AuthModal } from "../forms/AuthModal.jsx";
import { HelpFeedbackModal } from "../forms/HelpFeedbackModal.jsx";
import { AdminPortalModal } from "../dashboard/AdminPortalModal.jsx";
import { mergePublishedCatalog } from "../../lib/syllabus.js";
import { NotificationCenter } from "../common/NotificationCenter.jsx";
export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  // Theme State (Dark mode persisted)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("student_life_theme");
      if (saved) return saved === "dark";
    } catch (e) {}
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("student_life_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("student_life_theme", "light");
    }
  }, [isDarkMode]);
  // Main Navigation State
  const [currentTab, setCurrentTab] = useState("home");
  const [studySubjectId, setStudySubjectId] = useState(null);
  // App Data States
  const [profile, setProfile] = useState(loadProfile);
  const [tasks, setTasks] = useState(loadTasks);
  const [dailyNamaz, setDailyNamaz] = useState(() => loadNamaz());
  const [subjects, setSubjects] = useState(loadSubjects);
  const [academicSetup, setAcademicSetup] = useState(loadAcademicSetup);
  const [studyLogs, setStudyLogs] = useState(loadStudyLogs);
  const [exams, setExams] = useState(loadExams);
  const [notes, setNotes] = useState(loadNotes);
  const [goals, setGoals] = useState(loadGoals);
  const [routinePeriods, setRoutinePeriods] = useState(loadRoutinePeriods);
  const [routineFile, setRoutineFile] = useState(loadRoutineFile);
  const [sharedContent, setSharedContent] = useState({ routine: null, notes: [] });
  const [contentError, setContentError] = useState("");
  useEffect(() => {
    let active = true;
    async function loadContent() {
      try {
        const response = await fetch("/api/content", { cache: "no-store" });
        if (!response.ok) throw new Error("Published content is temporarily unavailable. Please try again.");
        const content = await response.json();
        if (!active) return;
        setSharedContent(content);
        setContentError("");
        setSubjects((saved) => {
          const merged = mergePublishedCatalog(saved, content.catalog);
          if (merged !== saved) saveSubjects(merged);
          return merged;
        });
      } catch (error) { if (active) setContentError(error.message); }
    }
    loadContent();
    window.addEventListener("focus", loadContent);
    const timer = setInterval(loadContent, 60_000);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", loadContent); };
  }, []);
  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  // Modals visibility states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  // Initial Notifications
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Mid-Term Board Preparatory Exam",
      message:
        "Physics 1st Paper exam in 5 days. Start Chapter 4 & 5 revision.",
      type: "exam",
      timestamp: "Today",
      read: false,
    },
    {
      id: "notif-2",
      title: "Daily Namaz Reminder",
      message: "Don't forget your afternoon prayers for peace of mind.",
      type: "namaz",
      timestamp: "1h ago",
      read: false,
    },
  ]);
  // Keep the basic server profile synchronized when local profile details change.
  useEffect(() => {
    syncBasicProfileToServer(profile);
  }, [profile]);
  // Update handlers
  const handleUpdateProfile = (newProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };
  const handleUpdateTasks = (newTasks) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };
  const handleUpdateNamaz = (newNamaz) => {
    setDailyNamaz(newNamaz);
    saveNamaz(newNamaz);
  };
  const handleUpdateSubjects = (newSubjects) => {
    setSubjects(newSubjects);
    saveSubjects(newSubjects);
  };
  const handleSaveSyllabusSetup = (newSetup, newSubjects) => {
    setAcademicSetup(newSetup);
    saveAcademicSetup(newSetup);
    setSubjects(newSubjects);
    saveSubjects(newSubjects);
    // update profile grade/group
    const updated = {
      ...profile,
      grade: newSetup.gradeLevel,
      group: newSetup.group,
      batch: newSetup.batch,
    };
    handleUpdateProfile(updated);
  };
  const handleUpdateExams = (newExams) => {
    setExams(newExams);
    saveExams(newExams);
  };
  const handleUpdateNotes = (newNotes) => {
    setNotes(newNotes);
    saveNotes(newNotes);
  };
  const handleUpdateGoals = (newGoals) => {
    setGoals(newGoals);
    saveGoals(newGoals);
  };
  const handleUpdateRoutinePeriods = (newPeriods) => {
    setRoutinePeriods(newPeriods);
    saveRoutinePeriods(newPeriods);
  };
  const handleUpdateRoutineFile = (newFile) => {
    setRoutineFile(newFile);
    saveRoutineFile(newFile);
  };
  // Timer complete session callback
  const handleSessionComplete = (minutes, subjectName) => {
    const today = new Date().toISOString().split("T")[0];
    const newLog = {
      id: "log_" + Date.now(),
      date: today,
      minutes,
      subjectName,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...studyLogs];
    setStudyLogs(updated);
    saveStudyLogs(updated);
    // Add in-app notification
    const studyNotif = {
      id: "notif_" + Date.now(),
      title: "Focus Milestone Logged!",
      message: `Great job! You completed a ${minutes}-minute study session in ${subjectName || "General Study"}.`,
      type: "study",
      timestamp: "Just now",
      read: false,
    };
    setNotifications([studyNotif, ...notifications]);
  };
  // Cloud sync trigger
  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncBasicProfileToServer(profile);
    setTimeout(() => setIsSyncing(false), 500);
  };
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* 1. Splash Screen (~1 sec with "Student Life" and "by Nahid") */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Main Top Navigation & Bottom Nav Bar */}
      <Navigation
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenTimer={() => setIsTimerOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        profile={profile}
        unreadNotificationsCount={unreadNotifs}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main App Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {currentTab === "home" && (
          <HomeDashboard
            profile={profile}
            tasks={tasks}
            onUpdateTasks={handleUpdateTasks}
            subjects={subjects}
            exams={exams}
            routinePeriods={routinePeriods}
            studyLogs={studyLogs}
            onNavigateTab={setCurrentTab}
            onOpenTimer={() => setIsTimerOpen(true)}
            onOpenAI={() => setIsAIOpen(true)}
            onOpenSetup={() => setIsSetupOpen(true)}
            onOpenSubject={(subject) => {
              if (!subjects.some((item) => item.id === subject.id)) {
                handleUpdateSubjects([...subjects, subject]);
              }
              setStudySubjectId(subject.id);
              setCurrentTab("study");
              window.scrollTo({ top: 0, behavior: "instant" });
            }}
          />
        )}

        {currentTab === "namaz" && <NamazView dailyNamaz={dailyNamaz} onUpdateNamaz={handleUpdateNamaz} />}

        {currentTab === "tasks" && (
          <TaskManagement
            tasks={tasks}
            onUpdateTasks={handleUpdateTasks}
          />
        )}

        {currentTab === "study" && (
          <StudySection
            publishedNotes={sharedContent.notes}
            contentError={contentError}
            initialSubjectId={studySubjectId}
            subjects={subjects}
            onUpdateSubjects={handleUpdateSubjects}
            onOpenSyllabusSetup={() => setIsSetupOpen(true)}
          />
        )}

        {currentTab === "routine" && (
          <ClassRoutineView
            publishedRoutine={sharedContent.routine}
            contentError={contentError}
            routineFile={routineFile}
            onUpdateRoutineFile={handleUpdateRoutineFile}
            periods={routinePeriods}
            onUpdatePeriods={handleUpdateRoutinePeriods}
          />
        )}

        {currentTab === "profile" && (
          <ProfileView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onOpenHelpFeedback={() => setIsHelpOpen(true)}
            onOpenAdminPortal={() => setIsAdminOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onSyncNow={handleManualSync}
            isSyncing={isSyncing}
          />
        )}

        {currentTab === "analytics" && (
          <AnalyticsView
            subjects={subjects}
            tasks={tasks}
            studyLogs={studyLogs}
            dailyNamaz={dailyNamaz}
          />
        )}

        {currentTab === "notes" && (
          <NotesAndGoalsView
            notes={notes}
            onUpdateNotes={handleUpdateNotes}
            goals={goals}
            onUpdateGoals={handleUpdateGoals}
            subjects={subjects}
          />
        )}

        {currentTab === "exams" && (
          <ExamPlannerModal
            exams={exams}
            onUpdateExams={handleUpdateExams}
            subjects={subjects}
          />
        )}
        {currentTab === "home" && <TeamSection />}
      </main>
      <SiteFooter />

      {/* Floating Mini AI Assistant Modal */}
      <StudentAIModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        profile={profile}
        subjects={subjects}
        exams={exams}
        studyMinutesToday={studyLogs
          .filter((l) => l.date === new Date().toISOString().split("T")[0])
          .reduce((a, b) => a + b.minutes, 0)}
      />

      {/* Focus Timer Modal */}
      <StudyTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        onSessionComplete={handleSessionComplete}
        availableSubjects={subjects.map((s) => s.name)}
      />

      {/* Academic & Syllabus Setup Modal */}
      <SyllabusSetupModal
        key={isSetupOpen ? "setup-open" : "setup-closed"}
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onSave={handleSaveSyllabusSetup}
        initialSetup={academicSetup}
        initialSubjects={subjects}
      />

      {/* Sign In / Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(updatedFields) => {
          const merged = { ...profile, ...updatedFields };
          handleUpdateProfile(merged);
        }}
        currentProfile={profile}
      />

      {/* Help & Feedback / Contact Admin Modal */}
      <HelpFeedbackModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        profile={profile}
      />

      {/* Admin Portal Modal (Passcode Protected, Strict Privacy) */}
      <AdminPortalModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() =>
          setNotifications(notifications.map((n) => ({ ...n, read: true })))
        }
        onClearNotifications={() => setNotifications([])}
      />
    </div>
  );
}
