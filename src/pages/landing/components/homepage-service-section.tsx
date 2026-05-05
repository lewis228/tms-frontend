import FadeIn from "@/pages/landing/components/fade-in";

const BLOCKS = [
  {
    num: "01",
    title: "Vision",
    text: "Our mission is to lead the global logistics industry by providing seamless, reliable, and innovative solutions that not only meet but exceed client expectations, driving long-term success and growth for businesses worldwide.",
  },
  {
    num: "02",
    title: "Mission",
    text: "We connect businesses to a streamlined and efficient supply chain by offering innovative and responsible logistics solutions that enhance operational performance, reduce costs, and foster growth in a dynamic global market.",
  },
];

export default function HomepageServiceSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          {/* Left column */}
          <div>
            <FadeIn>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
                  OMNIQ AT YOUR SERVICE
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="mt-5 font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                We Provide{" "}
                <span className="text-landing-red">
                  End-to-end Logistics Services
                </span>{" "}
                for Timely, Secure Delivery.
              </h2>
            </FadeIn>

            <div className="mt-10 space-y-8">
              {BLOCKS.map((block, i) => (
                <FadeIn key={block.num} delay={0.2 + 0.08 * i}>
                  <div className="border-l-2 border-landing-red/20 pl-5">
                    <span className="text-sm font-bold text-landing-red">
                      {block.num}
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-landing-red">
                      {block.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-landing-muted">
                      {block.text}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Right column — truck image */}
          <FadeIn delay={0.2} direction="right">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.pexels.com/photos/18446790/pexels-photo-18446790.jpeg?auto=compress&cs=tinysrgb&w=800&h=900&fit=crop"
                alt="White delivery truck on road" // TODO: replace asset
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-6 right-6 rounded-lg bg-white/90 px-4 py-2 backdrop-blur-sm">
                <span className="font-heading text-lg font-bold tracking-tight text-landing-navy">
                  <span className="italic">O</span>MNIQ
                </span>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
