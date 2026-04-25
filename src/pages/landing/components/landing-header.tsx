import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type DropdownItem = { label: string; href: string; desc?: string };
type NavItemDef = { label: string; href?: string; items?: DropdownItem[] };

const NAV_ITEMS: NavItemDef[] = [
  {
    label: "Features",
    items: [
      {
        label: "Ocean Tracking",
        href: "/",
        desc: "MBL tracking across 18+ carriers",
      },
      {
        label: "Terminal Visibility",
        href: "/",
        desc: "LFD, holds, yard status",
      },
      {
        label: "Webhooks",
        href: "/",
        desc: "Push events to your stack",
      },
      {
        label: "REST API",
        href: "/",
        desc: "X-API-Key, plan-based limits",
      },
      {
        label: "Dashboard",
        href: "/",
        desc: "Shipments list, detail, alerts",
      },
      {
        label: "Bulk CSV",
        href: "/",
        desc: "Register hundreds at once",
      },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Customers", href: "/customers" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Changelog", href: "/" },
      { label: "Pricing", href: "/pricing" },
      { label: "Security", href: "/" },
      { label: "Brand", href: "/" },
    ],
  },
  {
    label: "Help",
    items: [
      { label: "Contact", href: "/" },
      { label: "Support", href: "/" },
      { label: "Status", href: "/" },
      { label: "Knowledge Base", href: "/" },
    ],
  },
  {
    label: "Docs",
    items: [
      { label: "Documentation", href: "/" },
      { label: "API Reference", href: "/" },
      { label: "SDKs", href: "/" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
];

function DropdownMenu({ items, isOpen }: { items: DropdownItem[]; isOpen: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2"
        >
          <div className="rounded-xl border border-resend-border bg-resend-card p-2 shadow-2xl backdrop-blur-sm min-w-[200px]">
            {items.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex flex-col rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.05]"
              >
                <span className="text-sm text-resend-text">{item.label}</span>
                {item.desc && <span className="text-xs text-resend-dim">{item.desc}</span>}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LandingHeader() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  useEffect(() => {
    setOpenDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleEnter(label: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(label);
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-resend-border/50 bg-resend-bg/80 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="font-heading text-xl font-bold tracking-tight text-white">
          <span className="italic">O</span>MNIQ
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.items && handleEnter(item.label)}
              onMouseLeave={handleLeave}
            >
              {item.href && !item.items ? (
                <Link
                  to={item.href}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-resend-muted transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-resend-muted transition-colors hover:text-white"
                >
                  {item.label}
                  <ChevronDown className="h-3 w-3" />
                </button>
              )}
              {item.items && <DropdownMenu items={item.items} isOpen={openDropdown === item.label} />}
            </div>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-4">
          <Link to="/sign-in" className="text-sm text-resend-muted transition-colors hover:text-white">
            Log In
          </Link>
          <Link
            to="/sign-up"
            className="rounded-lg bg-resend-btn px-4 py-1.5 text-sm font-medium text-resend-bg transition-colors hover:bg-white"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
