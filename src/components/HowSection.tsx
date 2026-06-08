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

function CheckBullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-[15px] text-[var(--fg-2)] font-[family-name:var(--font-body)] list-none">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--teal-100)] text-[var(--teal)] shrink-0 mt-[1px]">
        <Icon name="check" size={11} strokeWidth={2.5} />
      </span>
      {text}
    </li>
  );
}

const cards = [
  {
    icon: "repeat" as const,
    iconBg: "var(--teal-100)",
    iconColor: "var(--teal)",
    title: "Plans, not promotions",
    body: 'Set a price, set the perks. We handle billing, renewals, and the awkward "your card expired" emails.',
    bullets: [
      "Recurring billing, handled",
      "Tiered & flat-rate plans",
      "Auto-retry on failure",
    ],
  },
  {
    icon: "gem" as const,
    iconBg: "var(--gold-100)",
    iconColor: "var(--gold-700)",
    title: "Perks they remember",
    body: "Stamps, rewards, members-only drops. Small touches that make an ₱899 plan feel like a ₱3,000 one.",
    bullets: [
      "Stamp cards & punches",
      "Tier-gated rewards",
      "Push notifications",
    ],
  },
  {
    icon: "trending-up" as const,
    iconBg: "var(--teal-100)",
    iconColor: "var(--teal)",
    title: "Numbers you can count on",
    body: "MRR, churn, lifetime value. The metrics that matter, plain English, no toggles, no PhDs.",
    bullets: [
      "Live MRR & churn",
      "Cohort retention",
      "Weekly digest email",
    ],
  },
];

export default function HowSection() {
  return (
    <section id="features" className="py-16 px-5 md:py-24 md:px-8 bg-[var(--bg-app)]">
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
              Built for small business
            </p>
            <h2 className="font-[family-name:var(--font-display)] font-semibold text-[32px] md:text-[48px] leading-[1.1] tracking-[-0.03em] text-[var(--ink)] mx-auto mb-5 max-w-[720px]">
              Everything you need to turn one-time customers into monthly ones.
            </h2>
            <p className="text-[17px] text-[var(--fg-2)] font-[family-name:var(--font-body)] m-0">
              Launch a plan in minutes. Watch the numbers do their thing.
            </p>
          </motion.div>

          {/* Cards */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {cards.map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                className="bg-white border border-[var(--border)] rounded-[10px] p-7 shadow-[0_1px_4px_rgba(20,47,45,0.05)] flex flex-col gap-3.5"
              >
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-[10px]"
                  style={{ background: card.iconBg, color: card.iconColor }}
                >
                  <Icon name={card.icon} size={20} />
                </div>
                <h3 className="font-[family-name:var(--font-display)] font-semibold text-[18px] text-[var(--ink)] m-0 tracking-[-0.02em]">
                  {card.title}
                </h3>
                <p className="text-sm text-[var(--fg-2)] font-[family-name:var(--font-body)] leading-[1.55] m-0">
                  {card.body}
                </p>
                <ul className="m-0 p-0 flex flex-col gap-2.5">
                  {card.bullets.map((b) => (
                    <CheckBullet key={b} text={b} />
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
