"use client";

import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const items = [
  { heading: "Built for regulars.", sub: "Your best customers deserve more than a punch card.", gold: false },
  { heading: "Zero monthly fees.", sub: "We only earn when your members pay you.", gold: true },
  { heading: "Live in minutes.", sub: "Create a plan and start accepting members today.", gold: false },
  { heading: "Real app. Real loyalty.", sub: "iOS & Android for your members, out of the box.", gold: false },
];

export default function WhySection() {
  return (
    <section className="bg-[var(--ink)] py-14 px-5 md:py-20 md:px-8 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{ backgroundImage: 'url("/assets/textures/grid.svg")' }}
      />
      <div className="max-w-[1200px] mx-auto relative z-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.heading}
              variants={fadeUp}
              className={[
                "flex flex-col gap-2 py-2 px-5 md:px-8",
                i % 2 === 1 ? "border-l border-l-[rgba(255,255,255,0.08)] md:border-l-0" : "",
                i > 0 ? "md:border-l md:border-l-[rgba(255,255,255,0.08)]" : "",
                i >= 2 ? "pt-10 md:pt-2" : "",
              ].filter(Boolean).join(" ")}
            >
              <div
                className="font-[family-name:var(--font-display)] font-semibold text-[22px] md:text-[28px] tracking-[-0.03em] leading-snug"
                style={{ color: item.gold ? "var(--gold)" : "#fff" }}
              >
                {item.heading}
              </div>
              <p className="text-[13px] text-[var(--teal-300)] font-[family-name:var(--font-body)] leading-[1.5] m-0">
                {item.sub}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
