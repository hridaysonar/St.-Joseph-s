import PageLink from "../../../components/ui/PageLink.jsx";
import BrandLogo from "../../../components/common/BrandLogo.jsx";
import TeamSection from "../../../components/common/TeamSection.jsx";
import SiteFooter from "../../../components/common/SiteFooter.jsx";

export const metadata = { title: "About & Team", description: "Meet the project creator and website developer behind Student Life, your everyday study companion." };

export default function AboutPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-16">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-7 text-white sm:p-12">
          <div className="flex flex-col items-start gap-7 sm:flex-row sm:items-center">
            <BrandLogo size={112} priority />
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Plan • Study • Excel</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">A little more focus.<br />A better student life.</h1>
              <p className="mt-5 text-sm leading-7 text-slate-300">Student Life brings your study plans, daily tasks, class routines and exam preparation into one place — so you can make time for what matters.</p>
            </div>
          </div>
          <div className="mt-7"><PageLink href="/dashboard">Open your dashboard →</PageLink></div>
        </div>
        <TeamSection />
      </main>
      <SiteFooter />
    </>
  );
}
