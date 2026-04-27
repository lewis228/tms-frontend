import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import AuthLayout from "@/components/layout/auth-layout";

function useCountdown(targetHours = 32, targetMinutes = 43, targetSeconds = 23) {
  const [total, setTotal] = useState(
    targetHours * 3600 + targetMinutes * 60 + targetSeconds,
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTotal((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export default function ComingSoonPage() {
  const { hours, minutes, seconds } = useCountdown();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center py-4">
        <h1 className="mb-4 text-4xl font-semibold leading-tight text-black">
          Coming Soon
        </h1>
        <img
          src="/images/illustration-coming-soon.svg"
          alt="Coming soon"
          className="mb-8 h-32 w-auto"
        />

        <div className="mb-8 flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-5xl font-semibold text-black">
              {String(hours).padStart(2, "0")}
            </span>
            <span className="text-sm text-black/55">Hours</span>
          </div>
          <span className="text-3xl text-black/20">:</span>
          <div className="flex flex-col items-center">
            <span className="text-5xl font-semibold text-black">
              {String(minutes).padStart(2, "0")}
            </span>
            <span className="text-sm text-black/55">Minutes</span>
          </div>
          <span className="text-3xl text-black/20">:</span>
          <div className="flex flex-col items-center">
            <span className="text-5xl font-semibold text-black">
              {String(seconds).padStart(2, "0")}
            </span>
            <span className="text-sm text-black/55">Seconds</span>
          </div>
        </div>

        <div className="relative w-full">
          <Input
            type="email"
            placeholder="Enter your email"
            className="rounded-2xl border-black/10 px-4 py-3 pr-10 text-sm placeholder:text-black/20"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/55 hover:text-black"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
