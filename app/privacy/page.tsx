import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR, POLICY_DATE } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy | Mind & Potential Architect", robots: { index: false } };

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 mt-8 text-lg font-bold text-slate-900">{children}</h2>;
}

export default function Privacy() {
  const o = OPERATOR;
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 leading-relaxed text-slate-700 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5">
      <Link href="/" className="text-sm font-semibold text-violet-600">
        ← Back
      </Link>
      <h1 className="mb-2 mt-4 text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
      <p className="text-sm text-slate-500">Last updated: {POLICY_DATE}</p>

      <H>1. Who is responsible</H>
      <p>
        The controller under the EU General Data Protection Regulation (GDPR) is: {o.name}, {o.street}, {o.city},{" "}
        {o.country}. E-mail: <a className="text-violet-600 underline" href={`mailto:${o.email}`}>{o.email}</a>
      </p>

      <H>2. The short version</H>
      <ul>
        <li>You do not need an account. We do not ask for your name to take the test.</li>
        <li>Your answers are stored only in your own browser, not in a database of ours.</li>
        <li>No advertising or analytics trackers are used on this website.</li>
        <li>If you buy the report, payment is handled by Whop. We never see your card details.</li>
      </ul>

      <H>3. Hosting and server logs (Vercel)</H>
      <p>
        This website is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA. When you visit the site,
        Vercel automatically processes technical data such as your IP address, date and time of access, browser type and
        the page requested, in order to deliver the website securely. Legal basis: Art. 6(1)(f) GDPR (our legitimate
        interest in a secure, working website). Data may be transferred to the USA; Vercel relies on the EU-U.S. Data
        Privacy Framework and/or Standard Contractual Clauses. More:{" "}
        <a className="text-violet-600 underline" href="https://vercel.com/legal/privacy-policy">vercel.com/legal/privacy-policy</a>
      </p>

      <H>4. Your test answers (stored in your browser)</H>
      <p>
        Your trait scores, workspace preferences and your generated report are saved in your browser&apos;s local
        storage, so your result is still there after a reload or after checkout. This data stays on your device. You
        can delete it at any time with the &quot;Retake&quot; button or by clearing your browser data. Legal basis: Art.
        6(1)(b) GDPR (providing the service you requested) and § 25(2) TDDDG (strictly necessary storage).
      </p>

      <H>5. Personal AI report (Anthropic)</H>
      <p>
        When you unlock your report, your five trait scores and five workspace preferences (numbers between 0 and 100)
        are sent to Anthropic PBC, 548 Market St, PMB 90375, San Francisco, CA 94104, USA, whose AI writes your
        personal text. We do not send your name, e-mail address or payment details. Under its commercial terms,
        Anthropic does not use this data to train its models. Legal basis: Art. 6(1)(b) GDPR (performance of the
        contract). Transfers to the USA are based on Standard Contractual Clauses. More:{" "}
        <a className="text-violet-600 underline" href="https://www.anthropic.com/legal/privacy">anthropic.com/legal/privacy</a>
      </p>

      <H>6. Payment (Whop)</H>
      <p>
        Purchases are processed by Whop Inc. (USA) through an embedded checkout. Whop collects the data needed for the
        payment, such as your e-mail address, payment method and billing country, under its own privacy policy. We
        receive confirmation that a payment was made, its ID and, depending on your checkout, your e-mail address, to
        unlock your report and to meet legal accounting duties. Legal basis: Art. 6(1)(b) and (c) GDPR. Accounting
        records are kept for up to 10 years as required by German tax law. More:{" "}
        <a className="text-violet-600 underline" href="https://whop.com/privacy">whop.com/privacy</a>
      </p>

      <H>7. Access cookie</H>
      <p>
        After a successful payment we set one strictly necessary cookie (&quot;mpa_access&quot;). It contains a signed
        token with your payment ID and proves that this browser has paid, valid for one year. It is not used for
        tracking. Legal basis: § 25(2) TDDDG and Art. 6(1)(b) GDPR. No consent banner is needed because no optional
        cookies are used.
      </p>

      <H>8. Fonts</H>
      <p>Fonts are served from our own server. No connection to Google Fonts is made when you visit the site.</p>

      <H>9. Contact by e-mail</H>
      <p>
        If you e-mail us, we use your message and address only to answer you. Legal basis: Art. 6(1)(b) or (f) GDPR. We
        delete it once your request is resolved, unless we must keep it by law.
      </p>

      <H>10. Your rights</H>
      <p>
        You have the right to access (Art. 15), rectification (Art. 16), erasure (Art. 17), restriction (Art. 18), data
        portability (Art. 20) and to object to processing based on legitimate interests (Art. 21 GDPR). Just e-mail us.
        You also have the right to lodge a complaint with a supervisory authority, for example: {o.supervisoryAuthority}.
      </p>

      <H>11. No automated decisions</H>
      <p>
        The AI report is generated automatically, but it has no legal or similarly significant effect on you. It is a
        self-reflection text, not a decision about you.
      </p>
    </main>
  );
}
