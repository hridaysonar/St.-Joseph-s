import { headers } from "next/headers";
import { requireAdminSession, ADMIN_EMAIL, adminSetupStatus } from "../../lib/admin-security.js";
import AdminDashboard from "../../components/dashboard/AdminDashboard.jsx";
import AdminLoginForm from "../../components/forms/AdminLoginForm.jsx";
import { configuredAdminPassword } from "../../lib/admin-password.js";
export const dynamic = "force-dynamic";
export default async function AdminPage({ searchParams }) {
  let authorized = false;
  let error = (await searchParams)?.error || "";
  try { await requireAdminSession(await headers()); authorized = true; }
  catch (failure) { if (failure.status !== 401) error = failure.status ? failure.message : "Admin service unavailable."; }
  if (authorized) return <AdminDashboard />;
  const setup = adminSetupStatus();
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <a href="/dashboard" className="text-sm text-indigo-600">← Student Life</a>
        <h1 className="text-2xl font-bold">Admin sign in</h1>
        <p className="text-sm text-slate-500">Sign in with your Admin email and password.</p>
        {error && !error.startsWith("Google") && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <AdminLoginForm email={ADMIN_EMAIL} enabled={configuredAdminPassword()} />
        <details className="text-sm"><summary className="cursor-pointer text-indigo-600">Google sign-in (optional)</summary>
        {error.startsWith("Google") && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {!setup.ready && <section aria-label="Google sign-in setup" className="mt-3 space-y-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-slate-200">
          <h2 className="font-semibold">Google sign-in setup required</h2>
          <p>Google OAuth Client ID ও Client Secret যোগ করলে Admin login চালু হবে।</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li><a href="https://console.cloud.google.com/auth/clients" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 underline dark:text-indigo-400">Google Cloud → Clients</a> খুলে Web application OAuth client তৈরি করুন।</li>
            <li>Authorized redirect URI হিসেবে এটি দিন:<code className="mt-1 block break-all rounded bg-white p-2 text-xs dark:bg-slate-900">{setup.redirectUri || "http://localhost:3000/api/admin/auth/callback"}</code></li>
            <li>Client ID ও Client Secret আপনার local <code>.env.local</code> ফাইলে <code>GOOGLE_CLIENT_ID</code> এবং <code>GOOGLE_CLIENT_SECRET</code>-এ দিন।</li>
            <li>Google app testing mode-এ থাকলে <strong>{ADMIN_EMAIL}</strong> test user হিসেবে যোগ করুন। তারপর dev server restart করুন।</li>
          </ol>
          {setup.missing.length > 0 && <p className="break-words text-xs">Missing settings: {setup.missing.join(", ")}</p>}
          {setup.error && <p role="alert" className="text-rose-700">{setup.error}</p>}
        </section>}
        {/* OAuth requires a full browser navigation rather than Next.js client routing. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        {setup.ready ? <a className="block rounded-xl bg-indigo-600 px-4 py-3 text-center font-semibold text-white" href="/api/admin/auth/start">Continue with Google</a> : <button type="button" disabled className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white opacity-50">Continue with Google — setup required</button>}
        </details>
      </div>
    </main>
  );
}
