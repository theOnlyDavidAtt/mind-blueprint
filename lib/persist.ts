import { TRAIT_ORDER, type Scores } from "@/lib/scoring";

export type SavedState = { scores: Scores; sliders: Record<string, number> };

const num = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100;

/** Compact, URL-safe copy of the quiz result. It travels through the checkout redirect. */
export function encodeState(s: SavedState): string {
  const json = JSON.stringify(s);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Returns null for anything that is not a well-formed quiz result. */
export function decodeState(raw: string | null): SavedState | null {
  if (!raw || raw.length > 2000) return null;
  try {
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const d = JSON.parse(decodeURIComponent(escape(atob(b64))));
    if (!d || typeof d !== "object" || !d.scores || !d.sliders) return null;
    if (!TRAIT_ORDER.every((k) => num(d.scores[k]))) return null;
    const sliders: Record<string, number> = {};
    for (const [k, v] of Object.entries(d.sliders)) {
      if (!num(v)) return null;
      sliders[k] = v as number;
    }
    return { scores: d.scores as Scores, sliders };
  } catch {
    return null;
  }
}
