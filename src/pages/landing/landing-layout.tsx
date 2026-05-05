import { Outlet } from "react-router-dom";
import LandingHeader from "./components/landing-header";
import LandingFooter from "./components/landing-footer";

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-white font-sans text-landing-navy">
      <LandingHeader />
      <main>
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
}
