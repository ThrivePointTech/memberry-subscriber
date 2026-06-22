"use client";

import { motion } from "framer-motion";
import { FaLinkedin } from "react-icons/fa";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const team = [
  {
    photo: "/team/hans-sayson.jpeg",
    avatarBg: "var(--teal)",
    name: "Hans Sayson",
    role: "Co-Founder · Strategy & Growth",
    bio: "Helps businesses refine their plans, pricing, and launch strategy to turn regular customers into consistent monthly revenue.",
  },
  {
    photo: "/team/dexter-moya.jpeg",
    avatarBg: "var(--ink)",
    name: "Dexter Moya",
    role: "Co-Founder · Operations & Finance",
    bio: "Handles setup, billing, and launch support to make the platform simple for shops to use every day.",
  },
  {
    photo: "/team/micah-bule.jpg",
    avatarBg: "var(--teal-700)",
    name: "Micah Bule",
    role: "Co-Founder · Technology",
    bio: "Leads the technology behind the app, QR system, billing, and dashboard. Makes everything easy to use and quick to resolve when issues arise.",
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-16 px-5 md:py-24 md:px-8 bg-white">
      <div className="max-w-[1200px] mx-auto">
        {/* Header row */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-20 items-start mb-10 md:mb-16"
        >
          <div>
            <motion.p
              variants={fadeUp}
              className="text-[13px] font-semibold tracking-[0.08em] uppercase text-[var(--teal)] font-[family-name:var(--font-body)] mb-4"
            >
              Team
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-[family-name:var(--font-display)] font-semibold text-[32px] md:text-[48px] leading-[1.1] tracking-[-0.03em] text-[var(--ink)] m-0 whitespace-pre-line"
            >
              {"Small team.\nSerious about small business."}
            </motion.h2>
          </div>
          <motion.div variants={fadeUp} className="pt-5 md:pt-4">
            <p className="text-[17px] text-[var(--fg-2)] font-[family-name:var(--font-body)] leading-relaxed mb-6">
              We&apos;ve spent years building software for large financial
              companies. We left because we wanted to build something for the
              businesses that don&apos;t make the case studies.
            </p>
            <div className="flex gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--border)] text-[var(--fg-2)]"
              >
                <FaLinkedin size={16} />
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {team.map((member) => (
            <motion.div
              key={member.name}
              variants={fadeUp}
              className="bg-[var(--bg-app)] border border-[var(--border)] rounded-[10px] p-7"
            >
              {/* Avatar */}
              <img
                src={member.photo}
                alt={member.name}
                className="w-[52px] h-[52px] rounded-full object-cover mb-5"
              />
              <h3 className="font-[family-name:var(--font-display)] font-semibold text-[18px] text-[var(--ink)] mb-1 tracking-[-0.02em]">
                {member.name}
              </h3>
              <p className="text-[13px] font-medium text-[var(--teal)] font-[family-name:var(--font-body)] mb-3.5">
                {member.role}
              </p>
              <p className="text-[15px] text-[var(--fg-2)] font-[family-name:var(--font-body)] leading-relaxed m-0">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
