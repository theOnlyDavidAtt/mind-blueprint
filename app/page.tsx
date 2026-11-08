"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Quiz from "@/components/Quiz";
import Sliders from "@/components/Sliders";
import Results from "@/components/Results";
import { scoreBig5, type Scores } from "@/lib/scoring";

type Stage = "intro" | "quiz" | "sliders" | "results";

const FEATURES = [
  ["🧠", "50 Big Five questions", "Science-based, from the public-domain IPIP item pool"],
  ["🎛️", "5 workspace sliders", "Your ideal pace, autonomy and decision style"],
  ["✨", "Personal AI report", "Thrive zones, friction fixes and a 7-day plan"],
];

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [scores, setScores] = useState<Scores | null>(null);
  const [sliders, setSliders] = useState<Record<string, number>>({});

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
                setStage("results");
              }}
            />
          )}
          {stage === "results" && scores && (
            <Results scores={scores} sliders={sliders} onRetake={() => setStage("intro")} />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
