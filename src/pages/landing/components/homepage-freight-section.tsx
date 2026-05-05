import FadeIn from "@/pages/landing/components/fade-in";

const FREIGHT_ITEMS = [
  {
    tag: "Air Freight",
    text: "Fast, reliable shipping for high-priority items across the globe.",
    img: "https://images.pexels.com/photos/13025947/pexels-photo-13025947.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
  },
  {
    tag: "Sea Freight",
    text: "Cost-effective solutions for bulk goods, with extensive port-to-port coverage.",
    img: "https://images.pexels.com/photos/31244440/pexels-photo-31244440.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
  },
  {
    tag: "Rail Freight",
    text: "Economical and friendly environmental, ideal for large volumes and long distances.",
    img: "https://images.unsplash.com/photo-1768779535660-57084fc27382?w=800&h=600&fit=crop",
  },
  {
    tag: "Road Freight",
    text: "Efficient transportation for regional shipments with flexible schedules.",
    img: "https://images.pexels.com/photos/18446790/pexels-photo-18446790.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
  },
];

export default function HomepageFreightSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <FadeIn>
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
              OUR FREIGHT SOLUTION
            </span>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="mx-auto mt-5 max-w-2xl text-center font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            <span className="text-landing-red">Expertly Managing</span> Every
            Step From Transit to Warehousing
          </h2>
        </FadeIn>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {FREIGHT_ITEMS.map((item, i) => (
            <FadeIn key={item.tag} delay={0.08 * i}>
              <div className="group relative overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1">
                <div className="aspect-[4/3] md:aspect-[3/2]">
                  <img
                    src={item.img} // TODO: replace asset
                    alt={item.tag}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-landing-navy/80 via-landing-navy/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {item.tag}
                  </span>
                  <p className="mt-3 text-lg font-semibold leading-snug text-white md:text-xl">
                    {item.text}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
