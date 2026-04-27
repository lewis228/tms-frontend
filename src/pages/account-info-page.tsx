import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, UserCircle, Briefcase, Target } from "lucide-react";
import AuthLayout from "@/components/layout/auth-layout";
import { cn } from "@/lib/utils";

const TEAM_SIZES = ["1-1", "2-10", "10-50", "50+"] as const;

type Plan = "company" | "developer" | "testing";

const PLANS: { key: Plan; icon: typeof UserCircle }[] = [
  { key: "company", icon: UserCircle },
  { key: "developer", icon: Briefcase },
  { key: "testing", icon: Target },
];

export default function AccountInfoPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [teamSize, setTeamSize] = useState<string>("1-1");
  const [teamName, setTeamName] = useState("");
  const [plan, setPlan] = useState<Plan>("company");

  return (
    <AuthLayout>
      <div className="flex flex-col">
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-2xl font-semibold text-black">
            {t("auth.accountInfo.title")}
          </h1>
          <p className="text-sm text-black/55">
            {t("auth.accountInfo.subtitle")}{" "}
            <a href="#" className="text-[#adadfb] hover:underline">
              {t("auth.accountInfo.helpLink")}
            </a>.
          </p>
        </div>

        {/* Team Size */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-black">
            {t("auth.accountInfo.teamSize")}
          </h3>
          <div className="mb-2 flex gap-3">
            {TEAM_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setTeamSize(size)}
                className={cn(
                  "rounded-2xl border px-5 py-2 text-sm transition-colors",
                  teamSize === size
                    ? "border-black bg-white font-medium text-black"
                    : "border-black/10 bg-white text-black/55 hover:border-black/20",
                )}
              >
                {size}
              </button>
            ))}
          </div>
          <p className="text-xs text-black/55">
            {t("auth.accountInfo.teamSizeHint")}
          </p>
        </div>

        {/* Team Account Name */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-black">
            {t("auth.accountInfo.teamName")}
          </h3>
          <Input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
          />
        </div>

        {/* Account Plan */}
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-black">
            {t("auth.accountInfo.planHeading")}
          </h3>
          <div className="flex flex-col gap-3">
            {PLANS.map((p) => {
              const Icon = p.icon;
              const labelKey =
                p.key === "company"
                  ? "auth.accountInfo.companyLabel"
                  : p.key === "developer"
                    ? "auth.accountInfo.developerLabel"
                    : "auth.accountInfo.testingLabel";
              const descKey =
                p.key === "company"
                  ? "auth.accountInfo.companyDescription"
                  : p.key === "developer"
                    ? "auth.accountInfo.developerDescription"
                    : "auth.accountInfo.testingDescription";
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPlan(p.key)}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-colors",
                    plan === p.key
                      ? "border-black bg-white"
                      : "border-black/10 bg-white hover:border-black/20",
                  )}
                >
                  <Icon className="h-8 w-8 shrink-0 text-black/55" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-black">
                      {t(labelKey)}
                    </span>
                    <p className="text-sm text-black/55">{t(descKey)}</p>
                  </div>
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      plan === p.key ? "border-black bg-black" : "border-black/20",
                    )}
                  >
                    {plan === p.key && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1 gap-1 rounded-2xl border-black/10 text-sm text-black/55 hover:bg-black/[0.02]"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("auth.accountInfo.previous")}
          </Button>
          <Button
            onClick={() => navigate("/billing-details")}
            className="flex-1 gap-1 rounded-2xl bg-black text-sm text-white hover:bg-black/80"
          >
            {t("auth.accountInfo.continue")}
            <ChevronRight className="h-4 w-4 text-white/40" />
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
