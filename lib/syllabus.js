import data from "./hsc-2027.json";

const colors = [
  "#6366f1",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#06b6d4",
  "#3b82f6",
];

export function createHscSubjects() {
  return data.syllabus.subjects.map((subject, index) => ({
    id: subject.id,
    name: subject.name,
    color: colors[index],
    papers: subject.papers.map(({ id, name, note }) => ({ id, name, note })),
    chapters: subject.papers.flatMap((paper) =>
      (paper.chapters || paper.units || paper.topics || []).map((chapter) => ({
        id: chapter.id,
        name: chapter.name,
        paperId: paper.id,
        status: chapter.completed ? "Completed" : "Not Started",
        revisionCount: 0,
      })),
    ),
  }));
}

export function getSubjectPapers(subject) {
  const papers = subject.papers || [];
  const knownIds = new Set(papers.map((paper) => paper.id));
  const unassigned = subject.chapters.filter(
    (chapter) => !knownIds.has(chapter.paperId),
  );
  return [
    ...papers.map((paper) => ({
      ...paper,
      chapters: subject.chapters.filter(
        (chapter) => chapter.paperId === paper.id,
      ),
    })),
    ...(unassigned.length || !papers.length
      ? [
          {
            id: "unassigned",
            name: papers.length ? "অন্যান্য অধ্যায়" : "অধ্যায়সমূহ",
            chapters: unassigned,
          },
        ]
      : []),
  ];
}

// Keep saved/custom chapters intact; do not guess their paper or overwrite progress.
export function upgradeSubjectPapers(subjects) {
  const aliases = [
    "physics",
    "chemistry",
    "higher mathematics",
    "biology",
    "bangla",
    "english",
    "ict",
  ];
  const templates = createHscSubjects();
  return subjects.map((subject) => {
    if (subject.papers?.length) return subject;
    const template = templates.find(
      (item, index) =>
        item.name === subject.name ||
        aliases[index] === subject.name.toLowerCase(),
    );
    if (!template) return subject;
    return {
      ...subject,
      papers: template.papers,
      chapters: [
        ...subject.chapters,
        ...template.chapters.filter(
          (chapter) =>
            !subject.chapters.some((saved) => saved.id === chapter.id),
        ),
      ],
    };
  });
}

export function chapterProgress(chapters) {
  const completed = chapters.filter(
    (chapter) => chapter.status === "Completed",
  ).length;
  return {
    total: chapters.length,
    completed,
    percent: chapters.length
      ? Math.round((completed / chapters.length) * 100)
      : 0,
  };
}

export function getHomeSubjectCards(subjects) {
  const catalog = [
    ["physics", "Physics"],
    ["chemistry", "Chemistry"],
    ["biology", "Biology"],
    ["higher_math", "Higher math", "Higher Mathematics"],
    ["bangla", "Bangla"],
    ["english", "English"],
    ["ict", "ICT"],
  ];
  const templates = createHscSubjects();
  return catalog.map(([id, label, alias]) => {
    const template = templates.find((item) => item.id === id);
    const names = [template.name, label, alias].filter(Boolean).map((name) => name.toLowerCase());
    const saved = subjects.find((item) => item.id === id || names.includes(item.name.trim().toLowerCase()));
    return { label, subject: saved || template };
  });
}
