"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "./Icon";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const faqs = [
  {
    q: "How does the commission work?",
    a: "You keep everything your members pay. Memberry takes a small percentage on each successful charge. There's no monthly fee, no setup cost, no minimum. If your members don't pay, we don't either.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No annual contracts, no cancellation fees. If you decide to stop, we make it straightforward to wind down or transfer your member data.",
  },
  {
    q: "Do my members get a real app?",
    a: "Yes, iOS and Android. Members can view all their active plans, track stamp progress, and receive push notifications when perks unlock. It's a full native app, not a web wrapper.",
  },
  {
    q: "What happens if a customer's card expires?",
    a: "We retry on a smart schedule, send the reminder so you don't have to, and only mark the membership lapsed after three failed attempts. No extra fees for failed charges.",
  },
  {
    q: "How do I start?",
    a: "Sign up, create a plan with a name and a price. Most merchants launch in under 11 minutes. No setup fee, no investment required to get started.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-4 md:px-6 md:py-5 bg-transparent border-0 cursor-pointer text-left flex items-center justify-between gap-4"
        aria-expanded={open}
      >
        <span className="font-[family-name:var(--font-display)] font-medium text-base text-[var(--ink)] tracking-[-0.01em]">
          {q}
        </span>
        <span className="shrink-0 text-[var(--fg-3)] flex items-center">
          <Icon name={open ? "minus" : "plus"} size={18} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 md:px-6 md:pb-5 text-[15px] leading-[1.7] text-[var(--fg-2)] font-[family-name:var(--font-body)] m-0">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection() {
  return (
    <section className="py-16 px-5 md:py-24 md:px-8 bg-[var(--bg-app)]">
      <div className="max-w-[800px] mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-[var(--teal)] font-[family-name:var(--font-body)] mb-4">
              FAQ
            </p>
            <h2 className="font-[family-name:var(--font-display)] font-semibold text-[32px] md:text-[48px] leading-[1.1] tracking-[-0.03em] text-[var(--ink)] m-0">
              Questions, answered.
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-white border border-[var(--border)] rounded-[10px] overflow-hidden"
          >
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
