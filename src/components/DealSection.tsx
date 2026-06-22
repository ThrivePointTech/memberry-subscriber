"use client";

import React from "react";
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

const FREE_ITEMS = [
  {
    icon: "layers" as const,
    label: "Posters & QR Code",
    sub: "Print-ready materials to promote your plans in-store",
  },
  {
    icon: "scan" as const,
    label: "Mobile App for Customers",
    sub: "iOS & Android app so members can track perks and billing",
  },
  {
    icon: "bar-chart" as const,
    label: "Merchant Dashboard",
    sub: "Track members, revenue, and plan performance in one place",
  },
  {
    icon: "repeat" as const,
    label: "Automated Billing & Payout",
    sub: "Recurring charges and payouts handled without lifting a finger",
  },
];

const tiers = [
  {
    pct: "10%",
    label: "On each membership fee",
    note: "Only pay when members pay you",
    tag: "Most common",
    dark: true,
    btn: { text: "Contact us for pricing", style: "gold" as const },
    bullets: [
      "Unlimited members",
      "Multiple plan tiers & perks",
      "Stamp cards & rewards",
      "Cohort analytics",
      "Email & push",
    ],
  },
  {
    pct: "Custom",
    label: "High-volume rate",
    note: "For established membership programs",
    tag: "High volume",
    dark: false,
    btn: { text: "Contact us for pricing", style: "teal" as const },
    bullets: [
      "Everything included",
      "Multiple locations",
      "API & webhooks",
      "Priority support",
      "Custom branding",
    ],
  },
];

const explainer = [
  {
    icon: "users" as const,
    label: "Members pay you",
    value: "₱899/mo each",
    iconBg: "var(--teal-100)",
    iconColor: "var(--teal)",
  },
  {
    icon: "percent" as const,
    label: "Memberry takes",
    value: "10% commission",
    iconBg: "var(--ink)",
    iconColor: "#fff",
  },
  {
    icon: "wallet" as const,
    label: "You keep",
    value: "₱809.10/member",
    iconBg: "var(--gold-100)",
    iconColor: "var(--gold-700)",
  },
];

