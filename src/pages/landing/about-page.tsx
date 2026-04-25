import FadeIn from "./components/fade-in";

const TEAM = [
  { name: "Lewis Jo", role: "Founder", avatar: "https://i.pravatar.cc/80?u=lewis-jo" },
  { name: "Insight Logistics", role: "Parent Company", avatar: "https://i.pravatar.cc/80?u=insight" },
];

const STATS = [
  { label: "Founded", value: "2026" },
  { label: "Carriers integrated", value: "18+" },
  { label: "MBLs tracked", value: "Scaling" },
  { label: "Terminals (LA/LB)", value: "5" },
];

export default function AboutPage() {
  return (
    <div className="pt-14">
      {/* Hero */}
      <section className="relative py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-resend-green/[0.04] blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-[1200px] px-6">
          <FadeIn>
            <h1 className="font-heading text-5xl font-normal tracking-tight text-white md:text-7xl">
              Our mission is to make
              <br />
              <span className="italic">container tracking effortless</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-resend-muted">
              Logistics teams lose hours every week logging into carrier portals
              one MBL at a time. We're fixing that with a single API and
              dashboard that covers every ocean carrier and major LA/LB terminal.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-resend-border">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <FadeIn key={stat.label} delay={0.05 * i}>
                <div>
                  <p className="font-heading text-4xl text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-resend-dim">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24">
        <div className="mx-auto max-w-[800px] px-6">
          <FadeIn>
            <h2 className="mb-8 font-heading text-3xl text-white">Our Story</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="space-y-5 text-base leading-relaxed text-resend-muted">
              <p>
                OMNIQ started inside Insight Logistics, a LA/LB drayage operator
                that had spent years watching teammates tab through 18 carrier
                sites and five terminal portals just to answer "where's my
                container?". We kept building internal scrapers, kept fighting
                bot walls, kept eating demurrage when an LFD slipped past
                unnoticed.
              </p>
              <p>
                Our vision is simple: registering an MBL should be as cheap as a
                single API call, and every downstream event — arrived, gated
                out, LFD in 2 days — should land in your stack the moment it
                happens. No more tab-switching, no more spreadsheets, no more
                surprise demurrage invoices.
              </p>
              <p>
                OMNIQ is built in Los Angeles and Seoul by the team behind
                Insight Logistics, with a particular focus on Korean and Asian
                carriers (HMM, SM Line, Yang Ming, Wan Hai, Evergreen) where
                competitors have blind spots.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <FadeIn>
            <h2 className="mb-12 font-heading text-3xl text-white">Meet the team</h2>
          </FadeIn>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            {TEAM.map((member, i) => (
              <FadeIn key={member.name} delay={0.05 * i}>
                <div className="group">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="mb-4 h-24 w-24 rounded-2xl grayscale transition-all group-hover:grayscale-0"
                  />
                  <h3 className="text-base font-medium text-white">{member.name}</h3>
                  <p className="text-sm text-resend-dim">{member.role}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
