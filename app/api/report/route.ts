import { NextRequest, NextResponse } from "next/server";
import { SLIDERS } from "@/lib/scoring";
import { ACCESS_COOKIE, devUnlock, verifyAccess } from "@/lib/access";

// Simple in-memory rate limit (per server instance). Replace with a real store (e.g. Upstash) before launch.
const hits = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

const RULES = `You are an expert in personality psychology and career development. You write for a self-reflection product, NOT a clinical or diagnostic tool.
Rules: be specific to the given scores and how they interact (never generic horoscope phrasing), warm but honest, no medical or clinical claims, no guarantees. Mention the Big Five score numbers in brackets, e.g. "Openness (80)", where it helps. NEVER quote raw numbers for the workspace preferences; describe them in words (e.g. "your preference for a slow, methodical pace"). Keep every text field concise and respect the word limits.
Answer immediately with ONLY valid JSON (no preamble, no markdown, no code fences) in exactly this shape:`;

const SHAPE_A = `{
 "executiveSummary": string (90-120 words),
 "traitInteractions": [string, string, string] (each 25-40 words, how 2-3 scores interact),
 "mindMechanics": string (70-100 words, how this person processes pressure, focus and decisions),
 "burnoutRisks": [string, string, string] (each 20-30 words),
 "resetTriggers": [string, string, string] (each 15-25 words, concrete recovery actions),
 "thriveZones": [{"title": string, "idealRole": string (25-35 words), "deepWork": string (20-30 words)} x3]
}`;

const SHAPE_B = `{
 "frictionPoints": [{"issue": string, "blindSpot": string (20-30 words), "strategies": [string, string, string] (each 15-25 words)} x3],
 "countries": [{"name": string, "fit": integer 60-95, "values": string (20-30 words), "pacing": string (15-25 words), "norms": string (15-25 words)} x3],
 "sevenDayPlan": [{"theme": string (2-3 words), "tasks": [string, string, string] (each 10-20 words, concrete and small)} x7, Day 1 to Day 7]
}
Countries are loose, non-binding cultural-fit suggestions (work culture, pace, social style).`;

const isPct = (n: unknown): n is number => typeof n === "number" && n >= 0 && n <= 100;

async function generate(apiKey: string, shape: string, userMsg: string): Promise<Record<string, unknown>> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
      max_tokens: 8000,
      system: `${RULES}\n${shape}`,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  if (!res.ok) {
    console.error("Anthropic API error", res.status, await res.text());
    throw new Error(`The AI service returned an error (${res.status}).`);
  }
  const data = await res.json();
  console.log("Anthropic usage:", JSON.stringify(data.usage), "stop_reason:", data.stop_reason);
  const text: string = (data.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("");
  if (data.stop_reason === "max_tokens") {
    console.error("Cut off at max_tokens. Visible text length:", text.length, "Block types:", (data.content ?? []).map((b: { type: string }) => b.type));
    throw new Error("The report was cut off. Please try again.");
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    console.error("No JSON found in model output:", text.slice(0, 500));
    throw new Error("The AI answer had an unexpected format.");
  }
  return JSON.parse(text.slice(start, end + 1));
}

export async function POST(req: NextRequest) {
  // Paywall: only verified buyers (signed cookie issued after Whop confirmed the payment) get a report.
  let allowed = devUnlock();
  if (!allowed) {
    try {
      allowed = !!verifyAccess(req.cookies.get(ACCESS_COOKIE)?.value);
    } catch {
      allowed = false;
    }
  }
  if (!allowed) {
    return NextResponse.json({ error: "Payment required." }, { status: 402 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI report is not configured (missing ANTHROPIC_API_KEY)." }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    return NextResponse.json({ error: "Rate limit reached. Please try again later." }, { status: 429 });
  }
  recent.push(now);
  hits.set(ip, recent);

  let body: { scores?: Record<string, number>; sliders?: Record<string, number> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { scores, sliders } = body;
  const keys = ["O", "C", "E", "A", "S"];
  if (!scores || !keys.every((k) => isPct(scores[k]))) {
    return NextResponse.json({ error: "Invalid scores" }, { status: 400 });
  }
  const sl = sliders ?? {};
  if (!Object.values(sl).every(isPct)) {
    return NextResponse.json({ error: "Invalid sliders" }, { status: 400 });
  }

  const lean = (v: number, l: string, r: string) =>
    v <= 20 ? `strongly: "${l}"` : v <= 40 ? `moderately: "${l}"` : v < 60 ? "balanced between both sides" : v < 80 ? `moderately: "${r}"` : `strongly: "${r}"`;
  const prefs = SLIDERS.map((d) => `- ${d.dimension}: ${lean(sl[d.id] ?? 50, d.left_label, d.right_label)}`).join("\n");

  const userMsg = `Big Five scores (0-100):
- Openness: ${scores.O}
- Conscientiousness: ${scores.C}
- Extraversion: ${scores.E}
- Agreeableness: ${scores.A}
- Emotional Stability: ${scores.S}

Workspace preferences (described in words):
${prefs}

Write the report.`;

  try {
    // Two smaller requests in parallel: faster and much less likely to be cut off.
    const [partA, partB] = await Promise.all([
      generate(apiKey, SHAPE_A, userMsg),
      generate(apiKey, SHAPE_B, userMsg),
    ]);
    return NextResponse.json({ report: { ...partA, ...partB } });
  } catch (e) {
    console.error("Report generation failed", e);
    const msg = e instanceof Error ? e.message : "Could not generate the report.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
