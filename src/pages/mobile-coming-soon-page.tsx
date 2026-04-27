import { Smartphone } from "lucide-react";

export default function MobileComingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
      <Smartphone className="mb-4 h-10 w-10 text-black" />
      <h1 className="mb-2 text-xl font-semibold text-black">
        Mobile App Coming Soon
      </h1>
      <p className="max-w-sm text-sm text-black/60">
        Our driver mobile app is under active development. Check back soon for
        the launch.
      </p>
    </div>
  );
}
