"use client";

import { motion } from "framer-motion";
import Icon from "./Icon";

const dotGridBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(20%2C47%2C45%2C0.08)'/%3E%3C/svg%3E")`;

function PlanCard({
  top,
  right,
  rotate,
  headerColor,
  title,
  price,
  perks,
  label,
}: {
  top: number;
  right: number;
  rotate: number;
  headerColor: string;
  title: string;
  price: string;
  perks: string;
  label: string;
  labelColor: string;
}) {
  return (
    <div
      className="absolute w-[320px] bg-white rounded-[10px] border border-[var(--border)] overflow-hidden shadow-[0_4px_16px_rgba(20,47,45,0.10),0_1px_4px_rgba(20,47,45,0.06)]"
      style={{ top, right, transform: `rotate(${rotate}deg)` }}
    >
      {/* Header strip */}
      <div
        className="px-[18px] py-[14px] flex items-center justify-between"
        style={{ background: headerColor }}
      >
        <span
          className="font-[family-name:var(--font-display)] font-semibold text-[15px] tracking-[-0.02em]"
          style={{ color: headerColor === "var(--gold)" ? "var(--ink)" : "var(--white)" }}
        >
          {title}
        </span>
        <span
          className="text-[11px] font-semibold px-2 py-[3px] rounded-full font-[family-name:var(--font-body)]"
          style={{
            background: headerColor === "var(--gold)" ? "rgba(20,47,45,0.15)" : "rgba(255,255,255,0.2)",
            color: headerColor === "var(--gold)" ? "var(--ink)" : "var(--white)",
          }}
        >
          {label}
        </span>
      </div>
      {/* Body */}
      <div className="px-[18px] py-4">
        <div className="font-[family-name:var(--font-display)] font-bold text-[22px] text-[var(--ink)] tracking-[-0.03em] mb-1.5">
          {price}
        </div>
        <div className="text-[13px] text-[var(--fg-3)] font-[family-name:var(--font-body)]">
          {perks}
        </div>
      </div>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function HeroSection() {
  return (
    <section
      className="px-5 pt-16 pb-12 md:px-8 md:pt-24 md:pb-20 bg-[var(--bg-app)] relative overflow-hidden"
      style={{ backgroundImage: dotGridBg }}
    >
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-[60px] items-center">
        {/* Left */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-7"
        >
          {/* Gold pill badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-[7px] bg-[var(--gold-100)] border border-[var(--gold)] rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-[var(--gold-700)] font-[family-name:var(--font-body)]">
              <Icon name="sparkles" size={13} />
              Recurring revenue, made simple
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={fadeUp}
            className="font-[family-name:var(--font-display)] font-semibold text-[40px] md:text-[72px] leading-[1.05] tracking-[-0.04em] text-[var(--ink)] m-0 whitespace-pre-line"
          >
            {"Recurring revenue,\nminus the spreadsheet."}
          </motion.h1>

          {/* Body */}
          <motion.p
            variants={fadeUp}
            className="text-base md:text-[19px] leading-relaxed text-[var(--fg-2)] m-0 font-[family-name:var(--font-body)] max-w-[520px]"
          >
            Memberry turns your best customers into members. Launch subscription
            plans, track perks, and watch monthly revenue compound.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col md:flex-row gap-3 items-stretch md:items-center"
          >
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 bg-[var(--teal)] text-white px-6 py-3.5 rounded-lg font-[family-name:var(--font-body)] font-semibold text-base no-underline"
            >
              Start free
              <Icon name="arrow-right" size={16} />
            </a>
            <a
              href="#merchant-app"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--ink)] px-6 py-3.5 rounded-lg border border-[var(--border-strong)] font-[family-name:var(--font-body)] font-semibold text-base no-underline"
            >
              See how it works
            </a>
          </motion.div>

          {/* Footer text */}
          <motion.p
            variants={fadeUp}
            className="text-[13px] text-[var(--fg-3)] m-0 font-[family-name:var(--font-body)]"
          >
            No setup fee · No investment required to get started
          </motion.p>
        </motion.div>

        {/* Right: stacked plan cards — hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.3 } }}
          className="hidden md:block relative h-[460px]"
        >
          <PlanCard
            top={0}
            right={80}
            rotate={-4}
            headerColor="var(--teal)"
            title="Monthly Glow"
            price="₱899 / mo"
            perks="1 blowout · 10% off treatments"
            label="Standard"
            labelColor="var(--teal)"
          />
          <PlanCard
            top={140}
            right={0}
            rotate={3}
            headerColor="var(--gold)"
            title="VIP Care"
            price="₱2,499 / mo"
            perks="Unlimited visits · Priority booking"
            label="Premium"
            labelColor="var(--gold)"
          />
          <PlanCard
            top={290}
            right={100}
            rotate={-2}
            headerColor="var(--teal)"
            title="Paw Club"
            price="₱1,299 / mo"
            perks="4 baths · Free nail trim"
            label="Standard"
            labelColor="var(--teal)"
          />
        </motion.div>
      </div>
    </section>
  );
}
