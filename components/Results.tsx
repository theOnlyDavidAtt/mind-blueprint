"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { DISCLAIMER, SLIDERS, TRAIT_META, TRAIT_ORDER, archetype, band, type Scores } from "@/lib/scoring";
import { INSIGHTS } from "@/lib/insights";

// HIER DEINEN ECHTEN WHOP CHECKOUT LINK EINTRAGEN:
const WHOP_CHECKOUT_URL = "https://whop.com/checkout/YOUR_PRODUCT_ID";

type Report = {
  executiveSummary?: string;
  traitInteractions?: string[];
  mindMechanics?: string;
  burnoutRisks?: string[];
  resetTriggers?: string[];
  thriveZones?: { title: string; idealRole: string; deepWork: string }[];
  frictionPoints?: { issue: string; blindSpot: string; strategies: string[] }[];
  countries?: { name: string; fit: number; values: string; pacing: string; norms: string }[];
  sevenDayPlan?: { theme: string; tasks: string[] }[];
};

const TONES = {
  indigo: { label: "text-indigo-600", tile: "bg-indigo-50 border-indigo-200" },
  rose: { label: "text-rose-600", tile: "bg-rose-50 border-rose-200" },
  emerald: { label: "text-emerald-600", tile: "bg-emerald-50 border-emerald-200" },
  amber: { label: "text-amber-600", tile: "bg-amber-50 border-amber-200" },
  fuchsia: { label: "text-fuchsia-600", tile: "bg-fuchsia-50 border-fuchsia-200" },
  teal: { label: "text-teal-600", tile: "bg-teal-50 border-teal-200" },
} as const;
type Tone = keyof typeof TONES;

const card = "break-inside-avoid rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60 print:p-4";

function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = animate(0, to, { duration: 1.2, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [to]);
  return <>{v}</>;
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ n, icon, title, sub, tone, pageBreak = false }: { n: number; icon: string; title: string; sub: string; tone: Tone; pageBreak?: boolean }) {
  return (
    <Reveal className={`mb-4 mt-12 flex break-after-avoid items-center gap-4 print:mt-6 ${pageBreak ? "print:break-before-page" : ""}`}>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl ${TONES[tone].tile}`}>{icon}</div>
      <div>
        <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${TONES[tone].label}`}>Section {String(n).padStart(2, "0")}</p>
        <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{sub}</p>
      </div>
    </Reveal>
  );
}

function Loading() {
  return (
    <div className={`${card} mt-10 text-center`}>
      <motion.div
        className="mx-auto mb-3 h-9 w-9 rounded-full border-[3px] border-violet-500 border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
      />
      <p className="font-bold text-slate-900">Writing your personal report… ✍️</p>
      <p className="mt-1 text-sm text-slate-500">This takes about 20–40 seconds. Your scores above are already complete.</p>
    </div>
  );
}

