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

const card = "break-inside-avoid rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60 print:p-5 print:mb-6";

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

function SectionHeader({ n, icon, title, sub, tone }: { n: number; icon: string; title: string; sub: string; tone: Tone }) {
  return (
    <Reveal className="mb-4 mt-12 flex break-after-avoid items-center gap-4 print:mt-8 print:mb-4 print:break-after-avoid">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl ${TONES[tone].tile}`}>{icon}</div>
      <div>
        <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${TONES[tone].label}`}>Section {String(n).padStart(2, "0")}</p>
        <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{sub}</p>
      </div>
    </Reveal>
  );
}

function Bullets({ items, dot }: { items: string[]; dot: string }) {
  return (
    <ul className="space-y-2.5 text-sm text-slate-700">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2.5">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
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
      <Reveal className={`${card} mb-4 print:hidden`}>
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
      <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2 print:gap-4">
        {plan.map((d, di) => (
          <Reveal key={di} className={`${card} print:break-inside-avoid print:mb-0`}>
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
      try { window.localStorage.setItem(k, v); } catch { /* storage may be blocked */ }
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

  const workspaceCard = (
      <Reveal className={`${card} print:break-inside-avoid`}>
        <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Your workspace style</p>
        <div className="grid gap-5 md:grid-cols-2 print:grid-cols-2 print:gap-4">
          {SLIDERS.map((s) => {
            const v = sliders[s.id] ?? 50;
            const label = v < 40 ? s.left_label : v > 60 ? s.right_label : "Balanced between both";
            return (
              <div key={s.id} className="print:break-inside-avoid">
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
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 print:w-full print:max-w-none print:px-8 print:py-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="break-inside-avoid rounded-[2rem] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 p-8 text-center text-white shadow-2xl shadow-violet-300 sm:p-12 print:p-6 print:mb-6 print:shadow-none print:break-inside-avoid"
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

      {/* 01 Executive summary */}
      <section className="print:break-inside-avoid">
      <SectionHeader n={1} icon="🧠" title="Executive Summary" sub="Your core psychological profile at a glance" tone="indigo" />
      <div className="grid gap-5 md:grid-cols-[360px_1fr] print:grid-cols-1 print:gap-4">
        <Reveal className={`${card} print:break-inside-avoid`}>
          <p className="font-bold text-slate-900">OCEAN profile</p>
          <p className="mb-2 text-sm text-slate-500">Your Big Five footprint</p>
          <div className="h-64 w-full print:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} outerRadius="55%" margin={{ top: 24, right: 56, bottom: 28, left: 56 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="trait" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                <Radar dataKey="value" stroke="#7c3aed" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.35} isAnimationActive={false} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Reveal>
        {unlocked === false && <Paywall onComplete={verify} verifying={verifying} error={payError} />}
        {unlocked === true && (
          <>
        <Reveal className={`${card} print:break-inside-avoid`}>
          {report?.executiveSummary ? (
            <>
              <p className="text-base leading-relaxed text-slate-800 print:text-sm print:leading-relaxed">{report.executiveSummary}</p>
              {!!report.traitInteractions?.length && (
                <div className="mt-5 border-t border-slate-100 pt-4 print:mt-4 print:pt-3">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Dominant trait interactions</p>
                  <ol className="space-y-3 text-sm text-slate-700 print:space-y-2 print:text-xs">
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
      <Reveal className={`${card} md:col-span-2 print:col-span-1 print:break-inside-avoid`}>
        <p className="mb-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Trait breakdown</p>
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-2 print:grid-cols-1 print:gap-y-4">
          {TRAIT_ORDER.map((k) => {
            const v = scores[k];
            return (
              <div key={k} className="print:break-inside-avoid">
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

          </>
        )}
      </div>
      </section>

      {unlocked === true && !report && <div className="mt-5">{workspaceCard}</div>}
      {unlocked === false && <LockedTeaser />}

      {unlocked === true && status === "loading" && <Loading />}
      {unlocked === true && status === "error" && (
        <div className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          The personal AI report is not available right now ({errMsg}). Your scores above are still complete.
        </div>
      )}

      {unlocked === true && report && (
        <>
          {/* 02 Stress */}
          <section className="print:break-inside-avoid">
          <SectionHeader n={2} icon="🔥" title="Mind Mechanics Under Stress" sub="How your brain behaves under pressure" tone="rose" />
          <Reveal className={`${card} print:break-inside-avoid`}>
            <p className="mb-5 leading-relaxed text-slate-800 print:text-sm print:mb-4">{report.mindMechanics}</p>
            <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2 print:gap-4">
              <div className="break-inside-avoid rounded-2xl border border-rose-200 bg-rose-50 p-5 print:p-4">
                <p className="mb-3 font-bold text-rose-700">🔥 Burnout risk factors</p>
                <Bullets items={report.burnoutRisks ?? []} dot="bg-rose-400" />
              </div>
              <div className="break-inside-avoid rounded-2xl border border-sky-200 bg-sky-50 p-5 print:p-4">
                <p className="mb-3 font-bold text-sky-700">🌊 Emotional reset triggers</p>
                <Bullets items={report.resetTriggers ?? []} dot="bg-sky-400" />
              </div>
            </div>
          </Reveal>
          </section>

          {/* 03 Thrive */}
          <section className="print:break-inside-avoid">
          <SectionHeader n={3} icon="🚀" title="Workplace & Life Thrive Zones" sub="Where your engine runs at full speed" tone="emerald" />
          <div className="mb-5 print:mb-4">{workspaceCard}</div>
          <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3 print:gap-4">
            {(report.thriveZones ?? []).map((z, i) => (
              <Reveal key={i} className={`${card} print:break-inside-avoid print:mb-0`}>
                <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Thrive zone #{i + 1}
                </p>
                <p className="mb-4 text-lg font-extrabold leading-snug text-slate-900 print:text-base print:mb-2">{z.title}</p>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Ideal role</p>
                <p className="mb-4 text-sm text-slate-700 print:mb-2">{z.idealRole}</p>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Deep work conditions</p>
                <p className="text-sm text-slate-700">{z.deepWork}</p>
              </Reveal>
            ))}
          </div>
          </section>

          {/* 04 Friction */}
          <section className="print:break-inside-avoid">
          <SectionHeader n={4} icon="⚠️" title="Friction & Challenge Zones" sub="Behavioural pitfalls, and 3 actionable moves each" tone="amber" />
          <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3 print:gap-4">
            {(report.frictionPoints ?? []).map((f, i) => (
              <Reveal key={i} className={`${card} print:break-inside-avoid print:mb-0`}>
                <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Friction #{i + 1}
                </p>
                <p className="mb-4 font-extrabold leading-snug text-slate-900 print:mb-2">{f.issue}</p>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Communication blind spot</p>
                <p className="mb-4 text-sm text-slate-700 print:mb-3">{f.blindSpot}</p>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 print:p-3">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-amber-700">Mitigation strategies</p>
                  <ul className="space-y-2 text-sm text-slate-700 print:space-y-1.5 print:text-xs">
                    {(f.strategies ?? []).map((s, j) => (
                      <li key={j} className="flex gap-2"><span className="font-bold text-amber-600">✓</span><span>{s}</span></li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
          </section>

          {/* 05 Countries */}
          <section className="print:break-inside-avoid">
          <SectionHeader n={5} icon="🌍" title="Geographical & Cultural Alignment" sub="Three cultures that may match your values, pacing and norms (loose suggestions)" tone="fuchsia" />
          <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3 print:gap-4">
            {(report.countries ?? []).map((c, i) => (
              <Reveal key={i} className={`${card} print:break-inside-avoid print:mb-0`}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xl font-extrabold text-slate-900 print:text-lg">{c.name}</p>
                  <span className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1 text-xs font-bold text-fuchsia-700">{c.fit}% fit</span>
                </div>
                <div className="mb-4 h-2 overflow-hidden rounded-full bg-fuchsia-100 print:mb-3">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.fit}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                  />
                </div>
                {([["Values alignment", c.values], ["Pacing match", c.pacing], ["Social norms", c.norms]] as const).map(([label, text]) => (
                  <div key={label} className="mb-3 last:mb-0 print:mb-2">
                    <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="text-sm text-slate-700 print:text-xs">{text}</p>
                  </div>
                ))}
              </Reveal>
            ))}
          </div>
          </section>

          {/* 06 Seven days */}
          <section className="print:break-inside-avoid">
          <SectionHeader n={6} icon="📅" title="7-Day Action Blueprint" sub="Micro-habits tuned to your profile: one week, tiny moves" tone="teal" />
          <SevenDays plan={report.sevenDayPlan ?? []} />
          </section>
        </>
      )}

      <p className="mt-12 text-center text-xs text-slate-400 print:mt-8">{DISCLAIMER}</p>

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