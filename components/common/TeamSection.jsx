import Image from "next/image";
import { Facebook } from "lucide-react";

export default function TeamSection() {
  return (
    <section aria-labelledby="team-heading" className="py-10 sm:py-14">
      <div className="mb-7 max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">The person behind the purpose</p>
        <h2 id="team-heading" className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Meet RiFat BhuiYan</h2>
      </div>
      <div className="max-w-xl">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
            <Image src="/img/imgRifat.jpeg" alt="RiFat BhuiYan" fill sizes="(max-width: 640px) 100vw, 576px" unoptimized className="object-cover object-[center_30%]" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">RiFat BhuiYan</h3>
            <a
              href="https://www.facebook.com/share/1Ejxfm1ow7/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="RiFat BhuiYan on Facebook (opens in a new tab)"
              className="mt-5 inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
            >
              <Facebook aria-hidden="true" className="h-4 w-4" />
              <span>Facebook Profile</span>
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
