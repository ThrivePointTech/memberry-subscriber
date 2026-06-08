"use client";

import Image from "next/image";

const footerLinks = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Member app", href: "#" },
      { label: "API", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Team", href: "#team" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "Help center", href: "#" },
      { label: "Status", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
];

function BrandCol() {
  return (
    <div>
      <a href="/" className="inline-flex items-center no-underline mb-4">
        <Image src="/images/logo_full.png" alt="Memberry" width={140} height={36} className="h-9 w-auto" />
      </a>
      <p className="text-sm text-[var(--fg-3)] font-[family-name:var(--font-body)] leading-relaxed max-w-[240px] mt-2">
        Recurring revenue for the businesses that don&apos;t make the case studies.
      </p>
    </div>
  );
}

function LinkCol({ col }: { col: typeof footerLinks[number] }) {
  return (
    <div>
      <h4 className="text-[12px] font-semibold tracking-[0.08em] uppercase text-[var(--fg-3)] font-[family-name:var(--font-body)] mb-4">
        {col.heading}
      </h4>
      <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
        {col.links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="text-sm text-[var(--fg-2)] no-underline font-[family-name:var(--font-body)]">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="pt-12 pb-6 px-5 md:pt-16 md:pb-8 md:px-8 bg-white">
      <div className="max-w-[1200px] mx-auto">
        {/* Main grid: 2-col on mobile (brand spans both), 4-col on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 md:gap-12 mb-12">
          <div className="col-span-2 md:col-span-1">
            <BrandCol />
          </div>
          {footerLinks.map((col) => (
            <LinkCol key={col.heading} col={col} />
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between text-[13px] text-[var(--fg-3)] font-[family-name:var(--font-body)]">
          <span>© 2026 Memberry, Inc.</span>
          <span>Made for small businesses</span>
        </div>
      </div>
    </footer>
  );
}
