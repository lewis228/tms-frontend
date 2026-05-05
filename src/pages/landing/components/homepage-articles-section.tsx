import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";

const ARTICLES = [
  {
    tag: "Logistic Innovation",
    title: "Streamlining Supply Chains with Innovative Logistics Solutions",
    desc: "Discover how advanced technology is transforming logistics, making supply chains faster and more efficient.",
    author: "Emily Tran",
    date: "November 5, 2030",
    img: "https://images.pexels.com/photos/1267329/pexels-photo-1267329.jpeg?auto=compress&cs=tinysrgb&w=600&h=500&fit=crop",
    showReadMore: true,
  },
  {
    tag: "Delivery Solutions",
    title: "The Future of Last-Mile Delivery: Trends and Challenges",
    desc: "",
    author: "Mark Douglas",
    date: "",
    img: "https://images.pexels.com/photos/6407553/pexels-photo-6407553.jpeg?auto=compress&cs=tinysrgb&w=600&h=500&fit=crop",
    showReadMore: false,
  },
  {
    tag: "Sustainability",
    title: "Why Sustainable Practices Matter in Logistics",
    desc: "",
    author: "Sarah Lee",
    date: "",
    img: "https://images.pexels.com/photos/36398150/pexels-photo-36398150.jpeg?auto=compress&cs=tinysrgb&w=600&h=500&fit=crop",
    showReadMore: false,
  },
];

export default function HomepageArticlesSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
          <div>
            <FadeIn>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
                  LATEST ARTICLE
                </span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="mt-5 font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                Industry{" "}
                <span className="text-landing-red">Insights</span> and{" "}
                <span className="text-landing-red">Tips</span>
              </h2>
            </FadeIn>
          </div>
          <FadeIn delay={0.2}>
            <div className="flex flex-col gap-3 md:items-end">
              <p className="text-sm text-landing-muted md:max-w-sm md:text-right">
                Stay informed with the latest industry insights and expert tips
                to optimize your logistics strategies and stay ahead of market
                trends.
              </p>
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              >
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-landing-border px-5 py-2 text-sm font-medium text-landing-navy transition-colors hover:border-landing-navy"
                >
                  View All Posts
                </Link>
              </motion.div>
            </div>
          </FadeIn>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {ARTICLES.map((article, i) => (
            <FadeIn key={article.title} delay={0.08 * i}>
              <div className="group relative overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1">
                <div className="aspect-[4/3]">
                  <img
                    src={article.img} // TODO: replace asset
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1340]/90 via-[#0B1340]/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {article.tag}
                    </span>
                    {article.date && (
                      <span className="text-xs text-white/60">
                        {article.date}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-white">
                    {article.title}
                  </h3>
                  {article.desc && (
                    <p className="mt-1 text-xs text-white/60">{article.desc}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-white/70">
                      {article.author}
                    </span>
                    {article.showReadMore && (
                      <Link
                        to="/"
                        className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                      >
                        Read More
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
