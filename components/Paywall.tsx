
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { loadWhop } from "@whop/elements";
import {
  Checkout as WhopCheckout,
  CheckoutElement,
  WhopElements,
} from "@whop/elements-react";

const PLAN_ID = process.env.NEXT_PUBLIC_WHOP_PLAN_ID;
const PRICE = process.env.NEXT_PUBLIC_PRICE_LABEL || "$20";

const INCLUDED = [
  "Executive summary and your trait interactions",
  "Full trait breakdown and workspace style",
  "Stress, burnout and reset triggers",
  "Thrive zones and ideal roles",
  "Friction points with 3 fixes each",
  "Cultural fit and your 7-day action plan",
];

export default function Paywall({
  onComplete,
  verifying,
  error,
  returnState,
}: {
  onComplete: (receiptId: string) => void;
  verifying: boolean;
  error: string;
  /** encoded quiz result, appended to the checkout return link so nothing is lost on redirect */
  returnState?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 shadow-sm"
    >
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600">
        Your full blueprint
      </p>

      <h3 className="mb-3 text-2xl font-extrabold text-slate-900">
        Unlock your complete report 🔓
      </h3>

      <ul className="mb-5 space-y-2 text-sm text-slate-700">
        {INCLUDED.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="font-bold text-emerald-600">✓</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>

      {!open && !verifying && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3.5 text-lg font-bold text-white shadow-lg shadow-violet-300"
        >
          Unlock for {PRICE}
        </button>
      )}

      {open && !verifying && !PLAN_ID && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Checkout is not configured yet. Set NEXT_PUBLIC_WHOP_PLAN_ID in your environment variables.
        </p>
      )}

      {open && !verifying && PLAN_ID && (
        <div className="rounded-2xl bg-white p-2">
          <WhopElements
            elements={loadWhop()}
            environment="production"
          >
            <WhopCheckout
              plan={PLAN_ID}
              metadata={returnState ? { mpa: returnState } : undefined}
              returnUrl={
                typeof window !== "undefined"
                  ? `${window.location.origin}/${returnState ? `?mpa=${returnState}` : ""}`
                  : undefined
              }
              fallback={
                <p className="p-6 text-center text-sm text-slate-500">
                  Loading secure checkout…
                </p>
              }
              onComplete={(completion) => {
                if (completion.result === "payment") {
                  onComplete(completion.paymentId);
                }
              }}
            >
              <CheckoutElement />
            </WhopCheckout>
          </WhopElements>
        </div>
      )}

      {verifying && (
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-medium text-slate-700">
          <motion.span
            className="h-5 w-5 rounded-full border-[3px] border-violet-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 0.9,
              ease: "linear",
            }}
          />
          Confirming your payment…
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}

      <p className="mt-3 text-center text-xs text-slate-400">
        One-time payment · secure checkout by Whop
      </p>
    </motion.div>
  );
}

// Placeholder tiles for the locked sections.
// Deliberately contains NO real report content.
const TILES = [
  ["🧠", "Executive Summary"],
  ["🔥", "Mind Mechanics Under Stress"],
  ["🚀", "Workplace & Life Thrive Zones"],
  ["⚠️", "Friction & Challenge Zones"],
  ["🌍", "Geographical & Cultural Alignment"],
  ["📅", "7-Day Action Blueprint"],
];

export function LockedTeaser() {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 print:hidden">
      {TILES.map(([icon, title]) => (
        <div
          key={title}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="flex items-center gap-2 font-bold text-slate-900">
              <span className="text-xl">{icon}</span> {title}
            </p>
            <span className="text-lg">🔒</span>
          </div>

          <div className="space-y-2">
            <div className="h-2.5 w-full animate-pulse rounded-full bg-slate-100" />
            <div className="h-2.5 w-5/6 animate-pulse rounded-full bg-slate-100" />
            <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
