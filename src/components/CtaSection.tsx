"use client";

import { useState } from "react";
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

type Status = "idle" | "loading" | "success" | "error";

const inputClassName =
  "w-full px-3.5 py-3 bg-white border border-[var(--border)] rounded-lg text-[var(--ink)] text-[15px] font-[family-name:var(--font-body)] outline-none box-border";

export default function CtaSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [focusField, setFocusField] = useState<string | null>(null);

  const cities = [
    "Quezon City","Manila","Makati","Pasig","Mandaluyong","Taguig","Pasay",
    "San Juan","Caloocan","Marikina","Parañaque","Las Piñas","Muntinlupa","Valenzuela","Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, business: businessName, city }),
      });
      if (!res.ok) throw new Error("send failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  // Focus ring uses box-shadow which isn't well-supported as a Tailwind arbitrary value — keep inline
  const focusStyle = (field: string): React.CSSProperties =>
    focusField === field
      ? { borderColor: "var(--teal)", boxShadow: "0 0 0 3px rgba(53,115,110,0.15)" }
      : {};

  const contactInfo = [
    { icon: "mail" as const, label: "Email", value: "getmemberry@gmail.com", href: "mailto:getmemberry@gmail.com" },
    { icon: "phone" as const, label: "Phone", value: "+63 956 160-8383", href: "tel:+639561608383" },
    { icon: "store" as const, label: "Address", value: "Mandaluyong City, Metro Manila, PH", href: "#" },
  ];

  return (
    <section id="contact" className="py-16 px-5 md:py-24 md:px-8 bg-[var(--ink)]">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-start">
        {/* Left */}
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
            Contact us
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-[family-name:var(--font-display)] font-semibold text-[32px] md:text-[48px] leading-[1.1] tracking-[-0.03em] text-white m-0"
          >
            Let&apos;s talk memberships.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-[17px] text-[var(--teal-300)] font-[family-name:var(--font-body)] leading-relaxed m-0"
          >
            Whether you&apos;re ready to launch or just exploring, we&apos;re happy to walk you through how Memberry fits your business.
          </motion.p>

          {/* Contact details */}
          <motion.div variants={stagger} className="flex flex-col gap-4 mt-2">
            {contactInfo.map((c) => (
              <motion.a
                key={c.label}
                href={c.href}
                variants={fadeUp}
                className="flex items-center gap-4 no-underline"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-[rgba(255,255,255,0.08)] text-[var(--teal-300)] shrink-0">
                  <Icon name={c.icon} size={17} />
                </span>
                <div>
                  <div className="text-[12px] font-medium text-[rgba(255,255,255,0.4)] font-[family-name:var(--font-body)] mb-0.5">{c.label}</div>
                  <div className="text-[15px] font-medium text-white font-[family-name:var(--font-body)]">{c.value}</div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-xl p-6 md:p-10"
        >
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
              <div className="text-[var(--teal)]">
                <Icon name="check-circle" size={48} strokeWidth={1.5} />
              </div>
              <h3 className="font-[family-name:var(--font-display)] font-semibold text-[22px] text-[var(--ink)] m-0">Message sent.</h3>
              <p className="text-[15px] text-[var(--fg-2)] font-[family-name:var(--font-body)] m-0">
                We&apos;ll get back to you within one business day.
              </p>
              <button
                onClick={() => { setStatus("idle"); setName(""); setPhone(""); setBusinessName(""); setCity(""); }}
                className="text-[14px] text-[var(--teal)] bg-transparent border-0 cursor-pointer font-[family-name:var(--font-body)] font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <h3 className="font-[family-name:var(--font-display)] font-semibold text-[20px] text-[var(--ink)] m-0 mb-2 tracking-[-0.02em]">
                Send us a message
              </h3>

              {/* Name + Phone grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ct-name" className="block text-[13px] font-medium text-[var(--fg-2)] mb-1.5 font-[family-name:var(--font-body)]">Name</label>
                  <input
                    id="ct-name"
                    type="text"
                    placeholder="Jane Smith"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusField("name")}
                    onBlur={() => setFocusField(null)}
                    className={inputClassName}
                    style={focusStyle("name")}
                  />
                </div>
                <div>
                  <label htmlFor="ct-phone" className="block text-[13px] font-medium text-[var(--fg-2)] mb-1.5 font-[family-name:var(--font-body)]">Phone number</label>
                  <input
                    id="ct-phone"
                    type="tel"
                    placeholder="09123456789"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={() => setFocusField("phone")}
                    onBlur={() => setFocusField(null)}
                    className={inputClassName}
                    style={focusStyle("phone")}
                  />
                </div>
              </div>

              {/* Business name */}
              <div>
                <label htmlFor="ct-business" className="block text-[13px] font-medium text-[var(--fg-2)] mb-1.5 font-[family-name:var(--font-body)]">Business name</label>
                <input
                  id="ct-business"
                  type="text"
                  placeholder="Glow Studio"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  onFocus={() => setFocusField("business")}
                  onBlur={() => setFocusField(null)}
                  className={inputClassName}
                  style={focusStyle("business")}
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="ct-city" className="block text-[13px] font-medium text-[var(--fg-2)] mb-1.5 font-[family-name:var(--font-body)]">City</label>
                <select
                  id="ct-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onFocus={() => setFocusField("city")}
                  onBlur={() => setFocusField(null)}
                  className={inputClassName}
                  style={focusStyle("city")}
                >
                  <option value="">Select your city…</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-[var(--teal)] text-white border-0 rounded-lg font-[family-name:var(--font-body)] font-semibold text-[15px] cursor-pointer mt-1"
                style={{
                  opacity: status === "loading" ? 0.7 : 1,
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                }}
              >
                {status === "loading" ? "Sending…" : (
                  <>
                    Send message
                    <Icon name="arrow-right" size={16} />
                  </>
                )}
              </button>

              {status === "error" && (
                <p className="text-[13px] font-[family-name:var(--font-body)] m-0" style={{ color: "#DC2626" }}>
                  Something went wrong. Please try again or email us directly.
                </p>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
