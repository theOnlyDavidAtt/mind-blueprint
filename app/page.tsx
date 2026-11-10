"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Quiz from "@/components/Quiz";
import Sliders from "@/components/Sliders";
import Results from "@/components/Results";
import { scoreBig5, type Scores } from "@/lib/scoring";
import { decodeState, type SavedState } from "@/lib/persist";
import { PENDING_KEY, ls, takeReturnParams, verifyPayment, type ReturnInfo } from "@/lib/payment";

type Stage = "intro" | "quiz" | "sliders" | "results" | "restoring" | "paidNoState";

const STORE = "mpa_state_v1"; // quiz result survives reloads and the checkout redirect (no database needed)

const FEATURES = [
  ["🧠", "50 Big Five questions", "Science-based, from the public-domain IPIP item pool"],
  ["🎛️", "5 workspace sliders", "Your ideal pace, autonomy and decision style"],
  ["✨", "Personal AI report", "Thrive zones, friction fixes and a 7-day plan"],
];

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [scores, setScores] = useState<Scores | null>(null);
  const [sliders, setSliders] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [restoreError, setRestoreError] = useState("");

  const restore = (s: SavedState) => {
    setScores(s.scores);
    setSliders(s.sliders);
    ls.set(STORE, JSON.stringify(s));
    setStage("results");
  };

  // Restore a finished quiz after a reload or a return from checkout. Order:
  // 1) copy carried in the checkout return link (works in a fresh tab / other browser)
  // 2) localStorage (same browser)
  // 3) copy stored with the payment at Whop (asked from our server with the payment id)
  useEffect(() => {
    let info: ReturnInfo = { mpa: null, paymentId: null, failed: false };
    try {
      info = takeReturnParams();
    } catch { /* ignore */ }

    if (info.failed) {
      setNotice("Your payment was not completed, so you have not been charged. You can try again below.");
    } else if (info.paymentId) {
      ls.set(PENDING_KEY, info.paymentId); // Results confirms it and unlocks the report
    }

    let saved: SavedState | null = decodeState(info.mpa);
    if (!saved) {
      try {
        const d = JSON.parse(ls.get(STORE) ?? "null");
        if (d?.scores && d?.sliders) saved = d;
      } catch { /* corrupt: ignore */ }
    }

    if (saved) {
      restore(saved);
      setReady(true);
      return;
    }

    // Paid, but this browser has no quiz result: get it back from the payment instead of
    // silently showing the start page.
    const pending = !info.failed ? (info.paymentId ?? ls.get(PENDING_KEY)) : null;
    if (pending) {
      setStage("restoring");
      setReady(true);
      verifyPayment(pending).then((r) => {
        const fromPayment = r.ok ? decodeState(r.state) : null;
        if (fromPayment) restore(fromPayment);
        else if (r.ok) setStage("paidNoState");
        else {
          setRestoreError(r.error);
          setStage(r.retryable ? "paidNoState" : "intro");
          if (!r.retryable) setNotice(r.error);
        }
      });
      return;
    }
    setReady(true);
  }, []);

  if (!ready) return <main className="min-h-screen bg-[#f6f5fb]" />;

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 via-[#f6f5fb] to-amber-50/40">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {stage === "restoring" && (
            <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
              <motion.span
                className="mb-6 h-12 w-12 rounded-full border-[4px] border-violet-500 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              />
              <h1 className="mb-2 text-2xl font-extrabold text-slate-900">Confirming your payment…</h1>
              <p className="text-slate-600">We are loading your results. This can take a few seconds, please keep this page open.</p>
            </div>
          )}
          {stage === "paidNoState" && (
            <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 text-6xl">{restoreError ? "⏳" : "✅"}</div>
              <h1 className="mb-3 text-2xl font-extrabold text-slate-900">
                {restoreError ? "Your payment is being processed" : "Payment confirmed, thank you!"}
              </h1>
              <p className="mb-6 text-slate-600">
                {restoreError ||
                  "Your quiz answers were not saved in this browser. Take the quiz once more (about 10 minutes): your full report unlocks automatically, no second payment."}
              </p>
              <button
                type="button"
                onClick={() => (restoreError ? window.location.reload() : setStage("quiz"))}
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-violet-300"
              >
                {restoreError ? "Try again" : "Retake the quiz →"}
              </button>
            </div>
          )}
          {stage === "intro" && (
            <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-12 text-center">
              <motion.div
                animate={{ rotate: [0, -6, 6, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="mb-4 text-6xl"
              >
                🧠
              </motion.div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-violet-600">The Core Blueprint</p>
              <h1 className="mb-4 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                Mind &amp; Potential Architect
              </h1>
              <p className="mb-8 text-lg text-slate-600">
                Discover how your mind really works, where you thrive and what to do about it, in about 10 minutes.
              </p>
              <div className="mb-8 grid w-full gap-3 text-left">
                {FEATURES.map(([icon, title, sub]) => (
                  <div key={title} className="flex items-center gap-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm shadow-violet-100">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-bold text-slate-900">{title}</p>
                      <p className="text-sm text-slate-500">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStage("quiz")}
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-violet-300"
              >
                Start the assessment →
              </button>
              {notice && <p className="mt-4 text-sm font-medium text-rose-600">{notice}</p>}
              <p className="mt-4 text-xs text-slate-400">For self-reflection, not a clinical diagnosis</p>
            </div>
          )}
          {stage === "quiz" && (
            <Quiz
              onDone={(answers) => {
                setScores(scoreBig5(answers));
                setStage("sliders");
              }}
            />
          )}
          {stage === "sliders" && (
            <Sliders
              onDone={(v) => {
                setSliders(v);
                try {
                  window.localStorage.setItem(STORE, JSON.stringify({ scores, sliders: v }));
                } catch { /* ignore */ }
                setStage("results");
              }}
            />
          )}
          {stage === "results" && scores && (
            <Results scores={scores} sliders={sliders} notice={notice} onRetake={() => {
              try {
                window.localStorage.removeItem(STORE);
                window.localStorage.removeItem("mpa_report_v1");
              } catch { /* ignore */ }
              setStage("intro");
            }} />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
