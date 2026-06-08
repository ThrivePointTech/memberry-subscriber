import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchant Portal - Memberry",
};

export default function MerchantPortalPage() {
  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#001a18] px-4 md:px-8 py-16">
      <div className="max-w-[840px] mx-auto">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-manrope)" }}>
          Merchant Portal Access
        </h1>
        <p className="mt-6 text-base leading-7" style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}>
          Need portal access or onboarding support? Contact the setup team and we will activate your merchant login.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="tel:+639561608383"
            className="inline-flex items-center justify-center px-5 py-3 rounded bg-[#001a18] text-[#ffe08f] font-semibold"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          >
            Call 0956-160-8383
          </a>
          <a
            href="mailto:getmemberry@gmail.com"
            className="inline-flex items-center justify-center px-5 py-3 rounded border border-[#001a18] text-[#001a18] font-semibold"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          >
            Email getmemberry@gmail.com
          </a>
        </div>
      </div>
    </main>
  );
}
