import "./globals.css";

export const metadata = {
  title: "Student Life",
  description:
    "Personal student management system — plan, study, track syllabus, daily tasks, namaz, routine, exams, and ask Student AI.",
  openGraph: { title: "Student Life", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
