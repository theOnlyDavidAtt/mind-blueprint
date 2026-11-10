import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR, POLICY_DATE } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms & Withdrawal | Mind & Potential Architect", robots: { index: false } };

function H({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-2 mt-8 scroll-mt-6 text-lg font-bold text-slate-900">
      {children}
    </h2>
  );
}

export default function Terms() {
  const o = OPERATOR;
  const addr = `${o.name}, ${o.street}, ${o.city}, ${o.country}, e-mail: ${o.email}`;
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 leading-relaxed text-slate-700 [&_p]:mb-3 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5">
      <Link href="/" className="text-sm font-semibold text-violet-600">
        ← Back
      </Link>
      <h1 className="mb-2 mt-4 text-3xl font-extrabold text-slate-900">Terms &amp; Conditions</h1>
      <p className="text-sm text-slate-500">Last updated: {POLICY_DATE}</p>

      <H>1. Scope and provider</H>
      <p>
        These terms apply to all purchases on this website. Your contract partner is {addr}. Different terms of the
        customer do not apply.
      </p>

      <H>2. What you get</H>
      <p>
        The personality assessment and the basic results are free. For a one-time payment you unlock a personal,
        AI-generated report (digital content) shown on this website, which you can save as a PDF. It is not a
        subscription; there are no recurring charges.
      </p>
      <p>
        The report is for self-reflection and entertainment. It is <strong>not</strong> a psychological, medical or
        clinical diagnosis and does not replace professional advice. Because it is written by an AI, individual
        statements may be imprecise.
      </p>

      <H>3. Contract and payment</H>
      <p>
        The product on this website is a non-binding invitation to buy. By completing the checkout you make a binding
        offer; we accept it by unlocking your report. Payment is processed by our payment provider Whop Inc. in the
        payment methods offered there. The price shown at checkout is final and includes any applicable VAT.
      </p>

      <H>4. Delivery</H>
      <p>
        The report is unlocked immediately after the payment is confirmed, in the same browser you used to pay. Access
        stays available in that browser for at least 12 months. Please save your report as a PDF.
      </p>

      <H id="withdrawal">5. Right of withdrawal (for consumers)</H>
      <p className="font-semibold text-slate-900">Withdrawal policy</p>
      <p>
        <strong>Right of withdrawal.</strong> You have the right to withdraw from this contract within 14 days without
        giving any reason. The withdrawal period will expire after 14 days from the day of the conclusion of the
        contract. To exercise the right of withdrawal, you must inform us ({addr}) of your decision to withdraw from
        this contract by an unequivocal statement (e.g. a letter sent by post or an e-mail). You may use the model
        withdrawal form below, but it is not obligatory. To meet the withdrawal deadline, it is sufficient for you to
        send your communication concerning your exercise of the right of withdrawal before the withdrawal period has
        expired.
      </p>
      <p>
        <strong>Effects of withdrawal.</strong> If you withdraw from this contract, we shall reimburse to you all
        payments received from you without undue delay and in any event not later than 14 days from the day on which
        we are informed about your decision to withdraw from this contract. We will carry out such reimbursement using
        the same means of payment as you used for the initial transaction, unless you have expressly agreed otherwise;
        in any event, you will not incur any fees as a result of such reimbursement.
      </p>
      <p>
        <strong>Early expiry of the right of withdrawal.</strong> For contracts for the supply of digital content not
        on a physical medium, the right of withdrawal expires when we have begun to perform the contract after you
        (1) expressly consented to us beginning the performance before the end of the withdrawal period, and (2)
        acknowledged that you thereby lose your right of withdrawal. You give this consent with the checkbox before
        checkout. Your report is unlocked immediately after payment, so the right of withdrawal expires at that moment.
      </p>

      <p className="mt-6 font-semibold text-slate-900">Model withdrawal form</p>
      <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        (Complete and return this form only if you wish to withdraw from the contract.)
        <br />
        To: {addr}
        <br />
        I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract for the supply of the following
        digital content: ____
        <br />
        Ordered on (*) / received on (*): ____
        <br />
        Name of consumer(s): ____
        <br />
        Address of consumer(s): ____
        <br />
        Signature of consumer(s) (only if this form is notified on paper): ____
        <br />
        Date: ____
        <br />
        (*) Delete as appropriate.
      </p>

      <H>6. Liability</H>
      <p>
        We are liable without limitation for intent and gross negligence, for injury to life, body or health, and under
        the German Product Liability Act. For slight negligence we are liable only for breach of essential contractual
        obligations, limited to the damage typical and foreseeable for this type of contract. Otherwise liability is
        excluded.
      </p>

      <H>7. Final provisions</H>
      <p>
        German law applies, excluding the UN Convention on Contracts for the International Sale of Goods. If you are a
        consumer, this choice of law does not deprive you of the protection of mandatory provisions of the law of the
        country where you habitually reside. We are neither willing nor obliged to take part in dispute resolution
        proceedings before a consumer arbitration board.
      </p>
    </main>
  );
}
