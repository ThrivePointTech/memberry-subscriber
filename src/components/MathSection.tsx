"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const metrics = [
  {
    value: "$2.4M",
    label: "Recurring revenue across our merchants — last month alone",
    color: "var(--white)",
  },
  {
    value: "140k+",
    label: "Active members redeeming perks every week",
    color: "var(--gold)",
  },
  {
    value: "2.8%",
    label: "Average churn — about a third of the industry norm",
    color: "var(--white)",
  },
  {
    value: "11 min",
    label: "Median time to launch your first plan",
    color: "var(--white)",
  },
];

export default function MathSection() {
  return (
    <section className="bg-[var(--ink)] text-white py-14 px-5 md:py-20 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4"
        >
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              variants={fadeUp}
              className={[
                "px-5 md:px-10 py-2",
                // Mobile: odd-indexed items (2nd, 4th) get left border
                i % 2 === 1 ? "border-l border-l-[rgba(255,255,255,0.08)] md:border-l-0" : "",
                // Desktop: all except first get left border
                i > 0 ? "md:border-l md:border-l-[rgba(255,255,255,0.08)]" : "",
                // Mobile: bottom two rows get top padding
                i >= 2 ? "pt-10 md:pt-2" : "",
              ].filter(Boolean).join(" ")}
            >
              <div
                className="font-[family-name:var(--font-display)] font-semibold text-[36px] md:text-[56px] tracking-[-0.04em] leading-none mb-4"
                style={{ color: m.color }}
              >
                {m.value}
              </div>
              <p className="text-[15px] leading-[1.55] text-[rgba(255,255,255,0.6)] m-0 font-[family-name:var(--font-body)]">
                {m.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
