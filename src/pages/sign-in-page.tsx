// 로그인 페이지 — 백엔드 /api/v1/auth/login 연동.
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import AuthLayout from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/api/auth";
import { fetchMe } from "@/api/user";
import { setBootstrappedSession, setTokensModule } from "@/store/auth";
import { generateErrorMessage } from "@/lib/error";

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setIsPending(true);
    try {
      const tokens = await signIn({ email: email.trim(), password });
      setTokensModule(tokens.accessToken, tokens.refreshToken);
      const me = await fetchMe();
      setBootstrappedSession({
        user: me,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from.startsWith("/app") ? from : "/app/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center">
        <h1 className="mb-1 text-2xl font-semibold text-black">Sign in</h1>
        <p className="mb-6 text-sm text-black/55">TMS Pro</p>

        <form
          onSubmit={handleSubmit}
          className="mb-6 flex w-full flex-col gap-4"
        >
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            required
            className="rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            required
            className="rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
          />
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white hover:bg-black/80"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-sm text-black/55">
          비밀번호를 잊으셨나요?{" "}
          <Link to="/forget-password" className="hover:underline">
            도움말
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
