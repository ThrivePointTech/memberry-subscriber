export default function LogoStrip() {
  return (
    <section className="py-8 md:py-10 px-5 md:px-8 bg-white border-t border-b border-[var(--border)]">
      <p className="text-center text-[12px] font-semibold tracking-[0.1em] uppercase text-[var(--fg-3)] mb-5 md:mb-7 font-[family-name:var(--font-body)]">
        Trusted by 4,200+ small businesses
      </p>
      <div className="flex flex-wrap items-center justify-center gap-5 md:gap-12">
        <span
          className="text-[16px] md:text-[22px] text-[var(--fg-3)]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-0.04em" }}
        >
          daybreak.
        </span>
        <span
          className="text-[16px] md:text-[22px] text-[var(--fg-3)]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontStyle: "italic" }}
        >
          Petalwork
        </span>
        <span
          className="text-[16px] md:text-[22px] text-[var(--fg-3)]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "0.01em" }}
        >
          NORTH/YOGA
        </span>
        <span
          className="text-[16px] md:text-[22px] text-[var(--fg-3)]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 600 }}
        >
          Hessler &amp; Co
        </span>
        <span
          className="text-[16px] md:text-[22px] text-[var(--fg-3)]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          oat &amp; ash
        </span>
        <span
          className="text-[16px] md:text-[22px] text-[var(--fg-3)]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontStyle: "italic" }}
        >
          boulevard
        </span>
      </div>
    </section>
  );
}
