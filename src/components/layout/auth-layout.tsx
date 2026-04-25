import { Link } from "react-router-dom";

const NAV_LINKS = ["Product", "Solutions", "Resources", "Download", "Pricing"];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-snow-surface">
      {/* Header */}
      <header className="flex items-center justify-between px-7 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/icons/omniq-logo.png"
            alt="OMNIQ AI"
            className="h-7 w-7 object-contain"
          />
          <span className="text-sm font-semibold tracking-tight text-black">
            OMNIQ AI
          </span>
        </Link>
        <nav className="flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs text-black/55 transition-colors hover:text-black"
            >
              {link}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/sign-up"
            className="text-xs text-black/55 transition-colors hover:text-black"
          >
            Sign up
          </Link>
          <Link
            to="/sign-in"
            className="rounded-full bg-black px-4 py-1.5 text-xs text-white transition-colors hover:bg-black/80"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-6 pb-12">
        <div className="w-full max-w-[520px] rounded-3xl bg-white px-12 py-10">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-6 text-center">
        <span className="text-xs text-black/55">© 2026 OMNIQ AI</span>
      </footer>
    </div>
  );
}
