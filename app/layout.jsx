import "./globals.css";

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", interactiveWidget: "resizes-content" };

export const metadata = {
  title: { default: "Student Life | Plan, Study & Excel", template: "%s | Student Life" },
  icons: { icon: "/img/website%20logo.jpeg", apple: "/img/website%20logo.jpeg" },
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
