import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR } from "@/lib/legal";

export const metadata: Metadata = { title: "Imprint | Mind & Potential Architect", robots: { index: false } };

export default function Imprint() {
  const o = OPERATOR;
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 text-slate-700">
      <Link href="/" className="text-sm font-semibold text-violet-600">
        ← Back
      </Link>
      <h1 className="mb-6 mt-4 text-3xl font-extrabold text-slate-900">Imprint (Impressum)</h1>

      <h2 className="mb-2 mt-6 text-lg font-bold text-slate-900">Information according to § 5 DDG</h2>
      <p>
        {o.name}
        <br />
        {o.street}
        <br />
        {o.city}
        <br />
        {o.country}
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-slate-900">Contact</h2>
      <p>
        E-mail: <a className="text-violet-600 underline" href={`mailto:${o.email}`}>{o.email}</a>
        {o.phone && (
          <>
            <br />
            Phone: {o.phone}
          </>
        )}
      </p>

      {o.businessId && (
        <>
          <h2 className="mb-2 mt-6 text-lg font-bold text-slate-900">Business ID</h2>
          <p>{o.businessId}</p>
        </>
      )}

      <h2 className="mb-2 mt-6 text-lg font-bold text-slate-900">Online dispute resolution</h2>
      <p>
        We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration
        board.
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-slate-900">Disclaimer</h2>
      <p>
        The assessment and report are for self-reflection and entertainment. They are not a psychological, medical or
        clinical diagnosis and do not replace professional advice.
      </p>
    </main>
  );
}
