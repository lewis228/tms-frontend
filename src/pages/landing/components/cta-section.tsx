import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import FadeIn from "./fade-in";

export default function CtaSection() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <FadeIn>
          <h2 className="font-heading text-5xl font-normal tracking-tight text-white md:text-7xl leading-[1.1]">
            Container visibility,
            <br />
            reimagined.
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mt-10 flex items-center justify-center gap-6">
            <Link
              to="/sign-up"
              className="group flex items-center gap-2 rounded-lg bg-resend-card border border-resend-border px-6 py-3 text-sm text-white transition-all hover:border-resend-muted/40 hover:bg-resend-card/80"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/"
              className="group flex items-center gap-2 text-sm text-resend-muted transition-colors hover:text-white"
            >
              Contact Us
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
