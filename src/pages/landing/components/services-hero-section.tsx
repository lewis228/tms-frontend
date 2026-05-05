import FadeIn from "@/pages/landing/components/fade-in";

export default function ServicesHeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/2226458/pexels-photo-2226458.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop"
          alt="Aerial view of container port — Tom Fisk on Pexels"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-landing-navy/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-32 text-center md:pb-20 md:pt-40 lg:px-8">
        <FadeIn>
          <h1 className="font-heading text-4xl font-bold italic text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Logistics Services
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
            Our comprehensive logistics solution is designed to optimize your
            supply chain and enhance your business operations.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-landing-navy/60 px-5 py-2 backdrop-blur-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white">
              Custom Solutions for Every Need
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
