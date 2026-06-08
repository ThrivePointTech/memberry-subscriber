import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Memberry",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#001a18] px-4 md:px-8 py-16">
      <div className="max-w-[840px] mx-auto">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-manrope)" }}>
          Privacy Policy
        </h1>
        <p className="mt-6 text-base leading-7" style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}>
          Memberry collects only the information needed to activate and support merchant membership plans, customer billing,
          and service communications. We do not sell personal information.
        </p>
        <p className="mt-4 text-base leading-7" style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}>
          For privacy concerns and requests, email getmemberry@gmail.com.
        </p>
      </div>
    </main>
  );
}
