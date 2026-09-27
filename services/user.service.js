import { GoogleGenAI } from "@google/genai";
import {
  connectToDatabase,
  readLocalStore,
  writeLocalStore,
} from "../lib/db.js";
import { ADMIN_SECRET } from "../lib/auth.js";
import { USER_COLLECTION } from "../models/User.js";
const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

export async function getApiUsers(req) {
  const { db: mongoDb } = await connectToDatabase();
  try {
    if (mongoDb) {
      const users = await mongoDb
        .collection(USER_COLLECTION)
        .find({})
        .toArray();
      return Response.json({ success: true, count: users.length, users });
    }
    const store = readLocalStore();
    return Response.json({
      success: true,
      count: store.students.length,
      users: store.students,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function postApiUsers(req) {
  const { db: mongoDb } = await connectToDatabase();
  try {
    const student = req.body;
    if (!student || !student.studentName) {
      return Response.json(
        { error: "studentName is required" },
        { status: 400 },
      );
    }
    if (mongoDb) {
      await mongoDb
        .collection(USER_COLLECTION)
        .updateOne(
          { userId: student.userId || "usr_" + Date.now() },
          { $set: { ...student, lastActive: new Date().toISOString() } },
          { upsert: true },
        );
    } else {
      const store = readLocalStore();
      const idx = store.students.findIndex((s) => s.userId === student.userId);
      if (idx >= 0) {
        store.students[idx] = { ...store.students[idx], ...student };
      } else {
        store.students.push(student);
      }
      writeLocalStore(store);
    }
    return Response.json({ success: true, message: "User updated" });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function getApiRoutine(req) {
  return Response.json({
    institution: "St. Joseph's School and College, Bonpara",
    location: "Bonpara, Natore",
    title: "Class Routine - 2026",
    class: "Science (TWELVE)",
    studentName: "Nahid Hasan",
    classroomNo: "Science Room No: 204",
    specialNote:
      "If Higher Mathematics, Psychology & Agriculture are combined, then the Psychology room no is 107. (Your standard classroom for Sci-B is Room No: 204).",
    effectiveDate: "22.04.2026",
    weeklyHoliday: "Friday",
  });
}

export async function postApiAuthRegister(req) {
  const { db: mongoDb } = await connectToDatabase();
  try {
    const {
      studentName,
      email,
      phone,
      password,
      school,
      grade,
      group,
      batch,
      studentId,
      classroomNo,
    } = req.body;
    if (!studentName || !password) {
      return Response.json(
        { error: "Student name and password are required." },
        { status: 400 },
      );
    }
    const userId =
      "std_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const newStudent = {
      userId,
      studentName: studentName.trim(),
      email: email ? email.trim() : "",
      phone: phone ? phone.trim() : "",
      password: String(password), // In production, password hash is stored
      school: school
        ? school.trim()
        : "St. Joseph's School and College, Bonpara",
      grade: grade ? grade.trim() : "Science (TWELVE)",
      group: group ? group.trim() : "Science (Sci-B)",
      batch: batch ? batch.trim() : "Batch 2027",
      studentId: studentId
        ? studentId.trim()
        : "SJSC-" + Math.floor(100 + Math.random() * 900),
      classroomNo: classroomNo ? classroomNo.trim() : "Science Room No: 204",
      profilePhoto:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    if (mongoDb) {
      // Check if email or phone already exists
      const existing = await mongoDb.collection(USER_COLLECTION).findOne({
        $or: [
          ...(email ? [{ email: newStudent.email }] : []),
          ...(phone ? [{ phone: newStudent.phone }] : []),
        ],
      });
      if (existing) {
        return Response.json(
          { error: "An account with this email or phone already exists." },
          { status: 409 },
        );
      }
      await mongoDb.collection(USER_COLLECTION).insertOne(newStudent);
    } else {
      const store = readLocalStore();
      const existing = (store.students || []).find(
        (s) => (email && s.email === email) || (phone && s.phone === phone),
      );
      if (existing) {
        return Response.json(
          { error: "An account with this email or phone already exists." },
          { status: 409 },
        );
      }
      store.students.push(newStudent);
      writeLocalStore(store);
    }
    const { password: _, ...safeUser } = newStudent;
    return Response.json({
      success: true,
      message: "Account registered successfully!",
      token: "jwt_tk_" + userId,
      user: safeUser,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return Response.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}

export async function postApiAuthLogin(req) {
  const { db: mongoDb } = await connectToDatabase();
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return Response.json(
        { error: "Identifier (email/phone/ID) and password are required." },
        { status: 400 },
      );
    }
    const trimmed = identifier.trim();
    let student = null;
    if (mongoDb) {
      student = await mongoDb.collection(USER_COLLECTION).findOne({
        $or: [
          { email: trimmed },
          { phone: trimmed },
          { studentId: trimmed },
          { studentName: trimmed },
        ],
      });
    } else {
      const store = readLocalStore();
      student = (store.students || []).find(
        (s) =>
          s.email === trimmed ||
          s.phone === trimmed ||
          s.studentId === trimmed ||
          s.studentName === trimmed,
      );
    }
    if (!student) {
      return Response.json(
        { error: "No account found with this credential." },
        { status: 401 },
      );
    }
    if (student.password && student.password !== String(password)) {
      return Response.json(
        { error: "Incorrect password. Please verify and try again." },
        { status: 401 },
      );
    }
    // Update last active
    if (mongoDb) {
      await mongoDb
        .collection(USER_COLLECTION)
        .updateOne(
          { userId: student.userId },
          { $set: { lastActive: new Date().toISOString() } },
        );
    }
    const { password: _, ...safeUser } = student;
    return Response.json({
      success: true,
      message: "Logged in successfully!",
      token: "jwt_tk_" + student.userId,
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    return Response.json(
      { error: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}

export async function postApiStudentAi(req) {
  try {
    const { message, context, history } = req.body;
    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }
    if (!geminiClient) {
      return Response.json(
        {
          error: "Student AI assistant service is temporarily initializing.",
        },
        { status: 503 },
      );
    }
    const studentName = context?.studentName || "Nahid Hasan";
    const school =
      context?.school || "St. Joseph's School and College, Bonpara";
    const grade = context?.grade || "Science (TWELVE)";
    const group = context?.group || "Science (Sci-B)";
    const classroomNo = context?.classroomNo || "Science Room No: 404";
    const subjects = Array.isArray(context?.subjects)
      ? context.subjects
          .map(
            (s) =>
              `${s.name} (${s.completedChapters}/${s.totalChapters} completed)`,
          )
          .join(", ")
      : "Physics, Chemistry, Higher Mathematics, Biology, ICT, Bangla, English";
    const upcomingExams = Array.isArray(context?.upcomingExams)
      ? context.upcomingExams
          .map((e) => `${e.name} in ${e.subject} on ${e.date}`)
          .join(", ")
      : "Mid-Term Board Prep";
    const studyHoursToday = context?.studyHoursToday || 0;
    const systemInstruction = `You are "Student AI", the dedicated in-app academic assistant and intelligent study mentor for ${studentName}.
Identity Rules:
1. You are the official Student Life companion application assistant.
2. NEVER say you are Gemini, Google, an LLM, or an external AI model under ANY circumstances. If asked "Who are you?", say: "আমি Student Life অ্যাপের অফিসিয়াল স্টাডি অ্যাসিস্ট্যান্ট। আমি তোমার পড়াশোনা, রুটিন এবং পরীক্ষার প্রস্তুতিতে সাহায্য করার জন্য তৈরি।"
3. Institution: ${school}.
4. Class & Section: ${grade}, ${group}, Standard Room: ${classroomNo} (Psychology room 107 if combined).
5. Weekly Routine Knowledge:
   - Monday: Physics (RI), English (RI), Chemistry (SH), Biology (MR), ICT (SK), H. Math
   - Tuesday: English (RI) [Quiz Week], Chemistry (SH), Biology (MR), Physics (RI), H. Math/Agr, English (RI)
   - Wednesday: Pr. Chemistry (SH), Physics (RI), Biology (MR), Bangla (AA), H. Math/Agr, English (RI)
   - Thursday: H. Math/Agr, Pr. Physics (RI), Bangla (AA), Biology (MR), Chemistry (SH), Physics (RI)
   - Saturday: Physics (RI) [Quiz Week], Chemistry (SH), ICT (SK), Pr. Biology (MR), Club Activity
   - Friday is weekly holiday.
6. Language: You can communicate smoothly in Bengali/Bangla (বাংলা) or English according to what language the student writes.
7. Tone: Warm, energetic, academic, motivating, and sharp. Explain complex formulas simply with step-by-step logic, bullet points, and active recall suggestions.`;
    const chatContents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-6)) {
        chatContents.push({
          role: turn.role === "assistant" ? "model" : "user",
          parts: [{ text: turn.text }],
        });
      }
    }
    chatContents.push({
      role: "user",
      parts: [{ text: message }],
    });
    const response = await geminiClient.models.generateContent({
      model: "gemini-3.8-flash",
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    const reply =
      response.text ||
      "আমি তোমার পড়াশোনা ও রুটিনের যেকোনো বিষয়ে সাহায্য করতে প্রস্তুত। কোনো প্রশ্ন থাকলে বলো!";
    return Response.json({ reply });
  } catch (err) {
    console.error("Error generating AI response:", err);
    return Response.json(
      {
        error: "Failed to generate answer from Student AI.",
        details: err?.message || "Server error",
      },
      { status: 500 },
    );
  }
}

export async function postApiStudentsSync(req) {
  const { db: mongoDb } = await connectToDatabase();
  try {
    const {
      userId,
      studentName,
      school,
      grade,
      group,
      batch,
      studentId,
      profilePhoto,
      email,
      phone,
      joinedAt,
    } = req.body;
    if (!userId || !studentName) {
      return Response.json(
        { error: "userId and studentName are required" },
        { status: 400 },
      );
    }
    const permittedRecord = {
      userId,
      studentName: String(studentName).trim(),
      school: school ? String(school).trim() : "",
      grade: grade ? String(grade).trim() : "",
      group: group ? String(group).trim() : "",
      batch: batch ? String(batch).trim() : "",
      studentId: studentId ? String(studentId).trim() : "",
      profilePhoto: profilePhoto || "",
      email: email ? String(email).trim() : "",
      phone: phone ? String(phone).trim() : "",
      joinedAt: joinedAt || new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    if (mongoDb) {
      await mongoDb
        .collection(USER_COLLECTION)
        .updateOne({ userId }, { $set: permittedRecord }, { upsert: true });
    } else {
      const store = readLocalStore();
      const existingIdx = store.students.findIndex((s) => s.userId === userId);
      if (existingIdx >= 0) {
        store.students[existingIdx] = {
          ...store.students[existingIdx],
          ...permittedRecord,
        };
      } else {
        store.students.push(permittedRecord);
      }
      writeLocalStore(store);
    }
    return Response.json({
      success: true,
      message: "Basic student account synchronized securely.",
      syncedAt: permittedRecord.lastActive,
    });
  } catch (err) {
    console.error("Error syncing student:", err);
    return Response.json(
      { error: "Failed to sync student data." },
      { status: 500 },
    );
  }
}

export async function getApiAdminStudents(req) {
  const { db: mongoDb } = await connectToDatabase();
  try {
    const adminToken = req.headers["x-admin-token"] || req.query.adminSecret;
    if (adminToken !== ADMIN_SECRET) {
      return Response.json(
        { error: "Unauthorized: Invalid Admin credentials." },
        { status: 401 },
      );
    }
    let students = [];
    if (mongoDb) {
      students = await mongoDb
        .collection(USER_COLLECTION)
        .find(
          {},
          {
            projection: {
              _id: 0,
              userId: 1,
              studentName: 1,
              school: 1,
              grade: 1,
              group: 1,
              batch: 1,
              studentId: 1,
              profilePhoto: 1,
              email: 1,
              phone: 1,
              joinedAt: 1,
              lastActive: 1,
            },
          },
        )
        .sort({ lastActive: -1 })
        .toArray();
    } else {
      const store = readLocalStore();
      students = (store.students || []).map((s) => ({
        userId: s.userId,
        studentName: s.studentName,
        school: s.school,
        grade: s.grade,
        group: s.group,
        batch: s.batch,
        studentId: s.studentId,
        profilePhoto: s.profilePhoto,
        email: s.email,
        phone: s.phone,
        joinedAt: s.joinedAt,
        lastActive: s.lastActive,
      }));
    }
    return Response.json({
      count: students.length,
      students,
    });
  } catch (err) {
    console.error("Error fetching admin students:", err);
    return Response.json(
      { error: "Failed to retrieve students list." },
      { status: 500 },
    );
  }
}

export async function getApiConfig(req) {
  const { db: mongoDb } = await connectToDatabase();
  try {
    let config = {
      adminContactEmail:
        process.env.ADMIN_CONTACT_EMAIL || "hridoy.dev.natore@gmail.com",
    };
    if (mongoDb) {
      const dbConfig = await mongoDb
        .collection("config")
        .findOne({ key: "admin_config" });
      if (dbConfig?.value) {
        config = { ...config, ...dbConfig.value };
      }
    } else {
      const store = readLocalStore();
      if (store.config) {
        config = { ...config, ...store.config };
      }
    }
    return Response.json(config);
  } catch (err) {
    return Response.json({ adminContactEmail: "hridoy.dev.natore@gmail.com" });
  }
}

export async function postApiAdminConfig(req) {
  const { db: mongoDb } = await connectToDatabase();
  try {
    const adminToken = req.headers["x-admin-token"] || req.query.adminSecret;
    if (adminToken !== ADMIN_SECRET) {
      return Response.json(
        { error: "Unauthorized: Invalid Admin credentials." },
        { status: 401 },
      );
    }
    const { adminContactEmail } = req.body;
    if (!adminContactEmail) {
      return Response.json(
        { error: "adminContactEmail is required." },
        { status: 400 },
      );
    }
    if (mongoDb) {
      await mongoDb
        .collection("config")
        .updateOne(
          { key: "admin_config" },
          { $set: { key: "admin_config", value: { adminContactEmail } } },
          { upsert: true },
        );
    } else {
      const store = readLocalStore();
      store.config = { ...store.config, adminContactEmail };
      writeLocalStore(store);
    }
    return Response.json({ success: true, adminContactEmail });
  } catch (err) {
    return Response.json(
      { error: "Failed to update admin config." },
      { status: 500 },
    );
  }
}

export async function postApiFeedback(req) {
  const { db: mongoDb } = await connectToDatabase();
  try {
    const { studentName, studentEmail, studentId, type, subject, message } =
      req.body;
    if (!message || !type) {
      return Response.json(
        { error: "Feedback type and message are required." },
        { status: 400 },
      );
    }
    const feedbackEntry = {
      id: "fb_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      studentName: studentName || "Anonymous Student",
      studentEmail: studentEmail || "",
      studentId: studentId || "",
      type, // 'Problem Report' | 'Feature Request' | 'Feedback' | 'General Help'
      subject: subject || `Student Life — ${type}`,
      message,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    if (mongoDb) {
      await mongoDb.collection("feedbacks").insertOne(feedbackEntry);
    } else {
      const store = readLocalStore();
      if (!Array.isArray(store.feedbacks)) store.feedbacks = [];
      store.feedbacks.unshift(feedbackEntry);
      writeLocalStore(store);
    }
    return Response.json({ success: true, id: feedbackEntry.id });
  } catch (err) {
    console.error("Error saving feedback:", err);
    return Response.json(
      { error: "Failed to submit feedback." },
      { status: 500 },
    );
  }
}

export async function getApiAdminFeedbacks(req) {
  const { db: mongoDb } = await connectToDatabase();
  try {
    const adminToken = req.headers["x-admin-token"] || req.query.adminSecret;
    if (adminToken !== ADMIN_SECRET) {
      return Response.json(
        { error: "Unauthorized: Invalid Admin credentials." },
        { status: 401 },
      );
    }
    let feedbacks = [];
    if (mongoDb) {
      feedbacks = await mongoDb
        .collection("feedbacks")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
    } else {
      const store = readLocalStore();
      feedbacks = store.feedbacks || [];
    }
    return Response.json({ feedbacks });
  } catch (err) {
    return Response.json(
      { error: "Failed to load feedbacks." },
      { status: 500 },
    );
  }
}

export async function postApiAdminLogin(req) {
  const { secret } = req.body;
  if (secret === ADMIN_SECRET) {
    return Response.json({ success: true, token: ADMIN_SECRET });
  }
  return Response.json(
    { success: false, error: "Incorrect Admin password." },
    { status: 401 },
  );
}
