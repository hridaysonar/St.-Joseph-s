import Link from "next/link";
export default function PageLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
    >
      {children}
    </Link>
  );
}
