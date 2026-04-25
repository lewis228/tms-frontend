import FadeIn from "./fade-in";

export default function TestimonialQuoteSection() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* Vercel triangle logo */}
        <FadeIn>
          <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center">
            <svg viewBox="0 0 76 65" fill="white" className="h-8 w-8 opacity-60">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <blockquote className="font-heading text-2xl leading-relaxed font-normal text-white md:text-3xl">
            "OMNIQ collapsed our carrier-portal spreadsheet into one API. We stopped logging into 18 sites and started shipping product."
          </blockquote>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-8 flex items-center justify-center gap-3">
            <img
              src="https://i.pravatar.cc/40?u=omniq-ops"
              alt="Forwarding Operations Lead"
              className="h-10 w-10 rounded-full"
            />
            <div className="text-left">
              <p className="text-sm font-medium text-white">Operations Lead</p>
              <p className="text-xs text-resend-dim">LA/LB Drayage Forwarder</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
