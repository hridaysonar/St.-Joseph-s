import { randomUUID } from "node:crypto";
import { ADMIN_EMAIL, adminDatabase, checkOrigin, fail } from "./admin-security.js";
import { textField } from "./admin-content.js";
import { limitSubmissions } from "./submission-limit.js";

export async function submitFeedback(req) {
  checkOrigin(req.headers);
  const db = await adminDatabase();
  await limitSubmissions(db, req.headers);
  const type = req.body.type;
  if (!["Problem Report", "Feature Request", "Feedback", "General Help"].includes(type)) fail("Choose a valid submission type.");
  const category = req.body.category || "Other";
  if (!["Website Problem", "Routine Problem", "PDF Problem", "Syllabus Problem", "Other"].includes(category)) fail("Invalid category.");
  const record = {
    id: randomUUID(), type, category,
    message: textField(req.body.message, "Message", 5000, true),
    studentName: textField(req.body.studentName || "Anonymous", "Student name", 160),
    studentEmail: textField(req.body.studentEmail || "", "Student email", 254),
    studentId: textField(req.body.studentId || "", "Student ID", 160),
    identityVerified: false, createdAt: new Date().toISOString(), status: "New", emailStatus: "pending",
  };
  const collection = db.collection(type === "Problem Report" ? "problem_reports" : type === "Feature Request" ? "feature_suggestions" : "feedbacks");
  // Save before contacting the mail provider; mail failures cannot erase a submission.
  await collection.insertOne(record);
  let emailStatus = "not_configured";
  if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
    try {
      const email = await fetch("https://api.resend.com/emails", {
        method: "POST", signal: AbortSignal.timeout(10000),
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": record.id },
        body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [ADMIN_EMAIL], subject: `Student Life — New ${type === "Feature Request" ? "Feature Suggestion" : type}`, text: `${record.message}\n\nCategory: ${category}\nDate: ${record.createdAt}\nStudent: ${record.studentName}\nEmail: ${record.studentEmail}\nID: ${record.studentId}\nStudent details are self-reported.\n\nReview in ${process.env.APP_ORIGIN}/admin` }),
      });
      emailStatus = email.ok ? "sent" : "failed";
    } catch { emailStatus = "failed"; }
  }
  await collection.updateOne({ id: record.id }, { $set: { emailStatus } }).catch(() => {});
  return Response.json({ success: true, id: record.id, emailStatus });
}
