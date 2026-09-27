import Image from "next/image";
import { Code2, Lightbulb } from "lucide-react";
const creator = "/img/creator.jpeg";
const developer = "/img/developer.jpg";

const people = [
  { image: creator, name: "Nahid Hasan", title: "Project Creator", label: "Idea & Direction", description: "The idea and requirements behind Student Life — shaped around the everyday needs of a student.", icon: Lightbulb, accent: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  { image: developer, name: "Hriday Sonar", title: "Website Developer", label: "Design & Development", description: "Bringing the idea to life through thoughtful design and development, one detail at a time.", icon: Code2, accent: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" },
];

export default function TeamSection() {
  return (
    <section aria-labelledby="team-heading" className="py-10 sm:py-14">
      <div className="mb-7 max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">The people behind the purpose</p>
        <h2 id="team-heading" className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">An idea. A shared effort. Student Life.</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">From the first idea to the final experience, meet the people behind your everyday study companion.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {people.map(({ image, name, title, label, description, icon: Icon, accent }) => (
          <article key={title} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image src={image} alt={`${name}, Student Life ${title}`} fill unoptimized className="object-cover object-[center_30%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <p className="absolute bottom-5 left-5 flex items-center gap-2 text-xs font-semibold tracking-wide text-white"><Icon aria-hidden="true" className="h-4 w-4" />{label}</p>
            </div>
            <div className="p-6">
              <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${accent}`}>{title}</span>
              <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{name}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