function SevenDays({ plan }: { plan: { theme: string; tasks: string[] }[] }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const total = plan.reduce((n, d) => n + d.tasks.length, 0);
  const count = Object.values(done).filter(Boolean).length;
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggle = (key: string, di: number) => {
    const next = { ...done, [key]: !done[key] };
    setDone(next);
    if (next[key]) {
      const dayDone = plan[di].tasks.every((_, ti) => next[`${di}-${ti}`]);
      confetti({ particleCount: dayDone ? 90 : 25, spread: dayDone ? 80 : 50, origin: { y: 0.75 } });
    }
  };

  return (
    <>
      <Reveal className={`${card} mb-4`}>
        <div className="mb-2 flex justify-between text-sm font-bold text-slate-700">
          <span>{count === total && total > 0 ? "Week complete! 🎉" : "Your week so far"}</span>
          <span>{count} / {total}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-teal-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
            animate={{ width: total ? `${(count / total) * 100}%` : "0%" }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400 print:hidden">Tick off the micro-habits as you go.</p>
      </Reveal>
      <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
        {plan.map((d, di) => (
          <Reveal key={di} className={card}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Day {di + 1} · {days[di] ?? ""}</p>
              <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">{d.theme}</span>
            </div>
            <div className="space-y-2.5">
              {d.tasks.map((t, ti) => {
                const key = `${di}-${ti}`;
                const on = !!done[key];
                return (
                  <button key={key} type="button" onClick={() => toggle(key, di)} className="flex w-full gap-3 text-left">
                    <motion.span
                      animate={{ scale: on ? [1, 1.3, 1] : 1 }}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold ${
                        on ? "border-teal-500 bg-teal-500 text-white" : "border-teal-300 bg-white"
                      }`}
                    >
                      {on ? "✓" : ""}
                    </motion.span>
                    <span className={`text-sm ${on ? "text-slate-400 line-through" : "text-slate-700"}`}>{t}</span>
                  </button>
                );
              })}
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}

export default function Results({
  scores,
  sliders,
  onRetake,
}: {
  scores: Scores;
  sliders: Record<string, number>;
  onRetake: () => void;
}) {
  const [report, setReport] = useState<Report | null>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [errMsg, setErrMsg] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const started = useRef(false);
  const arch = archetype(scores);
  const paywallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("paid") === "true") {
        setIsUnlocked(true);
      }
    }
  }, []);

  useEffect(() => {
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.25 } });
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const res = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scores, sliders }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Request failed");
        setReport(data.report);
        setStatus("done");
      } catch (e) {
        setErrMsg(e instanceof Error ? e.message : "Unknown error");
        setStatus("error");
      }
    })();
  }, [scores, sliders]);

  const SHORT: Record<string, string> = { O: "Openness", C: "Conscient.", E: "Extraversion", A: "Agreeable.", S: "Stability" };
  const printPdf = async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    await new Promise((r) => setTimeout(r, 1300));
    window.scrollTo(0, 0);
    window.print();
  };

  const chartData = TRAIT_ORDER.map((k) => ({ trait: SHORT[k], value: scores[k] }));

  const scrollToPaywall = () => {
    paywallRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* SEITE 1: Hero & OCEAN (IMMER KOSTENLOS ALS APPETIZER) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="break-inside-avoid rounded-[2rem] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 p-8 text-center text-white shadow-2xl shadow-violet-300 sm:p-12 print:p-5 print:shadow-none"
      >
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-white/80">Your profile type</p>
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="mb-1 text-6xl print:text-4xl">
          {arch.emoji}
        </motion.div>
        <h1 className="mb-4 text-3xl font-extrabold sm:text-5xl print:mb-2 print:text-3xl">{arch.title}</h1>
        <div className="flex flex-wrap justify-center gap-2">
          {arch.top.map((k) => (
            <span key={k} className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur">
              {TRAIT_META[k].name} · {scores[k]}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="mt-8">
        <Reveal className={card}>
          <p className="font-bold text-slate-900">OCEAN profile</p>
          <p className="mb-2 text-sm text-slate-500">Your Big Five footprint</p>
          <div className="h-64 w-full print:mx-auto print:h-56 print:max-w-sm">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} outerRadius="55%" margin={{ top: 24, right: 56, bottom: 28, left: 56 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="trait" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                <Radar dataKey="value" stroke="#7c3aed" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.35} isAnimationActive />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Reveal>
      </div>

      {/* HINWEIS-PFEIL ZUR PAYWALL (Führt direkt zum Popup) */}
      {!isUnlocked && (
        <div className="my-8 text-center print:hidden">
          <button
            type="button"
            onClick={scrollToPaywall}
            className="group inline-flex flex-col items-center gap-1 focus:outline-none"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 transition-colors group-hover:text-violet-800">
              Unlock Executive Summary &amp; Full Blueprint below
            </span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600 shadow-md group-hover:bg-violet-600 group-hover:text-white transition-colors"
            >
              ↓
            </motion.span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* AB HIER: DIE FRÜHE PAYWALL / GESCHÜTZTE INHALTE           */}
      {/* ======================================================== */}
      <div ref={paywallRef} className="relative mt-8">
        {!isUnlocked && (
          <div className="sticky top-6 z-20 mx-auto mb-[-320px] flex max-w-md flex-col items-center p-4">
            <div className="w-full rounded-3xl border border-violet-100 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-xl ring-4 ring-violet-500/10">
              <span className="mb-3 inline-block text-4xl">🔒</span>
              <h3 className="mb-2 text-2xl font-black text-slate-900">Unlock Your Full Blueprint</h3>
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                Get immediate access to your <strong>Executive Summary</strong>, <strong>Trait Breakdowns</strong>, <strong>37-Day Action Plan</strong>, and <strong>Thrive Zones</strong>.
              </p>
              <a
                href={WHOP_CHECKOUT_URL}
                className="block w-full rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 py-4 text-center font-extrabold text-white shadow-xl shadow-violet-300 hover:opacity-95 transition-opacity"
              >
                Unlock Full Access for $20 →
              </a>
              <p className="mt-3 text-xs text-slate-400">One-time payment · Instant access</p>
            </div>
          </div>
        )}

        {/* Die geschützten Abschnitte (verschwommen, wenn isUnlocked === false) */}
        <div className={!isUnlocked ? "blur-md select-none pointer-events-none opacity-30 transition-all duration-300" : ""}>
          
          <SectionHeader n={1} icon="🧠" title="Executive Summary" sub="Your core psychological profile at a glance" tone="indigo" />
          <div className="grid gap-5">
            <Reveal className={`${card} print:break-inside-auto`}>
              {report?.executiveSummary ? (
                <>
                  <p className="text-base leading-relaxed text-slate-800 print:text-sm">{report.executiveSummary}</p>
                  {!!report.traitInteractions?.length && (
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Dominant trait interactions</p>
                      <ol className="space-y-3 text-sm text-slate-700">
                        {report.traitInteractions.map((t, i) => (
                          <li key={i} className="flex gap-3"><span className="font-extrabold text-indigo-600">{i + 1}.</span><span>{t}</span></li>
                        ))}
                      </ol>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-600">
                  {status === "loading" ? "Your personal summary is being written…" : "Here is what your scores say:"}{" "}
                  {INSIGHTS[arch.top[0]][band(scores[arch.top[0]])]}
                </p>
              )}
            </Reveal>
          </div>

          {/* Trait Breakdown & Workspace Style */}
          <div className="print:break-before-page">
            <Reveal className={`${card} mt-5`}>
              <p className="mb-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Trait breakdown</p>
              <div className="grid gap-x-10 gap-y-6 md:grid-cols-2 print:grid-cols-2">
                {TRAIT_ORDER.map((k) => {
                  const v = scores[k];
                  return (
                    <div key={k} className="break-inside-avoid">
                      <div className="mb-1.5 flex items-baseline justify-between">
                        <span className="font-bold text-slate-900">{TRAIT_META[k].name}</span>
                        <span className="text-lg font-extrabold" style={{ color: TRAIT_META[k].color }}>
                          <CountUp to={v} />%
                        </span>
                      </div>
                      <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: TRAIT_META[k].color }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${v}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <p className="text-xs leading-relaxed text-slate-500">{INSIGHTS[k][band(v)]}</p>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal className={`${card} mt-5`}>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Your workspace style</p>
              <div className="grid gap-5 md:grid-cols-2 print:grid-cols-2">
                {SLIDERS.map((s) => {
                  const v = sliders[s.id] ?? 50;
                  const label = v < 40 ? s.left_label : v > 60 ? s.right_label : "Balanced between both";
                  return (
                    <div key={s.id}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-bold text-slate-700">{s.dimension}</span>
                        <span className="font-medium text-fuchsia-600">{label}</span>
                      </div>
                      <div className="relative h-2 rounded-full bg-gradient-to-r from-violet-200 to-fuchsia-200">
                        <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-violet-600 shadow" style={{ left: `${v}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>

          {status === "loading" && <Loading />}
          {status === "error" && (
            <div className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
              The personal report is not available right now ({errMsg}).
            </div>
          )}

          {report && (
            <>
              {/* Thrive Zones */}
              <SectionHeader n={3} icon="🚀" title="Workplace & Life Thrive Zones" sub="Where your engine runs at full speed" tone="emerald" />
              <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
                {(report.thriveZones ?? []).map((z, i) => (
                  <Reveal key={i} className={card}>
                    <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Thrive zone #{i + 1}
                    </p>
                    <p className="mb-4 text-lg font-extrabold leading-snug text-slate-900">{z.title}</p>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Ideal role</p>
                    <p className="mb-4 text-sm text-slate-700">{z.idealRole}</p>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Deep work conditions</p>
                    <p className="text-sm text-slate-700">{z.deepWork}</p>
                  </Reveal>
                ))}
              </div>

              {/* Friction Zones */}
              <SectionHeader n={4} icon="⚠️" title="Friction & Challenge Zones" sub="Behavioural pitfalls, and 3 actionable moves each" tone="amber" pageBreak />
              <div className="grid gap-4 md:grid-cols-3 print:grid-cols-1">
                {(report.frictionPoints ?? []).map((f, i) => (
                  <Reveal key={i} className={card}>
                    <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-600">
                      <span className="h-2 w-2 rounded-full bg-amber-500" /> Friction #{i + 1}
                    </p>
                    <p className="mb-4 font-extrabold leading-snug text-slate-900">{f.issue}</p>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Communication blind spot</p>
                    <p className="mb-4 text-sm text-slate-700">{f.blindSpot}</p>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-amber-700">Mitigation strategies</p>
                      <ul className="space-y-2 text-sm text-slate-700">
                        {(f.strategies ?? []).map((s, j) => (
                          <li key={j} className="flex gap-2"><span className="font-bold text-amber-600">✓</span><span>{s}</span></li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Geographical Alignment */}
              <SectionHeader n={5} icon="🌍" title="Geographical & Cultural Alignment" sub="Three cultures that may match your values, pacing and norms" tone="fuchsia" pageBreak />
              <div className="grid gap-4 md:grid-cols-3 print:grid-cols-1">
                {(report.countries ?? []).map((c, i) => (
                  <Reveal key={i} className={card}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xl font-extrabold text-slate-900">{c.name}</p>
                      <span className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1 text-xs font-bold text-fuchsia-700">{c.fit}% fit</span>
                    </div>
                    <div className="mb-4 h-2 overflow-hidden rounded-full bg-fuchsia-100">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${c.fit}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    {([["Values alignment", c.values], ["Pacing match", c.pacing], ["Social norms", c.norms]] as const).map(([label, text]) => (
                      <div key={label} className="mb-3 last:mb-0">
                        <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                        <p className="text-sm text-slate-700">{text}</p>
                      </div>
                    ))}
                  </Reveal>
                ))}
              </div>

              {/* 7-Day Plan */}
              <SectionHeader n={6} icon="📅" title="37-Day Action Blueprint" sub="Micro-habits tuned to your profile" tone="teal" pageBreak />
              <SevenDays plan={report.sevenDayPlan ?? []} />
            </>
          )}
        </div>
      </div>

      <p className="mt-12 text-center text-xs text-slate-400">{DISCLAIMER}</p>

      {/* FOOTER BUTTONS */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row print:hidden">
        {isUnlocked && (
          <button type="button" onClick={printPdf} className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3.5 font-bold text-white shadow-lg shadow-violet-300">
            Download as PDF
          </button>
        )}
        <button type="button" onClick={onRetake} className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-600 hover:bg-slate-50">
          Retake Assessment
        </button>
      </div>
    </div>
  );
}