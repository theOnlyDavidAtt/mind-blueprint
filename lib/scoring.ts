import bank from "./questionBank.json";

export type TraitKey = "O" | "C" | "E" | "A" | "S";
export type Big5Item = { id: string; trait: "O" | "C" | "E" | "A" | "N"; text: string; key: 1 | -1 };
export type SliderDef = { id: string; dimension: string; left_label: string; right_label: string };
export type Scores = Record<TraitKey, number>;

export const BIG5_ITEMS = bank.tier1.big5.items as unknown as Big5Item[];
export const SLIDERS = bank.tier1.sliders as unknown as SliderDef[];
export const LIKERT_LABELS = bank.tier1.big5.scale.labels as string[];
export const DISCLAIMER = bank.meta.disclaimer as string;

export const TRAIT_META: Record<TraitKey, { name: string; color: string }> = {
  O: { name: "Openness", color: "#8b5cf6" },
  C: { name: "Conscientiousness", color: "#0d9488" },
  E: { name: "Extraversion", color: "#f59e0b" },
  A: { name: "Agreeableness", color: "#10b981" },
  S: { name: "Emotional Stability", color: "#4f46e5" },
};
export const TRAIT_ORDER: TraitKey[] = ["O", "C", "E", "A", "S"];

// Interleave traits so the quiz doesn't ask 10 similar questions in a row.
export function orderedItems(): Big5Item[] {
  const by: Record<string, Big5Item[]> = { O: [], C: [], E: [], A: [], N: [] };
  BIG5_ITEMS.forEach((i) => by[i.trait].push(i));
  const order = ["E", "C", "O", "N", "A"];
  const out: Big5Item[] = [];
  for (let n = 0; n < 10; n++) order.forEach((t) => by[t][n] && out.push(by[t][n]));
  return out;
}

export function scoreBig5(answers: Record<string, number>): Scores {
  const sums: Record<string, { total: number; n: number }> = {};
  for (const item of BIG5_ITEMS) {
    const a = answers[item.id];
    if (!a) continue;
    const v = item.key === -1 ? 6 - a : a;
    (sums[item.trait] ||= { total: 0, n: 0 });
    sums[item.trait].total += v;
    sums[item.trait].n += 1;
  }
  const pct = (t: string) => {
    const s = sums[t];
    return s && s.n ? Math.round(((s.total / s.n - 1) / 4) * 100) : 50;
  };
  return { O: pct("O"), C: pct("C"), E: pct("E"), A: pct("A"), S: 100 - pct("N") };
}

export type Band = "low" | "medium" | "high";
export const band = (v: number): Band => (v < 34 ? "low" : v < 67 ? "medium" : "high");

const ADJ: Record<TraitKey, string> = { O: "Curious", C: "Disciplined", E: "Energetic", A: "Warm", S: "Steady" };
const NOUN: Record<TraitKey, string> = { O: "Explorer", C: "Architect", E: "Spark", A: "Harmonizer", S: "Anchor" };
const EMOJI: Record<TraitKey, string> = { O: "🧭", C: "🏗️", E: "⚡", A: "🤝", S: "🌊" };

// Fun, shareable profile title from the two strongest traits.
export function archetype(scores: Scores) {
  const sorted = [...TRAIT_ORDER].sort((a, b) => scores[b] - scores[a]);
  const [first, second] = sorted;
  return { title: `The ${ADJ[first]} ${NOUN[second]}`, emoji: EMOJI[first], top: sorted.slice(0, 2) as TraitKey[] };
}
