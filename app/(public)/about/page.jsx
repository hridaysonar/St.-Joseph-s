import PageLink from "../../../components/ui/PageLink.jsx";
export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-16">
      <h1 className="text-3xl font-bold">About Student Life</h1>
      <p>
        Plan your studies, track tasks and syllabus progress, manage class
        routines and exams, and review your study analytics in one place.
      </p>
      <PageLink href="/dashboard">Open dashboard</PageLink>
    </main>
  );
}
