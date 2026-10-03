"use client";

import React, { useState } from "react";
import { createHscSubjects } from "../../lib/syllabus.js";
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
const PRESET_GROUPS = [
  "Science",
  "Commerce / Business Studies",
  "Humanities / Arts",
  "General / Other",
];
const PRESET_BOARDS = [
  "Dhaka Board",
  "Chittagong Board",
  "Rajshahi Board",
  "Dinajpur Board",
  "Comilla Board",
  "Jessore Board",
  "Barisal Board",
  "Sylhet Board",
  "Mymensingh Board",
  "Madrasah Board",
  "Technical Board",
  "Cambridge / Edexcel",
  "CBSE / International",
];
const PRESET_LEVELS = [
  "Class 9",
  "Class 10 / SSC",
  "HSC 1st Year",
  "HSC 2nd Year",
  "College / University",
  "Admission Candidate",
];
const PRESET_SUBJECT_TEMPLATES = {
  Science: [
    {
      name: "Physics",
      color: "#3B82F6",
      chapters: [
        "Vector & Mechanics",
        "Newtonian Dynamics",
        "Work, Power & Energy",
        "Gravitation & Gravity",
        "Structural Properties of Matter",
        "Periodic Motion",
        "Waves & Sound",
      ],
    },
    {
      name: "Chemistry",
      color: "#10B981",
      chapters: [
        "Laboratory Safety & Qualitative Chemistry",
        "Periodic Properties & Chemical Bonds",
        "Chemical Changes & Thermochemistry",
        "Environmental Chemistry",
        "Organic Chemistry Basics",
      ],
    },
    {
      name: "Higher Mathematics",
      color: "#8B5CF6",
      chapters: [
        "Matrices & Determinants",
        "Vectors in 2D & 3D",
        "Straight Lines & Coordinate Geometry",
        "Circles & Conics",
        "Calculus: Differentiation",
        "Calculus: Integration",
      ],
    },
    {
      name: "Biology",
      color: "#EC4899",
      chapters: [
        "Cell Structure & Functions",
        "Cell Division",
        "Cell Chemistry & Enzymes",
        "Microorganisms & Genetics",
        "Plant Physiology",
      ],
    },
    {
      name: "ICT",
      color: "#F59E0B",
      chapters: [
        "Global Village & Virtual Reality",
        "Communication Systems & Networking",
        "Number Systems & Logic Gates",
        "HTML & Web Design Basics",
        "Programming in C",
      ],
    },
  ],
  "Commerce / Business Studies": [
    {
      name: "Accounting",
      color: "#3B82F6",
      chapters: [
        "Introduction to Accounting",
        "Transaction Analysis",
        "Ledger & Journal",
        "Work Sheet & Financial Statements",
      ],
    },
    {
      name: "Finance & Banking",
      color: "#10B981",
      chapters: [
        "Time Value of Money",
        "Risk and Return",
        "Commercial Banking",
        "Capital Budgeting",
      ],
    },
    {
      name: "Business Organization",
      color: "#8B5CF6",
      chapters: [
        "Nature of Business",
        "Sole Proprietorship",
        "Partnership Business",
        "Joint Stock Company",
      ],
    },
    {
      name: "ICT",
      color: "#F59E0B",
      chapters: [
        "Global Village",
        "Networking",
        "Spreadsheets & Database",
        "Web Fundamentals",
      ],
    },
  ],
  "Humanities / Arts": [
    {
      name: "Economics",
      color: "#3B82F6",
      chapters: [
        "Fundamental Economic Problems",
        "Consumer & Producer Behavior",
        "Market Structures",
        "National Income",
      ],
    },
    {
      name: "Civics & Good Governance",
      color: "#10B981",
      chapters: [
        "Citizenship Rights",
        "Constitution",
        "Organs of Government",
        "Rule of Law",
      ],
    },
    {
      name: "History & Civilization",
      color: "#8B5CF6",
      chapters: [
        "Ancient Civilizations",
        "Liberation War of 1971",
        "Medieval Period",
        "Contemporary World History",
      ],
    },
  ],
  "General / Other": [
    {
      name: "English",
      color: "#3B82F6",
      chapters: [
        "Grammar & Sentence Structures",
        "Vocabulary & Reading Comprehension",
        "Formal Writing & Essays",
      ],
    },
    {
      name: "Bangla",
      color: "#10B981",
      chapters: ["Prose & Fiction", "Poetry", "Applied Grammar & Composition"],
    },
    {
      name: "Mathematics",
      color: "#8B5CF6",
      chapters: [
        "Arithmetic & Algebra",
        "Geometry & Trigonometry",
        "Statistics & Probability",
      ],
    },
  ],
};
export const SyllabusSetupModal = ({
  isOpen,
  onClose,
  onSave,
  initialSetup,
  initialSubjects,
}) => {
  const [step, setStep] = useState(1);
  // Step 1: Academic Profile
  const [gradeLevel, setGradeLevel] = useState(
    initialSetup?.gradeLevel || "HSC 2nd Year",
  );
  const [group, setGroup] = useState(initialSetup?.group || "Science");
  const [board, setBoard] = useState(initialSetup?.board || "Dhaka Board");
  const [batch, setBatch] = useState(initialSetup?.batch || "Batch 2026");
  // Step 2: Subject & Chapters Setup (not blindly assumed!)
  const [subjects, setSubjects] = useState(() => {
    if (initialSubjects && initialSubjects.length > 0) return initialSubjects;
    return createHscSubjects();
  });
  const [activeSubjectIdx, setActiveSubjectIdx] = useState(0);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newChapterName, setNewChapterName] = useState("");
  const [selectedPaperId, setSelectedPaperId] = useState("");
  if (!isOpen) return null;
  const handleGroupSelect = (selectedGroup) => {
    setGroup(selectedGroup);
    if (selectedGroup === "Science" && gradeLevel.startsWith("HSC")) {
      setSubjects(createHscSubjects());
      setActiveSubjectIdx(0);
      return;
    }
    const templateKey =
      Object.keys(PRESET_SUBJECT_TEMPLATES).find((k) =>
        selectedGroup.includes(k.split(" ")[0]),
      ) || "General / Other";
    const templates =
      PRESET_SUBJECT_TEMPLATES[templateKey] ||
      PRESET_SUBJECT_TEMPLATES["General / Other"];
    setSubjects(
      templates.map((tmpl, idx) => ({
        id: `sub-${idx}-${Date.now()}`,
        name: tmpl.name,
        color: tmpl.color,
        chapters: tmpl.chapters.map((chName, cIdx) => ({
          id: `ch-${idx}-${cIdx}-${Date.now()}`,
          name: chName,
          status: "Not Started",
          revisionCount: 0,
        })),
      })),
    );
    setActiveSubjectIdx(0);
  };
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    const colors = [
      "#3B82F6",
      "#10B981",
      "#8B5CF6",
      "#EC4899",
      "#F59E0B",
      "#06B6D4",
      "#6366F1",
    ];
    const newSubject = {
      id: `sub-custom-${Date.now()}`,
      name: newSubjectName.trim(),
      color: colors[subjects.length % colors.length],
      chapters: [
        {
          id: `ch-custom-${Date.now()}-1`,
          name: "Chapter 1: Fundamentals",
          status: "Not Started",
          revisionCount: 0,
        },
      ],
    };
    setSubjects([...subjects, newSubject]);
    setActiveSubjectIdx(subjects.length);
    setNewSubjectName("");
  };
  const handleDeleteSubject = (indexToDelete) => {
    if (subjects.length <= 1) return;
    const filtered = subjects.filter((_, i) => i !== indexToDelete);
    setSubjects(filtered);
    setActiveSubjectIdx(Math.max(0, indexToDelete - 1));
  };
  const handleAddChapter = (e) => {
    e.preventDefault();
    if (!newChapterName.trim() || subjects.length === 0) return;
    const currentSub = subjects[activeSubjectIdx];
    const newCh = {
      id: `ch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newChapterName.trim(),
      paperId:
        currentSub.papers?.find((paper) => paper.id === selectedPaperId)?.id ||
        currentSub.papers?.[0]?.id,
      status: "Not Started",
      revisionCount: 0,
    };
    const updatedSub = {
      ...currentSub,
      chapters: [...currentSub.chapters, newCh],
    };
    const updatedSubjects = [...subjects];
    updatedSubjects[activeSubjectIdx] = updatedSub;
    setSubjects(updatedSubjects);
    setNewChapterName("");
  };
  const handleDeleteChapter = (chIdx) => {
    const currentSub = subjects[activeSubjectIdx];
    if (currentSub.chapters.length <= 1) return;
    const updatedChapters = currentSub.chapters.filter((_, i) => i !== chIdx);
    const updatedSub = { ...currentSub, chapters: updatedChapters };
    const updatedSubjects = [...subjects];
    updatedSubjects[activeSubjectIdx] = updatedSub;
    setSubjects(updatedSubjects);
  };
  const handleFinish = () => {
    const academicSetup = {
      isConfigured: true,
      gradeLevel,
      group,
      board,
      batch,
    };
    onSave(academicSetup, subjects);
    onClose();
  };
  return (
    <div className="dialog-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="dialog-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Academic & Syllabus Setup
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {step === 1
                  ? "Step 1: Your Academic Info"
                  : "Step 2: Customize Subjects & Chapters"}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Class / Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setGradeLevel(lvl)}
                      className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium border text-left transition-all ${
                        gradeLevel === lvl
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-semibold shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Group / Stream
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_GROUPS.map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => handleGroupSelect(grp)}
                      className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium border text-left transition-all ${
                        group === grp
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-semibold shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    Education Board
                  </label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PRESET_BOARDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    Academic Batch / Year
                  </label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="e.g. Batch 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs">
                <b>Customizable Syllabus:</b> Add or remove subjects and exact
                chapter names matching your textbook. The app does not assume a
                fixed syllabus!
              </div>

              {/* Subject Tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Your Subjects ({subjects.length})
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {subjects.map((sub, idx) => (
                    <div
                      key={sub.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer border transition-all ${
                        activeSubjectIdx === idx
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 font-semibold"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      onClick={() => setActiveSubjectIdx(idx)}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub.color }}
                      ></span>
                      <span>{sub.name}</span>
                      <span className="text-[10px] opacity-70">
                        ({sub.chapters.length})
                      </span>
                      {subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubject(idx);
                          }}
                          className="hover:text-rose-500 ml-1 p-0.5"
                          title="Remove subject"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Subject Input */}
                <form onSubmit={handleAddSubject} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom subject (e.g. Statistics, Bangla 2nd)..."
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 text-xs font-medium flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subject</span>
                  </button>
                </form>
              </div>

              {/* Chapters List for Active Subject */}
              {subjects[activeSubjectIdx] && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/60 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: subjects[activeSubjectIdx].color,
                        }}
                      ></span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {subjects[activeSubjectIdx].name} Chapters (
                        {subjects[activeSubjectIdx].chapters.length})
                      </h4>
                    </div>
                  </div>

                  {/* Chapter items */}
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {subjects[activeSubjectIdx].chapters.map((ch, chIdx) => (
                      <div
                        key={ch.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-500">
                            {chIdx + 1}
                          </span>
                          <span className="truncate">
                            {ch.name}
                            {ch.paperId && (
                              <span className="ml-2 text-indigo-500">
                                {
                                  subjects[activeSubjectIdx].papers?.find(
                                    (paper) => paper.id === ch.paperId,
                                  )?.name
                                }
                              </span>
                            )}
                          </span>
                        </div>
                        {subjects[activeSubjectIdx].chapters.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteChapter(chIdx)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                            title="Remove chapter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Chapter Form */}
                  {subjects[activeSubjectIdx].papers?.length > 0 && (
                    <label className="mt-3 block text-xs text-slate-600 dark:text-slate-300">
                      নতুন অধ্যায়ের পত্র
                      <select
                        aria-label="নতুন অধ্যায়ের পত্র"
                        value={
                          subjects[activeSubjectIdx].papers.some(
                            (paper) => paper.id === selectedPaperId,
                          )
                            ? selectedPaperId
                            : subjects[activeSubjectIdx].papers[0].id
                        }
                        onChange={(event) =>
                          setSelectedPaperId(event.target.value)
                        }
                        className="ml-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900"
                      >
                        {subjects[activeSubjectIdx].papers.map((paper) => (
                          <option key={paper.id} value={paper.id}>
                            {paper.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <form
                    onSubmit={handleAddChapter}
                    className="flex gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800"
                  >
                    <input
                      type="text"
                      placeholder={`Add new chapter name to ${subjects[activeSubjectIdx].name}...`}
                      value={newChapterName}
                      onChange={(e) => setNewChapterName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Chapter</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Back to Academic Info
            </button>
          ) : (
            <div></div>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-2"
            >
              <span>Next: Customize Syllabus</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Syllabus & Begin</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
