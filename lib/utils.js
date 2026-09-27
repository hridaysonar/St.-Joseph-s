const STORAGE_KEYS = {
  PROFILE: "student_life_profile",
  TASKS: "student_life_tasks",
  NAMAZ: "student_life_namaz",
  SUBJECTS: "student_life_subjects",
  ACADEMIC_SETUP: "student_life_setup",
  STUDY_LOGS: "student_life_study_logs",
  NOTES: "student_life_notes",
  GOALS: "student_life_goals",
  EXAMS: "student_life_exams",
  ROUTINE_PERIODS: "student_life_routine_periods",
  ROUTINE_FILE: "student_life_routine_file",
  NOTIFICATIONS: "student_life_notifications",
  THEME: "student_life_theme",
  STREAK: "student_life_streak",
};
export const DEFAULT_PROFILE = {
  userId: "usr_std_sjsc_2026",
  studentName: "Nahid Hasan",
  school: "St. Joseph's School and College, Bonpara",
  grade: "Science (TWELVE)",
  group: "Science (Sci-B)",
  batch: "Batch 2027",
  studentId: "SJSC-2027-404",
  profilePhoto:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  email: "nahid.hasan@gmail.com",
  phone: "+880 1712-345678",
  joinedAt: "2026-04-22T00:00:00.000Z",
  classroomNo: "Science Room No: 204",
  specialNote:
    "If Higher Mathematics, Psychology & Agriculture are combined, then the Psychology room no is 107. (Standard classroom for Sci-B is Room No: 204).",
};
export const DEFAULT_SUBJECTS = [
  {
    id: "sub-physics",
    name: "Physics",
    color: "#3B82F6", // blue
    chapters: [
      {
        id: "ch-p1",
        name: "Vector & Mechanics",
        status: "Completed",
        revisionCount: 2,
        lastRevised: "2026-09-24",
      },
      {
        id: "ch-p2",
        name: "Newtonian Dynamics",
        status: "Completed",
        revisionCount: 1,
        lastRevised: "2026-09-25",
      },
      {
        id: "ch-p3",
        name: "Work, Power & Energy",
        status: "Learning",
        revisionCount: 0,
      },
      {
        id: "ch-p4",
        name: "Gravitation & Gravity",
        status: "Not Started",
        revisionCount: 0,
      },
      {
        id: "ch-p5",
        name: "Structural Properties of Matter",
        status: "Not Started",
        revisionCount: 0,
      },
      {
        id: "ch-p6",
        name: "Periodic Motion",
        status: "Revision",
        revisionCount: 1,
        lastRevised: "2026-09-20",
      },
      {
        id: "ch-p7",
        name: "Waves & Sound",
        status: "Not Started",
        revisionCount: 0,
      },
    ],
  },
  {
    id: "sub-chemistry",
    name: "Chemistry",
    color: "#10B981", // emerald
    chapters: [
      {
        id: "ch-c1",
        name: "Laboratory Safety & Techniques",
        status: "Completed",
        revisionCount: 3,
        lastRevised: "2026-09-22",
      },
      {
        id: "ch-c2",
        name: "Qualitative Chemistry",
        status: "Completed",
        revisionCount: 2,
        lastRevised: "2026-09-26",
      },
      {
        id: "ch-c3",
        name: "Periodic Table & Chemical Bonds",
        status: "Learning",
        revisionCount: 0,
      },
      {
        id: "ch-c4",
        name: "Chemical Changes & Energetics",
        status: "Revision",
        revisionCount: 1,
        lastRevised: "2026-09-21",
      },
      {
        id: "ch-c5",
        name: "Working Chemistry",
        status: "Not Started",
        revisionCount: 0,
      },
    ],
  },
  {
    id: "sub-math",
    name: "Higher Mathematics",
    color: "#8B5CF6", // purple
    chapters: [
      {
        id: "ch-m1",
        name: "Matrices & Determinants",
        status: "Completed",
        revisionCount: 3,
        lastRevised: "2026-09-25",
      },
      {
        id: "ch-m2",
        name: "Vectors in 2D & 3D",
        status: "Completed",
        revisionCount: 2,
        lastRevised: "2026-09-23",
      },
      {
        id: "ch-m3",
        name: "Straight Lines & Coordinate Geometry",
        status: "Learning",
        revisionCount: 0,
      },
      {
        id: "ch-m4",
        name: "Circles & Conics",
        status: "Not Started",
        revisionCount: 0,
      },
      {
        id: "ch-m5",
        name: "Calculus: Differentiation",
        status: "Learning",
        revisionCount: 0,
      },
      {
        id: "ch-m6",
        name: "Calculus: Integration",
        status: "Not Started",
        revisionCount: 0,
      },
    ],
  },
  {
    id: "sub-biology",
    name: "Biology",
    color: "#EC4899", // pink
    chapters: [
      {
        id: "ch-b1",
        name: "Cell Structure and Functions",
        status: "Completed",
        revisionCount: 1,
        lastRevised: "2026-09-18",
      },
      {
        id: "ch-b2",
        name: "Cell Division (Mitosis & Meiosis)",
        status: "Completed",
        revisionCount: 2,
        lastRevised: "2026-09-22",
      },
      {
        id: "ch-b3",
        name: "Cell Chemistry & Enzymes",
        status: "Learning",
        revisionCount: 0,
      },
      {
        id: "ch-b4",
        name: "Plant Physiology",
        status: "Not Started",
        revisionCount: 0,
      },
    ],
  },
  {
    id: "sub-ict",
    name: "ICT",
    color: "#F59E0B", // amber
    chapters: [
      {
        id: "ch-i1",
        name: "Global Village & Communication",
        status: "Completed",
        revisionCount: 1,
        lastRevised: "2026-09-15",
      },
      {
        id: "ch-i2",
        name: "Networking Systems & Topologies",
        status: "Completed",
        revisionCount: 1,
        lastRevised: "2026-09-19",
      },
      {
        id: "ch-i3",
        name: "Number Systems & Digital Logic",
        status: "Learning",
        revisionCount: 0,
      },
      {
        id: "ch-i4",
        name: "HTML & Web Development",
        status: "Completed",
        revisionCount: 2,
        lastRevised: "2026-09-26",
      },
      {
        id: "ch-i5",
        name: "C Programming Concepts",
        status: "Not Started",
        revisionCount: 0,
      },
    ],
  },
];
export const DEFAULT_TASKS = [
  {
    id: "task-1",
    name: "Revise Physics Vector Problem Set #4",
    description:
      "Solve problem 12-25 on scalar and vector dot products from the reference sheet.",
    type: "Study Task",
    deadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    priority: "High",
    completed: false,
    reminderEnabled: true,
    reminderTime: "17:00",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    name: "Chemistry Qualitative Analysis Lab Report",
    description:
      "Complete the writeup for cation and anion salt flame tests with diagrams.",
    type: "Assignment/Homework",
    deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    priority: "High",
    completed: false,
    reminderEnabled: true,
    reminderTime: "20:00",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    name: "Math Differential Equations Practice",
    description: "Solve first order homogeneous differential equations.",
    type: "Study Task",
    deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    priority: "Medium",
    completed: true,
    reminderEnabled: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    name: "Collect College ID Renewal Seal",
    description: "Visit administration office building 2 with photo slips.",
    type: "Personal Task",
    deadline: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    priority: "Low",
    completed: false,
    reminderEnabled: false,
    createdAt: new Date().toISOString(),
  },
];
export const DEFAULT_ROUTINE_PERIODS = [
  // Monday
  {
    id: "rp-m1",
    day: "Monday",
    periodNumber: 1,
    timeSlot: "09:00 - 09:45",
    subject: "Physics",
    teacher: "Teacher RI",
    teacherCode: "RI",
    room: "Room 204",
  },
  {
    id: "rp-m2",
    day: "Monday",
    periodNumber: 2,
    timeSlot: "09:45 - 10:30",
    subject: "English",
    teacher: "Teacher RI",
    teacherCode: "RI",
    room: "Room 204",
  },
  {
    id: "rp-m3",
    day: "Monday",
    periodNumber: 3,
    timeSlot: "10:30 - 11:15",
    subject: "Chemistry",
    teacher: "Teacher SH",
    teacherCode: "SH",
    room: "Room 204",
  },
  {
    id: "rp-m4",
    day: "Monday",
    periodNumber: 4,
    timeSlot: "11:45 - 12:30",
    subject: "Biology",
    teacher: "Teacher MR",
    teacherCode: "MR",
    room: "Room 204",
  },
  {
    id: "rp-m5",
    day: "Monday",
    periodNumber: 5,
    timeSlot: "12:30 - 01:15",
    subject: "ICT",
    teacher: "Teacher SK",
    teacherCode: "SK",
    room: "Computer Lab",
  },
  {
    id: "rp-m6",
    day: "Monday",
    periodNumber: 6,
    timeSlot: "01:15 - 02:00",
    subject: "Higher Mathematics",
    teacher: "Mathematics Dept",
    teacherCode: "-",
    room: "Room 204",
  },
  // Tuesday
  {
    id: "rp-t1",
    day: "Tuesday",
    periodNumber: 1,
    timeSlot: "09:00 - 09:45",
    subject: "English",
    teacher: "Teacher RI",
    teacherCode: "RI",
    room: "Room 204",
    isQuizWeek: true,
    note: "✦ QUIZ WEEK ✦",
  },
  {
    id: "rp-t2",
    day: "Tuesday",
    periodNumber: 2,
    timeSlot: "09:45 - 10:30",
    subject: "Chemistry",
    teacher: "Teacher SH",
    teacherCode: "SH",
    room: "Room 204",
  },
  {
    id: "rp-t3",
    day: "Tuesday",
    periodNumber: 3,
    timeSlot: "10:30 - 11:15",
    subject: "Biology",
    teacher: "Teacher MR",
    teacherCode: "MR",
    room: "Room 204",
  },
  {
    id: "rp-t4",
    day: "Tuesday",
    periodNumber: 4,
    timeSlot: "11:45 - 12:30",
    subject: "Physics",
    teacher: "Teacher RI",
    teacherCode: "RI",
    room: "Room 204",
  },
  {
    id: "rp-t5",
    day: "Tuesday",
    periodNumber: 5,
    timeSlot: "12:30 - 01:15",
    subject: "H. Math / Agriculture",
    teacher: "Dept Faculty",
    teacherCode: "-",
    room: "Room 204 / 107",
    note: "Combined room 107 if psychology",
  },
  {
    id: "rp-t6",
    day: "Tuesday",
    periodNumber: 6,
    timeSlot: "01:15 - 02:00",
    subject: "English",
    teacher: "Teacher RI",
    teacherCode: "RI",
    room: "Room 204",
  },
  // Wednesday
  {
    id: "rp-w1",
    day: "Wednesday",
    periodNumber: 1,
    timeSlot: "09:00 - 09:45",
    subject: "Practical Chemistry",
    teacher: "Teacher SH",
    teacherCode: "SH",
    room: "Chemistry Lab",
    isPractical: true,
  },
  {
    id: "rp-w2",
    day: "Wednesday",
    periodNumber: 2,
    timeSlot: "09:45 - 10:30",
    subject: "Physics",
    teacher: "Teacher RI",
    teacherCode: "RI",
    room: "Room 204",
  },
  {
    id: "rp-w3",
    day: "Wednesday",
    periodNumber: 3,
    timeSlot: "10:30 - 11:15",
    subject: "Biology",
    teacher: "Teacher MR",
    teacherCode: "MR",
    room: "Room 204",
  },
  {
    id: "rp-w4",
    day: "Wednesday",
    periodNumber: 4,
    timeSlot: "11:45 - 12:30",
    subject: "Bangla",
    teacher: "Teacher AA",
    teacherCode: "AA",
    room: "Room 204",
  },
  {
    id: "rp-w5",
    day: "Wednesday",
    periodNumber: 5,
    timeSlot: "12:30 - 01:15",
    subject: "H. Math / Agriculture",
    teacher: "Dept Faculty",
    teacherCode: "-",
    room: "Room 204 / 107",
  },
  {
    id: "rp-w6",
    day: "Wednesday",
    periodNumber: 6,
    timeSlot: "01:15 - 02:00",
    subject: "English",
    teacher: "Teacher RI",
    teacherCode: "RI",
    room: "Room 204",
  },
  // Thursday
  {
    id: "rp-th1",
    day: "Thursday",
    periodNumber: 1,
    timeSlot: "09:00 - 09:45",
    subject: "H. Math / Agriculture",
    teacher: "Dept Faculty",
    teacherCode: "-",
    room: "Room 204 / 107",
  },
  {
    id: "rp-th2",
    day: "Thursday",
    periodNumber: 2,
    timeSlot: "09:45 - 10:30",
    subject: "Practical Physics",
    teacher: "Teacher RI",
    teacherCode: "RI",
    room: "Physics Lab",
    isPractical: true,
  },
  {
    id: "rp-th3",
    day: "Thursday",
    periodNumber: 3,
    timeSlot: "10:30 - 11:15",
    subject: "Bangla",
    teacher: "Teacher AA",
    teacherCode: "AA",
    room: "Room 204",
  },
  {
    id: "rp-th4",
    day: "Thursday",
    periodNumber: 4,
    timeSlot: "11:45 - 12:30",
    subject: "Biology",
    teacher: "Teacher MR",
    teacherCode: "MR",
    room: "Room 204",
  },
  {
    id: "rp-th5",
    day: "Thursday",
    periodNumber: 5,
    timeSlot: "12:30 - 01:15",
    subject: "Chemistry",
    teacher: "Teacher SH",
    teacherCode: "SH",
    room: "Room 204",
  },
  {
    id: "rp-th6",
    day: "Thursday",
    periodNumber: 6,
    timeSlot: "01:15 - 02:00",
    subject: "Physics",
    teacher: "Teacher RI",
    teacherCode: "RI",
    room: "Room 204",
  },
  // Saturday
  {
    id: "rp-s1",
    day: "Saturday",
    periodNumber: 1,
    timeSlot: "09:00 - 09:45",
    subject: "Physics",
    teacher: "Teacher RI",
    teacherCode: "RI",
    room: "Room 204",
    isQuizWeek: true,
    note: "✦ QUIZ WEEK ✦",
  },
  {
    id: "rp-s2",
    day: "Saturday",
    periodNumber: 2,
    timeSlot: "09:45 - 10:30",
    subject: "Chemistry",
    teacher: "Teacher SH",
    teacherCode: "SH",
    room: "Room 204",
  },
  {
    id: "rp-s3",
    day: "Saturday",
    periodNumber: 3,
    timeSlot: "10:30 - 11:15",
    subject: "ICT",
    teacher: "Teacher SK",
    teacherCode: "SK",
    room: "Computer Lab",
  },
  {
    id: "rp-s4",
    day: "Saturday",
    periodNumber: 4,
    timeSlot: "11:45 - 12:30",
    subject: "Practical Biology",
    teacher: "Teacher MR",
    teacherCode: "MR",
    room: "Biology Lab",
    isPractical: true,
  },
  {
    id: "rp-s5",
    day: "Saturday",
    periodNumber: 5,
    timeSlot: "12:30 - 01:15",
    subject: "Co-Curricular Club Activity",
    teacher: "Club Moderator",
    teacherCode: "-",
    room: "Auditorium / Field",
  },
  {
    id: "rp-s6",
    day: "Saturday",
    periodNumber: 6,
    timeSlot: "01:15 - 02:00",
    subject: "Club Activity & Mentorship",
    teacher: "Club Moderator",
    teacherCode: "-",
    room: "Auditorium",
  },
];
export const DEFAULT_EXAMS = [
  {
    id: "exam-1",
    name: "Mid-Term Board Preparatory Examination",
    subject: "Physics 1st Paper",
    date: new Date(
      Date.now() + 5 * 24 * 3600 * 1000 + 4 * 3600 * 1000,
    ).toISOString(),
    readinessPercentage: 72,
    room: "Hall B - Desk 42",
    notes:
      "Chapters 1 to 6. Focus on Vector derivations and Newtonian dynamics calculations.",
  },
  {
    id: "exam-2",
    name: "First Semester Evaluation",
    subject: "Chemistry 1st Paper",
    date: new Date(
      Date.now() + 11 * 24 * 3600 * 1000 + 9 * 3600 * 1000,
    ).toISOString(),
    readinessPercentage: 65,
    room: "Science Block Room 101",
    notes:
      "Qualitative analysis, Periodic properties & molecular orbital theory.",
  },
  {
    id: "exam-3",
    name: "Higher Math Class Test 3",
    subject: "Higher Mathematics",
    date: new Date(Date.now() + 16 * 24 * 3600 * 1000).toISOString(),
    readinessPercentage: 80,
    room: "Room 304",
    notes: "Straight lines and circles equation questions.",
  },
];
export const DEFAULT_NOTES = [
  {
    id: "note-1",
    title: "Newtonian Mechanics Key Formulas",
    content:
      "F = dp/dt = m(dv/dt)\nTorque = r x F = I*alpha\nConservation of Angular Momentum: L1 = L2 when external torque = 0.",
    subjectName: "Physics",
    color: "#EFF6FF", // subtle blue
    isPinned: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "note-2",
    title: "Periodic Table Trends Checklist",
    content:
      "1. Atomic radius decreases across a period, increases down a group.\n2. Ionization energy increases across, decreases down.\n3. Electronegativity: Fluorine is the highest (4.0).",
    subjectName: "Chemistry",
    color: "#ECFDF5", // subtle emerald
    isPinned: false,
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];
export const DEFAULT_GOALS = [
  {
    id: "goal-1",
    title: "Complete 3 Pomodoro study sessions today",
    type: "Daily",
    deadline: new Date().toISOString(),
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "goal-2",
    title: "Finish Physics Work & Energy chapter exercise",
    type: "Weekly",
    deadline: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "goal-3",
    title: "Achieve GPA 5.0 in Pre-Test & Model Tests",
    type: "Academic",
    deadline: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
    completed: false,
    createdAt: new Date().toISOString(),
  },
];
// Helper to get formatted today date YYYY-MM-DD
export function getTodayKey() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}
export function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.studentName === "Fahim Ahmed") {
        saveProfile(DEFAULT_PROFILE);
        return DEFAULT_PROFILE;
      }
      return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_PROFILE;
}
export function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    // Asynchronously sync basic permitted profile to server backend
    syncBasicProfileToServer(profile);
  } catch (e) {
    console.error(e);
  }
}
export async function syncBasicProfileToServer(profile) {
  try {
    const payload = {
      userId: profile.userId,
      studentName: profile.studentName,
      school: profile.school,
      grade: profile.grade,
      group: profile.group,
      batch: profile.batch,
      studentId: profile.studentId,
      profilePhoto: profile.profilePhoto,
      email: profile.email,
      phone: profile.phone,
      joinedAt: profile.joinedAt,
    };
    const res = await fetch("/api/students/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      profile.lastSyncedAt = data.syncedAt || new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      return true;
    }
  } catch (err) {
    console.warn("Could not sync profile to backend:", err);
  }
  return false;
}
export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_TASKS;
}
export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error(e);
  }
}
export function loadNamaz(dateStr = getTodayKey()) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.NAMAZ}_${dateStr}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return {
    date: dateStr,
    prayers: {
      Fajr: true,
      Zuhr: true,
      Asr: false,
      Maghrib: false,
      Isha: false,
    },
  };
}
export function saveNamaz(namaz) {
  try {
    localStorage.setItem(
      `${STORAGE_KEYS.NAMAZ}_${namaz.date}`,
      JSON.stringify(namaz),
    );
  } catch (e) {
    console.error(e);
  }
}
export function loadSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_SUBJECTS;
}
export function saveSubjects(subjects) {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error(e);
  }
}
export function loadAcademicSetup() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACADEMIC_SETUP);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return {
    isConfigured: true,
    gradeLevel: "HSC 2nd Year",
    group: "Science",
    board: "Dhaka Board",
    batch: "Batch 2026",
  };
}
export function saveAcademicSetup(setup) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACADEMIC_SETUP, JSON.stringify(setup));
  } catch (e) {
    console.error(e);
  }
}
export function loadStudyLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDY_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const today = getTodayKey();
  return [
    {
      id: "log-1",
      date: today,
      minutes: 25,
      subjectName: "Physics",
      timestamp: new Date().toISOString(),
    },
    {
      id: "log-2",
      date: today,
      minutes: 50,
      subjectName: "Chemistry",
      timestamp: new Date().toISOString(),
    },
  ];
}
export function saveStudyLogs(logs) {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDY_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error(e);
  }
}
export function loadExams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_EXAMS;
}
export function saveExams(exams) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  } catch (e) {
    console.error(e);
  }
}
export function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_NOTES;
}
export function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error(e);
  }
}
export function loadGoals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_GOALS;
}
export function saveGoals(goals) {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error(e);
  }
}
export function loadRoutinePeriods() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINE_PERIODS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        Array.isArray(parsed) &&
        parsed.some((p) => p.id === "rp-m1" || p.teacherCode === "RI")
      ) {
        return parsed;
      }
      saveRoutinePeriods(DEFAULT_ROUTINE_PERIODS);
      return DEFAULT_ROUTINE_PERIODS;
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_ROUTINE_PERIODS;
}
export function saveRoutinePeriods(periods) {
  try {
    localStorage.setItem(STORAGE_KEYS.ROUTINE_PERIODS, JSON.stringify(periods));
  } catch (e) {
    console.error(e);
  }
}
export function loadRoutineFile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINE_FILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return null;
}
export function saveRoutineFile(file) {
  try {
    if (file) {
      localStorage.setItem(STORAGE_KEYS.ROUTINE_FILE, JSON.stringify(file));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ROUTINE_FILE);
    }
  } catch (e) {
    console.error(e);
  }
}
