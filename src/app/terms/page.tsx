import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Memberry",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#001a18] px-4 md:px-8 py-16">
      <div className="max-w-[840px] mx-auto">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-manrope)" }}>
          Terms of Service
        </h1>
        <p className="mt-6 text-base leading-7" style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}>
          By using Memberry services, merchants agree to provide accurate business information and comply with lawful billing,
          redemption, and customer handling practices.
        </p>
        <p className="mt-4 text-base leading-7" style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}>
          Questions about these terms can be sent to getmemberry@gmail.com.
        </p>
      </div>
    </main>
  );
}
