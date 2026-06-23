"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "App", href: "#merchant-app" },
    { label: "Pricing", href: "#pricing" },
    { label: "Team", href: "#team" },
  ];

  return (
    <nav
      className="sticky top-0 z-[100] transition-[background,border-color] duration-200"
      style={{
        background: scrolled ? "rgba(245,248,247,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--border)"
          : "1px solid transparent",
      }}
    >
      <div className="h-[72px] max-w-[1200px] w-full mx-auto px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="inline-flex items-center no-underline">
          <Image
            src="/images/logo_full.png"
            alt="Memberry"
            width={140}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[15px] font-medium text-[var(--fg-2)] no-underline"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="text-[15px] font-semibold text-white bg-[var(--ink)] no-underline px-5 py-[9px] rounded-lg"
          >
            Book a Demo
          </a>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="md:hidden flex flex-col justify-between w-6 h-[18px] bg-transparent border-0 cursor-pointer p-1 box-content"
          >
            <span className="block h-0.5 bg-[var(--ink)] rounded-sm" />
            <span className="block h-0.5 bg-[var(--ink)] rounded-sm" />
            <span className="block h-0.5 bg-[var(--ink)] rounded-sm" />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-[72px] left-0 right-0 bg-[var(--white)] border-b border-[var(--border)] px-5 py-5 flex flex-col gap-5 z-[99]">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-base font-medium text-[var(--fg-2)] no-underline"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
