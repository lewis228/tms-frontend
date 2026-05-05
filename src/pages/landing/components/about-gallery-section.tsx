import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FadeIn from "@/pages/landing/components/fade-in";

const GALLERY_IMAGES = [
  {
    src: "https://images.pexels.com/photos/31244440/pexels-photo-31244440.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    alt: "Container ship at port",
  },
  {
    src: "https://images.pexels.com/photos/12530465/pexels-photo-12530465.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    alt: "Cargo plane loading",
  },
  {
    src: "https://images.pexels.com/photos/18446790/pexels-photo-18446790.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    alt: "Delivery truck on highway",
  },
  {
    src: "https://images.pexels.com/photos/4256976/pexels-photo-4256976.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    alt: "Port aerial view",
  },
];

export default function AboutGallerySection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
          <div>
            <FadeIn>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
                  GALLERY
                </span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="mt-5 font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                Fleet in{" "}
                <span className="text-landing-red">Action</span>: Our{" "}
                <span className="text-landing-red">Freight</span> Journey
              </h2>
            </FadeIn>
          </div>
          <FadeIn delay={0.2}>
            <p className="text-sm leading-relaxed text-landing-muted md:text-base">
              Taking you through the journey of our fleet, where every step is
              carefully managed for precision, speed, and reliability, ensuring
              timely deliveries and seamless logistics from start to finish.
            </p>
          </FadeIn>
        </div>

        {/* Horizontal scroll gallery */}
        <div className="relative mt-10">
          <div
            ref={scrollRef}
            className="scrollbar-hidden -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 md:mx-0 md:px-0"
          >
            {GALLERY_IMAGES.map((img, i) => (
              <FadeIn
                key={img.alt}
                delay={0.08 * i}
                className="w-[280px] shrink-0 snap-start md:w-[320px] lg:w-[360px]"
              >
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={img.src} // TODO: replace asset
                    alt={img.alt}
                    className="aspect-[4/3] h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Nav buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-landing-border text-landing-muted transition-colors hover:border-landing-navy hover:text-landing-navy"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-landing-navy text-white transition-colors hover:bg-landing-navy-light"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
