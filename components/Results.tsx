"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { DISCLAIMER, SLIDERS, TRAIT_META, TRAIT_ORDER, archetype, band, type Scores } from "@/lib/scoring";
import { INSIGHTS } from "@/lib/insights";
import Paywall, { LockedTeaser } from "@/components/Paywall";

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

// Kompakte, saubere Card-Größen für perfektes PDF-Printing ohne Überlappung
const card = "break-inside-avoid rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 print:p-4 print:mb-3";

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ n, icon, title, sub, tone }: { n: number; icon: string; title: string; sub: string; tone: Tone }) {
  return (
    <Reveal className="mb-4 mt-8 flex break-after-avoid items-center gap-3.5 print:mt-2 print:mb-3 print:break-after-avoid">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl ${TONES[tone].tile}`}>{icon}</div>
      <div>
        <p className={`text-[11px] font-bold uppercase tracking-[0.15em] ${TONES[tone].label}`}>Section {String(n).padStart(2, "0")}</p>
        <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{sub}</p>
      </div>
    </Reveal>
  );
}

function Bullets({ items, dot }: { items: string[]; dot: string }) {
  return (
    <ul className="space-y-2 text-sm text-slate-700">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2.5">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
          <span className="text-xs leading-relaxed">{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Loading() {
  return (
    <div className={`${card} mt-6 text-center`}>
      <motion.div
        className="mx-auto mb-2.5 h-8 w-8 rounded-full border-[3px] border-violet-500 border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
      />
      <p className="font-bold text-slate-900 text-sm">Writing your personal report… ✍️</p>
      <p className="mt-1 text-xs text-slate-500">This takes about 20–40 seconds. Your scores above are already complete.</p>
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
      <Reveal className={`${card} mb-3 print:hidden`}>
        <div className="mb-2 flex justify-between text-xs font-bold text-slate-700">
          <span>{count === total && total > 0 ? "Week complete! 🎉" : "Your week so far"}</span>
          <span>{count} / {total}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-teal-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
            animate={{ width: total ? `${(count / total) * 100}%` : "0%" }}
          />
        </div>
      </Reveal>
      <div className="grid gap-3 md:grid-cols-2 print:grid-cols-2 print:gap-2.5">
        {plan.map((d, di) => (
          <Reveal key={di} className={`${card} print:mb-0 print:p-3`}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Day {di + 1} · {days[di] ?? ""}</p>
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">{d.theme}</span>
            </div>
            <div className="space-y-2">
              {d.tasks.map((t, ti) => {
                const key = `${di}-${ti}`;
                const on = !!done[key];
                return (
                  <button key={key} type="button" onClick={() => toggle(key, di)} className="flex w-full gap-2.5 text-left">
                    <motion.span
                      animate={{ scale: on ? [1, 1.3, 1] : 1 }}
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border-2 text-[10px] font-bold ${
                        on ? "border-teal-500 bg-teal-500 text-white" : "border-teal-300 bg-white"
                      }`}
                    >
                      {on ? "✓" : ""}
                    </motion.span>
                    <span className={`text-xs leading-snug ${on ? "text-slate-400 line-through" : "text-slate-700"}`}>{t}</span>
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
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [payError, setPayError] = useState("");
  const started = useRef(false);
  const arch = archetype(scores);

  const store = {
    get: (k: string) => {
      try { return window.localStorage.getItem(k); } catch { return null; }
    },
    set: (k: string, v: string) => {
      try { window.localStorage.setItem(k, v); } catch { /* ignore */ }
    },
    del: (k: string) => {
      try { window.localStorage.removeItem(k); } catch { /* ignore */ }
    },
  };

  const verify = useCallback(async (paymentId: string) => {
    setVerifying(true);
    setPayError("");
    try {
      window.localStorage.setItem("mpa_pending_payment", paymentId);
    } catch { /* ignore */ }
    for (let i = 0; i < 15; i++) {
      try {
        const res = await fetch("/api/whop/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        if (res.ok) {
          try { window.localStorage.removeItem("mpa_pending_payment"); } catch { /* ignore */ }
          setUnlocked(true);
          setVerifying(false);
          confetti({ particleCount: 180, spread: 100, origin: { y: 0.4 } });
          return;
        }
        if (res.status !== 202) {
          const d = await res.json().catch(() => ({}));
          setPayError(d.error ?? "Verification failed.");
          setVerifying(false);
          return;
        }
      } catch { /* network hiccup: retry */ }
      await new Promise((r) => setTimeout(r, 2000));
    }
    setPayError("We could not confirm your payment yet. Please reload this page in a minute. Your purchase is safe.");
    setVerifying(false);
  }, []);

  useEffect(() => {
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.25 } });
    (async () => {
      const sp = new URLSearchParams(window.location.search);
      const returned = sp.get("payment_id") ?? sp.get("receipt_id");
      if (["payment_id", "receipt_id", "status", "state_id", "paid"].some((k) => sp.has(k))) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      let ok = false;
      try {
        const r = await fetch("/api/access", { cache: "no-store" });
        ok = (await r.json()).unlocked === true;
      } catch { /* treat as locked */ }
      setUnlocked(ok);
      if (!ok) {
        const pending = returned ?? store.get("mpa_pending_payment");
        if (pending) verify(pending);
      }
    })();
  }, [verify]);

  useEffect(() => {
    if (unlocked !== true || started.current) return;
    started.current = true;
    const key = JSON.stringify({ scores, sliders });
    try {
      const cached = JSON.parse(window.localStorage.getItem("mpa_report_v1") ?? "null");
      if (cached?.key === key && cached.report) {
        setReport(cached.report);
        setStatus("done");
        return;
      }
    } catch { /* ignore */ }
    setStatus("loading");
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
        store.set("mpa_report_v1", JSON.stringify({ key, report: data.report }));
      } catch (e) {
        setErrMsg(e instanceof Error ? e.message : "Unknown error");
        setStatus("error");
      }
    })();
  }, [unlocked, scores, sliders]);

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

  // Perfekt zentrierter Workspace Style für das Deckblatt (optimierte Schriftgröße & Abstände)
  const workspaceCard = (
      <Reveal className={`${card} text-center flex flex-col items-center print:p-4 print:mb-0`}>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-center w-full">Your workspace style</p>
        <div className="grid gap-3 md:grid-cols-2 print:grid-cols-2 w-full text-left">
          {SLIDERS.map((s) => {
            const v = sliders[s.id] ?? 50;
            const label = v < 40 ? s.left_label : v > 60 ? s.right_label : "Balanced between both";
            return (
              <div key={s.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-bold text-slate-700">{s.dimension}</span>
                  <span className="font-medium text-fuchsia-600">{label}</span>
                </div>
                <div className="relative h-2.5 rounded-full bg-gradient-to-r from-violet-200 to-fuchsia-200">
                  <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-violet-600 shadow" style={{ left: `${v}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 print:w-full print:max-w-none print:px-6 print:py-4">
      {/* ================= SEITE 1: Deckblatt (Zentriert, knackige Lesbarkeit) ================= */}
      <div className="print:min-h-[96vh] print:flex print:flex-col print:justify-between print:break-after-page text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="break-inside-avoid rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 p-8 text-center text-white shadow-xl shadow-violet-300 sm:p-10 print:p-5 print:mb-3 print:shadow-none flex flex-col items-center justify-center"
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-white/90 text-center">Your profile type</p>
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="mb-2 text-6xl print:text-5xl text-center">
            {arch.emoji}
          </motion.div>
          <h1 className="mb-3 text-3xl font-extrabold sm:text-5xl print:mb-2 print:text-3xl text-center">{arch.title}</h1>
          <div className="flex flex-wrap justify-center gap-2 text-center">
            {arch.top.map((k) => (
              <span key={k} className="rounded-full bg-white/25 px-4 py-1 text-xs font-semibold backdrop-blur text-center">
                {TRAIT_META[k].name} · {scores[k]}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="space-y-3 flex flex-col items-center w-full">
          <Reveal className={`${card} print:p-3 w-full text-center flex flex-col items-center`}>
            <p className="text-xs font-bold text-slate-900 text-center w-full">OCEAN profile</p>
            <p className="mb-1 text-[11px] text-slate-500 text-center w-full">Your Big Five footprint</p>
            <div className="h-48 w-full print:h-44 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} outerRadius="70%" margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="trait" tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }} />
                  <Radar dataKey="value" stroke="#7c3aed" strokeWidth={2.5} fill="#8b5cf6" fillOpacity={0.4} isAnimationActive={false} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Reveal>

          <div className="w-full">
            {workspaceCard}
          </div>
        </div>
      </div>

      {/* ================= SEITE 2: Executive Summary, Dominant Traits & Mind Mechanics ================= */}
      <section className="print:break-before-page">
      <SectionHeader n={1} icon="🧠" title="Executive Summary & Mind Mechanics" sub="Your core profile, dominant traits and stress responses" tone="indigo" />
      <div className="grid gap-4 md:grid-cols-1 print:grid-cols-1 print:gap-3">
        {unlocked === false && <Paywall onComplete={verify} verifying={verifying} error={payError} />}
        {unlocked === true && (
          <>
            <Reveal className={`${card} print:break-inside-avoid print:p-4`}>
              {report?.executiveSummary ? (
                <>
                  <p className="text-sm leading-relaxed text-slate-800 print:text-xs print:leading-relaxed">{report.executiveSummary}</p>
                  {!!report.traitInteractions?.length && (
                    <div className="mt-4 border-t border-slate-100 pt-3 print:mt-3 print:pt-2">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Dominant trait interactions</p>
                      <ol className="space-y-2 text-xs text-slate-700 print:space-y-1.5 print:text-[11px]">
                        {report.traitInteractions.map((t, i) => (
                          <li key={i} className="flex gap-2.5"><span className="font-extrabold text-indigo-600">{i + 1}.</span><span>{t}</span></li>
                        ))}
                      </ol>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-600">
                  {status === "loading" ? "Your personal summary is being written…" : "Here is what your scores say:"}{" "}
                  {INSIGHTS[arch.top[0]][band(scores[arch.top[0]])]}
                </p>
              )}
            </Reveal>

            <Reveal className={`${card} print:break-inside-avoid print:p-4`}>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Trait breakdown</p>
              <div className="grid gap-x-8 gap-y-3 md:grid-cols-2 print:grid-cols-1 print:gap-y-2.5">
                {TRAIT_ORDER.map((k) => {
                  const v = scores[k];
                  return (
                    <div key={k} className="print:break-inside-avoid">
                      <div className="mb-1 flex items-baseline justify-between text-xs">
                        <span className="font-bold text-slate-900">{TRAIT_META[k].name}</span>
                        <span className="font-extrabold text-sm" style={{ color: TRAIT_META[k].color }}>
                          <CountUp to={v} />%
                        </span>
                      </div>
                      <div className="mb-1 h-2 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: TRAIT_META[k].color }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${v}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500">{INSIGHTS[k][band(v)]}</p>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            {report && (
              <Reveal className={`${card} print:break-inside-avoid print:p-4`}>
                <p className="mb-2 text-sm font-extrabold text-slate-900">🔥 Mind Mechanics Under Stress</p>
                <p className="mb-3 text-xs leading-relaxed text-slate-800 print:mb-2 print:text-[11px]">{report.mindMechanics}</p>
                <div className="grid gap-3 md:grid-cols-2 print:grid-cols-2">
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 print:p-3">
                    <p className="mb-2 font-bold text-rose-700 text-xs">🔥 Burnout risk factors</p>
                    <Bullets items={report.burnoutRisks ?? []} dot="bg-rose-400" />
                  </div>
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3.5 print:p-3">
                    <p className="mb-2 font-bold text-sky-700 text-xs">🌊 Emotional reset triggers</p>
                    <Bullets items={report.resetTriggers ?? []} dot="bg-sky-400" />
                  </div>
                </div>
              </Reveal>
            )}
          </>
        )}
      </div>
      </section>

      {unlocked === true && status === "loading" && <Loading />}
      {unlocked === true && status === "error" && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs text-amber-900">
          The personal AI report is not available right now ({errMsg}). Your scores above are still complete.
        </div>
      )}

      {unlocked === true && report && (
        <>
          {/* ================= SEITE 3: Thrive Zones & Friction Zones ================= */}
          <section className="print:break-before-page">
          <SectionHeader n={2} icon="🚀" title="Thrive & Friction Zones" sub="Where you excel and your behavioral challenge points" tone="emerald" />
          <div className="space-y-4 print:space-y-3">
            <div className="grid gap-3 md:grid-cols-3 print:grid-cols-3 print:gap-2.5">
              {(report.thriveZones ?? []).map((z, i) => (
                <Reveal key={i} className={`${card} print:mb-0 print:p-3.5`}>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Thrive zone #{i + 1}
                  </p>
                  <p className="mb-2.5 text-xs font-extrabold leading-snug text-slate-900 print:text-[11px]">{z.title}</p>
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Ideal role</p>
                  <p className="mb-2.5 text-xs text-slate-700 print:text-[11px]">{z.idealRole}</p>
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Deep work conditions</p>
                  <p className="text-xs text-slate-700 print:text-[11px]">{z.deepWork}</p>
                </Reveal>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3 print:grid-cols-3 print:gap-2.5">
              {(report.frictionPoints ?? []).map((f, i) => (
                <Reveal key={i} className={`${card} print:mb-0 print:p-3.5`}>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Friction #{i + 1}
                  </p>
                  <p className="mb-2.5 text-xs font-extrabold leading-snug text-slate-900 print:text-[11px]">{f.issue}</p>
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Communication blind spot</p>
                  <p className="mb-2.5 text-xs text-slate-700 print:text-[11px]">{f.blindSpot}</p>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 print:p-2.5">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">Mitigation strategies</p>
                    <ul className="space-y-1.5 text-xs text-slate-700 print:text-[11px]">
                      {(f.strategies ?? []).map((s, j) => (
                        <li key={j} className="flex gap-1.5"><span className="font-bold text-amber-600">✓</span><span>{s}</span></li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          </section>

          {/* ================= SEITE 4: Geographical & Cultural Alignment alleine ================= */}
          <section className="print:break-before-page">
          <SectionHeader n={3} icon="🌍" title="Geographical & Cultural Alignment" sub="Three cultures that may match your values, pacing and norms" tone="fuchsia" />
          <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3 print:gap-3">
            {(report.countries ?? []).map((c, i) => (
              <Reveal key={i} className={`${card} print:mb-0 print:p-4`}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-extrabold text-slate-900">{c.name}</p>
                  <span className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-2.5 py-0.5 text-xs font-bold text-fuchsia-700">{c.fit}% fit</span>
                </div>
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-fuchsia-100">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.fit}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                  />
                </div>
                {([["Values alignment", c.values], ["Pacing match", c.pacing], ["Social norms", c.norms]] as const).map(([label, text]) => (
                  <div key={label} className="mb-2.5 last:mb-0">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="text-xs text-slate-700 print:text-[11px] leading-snug">{text}</p>
                  </div>
                ))}
              </Reveal>
            ))}
          </div>
          </section>

          {/* ================= SEITE 5: 7-Day Action Blueprint ================= */}
          <section className="print:break-before-page">
          <SectionHeader n={4} icon="📅" title="7-Day Action Blueprint" sub="Micro-habits tuned to your profile: one week, tiny moves" tone="teal" />
          <SevenDays plan={report.sevenDayPlan ?? []} />
          </section>
        </>
      )}

      <p className="mt-10 text-center text-[11px] text-slate-400 print:mt-6">{DISCLAIMER}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row print:hidden">
        <button type="button" onClick={printPdf} disabled={unlocked !== true} className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3.5 font-bold text-white shadow-lg shadow-violet-300 disabled:opacity-40 disabled:shadow-none">
          Download as PDF
        </button>
        <button type="button" onClick={onRetake} className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-600 hover:bg-slate-50">
          Retake
        </button>
      </div>
    </div>
  );
}