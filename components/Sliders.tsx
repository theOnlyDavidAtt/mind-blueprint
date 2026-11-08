"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SLIDERS } from "@/lib/scoring";

export default function Sliders({ onDone }: { onDone: (v: Record<string, number>) => void }) {
  const [vals, setVals] = useState<Record<string, number>>(
    Object.fromEntries(SLIDERS.map((s) => [s.id, 50]))
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <p className="mb-1 text-xs font-medium text-slate-500">Part 2 of 2 · Workspace &amp; pace</p>
      <h2 className="mb-2 text-3xl font-extrabold text-slate-900">How do you like to work? 🎛️</h2>
      <p className="mb-6 text-sm text-slate-500">Drag each slider towards the side that resonates with you more.</p>

      <div className="space-y-5">
        {SLIDERS.map((s, idx) => {
          const v = vals[s.id];
          const lean = v < 40 ? s.left_label : v > 60 ? s.right_label : "Right in the middle";
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-600">{s.dimension}</p>
              <div className="mb-3 grid grid-cols-2 gap-4 text-sm font-medium text-slate-700">
                <span>{s.left_label}</span>
                <span className="text-right">{s.right_label}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={v}
                onChange={(e) => setVals((x) => ({ ...x, [s.id]: Number(e.target.value) }))}
                className="h-2 w-full cursor-pointer accent-violet-600"
                aria-label={s.dimension}
              />
              <p className="mt-2 text-center text-xs font-semibold text-fuchsia-600">{lean}</p>
            </motion.div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onDone(vals)}
        className="mt-8 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-4 text-lg font-bold text-white shadow-xl shadow-violet-300"
      >
        Reveal my blueprint ✨
      </button>
    </div>
  );
}
