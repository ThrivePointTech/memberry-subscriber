import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Laundry Membership Flyer - Memberry",
  description:
    "Kumita sa tahimik na weekdays. Offer weekday memberships with Memberry at zero investment.",
};

const steps = [
  {
    title: "Create Plan",
    description: "Let us create the monthly plan you offer to customers.",
  },
  {
    title: "Customer Avails",
    description: "Customer pays for plan; redeems by QR code or app.",
  },
  {
    title: "Customer Renews",
    description: "Customer billed monthly; payments go to your bank.",
  },
];

const inclusions = [
  "Posters & Static QR",
  "Monthly Customer Billing",
  "Customer App",
  "Merchant App",
  "Staff Incentives & Training",
];

export default function LaundryPage() {
  return (
    <main className="min-h-screen w-full bg-[#0f7f79] text-white">
      <section className="max-w-[1120px] mx-auto px-4 md:px-8 pt-14 md:pt-20 pb-10 md:pb-16">
        <h1
          className="text-[42px] md:text-[78px] font-extrabold uppercase leading-[0.97] tracking-[-1px]"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          Kumita sa tahimik
          <br />
          na weekdays
        </h1>

        <p
          className="mt-8 text-[28px] md:text-[40px] italic font-bold text-[#ffd033] leading-[1.1]"
          style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
        >
          Di na sayang ang weekdays sa laundry mo
        </p>

        <p
          className="mt-6 text-[28px] md:text-[42px] italic leading-[1.2]"
          style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
        >
          Offer weekday memberships with <strong>Memberry</strong>!
        </p>

        <div className="mt-10 bg-[#ffc600] text-black rounded-md px-6 py-5 md:px-8 md:py-6 shadow-[6px_8px_0px_0px_rgba(0,0,0,0.35)]">
          <p
            className="text-[34px] md:text-[56px] font-extrabold italic leading-[1.05]"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            ₱0 INVESTMENT NEEDED
          </p>
        </div>
      </section>

      <section className="bg-[#eff1f1] text-[#123634] py-10 md:py-14">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div className="bg-white rounded-xl border border-[#d7dddd] shadow-[0px_10px_20px_rgba(0,0,0,0.08)] p-6">
            <h2
              className="inline-block bg-[#0f7f79] text-white px-5 py-2 rounded-lg text-[22px] md:text-[30px] font-extrabold"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              3 EASY STEPS
            </h2>

            <ul className="mt-7 space-y-6">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4 items-start">
                  <span
                    className="size-11 shrink-0 rounded-full bg-[#ffc600] text-black flex items-center justify-center text-[24px] font-bold"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3
                      className="text-[30px] font-extrabold leading-[1.05]"
                      style={{ fontFamily: "var(--font-manrope)" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="mt-1 text-[23px] leading-[1.2] text-[#204846]"
                      style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-[#d7dddd] shadow-[0px_10px_20px_rgba(0,0,0,0.08)] p-6">
            <h2
              className="inline-block bg-[#0f7f79] text-white px-5 py-2 rounded-lg text-[22px] md:text-[30px] font-extrabold"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              KAMI NA SA SETUP!
            </h2>

            <p
              className="mt-6 text-[31px] font-extrabold"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Si Memberry na sa:
            </p>

            <ul className="mt-4 space-y-3">
              {inclusions.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 size-5 rounded-full border-2 border-[#0f7f79]" aria-hidden="true" />
                  <span
                    className="text-[28px] leading-[1.2]"
                    style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <p
              className="mt-6 text-[33px] font-extrabold underline"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              At zero investment for you
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[#b6c6c4] bg-[#0f7f79] py-8 md:py-10">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-[2fr_1.2fr] gap-6 md:gap-12 items-center">
          <div>
            <p
              className="text-[24px] md:text-[30px] leading-[1.15]"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
            >
              Let&apos;s offer your plan now!
            </p>
            <p
              className="text-[40px] md:text-[54px] font-extrabold mt-2 leading-none"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              0956-160-8383
            </p>
            <p
              className="text-[27px] md:text-[34px] mt-2"
              style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
            >
              getmemberry@gmail.com
            </p>
          </div>

          <div className="flex md:justify-end">
            <div className="flex flex-col gap-3">
              <a
                href="tel:+639561608383"
                className="inline-flex items-center justify-center bg-[#ffc600] text-black text-lg font-bold rounded px-6 py-3 hover:bg-[#ffd34b] transition-colors"
                style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
              >
                Call now
              </a>
              <a
                href="mailto:getmemberry@gmail.com"
                className="inline-flex items-center justify-center border border-white text-white text-lg font-bold rounded px-6 py-3 hover:bg-[rgba(255,255,255,0.12)] transition-colors"
                style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
              >
                Email us
              </a>
              <Link
                href="/#setup-call"
                className="inline-flex items-center justify-center border border-white text-white text-lg font-bold rounded px-6 py-3 hover:bg-[rgba(255,255,255,0.12)] transition-colors"
                style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
              >
                Fill setup form
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
