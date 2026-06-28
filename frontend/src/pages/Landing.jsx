import React from "react";
import TopBar from "@/components/TopBar";
import { ArrowUpRight, BarChart3, FileSpreadsheet, Bot, Compass, ListChecks, Sparkles } from "lucide-react";

const PLATFORMS = ["INSTAGRAM", "TWITTER / X", "LINKEDIN", "YOUTUBE", "TIKTOK"];
const AGENTS_LIST = [
  { name: "Audience Analyst", desc: "Decodes who watches, when, and why they bounce." },
  { name: "Content Strategist", desc: "Designs pillars, formats and hooks tailored to your niche." },
  { name: "Engagement Coach", desc: "Crafts the specific calls-to-action that turn views into community." },
  { name: "Competitor Insight", desc: "Maps your positioning against inspiration accounts." },
  { name: "Action Planner", desc: "Synthesizes everything into a 30-day plan with daily steps." },
];

function startLogin() {
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const redirectUrl = window.location.origin + "/dashboard";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F4F4F0]" data-testid="landing-page">
      <TopBar />

      {/* HERO */}
      <section className="border-b-2 border-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <div className="overline mb-6">Issue №01 — Growth Intelligence for Creators</div>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl tracking-tighter leading-[0.95]">
              The numbers your dashboards <span className="text-[#FF3B00]">won't</span> explain.
              <br />
              The plan they <span className="bg-[#0A0A0A] text-white px-2">never</span> give you.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-[#4A4A4A] leading-relaxed">
              Pulse ingests your Instagram, X, LinkedIn, YouTube and TikTok exports — then runs a five-agent system
              that reads the data like a senior growth manager and ships a concrete 30-day playbook. No charts that
              shrug. No insights that already knew.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button className="btn-primary" onClick={startLogin} data-testid="hero-cta">
                Start free analysis <ArrowUpRight className="inline ml-1" size={18} />
              </button>
              <a href="#how" className="btn-secondary" data-testid="hero-how-it-works">How it works</a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-[#8A8A8A]">
              <span className="overline">Powered by</span>
              <span className="font-semibold text-[#0A0A0A]">Claude Sonnet 4.5</span>
              <span>·</span>
              <span className="font-semibold text-[#0A0A0A]">5 Specialized Agents</span>
              <span>·</span>
              <span className="font-semibold text-[#0A0A0A]">CSV · XLSX · PDF</span>
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="brutal-card p-6 brutal-shadow-sm" data-testid="hero-card-platforms">
              <div className="overline text-[#0033FF]">// platforms</div>
              <div className="font-display font-black text-3xl mt-2">5</div>
              <div className="text-sm text-[#4A4A4A] mt-1">Insta · X · LinkedIn · YouTube · TikTok</div>
            </div>
            <div className="brutal-card p-6 brutal-shadow-sm" data-testid="hero-card-agents">
              <div className="overline text-[#FF3B00]">// agents on duty</div>
              <div className="font-display font-black text-3xl mt-2">05</div>
              <div className="text-sm text-[#4A4A4A] mt-1">Analyst · Strategist · Coach · Scout · Planner</div>
            </div>
            <div className="brutal-card p-6 brutal-shadow-sm" data-testid="hero-card-output">
              <div className="overline">// output</div>
              <div className="font-display font-black text-3xl mt-2">30 days</div>
              <div className="text-sm text-[#4A4A4A] mt-1">Themes, posts, schedule, daily checklist.</div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-b-2 border-[#0A0A0A] bg-[#0A0A0A] text-white overflow-hidden">
        <div className="marquee-track whitespace-nowrap py-5 flex gap-12">
          {[...PLATFORMS, ...PLATFORMS, ...PLATFORMS].map((p, i) => (
            <span key={i} className="font-display font-black text-2xl tracking-tighter inline-flex items-center gap-12">
              {p}
              <span className="text-[#FF3B00]">●</span>
            </span>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-b-2 border-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5">
              <div className="overline mb-3">§ 02 · Method</div>
              <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tighter">
                Upload exports.<br/>Multi-agent system reads them like a team would.
              </h2>
              <p className="mt-6 text-[#4A4A4A] leading-relaxed">
                Meta lets you download reports. So does X, LinkedIn, YouTube, and TikTok.
                Pulse turns those raw exports into the kind of analysis a senior growth manager
                would write you — followed by the plan they'd actually ship.
              </p>
            </div>
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: FileSpreadsheet, t: "01 · Drop your exports", d: "CSV, XLSX, PDF — one file per platform. No API approvals, no waiting." },
                { icon: Bot, t: "02 · Agents run in sequence", d: "Five specialists pass their findings to the next. Watch the terminal stream." },
                { icon: BarChart3, t: "03 · Report you can read", d: "North star metric, charts, what's working, what to stop. Real sentences." },
                { icon: ListChecks, t: "04 · 30-day action plan", d: "Weekly themes, content ideas, posting schedule, daily checklist." },
              ].map((s, i) => (
                <div key={i} className="brutal-card p-6">
                  <s.icon size={28} strokeWidth={2} />
                  <div className="font-display font-bold text-xl mt-4">{s.t}</div>
                  <div className="text-sm text-[#4A4A4A] mt-2">{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AGENTS */}
      <section className="border-b-2 border-[#0A0A0A] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-20">
          <div className="overline mb-3 text-[#FF3B00]">§ 03 · The Bureau</div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tighter max-w-3xl">
            Five agents. One playbook. No fluff.
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 border-2 border-[#0A0A0A]">
            {AGENTS_LIST.map((a, i) => (
              <div key={a.name} className={`p-6 ${i < 4 ? 'lg:border-r-2 border-[#0A0A0A]' : ''} ${i < 3 ? 'md:border-r-2' : ''} ${i < 2 ? 'border-b-2 md:border-b-2 lg:border-b-0' : 'md:border-b-0'} border-[#0A0A0A]`}>
                <div className="overline text-[#0033FF]">Agent · 0{i+1}</div>
                <div className="font-display font-black text-xl mt-3">{a.name}</div>
                <div className="text-sm text-[#4A4A4A] mt-3 leading-relaxed">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="bg-[#0A0A0A] text-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-20 grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <div className="overline text-[#FF3B00] mb-4">§ 04 · Start</div>
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter leading-[0.95]">
              Your dashboards stop at numbers.<br/>
              <span className="text-[#FF3B00]">Pulse starts there.</span>
            </h2>
          </div>
          <div className="md:col-span-4 md:text-right">
            <button className="btn-primary !text-base" onClick={startLogin} data-testid="footer-cta">
              Sign in with Google <Sparkles className="inline ml-1" size={16} />
            </button>
            <div className="overline text-[#8A8A8A] mt-4">No credit card · 1-click setup</div>
          </div>
        </div>
        <div className="border-t-2 border-white/10 py-6">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between text-xs text-white/60 font-mono">
            <div>© Pulse Growth · MMXXVI</div>
            <div>signal/noise ratio: 100/0</div>
          </div>
        </div>
      </section>
    </div>
  );
}
