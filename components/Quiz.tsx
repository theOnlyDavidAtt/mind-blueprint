"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LIKERT_LABELS, orderedItems } from "@/lib/scoring";

const PER_PAGE = 5;

function cheer(p: number) {
  if (p === 0) return "Let's go ✨";
  if (p < 25) return "Great start 🔥";
  if (p < 50) return "You're in the flow 🌊";
  if (p < 75) return "Over halfway — keep going 🚀";
  if (p < 100) return "Final stretch 🏁";
  return "All done 🎉";
}

export default function Quiz({ onDone }: { onDone: (answers: Record<string, number>) => void }) {
  const items = useMemo(() => orderedItems(), []);
  const pages = Math.ceil(items.length / PER_PAGE);
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const slice = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const complete = slice.every((i) => answers[i.id]);
  const answered = Object.keys(answers).length;
  const pct = Math.round((answered / items.length) * 100);

  const next = () => {
    if (page + 1 < pages) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else onDone(answers);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Part 1 of 2 · Personality</span>
          <span>{answered} / {items.length}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-violet-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400"
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={cheer(pct)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-sm font-semibold text-violet-600"
          >
            {cheer(pct)}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="mb-4 text-sm text-slate-500">How accurately does each statement describe you, as you generally are?</p>

      <div className="space-y-4">
        {slice.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100"
          >
            <p className="mb-4 text-lg font-semibold text-slate-900">{item.text}</p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((v) => {
                const active = answers[item.id] === v;
                return (
                  <motion.button
                    key={v}
                    type="button"
                    aria-label={LIKERT_LABELS[v - 1]}
                    whileTap={{ scale: 0.88 }}
                    animate={{ scale: active ? 1.08 : 1 }}
                    onClick={() => setAnswers((a) => ({ ...a, [item.id]: v }))}
                    className={`rounded-2xl border py-3 text-sm font-bold transition-colors ${
                      active
                        ? "border-transparent bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-300"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300 hover:bg-violet-50"
                    }`}
                  >
                    {v}
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
              <span>{LIKERT_LABELS[0]}</span>
              <span>{LIKERT_LABELS[4]}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="rounded-xl px-4 py-3 text-sm font-medium text-slate-500 disabled:opacity-30"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={!complete}
          onClick={next}
          className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-3 font-bold text-white shadow-lg shadow-violet-300 transition disabled:opacity-40 disabled:shadow-none"
        >
          {page + 1 < pages ? "Next →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
