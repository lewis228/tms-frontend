import FadeIn from "./fade-in";

// Display names of the 18 carriers STE already integrates with. Logos
// proper can be swapped in later; for now the text-only marque mirrors the
// original boilerplate treatment.
const LOGOS = [
  "HMM", "SM Line", "ONE", "Maersk", "COSCO", "ZIM",
  "Yang Ming", "Evergreen", "MSC", "Hamburg Süd", "Wan Hai", "Matson",
];

export default function LogosSection() {
  return (
    <section className="relative py-24">
      {/* Top gradient line */}
      <div className="mx-auto mb-16 h-px w-full max-w-3xl bg-gradient-to-r from-transparent via-resend-border to-transparent" />

      <FadeIn>
        <p className="text-center text-sm leading-relaxed text-resend-muted">
          Forwarders and shippers trust OMNIQ
          <br />
          to keep every container visible in real time.
        </p>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="mx-auto mt-12 max-w-[900px] px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {LOGOS.slice(0, 6).map((name) => (
              <span
                key={name}
                className="text-base font-semibold tracking-wide text-resend-dim/60 transition-colors hover:text-resend-muted"
              >
                {name}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {LOGOS.slice(6).map((name) => (
              <span
                key={name}
                className="text-base font-semibold tracking-wide text-resend-dim/60 transition-colors hover:text-resend-muted"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
