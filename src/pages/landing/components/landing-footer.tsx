import { Link } from "react-router-dom";

const FOOTER_COLUMNS = [
  {
    title: "Features",
    links: [
      { label: "Ocean Tracking", href: "/" },
      { label: "Terminal Visibility", href: "/" },
      { label: "Webhooks", href: "/" },
      { label: "REST API", href: "/" },
      { label: "Dashboard", href: "/" },
      { label: "Bulk CSV", href: "/" },
      { label: "CSV Export", href: "/" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Changelog", href: "/" },
      { label: "Pricing", href: "/pricing" },
      { label: "Security", href: "/" },
      { label: "SOC 2", href: "/" },
      { label: "GDPR", href: "/" },
      { label: "Brand", href: "/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Customers", href: "/customers" },
      { label: "Humans", href: "/" },
      { label: "Philosophy", href: "/" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact", href: "/" },
      { label: "Support", href: "/" },
      { label: "Status", href: "/" },
      { label: "Migrate", href: "/" },
      { label: "Knowledge Base", href: "/" },
      { label: "Legal Policies", href: "/" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Events", href: "/" },
      { label: "Insiders", href: "/" },
      { label: "Open Source", href: "/" },
      { label: "Wallpapers", href: "/" },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-resend-border bg-resend-bg">
      {/* Large watermark text */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <span className="whitespace-nowrap font-heading text-[20vw] font-bold tracking-tight text-white/[0.03] select-none">
          <span className="italic">O</span>MNIQ
        </span>
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 pb-12 pt-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          {/* Address column */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-sm text-resend-dim">Insight Logistics, Inc.</p>
            <p className="text-sm text-resend-dim">Los Angeles · Seoul</p>

            <div className="mt-5 flex items-center gap-3">
              {["X", "GH", "in", "YT"].map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-resend-border text-xs text-resend-dim transition-colors hover:border-resend-muted hover:text-resend-text"
                >
                  {icon}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-resend-green" />
              <span className="text-xs text-resend-dim">All systems operational</span>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-medium text-resend-text">{col.title}</h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-resend-dim transition-colors hover:text-resend-text">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
