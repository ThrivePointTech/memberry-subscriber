"use client";

import { motion } from "framer-motion";
import Icon from "./Icon";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const CONSUMER_TABS = [
  { icon: "home" as const, label: "Home" },
  // { icon: "wallet" as const, label: "Cards" },
  // { icon: "search" as const, label: "Discover" },
  { icon: "scan" as const, label: "Scan" },
  { icon: "users" as const, label: "Profile" },
];

function ConsumerPhone() {
  const plans = [
    { tier: "Standard", price: "₱899/mo", name: "Monthly Glow", merchant: "Glow Studio", stamps: 7, total: 10, gold: false },
    { tier: "Premium", price: "₱2,499/mo", name: "VIP Care", merchant: "Serenity Spa", stamps: 3, total: 6, gold: true },
  ];
  return (
    <div
      className="relative overflow-hidden shrink-0"
      style={{
        width: 300,
        height: 612,
        background: "var(--ink)",
        border: "8px solid var(--ink)",
        borderRadius: 36,
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
      }}
    >
      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-white flex items-center justify-between px-4 z-10 text-[11px] font-semibold font-[family-name:var(--font-body)] text-[var(--ink)]">
        <span>9:41</span>
        <div className="flex gap-1 items-center">
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <rect x="0" y="4" width="2" height="6" rx="1" fill="var(--ink)" />
            <rect x="3" y="3" width="2" height="7" rx="1" fill="var(--ink)" />
            <rect x="6" y="1" width="2" height="9" rx="1" fill="var(--ink)" />
            <rect x="9" y="0" width="2" height="10" rx="1" fill="var(--ink)" />
          </svg>
          <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
            <rect x="0" y="1" width="14" height="8" rx="2" stroke="var(--ink)" strokeWidth="1.2" />
            <rect x="1.5" y="2.5" width="9" height="5" rx="1" fill="var(--ink)" />
            <path d="M15.5 3.5C16.3 3.8 17 4.4 17 5s-.7 1.2-1.5 1.5" stroke="var(--ink)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {/* Screen content */}
      <div className="absolute top-7 left-0 right-0 bottom-[60px] overflow-y-hidden" style={{ background: "var(--bg-app)" }}>
        <div className="px-4 pt-3 flex flex-col gap-3 h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-display)] font-semibold text-[22px] tracking-[-0.02em] text-[var(--ink)]">My memberships</span>
            <div
              className="w-8 h-8 rounded-full border border-[var(--border)] bg-white flex items-center justify-center relative"
            >
              <Icon name="bell" size={16} style={{ color: "var(--ink)" }} />
              <span className="absolute top-[6px] right-[7px] w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
            </div>
          </div>
          {/* Summary card */}
          <div
            className="rounded-xl px-4 py-[14px] text-white"
            style={{ background: "var(--ink)", backgroundImage: 'url("/assets/textures/dots.svg")', backgroundBlendMode: "soft-light" }}
          >
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[var(--teal-300)] font-[family-name:var(--font-body)]">Spending this month</span>
            <div className="font-[family-name:var(--font-display)] font-semibold text-[30px] tracking-[-0.02em] leading-none mt-1">
              ₱3,398<span className="text-[15px] text-[var(--teal-300)] font-medium"> / 2 plans</span>
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-[var(--teal-300)] font-[family-name:var(--font-body)]">
              <span>Next charge · Jun 1</span>
              <span style={{ color: "var(--gold)" }}>2 perks ready</span>
            </div>
          </div>
          {/* Plan cards */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[var(--fg-3)] font-[family-name:var(--font-body)]">Active</span>
            {plans.map((p) => (
              <div key={p.name} className="bg-white border border-[var(--border)] rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(20,47,45,0.06)" }}>
                {/* Ticket header */}
                <div
                  className="px-[14px] py-[10px] flex justify-between"
                  style={{ background: p.gold ? "var(--gold)" : "var(--teal)", color: p.gold ? "var(--ink)" : "#fff" }}
                >
                  <span className="text-[10px] font-semibold tracking-[0.06em] uppercase font-[family-name:var(--font-body)]">{p.tier}</span>
                  <span className="font-[family-name:var(--font-display)] font-semibold text-[13px]">{p.price}</span>
                </div>
                {/* Ticket tear line */}
                <div className="relative h-[10px] border-t border-dashed border-[rgba(20,47,45,0.15)] bg-white">
                  <div className="absolute -top-[5px] -left-[5px] w-[10px] h-[10px] rounded-full bg-[var(--bg-app)]" />
                  <div className="absolute -top-[5px] -right-[5px] w-[10px] h-[10px] rounded-full bg-[var(--bg-app)]" />
                </div>
                {/* Ticket body */}
                <div className="px-[14px] pb-3">
                  <div className="font-[family-name:var(--font-display)] font-semibold text-[16px] tracking-[-0.01em] text-[var(--ink)]">{p.name}</div>
                  <div className="text-[11px] text-[var(--fg-3)] font-[family-name:var(--font-body)] mt-[2px]">{p.merchant}</div>
                  <div className="h-1 rounded-full overflow-hidden mt-2" style={{ background: "var(--teal-100)" }}>
                    <div className="h-full rounded-full bg-[var(--teal)]" style={{ width: `${(p.stamps / p.total) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Tab bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-white border-t border-[var(--border)] flex items-center z-10">
        {CONSUMER_TABS.map((tab, i) => (
          <div key={tab.label} className="flex-1 flex flex-col items-center justify-center gap-[3px]">
            <Icon
              name={tab.icon}
              size={18}
              style={{ color: i === 0 ? "var(--teal)" : "var(--fg-3)" }}
            />
            <span
              className="text-[9px] font-[family-name:var(--font-body)] font-medium"
              style={{ color: i === 0 ? "var(--teal)" : "var(--fg-3)" }}
            >
              {tab.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const features = [
  { icon: "gem" as const, text: "Loyalty cards for every plan they join" },
  { icon: "bell" as const, text: "Push notifications when perks are ready" },
  { icon: "repeat" as const, text: "Billing & renewal handled automatically" },
  // { icon: "search" as const, text: "Discover new local businesses to support" },
];

export default function ReframeSection() {
  return (
    <section className="py-16 px-5 md:py-24 md:px-8 bg-[var(--ink)] border-t border-[var(--border)] relative overflow-hidden">
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'url("/assets/textures/grid.svg")' }}
      />
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center relative z-10">
        {/* Left content */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-col gap-6"
        >
          <motion.p
            variants={fadeUp}
            className="text-[13px] font-semibold tracking-[0.08em] uppercase text-[var(--teal-300)] font-[family-name:var(--font-body)] m-0"
          >
            Member app
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-[family-name:var(--font-display)] font-semibold text-[30px] md:text-[48px] leading-[1.05] tracking-[-0.02em] text-white m-0"
          >
            Your customers get an app they&apos;ll actually use.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-[17px] text-[var(--teal-300)] font-[family-name:var(--font-body)] m-0 leading-relaxed"
          >
            Every plan you create appears in your customers&apos; Memberry app. They track stamps, redeem perks, and manage billing, without ever calling you.
          </motion.p>

          {/* Feature list */}
          <motion.div variants={stagger} className="flex flex-col gap-3">
            {features.map((f) => (
              <motion.div
                key={f.text}
                variants={fadeUp}
                className="flex items-center gap-3.5"
              >
                <span
                  className="inline-flex items-center justify-center w-9 h-9 shrink-0 text-[var(--teal-300)]"
                  style={{ borderRadius: 10, background: "rgba(255,255,255,0.08)" }}
                >
                  <Icon name={f.icon} size={18} />
                </span>
                <span className="text-[15px] text-white font-[family-name:var(--font-body)]">
                  {f.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Store buttons */}
          <motion.div variants={fadeUp} className="flex gap-3 mt-2">
            {["iOS App Store", "Google Play"].map((label) => (
              <button
                key={label}
                className="px-[18px] py-[10px] rounded-lg text-white text-[14px] font-semibold font-[family-name:var(--font-body)] cursor-pointer border-0"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: phone */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center relative"
        >
          <div className="absolute w-[320px] h-[320px] rounded-full z-0" style={{ background: "var(--teal)", opacity: 0.15 }} />
          <div className="scale-[0.82] md:scale-100 origin-top relative z-10">
            <ConsumerPhone />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
