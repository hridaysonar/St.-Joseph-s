import Link from "next/link";
import BrandLogo from "./BrandLogo.jsx";

export default function SiteFooter() {
  return (
    <footer className="mx-auto mt-6 max-w-6xl border-t border-slate-200 px-4 pb-40 pt-7 sm:px-6 xl:pb-24 dark:border-slate-800">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex w-fit items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-indigo-500">
          <BrandLogo size={44} />
          <div><p className="text-sm font-extrabold">Student Life</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Plan with purpose. Study with focus.</p></div>
        </Link>
        <nav aria-label="Footer" className="flex gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/about" className="hover:text-indigo-500">About & Team</Link>
          <Link href="/contact" className="hover:text-indigo-500">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
