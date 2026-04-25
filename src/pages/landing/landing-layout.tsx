import { Outlet } from "react-router-dom";
import LandingHeader from "./components/landing-header";
import LandingFooter from "./components/landing-footer";

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-resend-bg text-resend-text font-sans">
      <LandingHeader />
      <main>
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
}
