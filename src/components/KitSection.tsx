"use client";

import { motion } from "framer-motion";
import Icon from "./Icon";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── Phone Frame ─── */
const TABS = [
  { icon: "home" as const, label: "Home" },
  { icon: "bar-chart" as const, label: "Analytics" },
  { icon: "scan" as const, label: "Scan" },
  { icon: "users" as const, label: "Members" },
  // { icon: "store" as const, label: "Plans" },
  { icon: "settings" as const, label: "Settings" },
];

function PhoneFrame({ children, activeTab = 0 }: { children: React.ReactNode; activeTab?: number }) {
  return (
    <div
      className="relative overflow-hidden shrink-0"
      style={{
        width: 300,
        height: 612,
        background: "var(--ink)",
        border: "8px solid var(--ink)",
        borderRadius: 36,
        boxShadow: "0 24px 64px rgba(20,47,45,0.18), 0 4px 12px rgba(20,47,45,0.10)",
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
      <div className="absolute top-7 left-0 right-0 bottom-[60px] bg-white overflow-y-hidden">
        {children}
      </div>
      {/* Tab bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-white border-t border-[var(--border)] flex items-center z-10">
        {TABS.map((tab, i) => (
          <div key={tab.label} className="flex-1 flex flex-col items-center justify-center gap-[3px]">
            <Icon
              name={tab.icon}
              size={18}
              style={{ color: i === activeTab ? "var(--teal)" : "var(--fg-3)" }}
            />
            <span
              className="text-[9px] font-[family-name:var(--font-body)] font-medium"
              style={{ color: i === activeTab ? "var(--teal)" : "var(--fg-3)" }}
            >
              {tab.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Dashboard Screen ─── */
function DashboardScreen() {
  return (
    <div className="h-full flex flex-col overflow-y-hidden" style={{ background: "#F5F8F7" }}>
      {/* Header */}
      <div className="px-4 pt-[14px] pb-[10px]">
        <div className="text-[10px] font-semibold tracking-[0.06em] uppercase text-[var(--fg-3)] font-[family-name:var(--font-body)] mb-[2px]">Good morning</div>
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-display)] font-semibold text-[20px] text-[var(--ink)] tracking-[-0.02em]">Glow Studio</span>
          <div
            className="w-9 h-9 bg-[var(--teal)] text-white flex items-center justify-center font-[family-name:var(--font-display)] font-bold text-[15px]"
            style={{ borderRadius: 10 }}
          >D</div>
        </div>
      </div>
      {/* MRR card */}
      <div className="mx-3 mb-2 bg-[var(--ink)] text-white px-4 py-[14px]" style={{ borderRadius: 14 }}>
        <div className="text-[10px] font-semibold tracking-[0.06em] uppercase text-[rgba(255,255,255,0.5)] font-[family-name:var(--font-body)] mb-[6px]">Monthly recurring revenue</div>
        <div className="font-[family-name:var(--font-display)] font-bold text-[36px] tracking-[-0.04em] leading-none mb-[10px]">₱457,080</div>
        <div className="flex items-center gap-3 text-[11px] text-[rgba(255,255,255,0.6)] font-[family-name:var(--font-body)]">
          <span className="flex items-center gap-1">
            <Icon name="users" size={11} style={{ color: "rgba(255,255,255,0.6)" }} />
            320 members
          </span>
          <span className="flex items-center gap-1" style={{ color: "var(--teal-300)" }}>
            <Icon name="trending-up" size={11} style={{ color: "var(--teal-300)" }} />
            +12 this week
          </span>
          <span className="flex items-center gap-1">
            <Icon name="zap" size={11} style={{ color: "rgba(255,255,255,0.6)" }} />
            2.1% churn
          </span>
        </div>
      </div>
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-2 mx-3 mb-2">
        <div className="bg-white border border-[var(--border)] rounded-lg px-3 py-[10px]">
          <div className="font-[family-name:var(--font-display)] font-bold text-[22px] tracking-[-0.03em]" style={{ color: "var(--gold-700)" }}>84</div>
          <div className="text-[10px] text-[var(--fg-3)] font-[family-name:var(--font-body)] leading-[1.3] mt-[2px]">Perks redeemed</div>
          <div className="text-[10px] font-semibold text-[var(--fg-3)] font-[family-name:var(--font-body)]">today</div>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-lg px-3 py-[10px]">
          <div className="font-[family-name:var(--font-display)] font-bold text-[22px] text-[var(--ink)] tracking-[-0.03em]">12</div>
          <div className="text-[10px] text-[var(--fg-3)] font-[family-name:var(--font-body)] leading-[1.3] mt-[2px]">New members</div>
          <div className="text-[10px] font-semibold text-[var(--fg-3)] font-[family-name:var(--font-body)]">this week</div>
        </div>
      </div>
      {/* Active plans */}
      <div className="mx-3 bg-white border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="px-3 py-[10px] border-b border-[var(--border)] text-[10px] font-semibold text-[var(--fg-3)] font-[family-name:var(--font-body)] uppercase tracking-[0.06em]">Active plans</div>
        {[
          { name: "Monthly Glow", info: "214 members · ₱899/mo", dot: "var(--teal)" },
          { name: "VIP Care", info: "106 members · ₱2,499/mo", dot: "var(--gold)" },
        ].map((p, i) => (
          <div key={p.name} className={`flex items-center justify-between px-3 py-[10px] ${i === 0 ? "border-b border-[var(--border)]" : ""}`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.dot }} />
              <div>
                <div className="font-[family-name:var(--font-display)] font-semibold text-[13px] text-[var(--ink)] tracking-[-0.02em]">{p.name}</div>
                <div className="text-[10px] text-[var(--fg-3)] font-[family-name:var(--font-body)]">{p.info}</div>
              </div>
            </div>
            <Icon name="arrow-right" size={14} style={{ color: "var(--fg-3)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Scan Screen ─── */
const QR_GRID = [
  1,1,1,0,1,1,1,
  1,0,1,0,1,0,1,
  1,1,1,0,1,1,1,
  0,1,0,1,0,1,0,
  1,0,0,1,1,0,1,
  0,1,1,0,0,1,0,
  1,1,0,1,0,0,1,
];

function ScanScreen() {
  return (
    <div className="h-full bg-white flex flex-col">
      {/* Teal header */}
      <div className="bg-[var(--teal)] px-4 pt-[14px] pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Icon name="arrow-left" size={14} style={{ color: "white" }} />
          </div>
          <span className="font-[family-name:var(--font-body)] text-[13px] text-white opacity-80">Plans</span>
        </div>
        <div className="font-[family-name:var(--font-display)] font-semibold text-[26px] text-white tracking-[-0.02em] leading-tight mb-1">Monthly Glow</div>
        <div className="text-[11px] text-[rgba(255,255,255,0.75)] font-[family-name:var(--font-body)]">Standard · ₱899/mo · 214 members</div>
      </div>
      {/* QR area */}
      <div className="mx-4 mt-4 border-2 border-dashed border-[var(--border-strong)] rounded-xl flex flex-col items-center justify-center gap-3 py-5">
        {/* 7×7 QR pixel grid */}
        <div
          className="p-[10px]"
          style={{ background: "var(--ink)", borderRadius: 8 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 10px)",
              gap: 2,
            }}
          >
            {QR_GRID.map((cell, i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: cell ? "white" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
        <div className="text-[11px] text-[var(--fg-3)] font-[family-name:var(--font-body)]">Point camera at member&apos;s code</div>
      </div>
      {/* Last check-in */}
      <div className="mx-4 mt-3">
        <div className="text-[10px] font-semibold text-[var(--fg-3)] font-[family-name:var(--font-body)] tracking-[0.06em] uppercase mb-2">Last check-in</div>
        <div className="bg-[#F5F8F7] border border-[var(--border)] rounded-lg px-3 py-[10px]">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-9 h-9 bg-[var(--teal)] text-white flex items-center justify-center font-[family-name:var(--font-display)] font-bold text-[15px] shrink-0"
              style={{ borderRadius: 10 }}
            >A</div>
            <div className="flex-1 min-w-0">
              <div className="font-[family-name:var(--font-display)] font-semibold text-[13px] text-[var(--ink)] tracking-[-0.02em]">Alex Rivera</div>
              <div className="text-[10px] text-[var(--fg-3)] font-[family-name:var(--font-body)]">Monthly Glow · Stamp 8/10</div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-[var(--teal-100)] text-[var(--teal)] px-2 py-[3px] rounded-[10px] font-[family-name:var(--font-body)] shrink-0">
              <Icon name="check" size={9} strokeWidth={2.5} />
              Stamped
            </span>
          </div>
        </div>
      </div>
      {/* Button */}
      <div className="mx-4 mt-3 py-[10px] bg-[var(--teal)] rounded-lg flex items-center justify-center gap-2">
        <Icon name="users" size={14} style={{ color: "white" }} />
        <span className="text-[12px] font-semibold text-white font-[family-name:var(--font-body)]">Search members manually</span>
      </div>
    </div>
  );
}

/* ─── Analytics Screen ─── */
function AnalyticsScreen() {
  const bars = [62, 75, 58, 88, 71, 95, 84];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="h-full flex flex-col overflow-y-hidden" style={{ background: "#F5F8F7" }}>
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-[var(--border)] flex items-center justify-between">
        <span className="font-[family-name:var(--font-display)] font-semibold text-[15px] text-[var(--ink)] tracking-[-0.02em]">Analytics</span>
        <span className="text-[10px] font-semibold bg-[var(--teal-100)] text-[var(--teal)] px-2 py-[3px] rounded-[10px] font-[family-name:var(--font-body)]">This month</span>
      </div>
      {/* MRR card */}
      <div className="mx-3 mt-3 bg-white border border-[var(--border)] rounded-[10px] px-[14px] py-3">
        <div className="flex items-center justify-between mb-[10px]">
          <div>
            <div className="text-[10px] text-[var(--fg-3)] font-[family-name:var(--font-body)] mb-[2px]">MRR</div>
            <div className="font-[family-name:var(--font-display)] font-bold text-[24px] tracking-[-0.04em] text-[var(--ink)]">₱457,080</div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-[3px] rounded-[10px] font-[family-name:var(--font-body)]" style={{ background: "#DCFCE7", color: "#16A34A" }}>+18%</span>
        </div>
        {/* Bar chart 60px tall with day labels */}
        <div className="flex items-end gap-[3px]" style={{ height: 60 }}>
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-[3px]">
              <div
                className="w-full rounded-sm"
                style={{
                  height: `${(h / 100) * 52}px`,
                  background: i === bars.length - 1 ? "var(--teal)" : "var(--teal-100)",
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-[3px] mt-[3px]">
          {days.map((d, i) => (
            <div key={i} className="flex-1 text-center text-[8px] text-[var(--fg-3)] font-[family-name:var(--font-body)]">{d}</div>
          ))}
        </div>
      </div>
      {/* Retention / Churn */}
      <div className="grid grid-cols-2 gap-2 mx-3 my-2">
        <div className="bg-white border border-[var(--border)] rounded-lg px-3 py-[10px]">
          <div className="text-[10px] text-[var(--fg-3)] font-[family-name:var(--font-body)] mb-[2px]">Retention</div>
          <div className="font-[family-name:var(--font-display)] font-bold text-[18px] text-[var(--teal)] tracking-[-0.03em]">97.9%</div>
          <div className="text-[9px] font-[family-name:var(--font-body)] mt-[2px]" style={{ color: "#16A34A" }}>+0.4% vs last month</div>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-lg px-3 py-[10px]">
          <div className="text-[10px] text-[var(--fg-3)] font-[family-name:var(--font-body)] mb-[2px]">Churn</div>
          <div className="font-[family-name:var(--font-display)] font-bold text-[18px] text-[var(--ink)] tracking-[-0.03em]">2.1%</div>
          <div className="text-[9px] font-[family-name:var(--font-body)] mt-[2px]" style={{ color: "#16A34A" }}>+0.4% vs last month</div>
        </div>
      </div>
      {/* Revenue by plan */}
      <div className="mx-3 bg-white border border-[var(--border)] rounded-lg px-3 py-[10px]">
        <div className="text-[10px] font-semibold text-[var(--fg-3)] font-[family-name:var(--font-body)] uppercase tracking-[0.06em] mb-[10px]">Revenue by plan</div>
        {[
          { name: "Monthly Glow", mrr: "₱192,186", pct: 67, color: "var(--teal)" },
          { name: "VIP Care", mrr: "₱264,894", pct: 33, color: "var(--gold)" },
        ].map((p) => (
          <div key={p.name} className="mb-2">
            <div className="flex justify-between text-[10px] text-[var(--fg-2)] font-[family-name:var(--font-body)] mb-[3px]">
              <span>{p.name}</span>
              <span>{p.mrr}</span>
            </div>
            <div className="h-1.5 bg-[var(--border)] rounded-[3px] overflow-hidden">
              <div className="h-full rounded-[3px]" style={{ width: `${p.pct}%`, background: p.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Content bullets ─── */
function ContentBullet({ text, gold }: { text: string; gold?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-[15px] text-[var(--fg-2)] font-[family-name:var(--font-body)] list-none">
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5"
        style={{
          background: gold ? "var(--gold-100)" : "var(--teal-100)",
          color: gold ? "var(--gold-700)" : "var(--teal)",
        }}
      >
        <Icon name="check" size={11} strokeWidth={2.5} />
      </span>
      {text}
    </li>
  );
}

const rows = [
  {
    eyebrow: "Your business at a glance",
    eyebrowColor: "var(--teal)",
    h3: "MRR, members, perks. All in your pocket.",
    body: "See your recurring revenue, member count, and key metrics the moment you open the app. No digging through reports.",
    bullets: ["Live MRR updates", "Member growth tracking", "Perk redemption summary"],
    gold: false,
    screen: <DashboardScreen />,
    activeTab: 0,
    accentBg: "var(--teal-100)",
    flip: false,
  },
  {
    eyebrow: "Check-in & stamp",
    eyebrowColor: "var(--gold-700)",
    h3: "Scan a member in three seconds flat.",
    body: "Point the scanner, confirm the plan, done. Stamp cards update instantly and the member gets a notification.",
    bullets: ["QR code scan", "Instant stamp update", "Manual member search"],
    gold: true,
    screen: <ScanScreen />,
    activeTab: 2,
    accentBg: "var(--gold-100)",
    flip: true,
  },
  {
    eyebrow: "Analytics",
    eyebrowColor: "var(--teal)",
    h3: "Know your retention before the end of the month.",
    body: "Track MRR trends, churn rates, and revenue by plan. Weekly digest emails keep you posted even when you're away from the app.",
    bullets: ["MRR trend charts", "Cohort retention view", "Weekly digest email"],
    gold: false,
    screen: <AnalyticsScreen />,
    activeTab: 1,
    accentBg: "var(--teal-100)",
    flip: false,
  },
];

export default function KitSection() {
  return (
    <section id="merchant-app" className="py-16 px-5 md:py-24 md:px-8 bg-white">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-20"
        >
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-[var(--teal)] font-[family-name:var(--font-body)] mb-4">
            Merchant app
          </p>
          <h2 className="font-[family-name:var(--font-display)] font-semibold text-[30px] md:text-[48px] leading-[1.1] tracking-[-0.03em] text-[var(--ink)] mx-auto mb-4 max-w-[600px] whitespace-pre-line">
            {"Run your membership\nprogram from anywhere."}
          </h2>
          <p className="text-[17px] text-[var(--fg-2)] font-[family-name:var(--font-body)]">iOS &amp; Android.</p>
        </motion.div>

        {/* Alternating rows */}
        <div className="flex flex-col gap-14 md:gap-24">
          {rows.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center"
            >
              {/* Phone side — always first (top) on mobile */}
              <div className={`flex items-center justify-center relative ${row.flip ? "md:order-2" : "md:order-1"} order-1`}>
                {/* Accent circle — hidden on mobile */}
                <div
                  className="hidden md:block absolute w-[280px] h-[280px] rounded-full z-0"
                  style={{ background: row.accentBg }}
                />
                <div className="scale-[0.82] md:scale-100 origin-top relative z-10">
                  <PhoneFrame activeTab={row.activeTab}>{row.screen}</PhoneFrame>
                </div>
              </div>

              {/* Content side */}
              <div className={`${row.flip ? "md:order-1" : "md:order-2"} order-2`}>
                <p
                  className="text-[13px] font-semibold tracking-[0.08em] uppercase font-[family-name:var(--font-body)] mb-4"
                  style={{ color: row.eyebrowColor }}
                >
                  {row.eyebrow}
                </p>
                <h3 className="font-[family-name:var(--font-display)] font-semibold text-2xl md:text-[32px] leading-[1.15] tracking-[-0.03em] text-[var(--ink)] mb-4">
                  {row.h3}
                </h3>
                <p className="text-[17px] text-[var(--fg-2)] font-[family-name:var(--font-body)] leading-relaxed mb-6">
                  {row.body}
                </p>
                <ul className="m-0 p-0 flex flex-col gap-2.5">
                  {row.bullets.map((b) => (
                    <ContentBullet key={b} text={b} gold={row.gold} />
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
