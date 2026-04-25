import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import FadeIn from "./components/fade-in";

const POSTS = [
  {
    title: "Introducing Ocean Tracking v2",
    desc: "All 18 carriers, terminal holds, and webhook events in one API. Here's what shipped and what's next.",
    date: "Apr 14, 2026",
    tag: "Announcement",
    image: "https://picsum.photos/600/340?random=1",
  },
  {
    title: "How We Keep 18 Carrier Scrapers Green",
    desc: "A deep dive into Playwright, curl_cffi, and Camoufox — and why we need all three to stay ahead of bot walls.",
    date: "Apr 10, 2026",
    tag: "Engineering",
    image: "https://picsum.photos/600/340?random=2",
  },
  {
    title: "LFD Alerts Before Dispatch, Not After",
    desc: "How one webhook into Slack dropped demurrage charges by 72% for a LA drayage operator.",
    date: "Apr 5, 2026",
    tag: "Case Study",
    image: "https://picsum.photos/600/340?random=3",
  },
  {
    title: "The State of Ocean Visibility in 2026",
    desc: "Our annual report on carrier coverage, scraping reliability, and where APIs still leave gaps.",
    date: "Mar 28, 2026",
    tag: "Research",
    image: "https://picsum.photos/600/340?random=4",
  },
  {
    title: "Why MBL is a Bad Primary Key",
    desc: "Lessons from three years of building tracking systems — and the multi-tenant ID model we settled on.",
    date: "Mar 20, 2026",
    tag: "Engineering",
    image: "https://picsum.photos/600/340?random=5",
  },
  {
    title: "Behind the LA/LB Terminal Integrations",
    desc: "eModal, APM, Fenix, YTI, and LBCT each speak a different language. Here's how we normalize them.",
    date: "Mar 12, 2026",
    tag: "Engineering",
    image: "https://picsum.photos/600/340?random=6",
  },
];

export default function BlogPage() {
  return (
    <div className="pt-14">
      <section className="py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <FadeIn>
            <h1 className="font-heading text-5xl font-normal tracking-tight text-white md:text-7xl">Blog</h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-4 text-lg text-resend-muted">News, updates, and stories from the OMNIQ team.</p>
          </FadeIn>

          {/* Featured */}
          <FadeIn delay={0.2}>
            <motion.a
              href="#"
              whileHover={{ y: -4 }}
              className="group mt-12 block overflow-hidden rounded-2xl border border-resend-border bg-resend-card transition-colors hover:border-resend-muted/30"
            >
              <div className="grid md:grid-cols-2">
                <img src={POSTS[0].image} alt="" className="h-64 w-full object-cover md:h-full" />
                <div className="p-8 flex flex-col justify-center">
                  <span className="mb-3 inline-block w-fit rounded-full bg-resend-green/10 px-3 py-1 text-xs text-resend-green">{POSTS[0].tag}</span>
                  <h2 className="font-heading text-2xl text-white group-hover:text-resend-green transition-colors">{POSTS[0].title}</h2>
                  <p className="mt-3 text-sm text-resend-muted">{POSTS[0].desc}</p>
                  <p className="mt-4 text-xs text-resend-dim">{POSTS[0].date}</p>
                </div>
              </div>
            </motion.a>
          </FadeIn>

          {/* Grid */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {POSTS.slice(1).map((post, i) => (
              <FadeIn key={post.title} delay={0.05 * i}>
                <motion.a
                  href="#"
                  whileHover={{ y: -4 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-resend-border bg-resend-card transition-colors hover:border-resend-muted/30"
                >
                  <img src={post.image} alt="" className="h-44 w-full object-cover" />
                  <div className="flex flex-1 flex-col p-5">
                    <span className="mb-2 inline-block w-fit rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-resend-dim">{post.tag}</span>
                    <h3 className="text-base font-medium text-white group-hover:text-resend-green transition-colors">{post.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-resend-dim">{post.desc}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-resend-dim">{post.date}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-resend-dim transition-all group-hover:text-white group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </motion.a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