export default function DealSection() {
  return (
    <section
      id="pricing"
      className="py-16 px-5 md:py-24 md:px-8 bg-[var(--bg-app)] border-t border-[var(--border)]"
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-[var(--teal)] font-[family-name:var(--font-body)] mb-4">
              Pricing
            </p>
            <h2 className="font-[family-name:var(--font-display)] font-semibold text-[32px] md:text-[48px] leading-[1.1] tracking-[-0.03em] text-[var(--ink)] mb-4">
              Pay as you grow.
            </h2>
            <p className="text-[17px] text-[var(--fg-2)] font-[family-name:var(--font-body)] max-w-[520px] mx-auto m-0">
              No monthly fees. No setup costs. Just a small percentage of what
              your members pay you. We win when you win.
            </p>
          </motion.div>

          {/* Commission explainer */}
          <motion.div
            variants={fadeUp}
            className="relative bg-white border border-[var(--border)] rounded-xl overflow-hidden p-8 md:p-10 mb-8 max-w-[860px] mx-auto"
          >
            {/* Grid texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-50"
              style={{ backgroundImage: 'url("/assets/textures/grid.svg")' }}
            />
            <div className="relative z-10">
              <div className="flex flex-col md:grid md:[grid-template-columns:1fr_auto_1fr_auto_1fr] items-center gap-6 md:gap-6">
                {explainer.map((item, i) => (
                  <React.Fragment key={item.label}>
                    <div className="flex flex-col items-center gap-[10px] text-center">
                      <div
                        className="w-[52px] h-[52px] flex items-center justify-center"
                        style={{
                          borderRadius: 14,
                          background: item.iconBg,
                          color: item.iconColor,
                        }}
                      >
                        <Icon name={item.icon} size={24} />
                      </div>
                      <span className="text-[12px] font-semibold tracking-[0.06em] uppercase text-[var(--fg-3)] font-[family-name:var(--font-body)]">
                        {item.label}
                      </span>
                      <span className="font-[family-name:var(--font-display)] font-semibold text-[22px] tracking-[-0.02em] text-[var(--ink)]">
                        {item.value}
                      </span>
                    </div>
                    {i < 2 && (
                      <div className="hidden md:flex justify-center text-[var(--border-strong)]">
                        <Icon name="arrow-right" size={28} strokeWidth={1.5} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-center text-[13px] text-[var(--fg-3)] font-[family-name:var(--font-body)] mt-6 mb-0 border-t border-[var(--border)] pt-5">
                Example: 100 members at ₱899/mo = ₱89,900 revenue · ₱8,999 to
                Memberry · ₱80,901 in your pocket
              </p>
            </div>
          </motion.div>

          {/* What's free */}
          <motion.div variants={fadeUp} className="mb-8">
            <div className="bg-white border border-[var(--border)] rounded-xl p-6 md:p-8 max-w-[860px] mx-auto">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[var(--teal)] font-[family-name:var(--font-body)]">
                  Always free to get started
                </span>
                <span className="text-[12px] font-semibold text-[var(--fg-3)] font-[family-name:var(--font-body)]">
                  — no setup fee, no investment required
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FREE_ITEMS.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span
                      className="w-9 h-9 shrink-0 flex items-center justify-center rounded-[10px]"
                      style={{
                        background: "var(--teal-100)",
                        color: "var(--teal)",
                      }}
                    >
                      <Icon name={item.icon} size={18} />
                    </span>
                    <div>
                      <div className="font-[family-name:var(--font-body)] font-semibold text-[14px] text-[var(--ink)]">
                        {item.label}
                      </div>
                      <div className="font-[family-name:var(--font-body)] text-[13px] text-[var(--fg-3)] mt-0.5">
                        {item.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tier cards */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7 max-w-[860px] mx-auto"
          >
            {tiers.map((tier) => (
              <motion.div
                key={tier.pct}
                variants={fadeUp}
                className="rounded-xl p-8 flex flex-col gap-4 relative overflow-hidden"
                style={{
                  background: tier.dark ? "var(--ink)" : "#fff",
                  border: `1px solid ${tier.dark ? "var(--ink)" : "var(--border)"}`,
                  boxShadow: tier.dark
                    ? "0 8px 32px rgba(20,47,45,0.15)"
                    : "0 1px 4px rgba(20,47,45,0.05)",
                }}
              >
                {/* Dots texture on dark card */}
                {tier.dark && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40"
                    style={{
                      backgroundImage: 'url("/assets/textures/dots.svg")',
                    }}
                  />
                )}
                <div className="relative flex flex-col gap-4">
                  {/* Tag */}
                  {tier.tag && (
                    <span
                      className="self-start px-[10px] py-1 text-[11px] font-bold tracking-[0.08em] uppercase rounded-full font-[family-name:var(--font-body)]"
                      style={
                        tier.dark
                          ? { background: "var(--gold)", color: "var(--ink)" }
                          : {
                              background: "var(--teal-100)",
                              color: "var(--teal)",
                            }
                      }
                    >
                      {tier.tag}
                    </span>
                  )}
                  {/* Percentage + labels */}
                  <div>
                    <div
                      className="font-[family-name:var(--font-display)] font-semibold text-[64px] leading-none tracking-[-0.03em]"
                      style={{ color: tier.dark ? "#fff" : "var(--ink)" }}
                    >
                      {tier.pct}
                    </div>
                    <span
                      className="text-[14px] font-[family-name:var(--font-body)] block mt-1"
                      style={{
                        color: tier.dark ? "var(--teal-300)" : "var(--fg-2)",
                      }}
                    >
                      {tier.label}
                    </span>
                    <span
                      className="text-[13px] font-[family-name:var(--font-body)] block mt-1.5"
                      style={{
                        color: tier.dark
                          ? "rgba(255,255,255,0.5)"
                          : "var(--fg-3)",
                      }}
                    >
                      {tier.note}
                    </span>
                  </div>
                  {/* Button */}
                  <a
                    href="#contact"
                    className="block text-center py-3 px-[18px] rounded-lg text-[14px] font-semibold font-[family-name:var(--font-body)] no-underline"
                    style={
                      tier.btn.style === "gold"
                        ? { background: "var(--gold)", color: "var(--ink)" }
                        : { background: "var(--teal)", color: "#fff" }
                    }
                  >
                    {tier.btn.text}
                  </a>
                  {/* Divider */}
                  <div
                    className="my-1"
                    style={{
                      borderTop: `1px solid ${tier.dark ? "rgba(255,255,255,0.12)" : "var(--border)"}`,
                    }}
                  />
                  {/* Feature bullets */}
                  <div className="flex flex-col gap-[10px]">
                    {tier.bullets.map((b) => (
                      <span
                        key={b}
                        className="flex items-center gap-[10px] text-[14px] font-[family-name:var(--font-body)]"
                        style={{ color: tier.dark ? "#fff" : "var(--fg-1)" }}
                      >
                        <span
                          className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: tier.dark
                              ? "var(--gold-100)"
                              : "var(--teal-100)",
                            color: tier.dark
                              ? "var(--gold-700)"
                              : "var(--teal)",
                          }}
                        >
                          <Icon name="check" size={11} strokeWidth={3} />
                        </span>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer note */}
          <motion.p
            variants={fadeUp}
            className="text-center text-[14px] text-[var(--fg-3)] font-[family-name:var(--font-body)] mt-0 mb-0"
          >
            Volume discounts and custom contracts available for 500+ member
            programs.{" "}
            <a
              href="#contact"
              className="text-[var(--teal)] font-semibold no-underline"
            >
              Talk to us →
            </a>
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
